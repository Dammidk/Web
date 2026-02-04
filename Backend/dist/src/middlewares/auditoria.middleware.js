"use strict";
// Middleware de Auditoría
// Registra automáticamente las acciones de crear, editar y eliminar
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerIP = exports.registrarAuditoria = void 0;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
// Función para registrar un evento de auditoría
const registrarAuditoria = async (usuarioId, datos, ipAddress) => {
    try {
        await database_1.default.registroAuditoria.create({
            data: {
                usuarioId,
                accion: datos.accion,
                entidad: datos.entidad,
                entidadId: datos.entidadId,
                datosAnteriores: datos.datosAnteriores ?? client_1.Prisma.JsonNull,
                datosNuevos: datos.datosNuevos ?? client_1.Prisma.JsonNull,
                ipAddress: ipAddress || null,
            }
        });
        console.log(`[AUDITORÍA] ${datos.accion} en ${datos.entidad} (ID: ${datos.entidadId}) por usuario ${usuarioId}`);
    }
    catch (error) {
        console.error('[ERROR AUDITORÍA] No se pudo registrar la acción:', error);
    }
};
exports.registrarAuditoria = registrarAuditoria;
// Obtener IP del cliente
const obtenerIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'desconocido';
};
exports.obtenerIP = obtenerIP;
//# sourceMappingURL=auditoria.middleware.js.map