"use strict";
// Rutas de Auditoría - EXCLUSIVAS PARA AUDITOR
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditoria_controller_1 = require("../controllers/auditoria.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Solo AUDITOR puede acceder a estos registros
router.use(auth_middleware_1.verificarToken, auth_middleware_1.soloAuditor);
router.get('/', auditoria_controller_1.listarAuditoria);
router.get('/entidades', auditoria_controller_1.obtenerEntidades);
router.get('/:id', auditoria_controller_1.obtenerRegistroAuditoria);
exports.default = router;
//# sourceMappingURL=auditoria.routes.js.map