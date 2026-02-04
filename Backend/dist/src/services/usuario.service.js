"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioService = void 0;
// Servicio de Usuarios
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usuario_repository_1 = require("../repositories/usuario.repository");
exports.usuarioService = {
    async buscarPorEmailOUsuario(identificador) {
        // Buscar por email o nombre de usuario
        let usuario = await usuario_repository_1.usuarioRepository.findByEmail(identificador);
        if (!usuario) {
            usuario = await usuario_repository_1.usuarioRepository.findByNombreUsuario(identificador);
        }
        return usuario;
    },
    async verificarPassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    },
    async crearUsuario(datos) {
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(datos.password, salt);
        return usuario_repository_1.usuarioRepository.create({
            nombreUsuario: datos.nombreUsuario,
            email: datos.email,
            passwordHash,
            nombreCompleto: datos.nombreCompleto,
            rol: datos.rol || 'ADMIN'
        });
    }
};
//# sourceMappingURL=usuario.service.js.map