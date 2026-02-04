"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditoriaRepository = void 0;
// Repositorio de Auditoría - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
exports.auditoriaRepository = {
    /**
     * Buscar registros de auditoría con filtros y paginación
     */
    async findAll(filtros = {}) {
        const page = filtros.page || 1;
        const limit = filtros.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (filtros.entidad) {
            where.entidad = filtros.entidad;
        }
        if (filtros.accion) {
            where.accion = filtros.accion;
        }
        if (filtros.usuarioId) {
            where.usuarioId = filtros.usuarioId;
        }
        if (filtros.fechaInicio || filtros.fechaFin) {
            where.fechaHora = {};
            if (filtros.fechaInicio) {
                where.fechaHora.gte = filtros.fechaInicio;
            }
            if (filtros.fechaFin) {
                where.fechaHora.lte = filtros.fechaFin;
            }
        }
        const [items, total] = await Promise.all([
            database_1.default.registroAuditoria.findMany({
                where,
                include: {
                    usuario: {
                        select: { id: true, nombreCompleto: true, nombreUsuario: true }
                    }
                },
                orderBy: { fechaHora: 'desc' },
                skip,
                take: limit
            }),
            database_1.default.registroAuditoria.count({ where })
        ]);
        // No enviar datos antes/después en el listado para reducir tamaño
        const itemsSinDatos = items.map(item => ({
            id: item.id,
            entidad: item.entidad,
            entidadId: item.entidadId,
            accion: item.accion,
            usuario: item.usuario,
            fechaHora: item.fechaHora,
            ipAddress: item.ipAddress
        }));
        return {
            items: itemsSinDatos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    /**
     * Obtener un registro de auditoría por ID con todos los detalles
     */
    async findById(id) {
        return database_1.default.registroAuditoria.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: { id: true, nombreCompleto: true, nombreUsuario: true }
                }
            }
        });
    },
    /**
     * Crear un registro de auditoría
     */
    async create(usuarioId, datos) {
        return database_1.default.registroAuditoria.create({
            data: {
                usuarioId,
                accion: datos.accion,
                entidad: datos.entidad,
                entidadId: datos.entidadId,
                datosAnteriores: datos.datosAnteriores || null,
                datosNuevos: datos.datosNuevos || null,
                ipAddress: datos.ipAddress || null
            }
        });
    },
    /**
     * Obtener lista de entidades únicas para filtros
     */
    async getEntidadesUnicas() {
        const result = await database_1.default.registroAuditoria.findMany({
            distinct: ['entidad'],
            select: { entidad: true },
            orderBy: { entidad: 'asc' }
        });
        return result.map(r => r.entidad);
    }
};
//# sourceMappingURL=auditoria.repository.js.map