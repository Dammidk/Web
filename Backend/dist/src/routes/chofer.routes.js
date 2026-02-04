"use strict";
// Rutas de Choferes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chofer_controller_1 = require("../controllers/chofer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verificarToken);
router.get('/', auth_middleware_1.puedeLeer, chofer_controller_1.listarChoferes);
router.get('/:id', auth_middleware_1.puedeLeer, chofer_controller_1.obtenerChofer);
router.post('/', auth_middleware_1.puedeEscribir, chofer_controller_1.crearChofer);
router.put('/:id', auth_middleware_1.puedeEscribir, chofer_controller_1.actualizarChofer);
router.delete('/:id', auth_middleware_1.puedeEscribir, chofer_controller_1.eliminarChofer);
router.get('/:id/viajes-pendientes', auth_middleware_1.puedeLeer, chofer_controller_1.obtenerViajesPendientes);
exports.default = router;
//# sourceMappingURL=chofer.routes.js.map