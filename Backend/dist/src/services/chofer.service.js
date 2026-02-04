"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.choferService = exports.choferSchema = void 0;
// Servicio de Choferes - Lógica de negocio
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const chofer_repository_1 = require("../repositories/chofer.repository");
const auditoria_repository_1 = require("../repositories/auditoria.repository");
const database_1 = __importDefault(require("../config/database"));
exports.choferSchema = zod_1.z.object({
    nombres: zod_1.z.string().min(1, 'Nombres requeridos'),
    apellidos: zod_1.z.string().min(1, 'Apellidos requeridos'),
    documentoId: zod_1.z.string().min(1, 'Documento requerido'),
    telefono: zod_1.z.string().optional().nullable(),
    correo: zod_1.z.string().email().optional().nullable().or(zod_1.z.literal('')),
    estado: zod_1.z.enum(['ACTIVO', 'INACTIVO']).optional().default('ACTIVO'),
    fechaVencimientoLicencia: zod_1.z.string().optional().nullable(),
    modalidadPago: zod_1.z.enum(['POR_VIAJE', 'MENSUAL']).optional().default('POR_VIAJE'),
    metodoPago: zod_1.z.enum(['EFECTIVO', 'TRANSFERENCIA']).optional().default('EFECTIVO'),
    banco: zod_1.z.string().optional().nullable(),
    numeroCuenta: zod_1.z.string().optional().nullable(),
    sueldoMensual: zod_1.z.coerce.number().min(0).optional().nullable(),
    diaPago: zod_1.z.coerce.number().min(1).max(28).optional().nullable(),
    pagoQuincenal: zod_1.z.boolean().optional().default(false)
});
exports.choferService = {
    async listar(filtros) {
        return chofer_repository_1.choferRepository.findAll(filtros);
    },
    async obtenerPorId(id) {
        return chofer_repository_1.choferRepository.findById(id);
    },
    async crear(datos, usuarioId, ip) {
        const docNormalizado = datos.documentoId.trim();
        const existente = await chofer_repository_1.choferRepository.findByDocumento(docNormalizado);
        if (existente)
            throw new Error(`Ya existe un chofer con el documento ${docNormalizado}`);
        // Validación para modalidad MENSUAL
        if (datos.modalidadPago === 'MENSUAL') {
            if (!datos.sueldoMensual || datos.sueldoMensual <= 0) {
                throw new Error('Para pago mensual, debe especificar un sueldo mensual válido');
            }
            if (!datos.diaPago || datos.diaPago < 1 || datos.diaPago > 28) {
                throw new Error('Para pago mensual, debe especificar un día de pago válido (1-28)');
            }
        }
        const dataToSave = {
            nombres: datos.nombres.trim(),
            apellidos: datos.apellidos.trim(),
            documentoId: docNormalizado,
            telefono: datos.telefono?.trim() || null,
            correo: datos.correo?.trim() || null,
            estado: datos.estado || 'ACTIVO',
            fechaVencimientoLicencia: datos.fechaVencimientoLicencia ? new Date(datos.fechaVencimientoLicencia) : null,
            modalidadPago: datos.modalidadPago || 'POR_VIAJE',
            metodoPago: datos.metodoPago || 'EFECTIVO',
            banco: datos.banco?.trim() || null,
            numeroCuenta: datos.numeroCuenta?.trim() || null,
            sueldoMensual: datos.sueldoMensual || null,
            diaPago: datos.diaPago || null,
            pagoQuincenal: datos.pagoQuincenal || false
        };
        const chofer = await chofer_repository_1.choferRepository.create(dataToSave);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.CREAR,
            entidad: 'Chofer',
            entidadId: chofer.id,
            datosNuevos: chofer,
            ipAddress: ip
        });
        return chofer;
    },
    async actualizar(id, datos, usuarioId, ip) {
        const anterior = await chofer_repository_1.choferRepository.findById(id);
        if (!anterior)
            throw new Error('Chofer no encontrado');
        if (datos.documentoId && datos.documentoId !== anterior.documentoId) {
            const existente = await chofer_repository_1.choferRepository.findByDocumento(datos.documentoId);
            if (existente)
                throw new Error(`El documento ${datos.documentoId} ya está en uso`);
        }
        const dataToUpdate = {};
        if (datos.nombres)
            dataToUpdate.nombres = datos.nombres.trim();
        if (datos.apellidos)
            dataToUpdate.apellidos = datos.apellidos.trim();
        if (datos.documentoId)
            dataToUpdate.documentoId = datos.documentoId.trim();
        if (datos.telefono !== undefined)
            dataToUpdate.telefono = datos.telefono?.trim() || null;
        if (datos.correo !== undefined)
            dataToUpdate.correo = datos.correo?.trim() || null;
        if (datos.estado)
            dataToUpdate.estado = datos.estado;
        if (datos.fechaVencimientoLicencia !== undefined) {
            dataToUpdate.fechaVencimientoLicencia = datos.fechaVencimientoLicencia ? new Date(datos.fechaVencimientoLicencia) : null;
        }
        // NUEVO: Validar cambio a INACTIVO
        if (datos.estado === 'INACTIVO' && anterior.estado !== 'INACTIVO') {
            const viajesActivos = await database_1.default.viaje.count({
                where: { choferId: id, estado: { in: ['PLANIFICADO', 'EN_CURSO'] } }
            });
            if (viajesActivos > 0) {
                throw new Error(`No se puede desactivar: El chofer tiene ${viajesActivos} viaje(s) activo(s). Complete o cancele los viajes primero.`);
            }
        }
        if (datos.modalidadPago)
            dataToUpdate.modalidadPago = datos.modalidadPago;
        if (datos.metodoPago)
            dataToUpdate.metodoPago = datos.metodoPago;
        if (datos.banco !== undefined)
            dataToUpdate.banco = datos.banco?.trim() || null;
        if (datos.numeroCuenta !== undefined)
            dataToUpdate.numeroCuenta = datos.numeroCuenta?.trim() || null;
        if (datos.sueldoMensual !== undefined)
            dataToUpdate.sueldoMensual = datos.sueldoMensual || null;
        if (datos.diaPago !== undefined)
            dataToUpdate.diaPago = datos.diaPago || null;
        if (datos.pagoQuincenal !== undefined)
            dataToUpdate.pagoQuincenal = datos.pagoQuincenal || false;
        // Validación para modalidad MENSUAL (considerar datos actuales y nuevos)
        const modalidadFinal = datos.modalidadPago || anterior.modalidadPago;
        const sueldoFinal = datos.sueldoMensual !== undefined ? datos.sueldoMensual : anterior.sueldoMensual;
        const diaPagoFinal = datos.diaPago !== undefined ? datos.diaPago : anterior.diaPago;
        if (modalidadFinal === 'MENSUAL') {
            if (!sueldoFinal || Number(sueldoFinal) <= 0) {
                throw new Error('Para pago mensual, debe especificar un sueldo mensual válido');
            }
            if (!diaPagoFinal || diaPagoFinal < 1 || diaPagoFinal > 28) {
                throw new Error('Para pago mensual, debe especificar un día de pago válido (1-28)');
            }
        }
        const chofer = await chofer_repository_1.choferRepository.update(id, dataToUpdate);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'Chofer',
            entidadId: id,
            datosAnteriores: anterior,
            datosNuevos: chofer,
            ipAddress: ip
        });
        return chofer;
    },
    async eliminar(id, usuarioId, ip) {
        const chofer = await chofer_repository_1.choferRepository.findById(id);
        if (!chofer)
            throw new Error('Chofer no encontrado');
        // Verificar viajes activos
        const viajesActivos = await database_1.default.viaje.count({
            where: {
                choferId: id,
                estado: { in: ['PLANIFICADO', 'EN_CURSO'] }
            }
        });
        if (viajesActivos > 0) {
            throw new Error(`No se puede eliminar: El chofer tiene ${viajesActivos} viaje(s) activo(s). Cancele o complete los viajes primero.`);
        }
        // Verificar saldo pendiente
        const pendientes = await this.obtenerViajesPendientes(id);
        const totalPendiente = pendientes.reduce((sum, v) => sum + v.pendiente, 0);
        if (totalPendiente > 0) {
            throw new Error(`No se puede eliminar: El chofer tiene $${totalPendiente.toFixed(2)} pendientes de pago.`);
        }
        await chofer_repository_1.choferRepository.delete(id);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.ELIMINAR,
            entidad: 'Chofer',
            entidadId: id,
            datosAnteriores: chofer,
            ipAddress: ip
        });
        return chofer;
    },
    async obtenerViajesPendientes(choferId) {
        // Buscar viajes COMPLETADOS de este chofer que tengan monto de pago definido
        // y donde la suma de pagos sea menor al monto acordado
        const viajes = await database_1.default.viaje.findMany({
            where: {
                choferId,
                estado: 'COMPLETADO',
                montoPagoChofer: { not: null } // Solo viajes con monto de pago acordado
            },
            include: {
                pagos: { select: { monto: true } },
                vehiculo: { select: { placa: true } }
            },
            orderBy: { fechaLlegadaReal: 'desc' }
        });
        // Filtrar solo los que tienen saldo pendiente
        const viajesConPendiente = viajes
            .map(viaje => {
            const montoPactado = Number(viaje.montoPagoChofer || 0);
            const totalPagado = viaje.pagos.reduce((sum, p) => sum + Number(p.monto), 0);
            const pendiente = montoPactado - totalPagado;
            return {
                id: viaje.id,
                origen: viaje.origen,
                destino: viaje.destino,
                tarifa: viaje.tarifa,
                fechaLlegadaReal: viaje.fechaLlegadaReal,
                vehiculo: viaje.vehiculo,
                montoPagoChofer: montoPactado,
                totalPagado,
                pendiente
            };
        })
            .filter(v => v.pendiente > 0); // Solo los que tienen saldo pendiente
        return viajesConPendiente;
    }
};
//# sourceMappingURL=chofer.service.js.map