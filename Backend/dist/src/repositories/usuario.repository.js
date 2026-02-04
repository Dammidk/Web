"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioRepository = void 0;
// Repositorio de Usuarios - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
exports.usuarioRepository = {
    async findByEmail(email) {
        return database_1.default.usuario.findUnique({ where: { email } });
    },
    async findByNombreUsuario(nombreUsuario) {
        return database_1.default.usuario.findUnique({ where: { nombreUsuario } });
    },
    async findById(id) {
        return database_1.default.usuario.findUnique({ where: { id } });
    },
    async create(data) {
        return database_1.default.usuario.create({ data });
    }
};
//# sourceMappingURL=usuario.repository.js.map