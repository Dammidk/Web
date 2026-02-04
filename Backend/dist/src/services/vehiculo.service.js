"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehiculoService = exports.vehiculoSchema = void 0;
// Servicio de Vehículos - Lógica de negocio
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const vehiculo_repository_1 = require("../repositories/vehiculo.repository");
const auditoria_repository_1 = require("../repositories/auditoria.repository");
// Schema de validación Zod
exports.vehiculoSchema = zod_1.z.object({
    placa: zod_1.z.string().min(1, 'Placa requerida').max(10),
    marca: zod_1.z.string().min(1, 'Marca requerida'),
    modelo: zod_1.z.string().min(1, 'Modelo requerido'),
    anio: zod_1.z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
    tipo: zod_1.z.string().min(1, 'Tipo requerido'),
    capacidad: zod_1.z.string().min(1, 'Capacidad requerida'),
    estado: zod_1.z.enum(['ACTIVO', 'EN_RUTA', 'EN_MANTENIMIENTO', 'INACTIVO']).optional().default('ACTIVO'),
    kilometrajeActual: zod_1.z.coerce.number().min(0).optional().default(0),
    observaciones: zod_1.z.string().optional().nullable(),
    fechaUltimoMantenimiento: zod_1.z.string().optional().nullable(),
    fechaProximoMantenimiento: zod_1.z.string().optional().nullable(),
    fechaVencimientoSoat: zod_1.z.string().optional().nullable(),
    fechaVencimientoSeguro: zod_1.z.string().optional().nullable(),
    fechaVencimientoMatricula: zod_1.z.string().optional().nullable()
});
exports.vehiculoService = {
    async listar(filtros) {
        return vehiculo_repository_1.vehiculoRepository.findAll(filtros);
    },
    async obtenerPorId(id) {
        return vehiculo_repository_1.vehiculoRepository.findById(id);
    },
    async crear(datos, usuarioId, ip) {
        // Normalizar placa a mayúsculas
        const placaNormalizada = datos.placa.toUpperCase().trim();
        // Verificar unicidad de placa
        const existente = await vehiculo_repository_1.vehiculoRepository.findByPlaca(placaNormalizada);
        if (existente) {
            throw new Error(`Ya existe un vehículo con la placa ${placaNormalizada}`);
        }
        // Preparar datos para guardar
        const dataToSave = {
            placa: placaNormalizada,
            marca: datos.marca.trim(),
            modelo: datos.modelo.trim(),
            anio: datos.anio,
            tipo: datos.tipo.trim(),
            capacidad: datos.capacidad.trim(),
            estado: datos.estado || 'ACTIVO',
            kilometrajeActual: datos.kilometrajeActual || 0,
            observaciones: datos.observaciones || null,
            fechaUltimoMantenimiento: datos.fechaUltimoMantenimiento ? new Date(datos.fechaUltimoMantenimiento) : null,
            fechaProximoMantenimiento: datos.fechaProximoMantenimiento ? new Date(datos.fechaProximoMantenimiento) : null,
            fechaVencimientoSoat: datos.fechaVencimientoSoat ? new Date(datos.fechaVencimientoSoat) : null,
            fechaVencimientoSeguro: datos.fechaVencimientoSeguro ? new Date(datos.fechaVencimientoSeguro) : null,
            fechaVencimientoMatricula: datos.fechaVencimientoMatricula ? new Date(datos.fechaVencimientoMatricula) : null
        };
        const vehiculo = await vehiculo_repository_1.vehiculoRepository.create(dataToSave);
        // Registrar auditoría
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.CREAR,
            entidad: 'Vehiculo',
            entidadId: vehiculo.id,
            datosNuevos: vehiculo,
            ipAddress: ip
        });
        return vehiculo;
    },
    async actualizar(id, datos, usuarioId, ip) {
        // Obtener datos anteriores
        const anterior = await vehiculo_repository_1.vehiculoRepository.findById(id);
        if (!anterior)
            throw new Error('Vehículo no encontrado');
        // Verificar placa única si cambió
        if (datos.placa && datos.placa.toUpperCase() !== anterior.placa) {
            const existente = await vehiculo_repository_1.vehiculoRepository.findByPlaca(datos.placa.toUpperCase());
            if (existente)
                throw new Error(`La placa ${datos.placa} ya está en uso`);
        }
        // Preparar datos para actualizar
        const dataToUpdate = {};
        if (datos.placa)
            dataToUpdate.placa = datos.placa.toUpperCase().trim();
        if (datos.marca)
            dataToUpdate.marca = datos.marca.trim();
        if (datos.modelo)
            dataToUpdate.modelo = datos.modelo.trim();
        if (datos.anio)
            dataToUpdate.anio = datos.anio;
        if (datos.tipo)
            dataToUpdate.tipo = datos.tipo.trim();
        if (datos.capacidad)
            dataToUpdate.capacidad = datos.capacidad.trim();
        // NUEVO: Validar cambio a INACTIVO
        if (datos.estado === 'INACTIVO' && anterior.estado !== 'INACTIVO') {
            const viajesActivos = await database_1.default.viaje.count({
                where: { vehiculoId: id, estado: { in: ['PLANIFICADO', 'EN_CURSO'] } }
            });
            if (viajesActivos > 0) {
                throw new Error(`No se puede desactivar: El vehículo tiene ${viajesActivos} viaje(s) activo(s). Complete o cancele los viajes primero.`);
            }
        }
        if (datos.estado)
            dataToUpdate.estado = datos.estado;
        if (datos.kilometrajeActual !== undefined)
            dataToUpdate.kilometrajeActual = datos.kilometrajeActual;
        if (datos.observaciones !== undefined)
            dataToUpdate.observaciones = datos.observaciones;
        // Fechas
        ['fechaUltimoMantenimiento', 'fechaProximoMantenimiento', 'fechaVencimientoSoat', 'fechaVencimientoSeguro', 'fechaVencimientoMatricula'].forEach(f => {
            if (datos[f] !== undefined) {
                dataToUpdate[f] = datos[f] ? new Date(datos[f]) : null;
            }
        });
        const vehiculo = await vehiculo_repository_1.vehiculoRepository.update(id, dataToUpdate);
        // Registrar auditoría
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'Vehiculo',
            entidadId: id,
            datosAnteriores: anterior,
            datosNuevos: vehiculo,
            ipAddress: ip
        });
        return vehiculo;
    },
    async eliminar(id, usuarioId, ip) {
        const vehiculo = await vehiculo_repository_1.vehiculoRepository.findById(id);
        if (!vehiculo)
            throw new Error('Vehículo no encontrado');
        // Verificar viajes activos
        const viajesActivos = await database_1.default.viaje.count({
            where: {
                vehiculoId: id,
                estado: { in: ['PLANIFICADO', 'EN_CURSO'] }
            }
        });
        if (viajesActivos > 0) {
            throw new Error(`No se puede eliminar: El vehículo tiene ${viajesActivos} viaje(s) activo(s). Cancele o complete los viajes primero.`);
        }
        // Verificar mantenimientos en curso
        const mantenimientosActivos = await database_1.default.mantenimiento.count({
            where: {
                vehiculoId: id,
                estado: 'EN_CURSO'
            }
        });
        if (mantenimientosActivos > 0) {
            throw new Error('No se puede eliminar: El vehículo está actualmente en mantenimiento.');
        }
        await vehiculo_repository_1.vehiculoRepository.delete(id);
        // Registrar auditoría
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.ELIMINAR,
            entidad: 'Vehiculo',
            entidadId: id,
            datosAnteriores: vehiculo,
            ipAddress: ip
        });
        return vehiculo;
    }
};
//# sourceMappingURL=vehiculo.service.js.map