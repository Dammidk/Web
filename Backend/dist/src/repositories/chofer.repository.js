"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.choferRepository = void 0;
// Repositorio de Choferes - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
exports.choferRepository = {
    async findAll(filtros = {}) {
        const where = {};
        if (filtros.busqueda) {
            where.OR = [
                { nombres: { contains: filtros.busqueda, mode: 'insensitive' } },
                { apellidos: { contains: filtros.busqueda, mode: 'insensitive' } },
                { documentoId: { contains: filtros.busqueda, mode: 'insensitive' } }
            ];
        }
        if (filtros.estado)
            where.estado = filtros.estado;
        return database_1.default.chofer.findMany({ where, orderBy: { apellidos: 'asc' } });
    },
    async findById(id) {
        return database_1.default.chofer.findUnique({ where: { id } });
    },
    async findByDocumento(documentoId) {
        return database_1.default.chofer.findUnique({ where: { documentoId } });
    },
    async create(data) {
        return database_1.default.chofer.create({ data });
    },
    async update(id, data) {
        return database_1.default.chofer.update({ where: { id }, data });
    },
    async delete(id) {
        return database_1.default.chofer.delete({ where: { id } });
    },
    async countActivos() {
        return database_1.default.chofer.count({ where: { estado: 'ACTIVO' } });
    },
    async countTotal() {
        return database_1.default.chofer.count();
    }
};
//# sourceMappingURL=chofer.repository.js.map