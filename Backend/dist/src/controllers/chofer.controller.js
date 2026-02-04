"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerViajesPendientes = exports.eliminarChofer = exports.actualizarChofer = exports.crearChofer = exports.obtenerChofer = exports.listarChoferes = void 0;
const chofer_service_1 = require("../services/chofer.service");
// GET /api/choferes
const listarChoferes = async (req, res, next) => {
    try {
        const { busqueda, estado } = req.query;
        const choferes = await chofer_service_1.choferService.listar({
            busqueda: busqueda,
            estado: estado
        });
        res.json({ exito: true, datos: choferes });
    }
    catch (error) {
        next(error);
    }
};
exports.listarChoferes = listarChoferes;
// GET /api/choferes/:id
const obtenerChofer = async (req, res, next) => {
    try {
        const chofer = await chofer_service_1.choferService.obtenerPorId(parseInt(req.params.id));
        if (!chofer) {
            res.status(404).json({ error: 'Chofer no encontrado' });
            return;
        }
        res.json({ chofer });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerChofer = obtenerChofer;
// POST /api/choferes
const crearChofer = async (req, res, next) => {
    try {
        const resultado = chofer_service_1.choferSchema.safeParse(req.body);
        if (!resultado.success) {
            res.status(400).json({ error: 'Datos inválidos', detalles: resultado.error.flatten() });
            return;
        }
        const chofer = await chofer_service_1.choferService.crear(resultado.data, req.usuario.id, req.ip || undefined);
        console.log(`✅ Chofer creado: ${chofer.nombres} ${chofer.apellidos}`);
        res.status(201).json({ mensaje: 'Chofer creado exitosamente', chofer });
    }
    catch (error) {
        next(error);
    }
};
exports.crearChofer = crearChofer;
// PUT /api/choferes/:id
const actualizarChofer = async (req, res, next) => {
    try {
        const chofer = await chofer_service_1.choferService.actualizar(parseInt(req.params.id), req.body, req.usuario.id, req.ip || undefined);
        console.log(`✅ Chofer actualizado: ${chofer.nombres} ${chofer.apellidos}`);
        res.json({ mensaje: 'Chofer actualizado exitosamente', chofer });
    }
    catch (error) {
        next(error);
    }
};
exports.actualizarChofer = actualizarChofer;
// DELETE /api/choferes/:id
const eliminarChofer = async (req, res, next) => {
    try {
        const chofer = await chofer_service_1.choferService.eliminar(parseInt(req.params.id), req.usuario.id, req.ip || undefined);
        console.log(`🗑️ Chofer eliminado: ${chofer.nombres} ${chofer.apellidos}`);
        res.json({ mensaje: 'Chofer eliminado exitosamente', choferEliminado: chofer });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarChofer = eliminarChofer;
// GET /api/choferes/:id/viajes-pendientes
const obtenerViajesPendientes = async (req, res, next) => {
    try {
        const viajes = await chofer_service_1.choferService.obtenerViajesPendientes(Number(req.params.id));
        res.json({ exito: true, viajes });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerViajesPendientes = obtenerViajesPendientes;
//# sourceMappingURL=chofer.controller.js.map