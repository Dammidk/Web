"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gastosController = void 0;
const gastos_service_1 = require("../services/gastos.service");
const client_1 = require("@prisma/client");
exports.gastosController = {
    /**
     * GET /api/viajes/:viajeId/gastos
     * Listar gastos de un viaje
     */
    async listar(req, res, next) {
        try {
            const { viajeId } = req.params;
            const gastos = await gastos_service_1.gastosService.listarPorViaje(parseInt(viajeId));
            res.json({
                exito: true,
                datos: gastos,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /api/viajes/:viajeId/gastos
     * Crear gasto para un viaje (con soporte para archivo/comprobante)
     */
    async crear(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { viajeId } = req.params;
            const { tipoGasto, monto, fecha, metodoPago, descripcion } = req.body;
            // Validaciones básicas
            if (!tipoGasto || !monto || !fecha) {
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Faltan campos requeridos: tipoGasto, monto, fecha',
                });
            }
            // Validar que el tipo de gasto sea válido
            if (!Object.values(client_1.TipoGasto).includes(tipoGasto)) {
                return res.status(400).json({
                    exito: false,
                    mensaje: `Tipo de gasto inválido. Tipos permitidos: ${Object.values(client_1.TipoGasto).join(', ')}`,
                });
            }
            // Validar método de pago si viene
            if (metodoPago && !Object.values(client_1.MetodoPago).includes(metodoPago)) {
                return res.status(400).json({
                    exito: false,
                    mensaje: `Método de pago inválido. Métodos permitidos: ${Object.values(client_1.MetodoPago).join(', ')}`,
                });
            }
            const gasto = await gastos_service_1.gastosService.crear({
                viajeId: parseInt(viajeId),
                tipoGasto,
                monto: parseFloat(monto),
                fecha: new Date(fecha),
                metodoPago,
                descripcion,
                archivo: req.file
                    ? {
                        buffer: req.file.buffer,
                        originalname: req.file.originalname,
                    }
                    : undefined,
            }, usuarioId);
            res.status(201).json({
                exito: true,
                mensaje: 'Gasto registrado exitosamente',
                datos: gasto,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /api/gastos/:id
     * Actualizar un gasto
     */
    async actualizar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const datos = req.body;
            // Parsear monto si viene
            if (datos.monto)
                datos.monto = parseFloat(datos.monto);
            if (datos.fecha)
                datos.fecha = new Date(datos.fecha);
            const gasto = await gastos_service_1.gastosService.actualizar(parseInt(id), datos, usuarioId);
            res.json({
                exito: true,
                mensaje: 'Gasto actualizado exitosamente',
                datos: gasto,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /api/gastos/:id
     * Eliminar un gasto
     */
    async eliminar(req, res, next) {
        try {
            const usuarioId = req.usuario?.id;
            if (!usuarioId) {
                return res.status(401).json({ exito: false, mensaje: 'No autorizado' });
            }
            const { id } = req.params;
            const resultado = await gastos_service_1.gastosService.eliminar(parseInt(id), usuarioId);
            res.json({
                exito: true,
                mensaje: resultado.mensaje,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=gastos.controller.js.map