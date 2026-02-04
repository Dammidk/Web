"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Rutas de Gastos (independientes, para edición/eliminación)
const express_1 = require("express");
const gastos_controller_1 = require("../controllers/gastos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.verificarToken);
// PUT /api/gastos/:id - Actualizar gasto (solo admin)
router.put('/:id', auth_middleware_1.soloAdmin, gastos_controller_1.gastosController.actualizar);
// DELETE /api/gastos/:id - Eliminar gasto (solo admin)
router.delete('/:id', auth_middleware_1.soloAdmin, gastos_controller_1.gastosController.eliminar);
exports.default = router;
//# sourceMappingURL=gastos.routes.js.map