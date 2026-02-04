"use strict";
// Configuración de Helmet
// Establece headers de seguridad HTTP para proteger la aplicación
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helmetConfig = void 0;
const helmet_1 = __importDefault(require("helmet"));
// Configuración personalizada de Helmet
exports.helmetConfig = (0, helmet_1.default)({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Permite estilos inline para compatibilidad
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"], // Permite imágenes de Cloudinary y data URIs
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: false, // Desactivado para compatibilidad con Cloudinary
    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite recursos de Cloudinary
    // HSTS (HTTP Strict Transport Security)
    hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
    },
    // X-Content-Type-Options
    noSniff: true, // Previene MIME type sniffing
    // X-Frame-Options
    frameguard: {
        action: 'deny' // Previene clickjacking
    },
    // X-XSS-Protection (legacy, pero útil para navegadores antiguos)
    xssFilter: true,
    // Referrer Policy
    referrerPolicy: {
        policy: "strict-origin-when-cross-origin"
    },
});
exports.default = exports.helmetConfig;
//# sourceMappingURL=helmet.config.js.map