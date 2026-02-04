"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteService = exports.clienteSchema = void 0;
// Servicio de Clientes - Lógica de negocio
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const cliente_repository_1 = require("../repositories/cliente.repository");
const auditoria_repository_1 = require("../repositories/auditoria.repository");
exports.clienteSchema = zod_1.z.object({
    nombreRazonSocial: zod_1.z.string().min(1, 'Nombre o razón social requerido'),
    documentoId: zod_1.z.string().min(1, 'Documento requerido'),
    telefono: zod_1.z.string().optional().nullable(),
    correo: zod_1.z.string().email().optional().nullable().or(zod_1.z.literal('')),
    direccion: zod_1.z.string().optional().nullable(),
    sector: zod_1.z.string().optional().nullable(),
    estado: zod_1.z.enum(['ACTIVO', 'INACTIVO']).optional().default('ACTIVO')
});
exports.clienteService = {
    async listar(filtros) {
        return cliente_repository_1.clienteRepository.findAll(filtros);
    },
    async obtenerPorId(id) {
        return cliente_repository_1.clienteRepository.findById(id);
    },
    async crear(datos, usuarioId, ip) {
        const docNormalizado = datos.documentoId.trim();
        const existente = await cliente_repository_1.clienteRepository.findByDocumento(docNormalizado);
        if (existente)
            throw new Error(`Ya existe un cliente con el documento ${docNormalizado}`);
        const dataToSave = {
            nombreRazonSocial: datos.nombreRazonSocial.trim(),
            documentoId: docNormalizado,
            telefono: datos.telefono?.trim() || null,
            correo: datos.correo?.trim() || null,
            direccion: datos.direccion?.trim() || null,
            sector: datos.sector?.trim() || null,
            estado: datos.estado || 'ACTIVO'
        };
        const cliente = await cliente_repository_1.clienteRepository.create(dataToSave);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.CREAR,
            entidad: 'Cliente',
            entidadId: cliente.id,
            datosNuevos: cliente,
            ipAddress: ip
        });
        return cliente;
    },
    async actualizar(id, datos, usuarioId, ip) {
        const anterior = await cliente_repository_1.clienteRepository.findById(id);
        if (!anterior)
            throw new Error('Cliente no encontrado');
        if (datos.documentoId && datos.documentoId !== anterior.documentoId) {
            const existente = await cliente_repository_1.clienteRepository.findByDocumento(datos.documentoId);
            if (existente)
                throw new Error(`El documento ${datos.documentoId} ya está en uso`);
        }
        const dataToUpdate = {};
        if (datos.nombreRazonSocial)
            dataToUpdate.nombreRazonSocial = datos.nombreRazonSocial.trim();
        if (datos.documentoId)
            dataToUpdate.documentoId = datos.documentoId.trim();
        if (datos.telefono !== undefined)
            dataToUpdate.telefono = datos.telefono?.trim() || null;
        if (datos.correo !== undefined)
            dataToUpdate.correo = datos.correo?.trim() || null;
        if (datos.direccion !== undefined)
            dataToUpdate.direccion = datos.direccion?.trim() || null;
        if (datos.sector !== undefined)
            dataToUpdate.sector = datos.sector?.trim() || null;
        if (datos.estado)
            dataToUpdate.estado = datos.estado;
        const cliente = await cliente_repository_1.clienteRepository.update(id, dataToUpdate);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'Cliente',
            entidadId: id,
            datosAnteriores: anterior,
            datosNuevos: cliente,
            ipAddress: ip
        });
        return cliente;
    },
    async eliminar(id, usuarioId, ip) {
        const cliente = await cliente_repository_1.clienteRepository.findById(id);
        if (!cliente)
            throw new Error('Cliente no encontrado');
        // Verificar viajes activos
        const viajesActivos = await database_1.default.viaje.count({
            where: {
                clienteId: id,
                estado: { in: ['PLANIFICADO', 'EN_CURSO'] }
            }
        });
        if (viajesActivos > 0) {
            throw new Error(`No se puede eliminar: El cliente tiene ${viajesActivos} viaje(s) activo(s). Cancele o complete los viajes primero.`);
        }
        // Verificar deudas pendientes
        const viajesPendientes = await database_1.default.viaje.findMany({
            where: {
                clienteId: id,
                estadoPagoCliente: { in: ['PENDIENTE', 'PARCIAL'] }
            },
            select: { tarifa: true, montoPagadoCliente: true }
        });
        if (viajesPendientes.length > 0) {
            const totalDeuda = viajesPendientes.reduce((sum, v) => sum + (Number(v.tarifa) - Number(v.montoPagadoCliente || 0)), 0);
            throw new Error(`No se puede eliminar: El cliente tiene $${totalDeuda.toFixed(2)} en deudas pendientes.`);
        }
        await cliente_repository_1.clienteRepository.delete(id);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.ELIMINAR,
            entidad: 'Cliente',
            entidadId: id,
            datosAnteriores: cliente,
            ipAddress: ip
        });
        return cliente;
    }
};
//# sourceMappingURL=cliente.service.js.map