"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logRequest = void 0;
// Configuración de Logging Estructurado con Winston
const winston_1 = __importDefault(require("winston"));
// Formato personalizado para logs
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Formato para consola (más legible en desarrollo)
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
}));
// Crear logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: logFormat,
    defaultMeta: { service: 'transporte-backend' },
    transports: [
        // Escribir todos los logs con nivel 'error' y menores a error.log
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Escribir todos los logs a combined.log
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/rejections.log' })
    ],
});
// Si no estamos en producción, también loguear a la consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat
    }));
}
// Helper para logging de requests HTTP
const logRequest = (req, res, responseTime) => {
    logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: responseTime ? `${responseTime}ms` : undefined,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
};
exports.logRequest = logRequest;
// Helper para logging de errores
const logError = (error, context) => {
    logger.error('Error occurred', {
        message: error.message,
        stack: error.stack,
        ...context,
    });
};
exports.logError = logError;
exports.default = logger;
//# sourceMappingURL=logger.config.js.map