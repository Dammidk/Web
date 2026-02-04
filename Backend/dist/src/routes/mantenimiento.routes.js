"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Rutas de Mantenimientos
const express_1 = require("express");
const mantenimiento_controller_1 = require("../controllers/mantenimiento.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_config_1 = __importDefault(require("../config/multer.config"));
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.verificarToken);
// GET /api/mantenimientos - Listar
router.get('/', auth_middleware_1.puedeLeer, mantenimiento_controller_1.mantenimientoController.listar);
// GET /api/mantenimientos/:id - Detalle
router.get('/:id', auth_middleware_1.puedeLeer, mantenimiento_controller_1.mantenimientoController.obtenerDetalle);
// POST /api/mantenimientos - Crear (con archivo opcional)
router.post('/', auth_middleware_1.puedeEscribir, multer_config_1.default.single('archivo'), mantenimiento_controller_1.mantenimientoController.crear);
// POST /api/mantenimientos/:id/iniciar - Iniciar mantenimiento PENDIENTE
router.post('/:id/iniciar', auth_middleware_1.puedeEscribir, mantenimiento_controller_1.mantenimientoController.iniciar);
// POST /api/mantenimientos/:id/completar - Completar mantenimiento EN_CURSO
router.post('/:id/completar', auth_middleware_1.puedeEscribir, multer_config_1.default.single('archivo'), mantenimiento_controller_1.mantenimientoController.completar);
// POST /api/mantenimientos/:id/cancelar - Cancelar mantenimiento PENDIENTE
router.post('/:id/cancelar', auth_middleware_1.puedeEscribir, mantenimiento_controller_1.mantenimientoController.cancelar);
// DELETE /api/mantenimientos/:id - Eliminar
router.delete('/:id', auth_middleware_1.puedeEscribir, mantenimiento_controller_1.mantenimientoController.eliminar);
exports.default = router;
//# sourceMappingURL=mantenimiento.routes.js.map