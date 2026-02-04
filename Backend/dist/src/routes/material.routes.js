"use strict";
// Rutas de Materiales
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const material_controller_1 = require("../controllers/material.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verificarToken);
router.get('/', auth_middleware_1.puedeLeer, material_controller_1.listarMateriales);
router.get('/:id', auth_middleware_1.puedeLeer, material_controller_1.obtenerMaterial);
router.post('/', auth_middleware_1.puedeEscribir, material_controller_1.crearMaterial);
router.put('/:id', auth_middleware_1.puedeEscribir, material_controller_1.actualizarMaterial);
router.delete('/:id', auth_middleware_1.puedeEscribir, material_controller_1.eliminarMaterial);
exports.default = router;
//# sourceMappingURL=material.routes.js.map