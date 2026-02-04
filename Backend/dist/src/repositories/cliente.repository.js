"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteRepository = void 0;
// Repositorio de Clientes - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
exports.clienteRepository = {
    async findAll(filtros = {}) {
        const where = {};
        if (filtros.busqueda) {
            where.OR = [
                { nombreRazonSocial: { contains: filtros.busqueda, mode: 'insensitive' } },
                { documentoId: { contains: filtros.busqueda, mode: 'insensitive' } }
            ];
        }
        if (filtros.estado)
            where.estado = filtros.estado;
        return database_1.default.cliente.findMany({ where, orderBy: { nombreRazonSocial: 'asc' } });
    },
    async findById(id) {
        return database_1.default.cliente.findUnique({ where: { id } });
    },
    async findByDocumento(documentoId) {
        return database_1.default.cliente.findUnique({ where: { documentoId } });
    },
    async create(data) {
        return database_1.default.cliente.create({ data });
    },
    async update(id, data) {
        return database_1.default.cliente.update({ where: { id }, data });
    },
    async delete(id) {
        return database_1.default.cliente.delete({ where: { id } });
    },
    async countActivos() {
        return database_1.default.cliente.count({ where: { estado: 'ACTIVO' } });
    },
    async countTotal() {
        return database_1.default.cliente.count();
    }
};
//# sourceMappingURL=cliente.repository.js.map