"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mantenimientoController = void 0;
const mantenimiento_service_1 = require("../services/mantenimiento.service");
exports.mantenimientoController = {
    /**
     * GET /api/mantenimientos
     * Listar mantenimientos con filtros
     */
    async listar(req, res, next) {
        try {
            const { vehiculoId, fechaDesde, fechaHasta, tipo, estado } = req.query;
            const filtros = {
                vehiculoId: vehiculoId ? Number(vehiculoId) : undefined,
                fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
                fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
                tipo: (tipo && tipo !== '') ? tipo : undefined,
                estado: estado,
            };
            const mantenimientos = await mantenimiento_service_1.mantenimientoService.listar(filtros);
            res.json({
                exito: true,
                datos: mantenimientos,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/mantenimientos/:id
     */
    async obtenerDetalle(req, res, next) {
        try {
            const { id } = req.params;
            const mantenimiento = await mantenimiento_service_1.mantenimientoService.obtenerDetalle(Number(id));
            res.json({ exito: true, datos: mantenimiento });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/mantenimientos
     * Registrar nuevo mantenimiento
     * - PREVENTIVO: Crea en estado PENDIENTE
     * - CORRECTIVO: Crea en estado EN_CURSO y pone vehículo EN_MANTENIMIENTO
     */
    async crear(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { vehiculoId, tipo, descripcion, taller, costoManoObra, costoRepuestos, fecha, kilometrajeAlMomento, proximaFecha, proximoKilometraje } = req.body;
            // Validaciones - taller opcional para PREVENTIVO
            if (!vehiculoId || !tipo || !fecha) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Faltan campos requeridos: vehiculoId, tipo, fecha'
                });
            }
            // Para CORRECTIVO, taller es obligatorio
            if (tipo === 'CORRECTIVO' && !taller) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Para mantenimiento CORRECTIVO, el taller es obligatorio'
                });
            }
            const mantenimiento = await mantenimiento_service_1.mantenimientoService.crear({
                vehiculoId: Number(vehiculoId),
                tipo: tipo,
                descripcion,
                taller,
                costoManoObra: costoManoObra ? parseFloat(costoManoObra) : 0,
                costoRepuestos: costoRepuestos ? parseFloat(costoRepuestos) : 0,
                fecha: new Date(fecha),
                kilometrajeAlMomento: kilometrajeAlMomento ? Number(kilometrajeAlMomento) : undefined,
                proximaFecha: proximaFecha ? new Date(proximaFecha) : undefined,
                proximoKilometraje: proximoKilometraje ? Number(proximoKilometraje) : undefined,
                archivo: req.file ? {
                    buffer: req.file.buffer,
                    originalname: req.file.originalname
                } : undefined
            }, usuarioId);
            res.status(201).json({
                exito: true,
                mensaje: tipo === 'CORRECTIVO'
                    ? 'Mantenimiento iniciado - Vehículo en taller'
                    : 'Mantenimiento programado',
                datos: mantenimiento
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/mantenimientos/:id/iniciar
     * Iniciar un mantenimiento PENDIENTE (llevarlo al taller)
     */
    async iniciar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const { taller } = req.body;
            if (!taller) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El nombre del taller es requerido'
                });
            }
            const mantenimiento = await mantenimiento_service_1.mantenimientoService.iniciar(Number(id), taller, usuarioId);
            res.json({
                exito: true,
                mensaje: 'Mantenimiento iniciado - Vehículo en taller',
                datos: mantenimiento
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/mantenimientos/:id/completar
     * Completar un mantenimiento EN_CURSO
     */
    async completar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const { taller, costoManoObra, costoRepuestos, descripcion, kilometrajeAlMomento, proximoKilometraje } = req.body;
            if (!taller || costoManoObra === undefined || costoRepuestos === undefined) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Campos requeridos: taller, costoManoObra, costoRepuestos'
                });
            }
            const mantenimiento = await mantenimiento_service_1.mantenimientoService.completar(Number(id), {
                taller,
                costoManoObra: parseFloat(costoManoObra),
                costoRepuestos: parseFloat(costoRepuestos),
                descripcion,
                kilometrajeAlMomento: kilometrajeAlMomento ? Number(kilometrajeAlMomento) : undefined,
                proximoKilometraje: proximoKilometraje ? Number(proximoKilometraje) : undefined,
                archivo: req.file ? {
                    buffer: req.file.buffer,
                    originalname: req.file.originalname
                } : undefined
            }, usuarioId);
            res.json({
                exito: true,
                mensaje: 'Mantenimiento completado - Vehículo disponible',
                datos: mantenimiento
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/mantenimientos/:id/cancelar
     * Cancelar un mantenimiento PENDIENTE
     */
    async cancelar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const mantenimiento = await mantenimiento_service_1.mantenimientoService.cancelar(Number(id), usuarioId);
            res.json({
                exito: true,
                mensaje: 'Mantenimiento cancelado',
                datos: mantenimiento
            });
        }
        catch (error) {
            next(error);
        }
    },
    async eliminar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId)
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            const { id } = req.params;
            const result = await mantenimiento_service_1.mantenimientoService.eliminar(Number(id), usuarioId);
            res.json({ exito: true, mensaje: result.mensaje });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=mantenimiento.controller.js.map