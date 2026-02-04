"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Rutas de Alertas
const express_1 = require("express");
const alertas_controller_1 = require("../controllers/alertas.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Ambos roles pueden ver las alertas
router.use(auth_middleware_1.verificarToken);
router.get('/', alertas_controller_1.obtenerAlertas);
exports.default = router;
//# sourceMappingURL=alertas.routes.js.map