"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagosChoferController = void 0;
const pagosChofer_service_1 = require("../services/pagosChofer.service");
exports.pagosChoferController = {
    /**
     * GET /api/pagos-choferes
     */
    async listar(req, res, next) {
        try {
            const { choferId, fechaDesde, fechaHasta, estado } = req.query;
            const filtros = {
                choferId: choferId ? Number(choferId) : undefined,
                fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
                fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
                estado: estado,
            };
            const pagos = await pagosChofer_service_1.pagoChoferService.listar(filtros);
            res.json({ exito: true, datos: pagos });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/pagos-choferes
     */
    async crear(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId)
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            const { choferId, monto, fecha, metodoPago, descripcion, viajeId, banco, numeroCuenta } = req.body;
            if (!choferId || !monto || !fecha) {
                return res.status(400).json({ exito: false, mensaje: 'Faltan campos (choferId, monto, fecha)' });
            }
            const pago = await pagosChofer_service_1.pagoChoferService.crear({
                choferId: Number(choferId),
                monto: parseFloat(monto),
                fecha: new Date(fecha),
                metodoPago: metodoPago,
                descripcion,
                archivo: req.file ? {
                    buffer: req.file.buffer,
                    originalname: req.file.originalname
                } : undefined,
                viajeId: viajeId ? Number(viajeId) : undefined,
                datosBancarios: (banco && numeroCuenta) ? { banco, numeroCuenta } : undefined
            }, usuarioId);
            res.status(201).json({ exito: true, mensaje: 'Pago registrado', datos: pago });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/pagos-choferes/resumen/:choferId
     */
    async obtenerResumen(req, res, next) {
        try {
            const { choferId } = req.params;
            const { fechaDesde, fechaHasta } = req.query;
            const resumen = await pagosChofer_service_1.pagoChoferService.obtenerResumenEconomico(Number(choferId), fechaDesde ? new Date(fechaDesde) : undefined, fechaHasta ? new Date(fechaHasta) : undefined);
            res.json({ exito: true, datos: resumen });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/pagos-choferes/:id/pagar
     * Marcar un pago como pagado
     */
    async marcarPagado(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId)
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            const { id } = req.params;
            const { monto, fecha, metodoPago, descripcion } = req.body;
            // DEBUG: Ver si llega el archivo
            console.log('[DEBUG marcarPagado] req.file:', req.file ? { name: req.file.originalname, size: req.file.size } : 'NO FILE');
            console.log('[DEBUG marcarPagado] req.body:', { monto, fecha, metodoPago });
            // Procesar archivo si existe
            let archivoData;
            if (req.file) {
                archivoData = {
                    buffer: req.file.buffer,
                    originalname: req.file.originalname
                };
            }
            const pago = await pagosChofer_service_1.pagoChoferService.marcarPagado(Number(id), usuarioId, {
                monto: monto ? parseFloat(monto) : undefined, // Puede ser parcial
                fecha: fecha ? new Date(fecha) : undefined,
                metodoPago: metodoPago,
                descripcion: descripcion,
                archivo: archivoData
            });
            res.json({
                exito: true,
                mensaje: 'Pago registrado exitosamente',
                datos: pago
            });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=pagosChofer.controller.js.map