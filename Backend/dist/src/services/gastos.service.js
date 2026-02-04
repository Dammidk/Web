"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gastosService = void 0;
// Servicio de Gastos de Viaje - Lógica de negocio
const client_1 = require("@prisma/client");
const gastos_repository_1 = require("../repositories/gastos.repository");
const viajes_repository_1 = require("../repositories/viajes.repository");
const auditoria_repository_1 = require("../repositories/auditoria.repository");
const cloudinary_service_1 = require("./cloudinary.service");
exports.gastosService = {
    /**
     * Listar gastos de un viaje
     */
    async listarPorViaje(viajeId) {
        // Verificar que el viaje existe
        const viaje = await viajes_repository_1.viajesRepository.findById(viajeId);
        if (!viaje) {
            throw new Error('Viaje no encontrado');
        }
        return gastos_repository_1.gastosRepository.findByViajeId(viajeId);
    },
    /**
     * Crear un gasto de viaje (con soporte para archivo)
     */
    async crear(datos, usuarioId) {
        // Verificar que el viaje existe
        const viaje = await viajes_repository_1.viajesRepository.findById(datos.viajeId);
        if (!viaje) {
            throw new Error('Viaje no encontrado');
        }
        // Validar monto
        if (datos.monto <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }
        let comprobanteId;
        // Si hay archivo, subirlo a Cloudinary
        if (datos.archivo) {
            const resultadoUpload = await (0, cloudinary_service_1.uploadToCloudinary)(datos.archivo.buffer, 'comprobantes/gastos', datos.archivo.originalname);
            // Crear registro de comprobante
            const comprobante = await gastos_repository_1.gastosRepository.createComprobante({
                tipo: client_1.TipoComprobante.GASTO_VIAJE,
                url: resultadoUpload.url,
                publicId: resultadoUpload.publicId,
                nombreArchivoOriginal: datos.archivo.originalname,
            });
            comprobanteId = comprobante.id;
        }
        // Crear el gasto
        const datosGasto = {
            viajeId: datos.viajeId,
            tipoGasto: datos.tipoGasto,
            monto: datos.monto,
            fecha: datos.fecha,
            metodoPago: datos.metodoPago,
            descripcion: datos.descripcion,
        };
        const gasto = await gastos_repository_1.gastosRepository.create(datosGasto, comprobanteId);
        // Actualizar referenciaId del comprobante si existe
        if (comprobanteId) {
            await gastos_repository_1.gastosRepository.createComprobante;
        }
        // Registrar auditoría
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.CREAR,
            entidad: 'GastoViaje',
            entidadId: gasto.id,
            datosNuevos: gasto,
        });
        return gasto;
    },
    /**
     * Actualizar un gasto
     */
    async actualizar(id, datos, usuarioId) {
        const gastoAnterior = await gastos_repository_1.gastosRepository.findById(id);
        if (!gastoAnterior) {
            throw new Error('Gasto no encontrado');
        }
        if (datos.monto && datos.monto <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }
        const gastoActualizado = await gastos_repository_1.gastosRepository.update(id, datos);
        // Registrar auditoría
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'GastoViaje',
            entidadId: id,
            datosAnteriores: gastoAnterior,
            datosNuevos: gastoActualizado,
        });
        return gastoActualizado;
    },
    /**
     * Eliminar un gasto
     */
    async eliminar(id, usuarioId) {
        const gasto = await gastos_repository_1.gastosRepository.findById(id);
        if (!gasto) {
            throw new Error('Gasto no encontrado');
        }
        // Si tiene comprobante, eliminar de Cloudinary (opcional)
        if (gasto.comprobante) {
            try {
                await (0, cloudinary_service_1.deleteFromCloudinary)(gasto.comprobante.publicId);
            }
            catch (error) {
                console.error('Error al eliminar comprobante de Cloudinary:', error);
            }
        }
        await gastos_repository_1.gastosRepository.delete(id);
        // Registrar auditoría
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.ELIMINAR,
            entidad: 'GastoViaje',
            entidadId: id,
            datosAnteriores: gasto,
        });
        return { mensaje: 'Gasto eliminado correctamente' };
    },
    /**
     * Obtener gastos totales del mes para dashboard
     */
    async obtenerGastosMensuales(anio, mes) {
        return gastos_repository_1.gastosRepository.getGastosMensuales(anio, mes);
    },
};
//# sourceMappingURL=gastos.service.js.map