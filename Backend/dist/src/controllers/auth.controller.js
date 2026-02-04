"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerPerfil = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const usuario_service_1 = require("../services/usuario.service");
const usuario_repository_1 = require("../repositories/usuario.repository");
// Schema de validación para login
const loginSchema = zod_1.z.object({
    usuario: zod_1.z.string().min(1, 'Usuario requerido'),
    password: zod_1.z.string().min(1, 'Contraseña requerida')
});
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const resultado = loginSchema.safeParse(req.body);
        if (!resultado.success) {
            res.status(400).json({ error: 'Datos inválidos', detalles: resultado.error.flatten() });
            return;
        }
        const { usuario: identificador, password } = resultado.data;
        const usuario = await usuario_service_1.usuarioService.buscarPorEmailOUsuario(identificador);
        if (!usuario) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        if (!usuario.activo) {
            res.status(401).json({ error: 'Usuario desactivado' });
            return;
        }
        const passwordValido = await usuario_service_1.usuarioService.verificarPassword(password, usuario.passwordHash);
        if (!passwordValido) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no configurado. La aplicación no puede funcionar sin esta variable.');
        }
        const token = jsonwebtoken_1.default.sign({ id: usuario.id, nombreUsuario: usuario.nombreUsuario, rol: usuario.rol }, jwtSecret, { expiresIn: '24h' });
        console.log(`✅ Login exitoso: ${usuario.nombreUsuario} (${usuario.rol})`);
        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombreUsuario: usuario.nombreUsuario,
                email: usuario.email,
                nombreCompleto: usuario.nombreCompleto,
                rol: usuario.rol
            }
        });
    }
    catch (error) {
        console.error('[ERROR LOGIN]', error);
        const errorMessage = error instanceof Error ? error.message : 'Error en el servidor';
        res.status(500).json({ error: errorMessage });
    }
};
exports.login = login;
// GET /api/auth/perfil
const obtenerPerfil = async (req, res) => {
    try {
        if (!req.usuario) {
            res.status(401).json({ error: 'No autenticado' });
            return;
        }
        const usuario = await usuario_repository_1.usuarioRepository.findById(req.usuario.id);
        if (!usuario) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        res.json({
            usuario: {
                id: usuario.id,
                nombreUsuario: usuario.nombreUsuario,
                email: usuario.email,
                nombreCompleto: usuario.nombreCompleto,
                rol: usuario.rol
            }
        });
    }
    catch (error) {
        console.error('[ERROR PERFIL]', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al obtener perfil';
        res.status(500).json({ error: errorMessage });
    }
};
exports.obtenerPerfil = obtenerPerfil;
//# sourceMappingURL=auth.controller.js.map