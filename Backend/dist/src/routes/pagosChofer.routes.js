"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Rutas de Pagos a Choferes
const express_1 = require("express");
const pagosChofer_controller_1 = require("../controllers/pagosChofer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_config_1 = __importDefault(require("../config/multer.config"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verificarToken);
// GET /api/pagos-choferes - Listar
router.get('/', auth_middleware_1.puedeLeer, pagosChofer_controller_1.pagosChoferController.listar);
// GET /api/pagos-choferes/resumen/:choferId - Resumen económico
router.get('/resumen/:choferId', auth_middleware_1.puedeLeer, pagosChofer_controller_1.pagosChoferController.obtenerResumen);
// POST /api/pagos-choferes - Crear
router.post('/', auth_middleware_1.puedeEscribir, multer_config_1.default.single('archivo'), pagosChofer_controller_1.pagosChoferController.crear);
// PATCH /api/pagos-choferes/:id/pagar - Marcar como pagado
router.patch('/:id/pagar', auth_middleware_1.puedeEscribir, multer_config_1.default.single('archivo'), pagosChofer_controller_1.pagosChoferController.marcarPagado);
exports.default = router;
//# sourceMappingURL=pagosChofer.routes.js.map