"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialRepository = void 0;
// Repositorio de Materiales - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
exports.materialRepository = {
    async findAll(filtros = {}) {
        const where = {};
        if (filtros.busqueda) {
            where.nombre = { contains: filtros.busqueda, mode: 'insensitive' };
        }
        return database_1.default.material.findMany({ where, orderBy: { nombre: 'asc' } });
    },
    async findById(id) {
        return database_1.default.material.findUnique({ where: { id } });
    },
    async findByNombre(nombre) {
        return database_1.default.material.findUnique({ where: { nombre } });
    },
    async create(data) {
        return database_1.default.material.create({ data });
    },
    async update(id, data) {
        return database_1.default.material.update({ where: { id }, data });
    },
    async delete(id) {
        return database_1.default.material.delete({ where: { id } });
    },
    async countTotal() {
        return database_1.default.material.count();
    }
};
//# sourceMappingURL=material.repository.js.map