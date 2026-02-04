"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Rutas de Viajes
const express_1 = require("express");
const viajes_controller_1 = require("../controllers/viajes.controller");
const gastos_controller_1 = require("../controllers/gastos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const viajes_schema_1 = require("../schemas/viajes.schema");
const multer_config_1 = require("../config/multer.config");
const rateLimiter_config_1 = require("../config/rateLimiter.config");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.verificarToken);
// ====================
// RUTAS DE VIAJES
// ====================
// GET /api/viajes - Listar viajes con filtros
router.get('/', auth_middleware_1.puedeLeer, viajes_controller_1.viajesController.listar);
// GET /api/viajes/:id - Detalle de viaje con gastos y rentabilidad
router.get('/:id', auth_middleware_1.puedeLeer, viajes_controller_1.viajesController.obtenerDetalle);
// POST /api/viajes - Crear viaje (solo admin)
router.post('/', rateLimiter_config_1.writeLimiter, auth_middleware_1.puedeEscribir, (0, validate_middleware_1.validateRequest)(viajes_schema_1.createViajeSchema), viajes_controller_1.viajesController.crear);
// PUT /api/viajes/:id - Actualizar viaje (solo admin)
router.put('/:id', rateLimiter_config_1.writeLimiter, auth_middleware_1.puedeEscribir, (0, validate_middleware_1.validateRequest)(viajes_schema_1.updateViajeSchema), viajes_controller_1.viajesController.actualizar);
// PATCH /api/viajes/:id/estado - Cambiar estado (solo admin)
router.patch('/:id/estado', rateLimiter_config_1.writeLimiter, auth_middleware_1.puedeEscribir, (0, validate_middleware_1.validateRequest)(viajes_schema_1.cambiarEstadoViajeSchema), viajes_controller_1.viajesController.cambiarEstado);
// POST /api/viajes/:id/pago - Registrar pago del cliente (solo admin)
router.post('/:id/pago', rateLimiter_config_1.writeLimiter, auth_middleware_1.puedeEscribir, viajes_controller_1.viajesController.registrarPago);
// DELETE /api/viajes/:id - Eliminar viaje (solo admin)
router.delete('/:id', rateLimiter_config_1.writeLimiter, auth_middleware_1.puedeEscribir, viajes_controller_1.viajesController.eliminar);
// ====================
// RUTAS DE GASTOS DE VIAJE
// ====================
// GET /api/viajes/:viajeId/gastos - Listar gastos de un viaje
router.get('/:viajeId/gastos', auth_middleware_1.puedeLeer, gastos_controller_1.gastosController.listar);
// POST /api/viajes/:viajeId/gastos - Crear gasto (solo admin, con archivo opcional)
router.post('/:viajeId/gastos', rateLimiter_config_1.uploadLimiter, auth_middleware_1.puedeEscribir, multer_config_1.upload.single('comprobante'), gastos_controller_1.gastosController.crear);
exports.default = router;
//# sourceMappingURL=viajes.routes.js.map