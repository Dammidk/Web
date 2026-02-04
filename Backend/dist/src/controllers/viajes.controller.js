"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viajesController = void 0;
const viajes_service_1 = require("../services/viajes.service");
exports.viajesController = {
    /**
     * GET /api/viajes
     * Listar viajes con filtros
     */
    async listar(req, res, next) {
        try {
            const { estado, vehiculoId, choferId, clienteId, estadoPagoCliente, fechaDesde, fechaHasta, page = '1', limit = '20', } = req.query;
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
            const filtros = {
                estado: estado,
                vehiculoId: vehiculoId ? parseInt(vehiculoId) || undefined : undefined,
                choferId: choferId ? parseInt(choferId) || undefined : undefined,
                clienteId: clienteId ? parseInt(clienteId) || undefined : undefined,
                estadoPagoCliente: estadoPagoCliente,
                fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
                fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            };
            const resultado = await viajes_service_1.viajesService.listar(filtros);
            res.json({
                exito: true,
                datos: resultado.viajes,
                paginacion: {
                    total: resultado.total,
                    pagina: pageNum,
                    limite: limitNum,
                    totalPaginas: Math.ceil(resultado.total / limitNum),
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/viajes/:id
     * Obtener detalle de viaje con gastos y resumen económico
     */
    async obtenerDetalle(req, res, next) {
        try {
            const { id } = req.params;
            const resultado = await viajes_service_1.viajesService.obtenerDetalle(parseInt(id));
            res.json({
                exito: true,
                datos: resultado,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/viajes
     * Crear nuevo viaje
     */
    async crear(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            // Datos ya validados y transformados por Zod
            const { vehiculoId, choferId, clienteId, materialId, origen, destino, fechaSalida, fechaLlegadaEstimada, kilometrosEstimados, tarifa, montoPagoChofer, observaciones, diasCredito } = req.body;
            const viaje = await viajes_service_1.viajesService.crear({
                vehiculoId,
                choferId,
                clienteId,
                materialId,
                origen,
                destino,
                fechaSalida,
                fechaLlegadaEstimada,
                kilometrosEstimados,
                tarifa,
                montoPagoChofer,
                diasCredito,
                observaciones,
            }, usuarioId);
            res.status(201).json({
                exito: true,
                mensaje: 'Viaje creado exitosamente',
                datos: viaje,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/viajes/:id
     * Actualizar datos de un viaje
     */
    async actualizar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            // Datos ya transformados por Zod
            const datos = req.body;
            const viaje = await viajes_service_1.viajesService.actualizar(parseInt(id), datos, usuarioId);
            res.json({
                exito: true,
                mensaje: 'Viaje actualizado exitosamente',
                datos: viaje,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /api/viajes/:id/estado
     * Cambiar estado del viaje
     */
    async cambiarEstado(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const { estado, fechaLlegadaReal, kilometrosReales } = req.body;
            // Validaciones de negocio adicionales pueden ir aquí si Zod no es suficiente
            const viaje = await viajes_service_1.viajesService.cambiarEstado(parseInt(id), estado, usuarioId, {
                fechaLlegadaReal,
                kilometrosReales,
            });
            res.json({
                exito: true,
                mensaje: `Estado cambiado a ${estado}`,
                datos: viaje,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/viajes/:id
     * Eliminar viaje
     */
    async eliminar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const resultado = await viajes_service_1.viajesService.eliminar(parseInt(id), usuarioId);
            res.json({
                exito: true,
                mensaje: resultado.mensaje,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/viajes/:id/pago
     * Registrar pago del cliente
     */
    async registrarPago(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const { monto } = req.body;
            if (!monto || isNaN(parseFloat(monto))) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'El campo monto es requerido y debe ser un número',
                });
            }
            const resultado = await viajes_service_1.viajesService.registrarPagoCliente(parseInt(id), parseFloat(monto), usuarioId);
            res.json({
                exito: true,
                mensaje: `Pago de $${parseFloat(monto)} registrado exitosamente`,
                datos: resultado,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=viajes.controller.js.map