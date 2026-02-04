"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerRegistroAuditoria = exports.obtenerEntidades = exports.listarAuditoria = void 0;
const auditoria_service_1 = require("../services/auditoria.service");
// GET /api/auditoria
const listarAuditoria = async (req, res, next) => {
    try {
        const { entidad, accion, usuarioId, desde, hasta, page, limit } = req.query;
        const filtros = {};
        if (entidad)
            filtros.entidad = entidad;
        if (accion)
            filtros.accion = accion;
        if (usuarioId)
            filtros.usuarioId = parseInt(usuarioId);
        if (desde)
            filtros.fechaInicio = new Date(desde);
        if (hasta)
            filtros.fechaFin = new Date(hasta);
        if (page)
            filtros.page = parseInt(page);
        if (limit)
            filtros.limit = parseInt(limit);
        const resultado = await auditoria_service_1.auditoriaService.listar(filtros);
        res.json(resultado);
    }
    catch (error) {
        next(error);
    }
};
exports.listarAuditoria = listarAuditoria;
// GET /api/auditoria/entidades
const obtenerEntidades = async (req, res, next) => {
    try {
        const entidades = await auditoria_service_1.auditoriaService.getEntidadesUnicas();
        res.json({ entidades });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerEntidades = obtenerEntidades;
// GET /api/auditoria/:id
const obtenerRegistroAuditoria = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const registro = await auditoria_service_1.auditoriaService.obtenerDetalle(id);
        res.json({ registro });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerRegistroAuditoria = obtenerRegistroAuditoria;
//# sourceMappingURL=auditoria.controller.js.map