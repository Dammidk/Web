"use strict";
// Middleware de Autenticación con JWT
// Verifica tokens y extrae información del usuario
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditorOAdmin = exports.soloAuditor = exports.usuarioAutenticado = exports.puedeLeer = exports.puedeEscribir = exports.soloAdmin = exports.verificarToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware para verificar que el usuario está autenticado
const verificarToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
            return;
        }
        // El header debe ser: "Bearer <token>"
        const partes = authHeader.split(' ');
        if (partes.length !== 2 || partes[0] !== 'Bearer') {
            res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
            return;
        }
        const token = partes[1];
        const secreto = process.env.JWT_SECRET;
        if (!secreto) {
            throw new Error('JWT_SECRET no configurado. La aplicación no puede funcionar sin esta variable.');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secreto);
        // Adjuntar información del usuario al request
        req.usuario = {
            id: decoded.id,
            nombreUsuario: decoded.nombreUsuario,
            rol: decoded.rol
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'Token expirado. Por favor inicie sesión nuevamente.' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: 'Token inválido.' });
            return;
        }
        res.status(500).json({ error: 'Error al verificar el token.' });
    }
};
exports.verificarToken = verificarToken;
// Middleware para verificar que el usuario es ADMIN (puede modificar datos)
const soloAdmin = (req, res, next) => {
    if (!req.usuario) {
        res.status(401).json({ error: 'Usuario no autenticado.' });
        return;
    }
    if (req.usuario.rol !== 'ADMIN') {
        res.status(403).json({
            error: 'Acceso denegado. Se requieren permisos de administrador.',
            mensaje: 'Su rol actual es AUDITOR y solo tiene permisos de lectura.'
        });
        return;
    }
    next();
};
exports.soloAdmin = soloAdmin;
// Middleware para verificar que el usuario puede ESCRIBIR (solo ADMIN)
exports.puedeEscribir = exports.soloAdmin; // Alias más descriptivo
// Middleware para verificar que el usuario puede LEER (ADMIN o AUDITOR)
const puedeLeer = (req, res, next) => {
    if (!req.usuario) {
        res.status(401).json({ error: 'Usuario no autenticado.' });
        return;
    }
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'AUDITOR') {
        res.status(403).json({
            error: 'Acceso denegado.',
            mensaje: 'No tiene permisos para acceder a este recurso.'
        });
        return;
    }
    next();
};
exports.puedeLeer = puedeLeer;
// Middleware que permite tanto ADMIN como AUDITOR (solo lectura)
const usuarioAutenticado = (req, res, next) => {
    if (!req.usuario) {
        res.status(401).json({ error: 'Usuario no autenticado.' });
        return;
    }
    next();
};
exports.usuarioAutenticado = usuarioAutenticado;
// Middleware exclusivo para AUDITOR
const soloAuditor = (req, res, next) => {
    if (!req.usuario) {
        res.status(401).json({ error: 'Usuario no autenticado.' });
        return;
    }
    if (req.usuario.rol !== 'AUDITOR') {
        res.status(403).json({
            error: 'Acceso denegado. Este módulo es exclusivo para auditores.',
            mensaje: 'Solo el personal de auditoría puede acceder a esta función.'
        });
        return;
    }
    next();
};
exports.soloAuditor = soloAuditor;
// Middleware para AUDITOR o ADMIN (ambos roles permitidos)
const auditorOAdmin = (req, res, next) => {
    if (!req.usuario) {
        res.status(401).json({ error: 'Usuario no autenticado.' });
        return;
    }
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'AUDITOR') {
        res.status(403).json({
            error: 'Acceso denegado.',
            mensaje: 'Se requieren permisos de administrador o auditor.'
        });
        return;
    }
    next();
};
exports.auditorOAdmin = auditorOAdmin;
//# sourceMappingURL=auth.middleware.js.map