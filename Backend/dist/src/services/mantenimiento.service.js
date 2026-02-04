"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mantenimientoService = void 0;
// Servicio de Mantenimientos - Lógica de negocio
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const mantenimiento_repository_1 = require("../repositories/mantenimiento.repository");
const vehiculo_repository_1 = require("../repositories/vehiculo.repository");
const auditoria_repository_1 = require("../repositories/auditoria.repository");
const cloudinary_service_1 = require("./cloudinary.service");
exports.mantenimientoService = {
    async listar(filtros) {
        return mantenimiento_repository_1.mantenimientosRepository.findAll(filtros);
    },
    async obtenerDetalle(id) {
        const mantenimiento = await mantenimiento_repository_1.mantenimientosRepository.findById(id);
        if (!mantenimiento) {
            throw new Error('Mantenimiento no encontrado');
        }
        return mantenimiento;
    },
    /**
     * Crear mantenimiento
     * - PREVENTIVO: Inicia en estado PENDIENTE (programado)
     * - CORRECTIVO: Inicia en estado EN_CURSO y pone el vehículo EN_MANTENIMIENTO
     */
    async crear(datos, usuarioId) {
        // 1. Validar Vehículo
        const vehiculo = await vehiculo_repository_1.vehiculoRepository.findById(datos.vehiculoId);
        if (!vehiculo) {
            throw new Error('Vehículo no encontrado');
        }
        if (vehiculo.estado === 'INACTIVO') {
            throw new Error('No se puede registrar mantenimiento a un vehículo inactivo');
        }
        // 2. Determinar estado inicial según tipo
        const esCorrectivo = datos.tipo === 'CORRECTIVO';
        const estadoInicial = esCorrectivo ? client_1.EstadoMantenimiento.EN_CURSO : client_1.EstadoMantenimiento.PENDIENTE;
        // 3. Calcular Costo Total (si ya tiene costos)
        const costoTotal = (datos.costoManoObra || 0) + (datos.costoRepuestos || 0);
        // Subir archivo si existe (fuera de transacción porque es externo)
        let comprobanteId;
        if (datos.archivo) {
            const resultadoUpload = await (0, cloudinary_service_1.uploadToCloudinary)(datos.archivo.buffer, 'comprobantes/mantenimientos', datos.archivo.originalname);
            const comprobante = await mantenimiento_repository_1.mantenimientosRepository.createComprobante({
                tipo: client_1.TipoComprobante.MANTENIMIENTO,
                url: resultadoUpload.url,
                publicId: resultadoUpload.publicId,
                nombreArchivoOriginal: datos.archivo.originalname
            });
            comprobanteId = comprobante.id;
        }
        // Usar transacción para garantizar atomicidad
        const mantenimiento = await database_1.default.$transaction(async (tx) => {
            // 1. Crear Mantenimiento
            const mantenimiento = await tx.mantenimiento.create({
                data: {
                    vehiculoId: datos.vehiculoId,
                    tipo: datos.tipo,
                    estado: estadoInicial,
                    descripcion: datos.descripcion,
                    taller: datos.taller || '',
                    esExterno: true,
                    costoManoObra: datos.costoManoObra || 0,
                    costoRepuestos: datos.costoRepuestos || 0,
                    costoTotal,
                    fecha: datos.fecha,
                    fechaInicio: esCorrectivo ? new Date() : null,
                    kilometrajeAlMomento: datos.kilometrajeAlMomento,
                    proximaFecha: datos.proximaFecha,
                    proximoKilometraje: datos.proximoKilometraje,
                    comprobanteId
                },
                include: { vehiculo: true }
            });
            // 2. Si es CORRECTIVO, cambiar vehículo a EN_MANTENIMIENTO
            if (esCorrectivo) {
                await tx.vehiculo.update({
                    where: { id: datos.vehiculoId },
                    data: { estado: client_1.EstadoVehiculo.EN_MANTENIMIENTO }
                });
            }
            return mantenimiento;
        });
        // Registrar auditoría (fuera de la transacción)
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.CREAR,
            entidad: 'Mantenimiento',
            entidadId: mantenimiento.id,
            datosNuevos: mantenimiento
        });
        return mantenimiento;
    },
    /**
     * Iniciar un mantenimiento PENDIENTE (llevarlo al taller)
     * Cambia de PENDIENTE → EN_CURSO
     */
    async iniciar(id, taller, usuarioId) {
        const mantenimiento = await mantenimiento_repository_1.mantenimientosRepository.findById(id);
        if (!mantenimiento) {
            throw new Error('Mantenimiento no encontrado');
        }
        if (mantenimiento.estado !== 'PENDIENTE') {
            throw new Error(`No se puede iniciar un mantenimiento en estado ${mantenimiento.estado}`);
        }
        // FIX #6: Validar que el vehículo no tenga viajes activos
        const viajesActivos = await database_1.default.viaje.count({
            where: {
                vehiculoId: mantenimiento.vehiculoId,
                estado: { in: ['PLANIFICADO', 'EN_CURSO'] }
            }
        });
        if (viajesActivos > 0) {
            throw new Error(`El vehículo tiene ${viajesActivos} viaje(s) activo(s). ` +
                `Complete o cancele los viajes antes de iniciar el mantenimiento.`);
        }
        // Actualizar mantenimiento a EN_CURSO
        const mantenimientoActualizado = await mantenimiento_repository_1.mantenimientosRepository.update(id, {
            estado: 'EN_CURSO',
            taller,
            fechaInicio: new Date()
        });
        // Cambiar estado del vehículo a EN_MANTENIMIENTO
        await vehiculo_repository_1.vehiculoRepository.update(mantenimiento.vehiculoId, {
            estado: client_1.EstadoVehiculo.EN_MANTENIMIENTO
        });
        // Auditoría
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'Mantenimiento',
            entidadId: id,
            datosNuevos: { estado: 'EN_CURSO', taller }
        });
        return mantenimientoActualizado;
    },
    /**
     * Completar un mantenimiento EN_CURSO
     * Registra costos y devuelve el vehículo a ACTIVO
     */
    async completar(id, datos, usuarioId) {
        const mantenimiento = await database_1.default.mantenimiento.findUnique({ where: { id } });
        if (!mantenimiento) {
            throw new Error('Mantenimiento no encontrado');
        }
        if (mantenimiento.estado !== client_1.EstadoMantenimiento.EN_CURSO && mantenimiento.estado !== client_1.EstadoMantenimiento.PENDIENTE) {
            throw new Error('Solo se pueden completar mantenimientos en estado PENDIENTE o EN_CURSO');
        }
        const costoTotal = datos.costoManoObra + datos.costoRepuestos;
        let comprobanteId = mantenimiento.comprobanteId;
        // Subir comprobante si hay archivo nuevo
        if (datos.archivo) {
            const resultadoUpload = await (0, cloudinary_service_1.uploadToCloudinary)(datos.archivo.buffer, 'comprobantes/mantenimientos', datos.archivo.originalname);
            const comprobante = await mantenimiento_repository_1.mantenimientosRepository.createComprobante({
                tipo: client_1.TipoComprobante.MANTENIMIENTO,
                url: resultadoUpload.url,
                publicId: resultadoUpload.publicId,
                nombreArchivoOriginal: datos.archivo.originalname
            });
            comprobanteId = comprobante.id;
        }
        // Calcular próximo mantenimiento: 90 días por defecto
        const DIAS_PROXIMO_MANTENIMIENTO = 90;
        let proximaFechaVehiculo = null;
        // Si el usuario especificó una fecha próxima en el mantenimiento, usarla
        if (datos.proximoKilometraje) {
            // Si hay próximo km, no establecer fecha automática (se usa km)
            proximaFechaVehiculo = null;
        }
        else {
            // Calcular fecha automática
            proximaFechaVehiculo = new Date();
            proximaFechaVehiculo.setDate(proximaFechaVehiculo.getDate() + DIAS_PROXIMO_MANTENIMIENTO);
        }
        // Usar transacción para garantizar atomicidad
        const actualizado = await database_1.default.$transaction(async (tx) => {
            // 1. Actualizar mantenimiento
            const actualizado = await tx.mantenimiento.update({
                where: { id },
                data: {
                    estado: client_1.EstadoMantenimiento.COMPLETADO,
                    taller: datos.taller,
                    costoManoObra: datos.costoManoObra,
                    costoRepuestos: datos.costoRepuestos,
                    costoTotal,
                    descripcion: datos.descripcion || mantenimiento.descripcion,
                    fechaFin: new Date(),
                    kilometrajeAlMomento: datos.kilometrajeAlMomento || mantenimiento.kilometrajeAlMomento,
                    proximoKilometraje: datos.proximoKilometraje,
                    comprobanteId
                },
                include: { vehiculo: true }
            });
            // 2. Devolver vehículo a ACTIVO y programar próximo mantenimiento
            await tx.vehiculo.update({
                where: { id: mantenimiento.vehiculoId },
                data: {
                    estado: client_1.EstadoVehiculo.ACTIVO,
                    kilometrajeActual: datos.kilometrajeAlMomento || undefined,
                    fechaUltimoMantenimiento: new Date(),
                    fechaProximoMantenimiento: proximaFechaVehiculo
                }
            });
            return actualizado;
        });
        // Auditoría (fuera de la transacción)
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'Mantenimiento',
            entidadId: id,
            datosNuevos: { estado: 'COMPLETADO', costoTotal }
        });
        return actualizado;
    },
    /**
     * Cancelar un mantenimiento PENDIENTE
     */
    async cancelar(id, usuarioId) {
        const mantenimiento = await database_1.default.mantenimiento.findUnique({ where: { id } });
        if (!mantenimiento) {
            throw new Error('Mantenimiento no encontrado');
        }
        if (mantenimiento.estado !== client_1.EstadoMantenimiento.PENDIENTE) {
            throw new Error('Solo se pueden cancelar mantenimientos en estado PENDIENTE');
        }
        const actualizado = await database_1.default.mantenimiento.update({
            where: { id },
            data: { estado: client_1.EstadoMantenimiento.CANCELADO }
        });
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'Mantenimiento',
            entidadId: id,
            datosNuevos: { estado: 'CANCELADO' }
        });
        return actualizado;
    },
    async eliminar(id, usuarioId) {
        const mantenimiento = await mantenimiento_repository_1.mantenimientosRepository.findById(id);
        if (!mantenimiento)
            throw new Error('Mantenimiento no encontrado');
        // Eliminar comprobante de Cloudinary si existe
        if (mantenimiento.comprobante) {
            try {
                await (0, cloudinary_service_1.deleteFromCloudinary)(mantenimiento.comprobante.publicId);
            }
            catch (error) {
                console.error('Error eliminando comprobante maintenance:', error);
            }
        }
        await mantenimiento_repository_1.mantenimientosRepository.delete(id);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.ELIMINAR,
            entidad: 'Mantenimiento',
            entidadId: id,
            datosNuevos: { estado: 'ELIMINADO' }
        });
        // Restaurar estado del vehículo a ACTIVO si estaba en mantenimiento
        const vehiculo = await database_1.default.vehiculo.findUnique({ where: { id: mantenimiento.vehiculoId } });
        if (vehiculo?.estado === client_1.EstadoVehiculo.EN_MANTENIMIENTO) {
            await database_1.default.vehiculo.update({
                where: { id: mantenimiento.vehiculoId },
                data: { estado: client_1.EstadoVehiculo.ACTIVO }
            });
        }
        return { mensaje: 'Mantenimiento eliminado' };
    }
};
//# sourceMappingURL=mantenimiento.service.js.map