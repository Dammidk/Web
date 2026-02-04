"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Rutas de Reportes
const express_1 = require("express");
const reportes_controller_1 = require("../controllers/reportes.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verificarToken);
// GET /api/reportes/vehiculos
router.get('/vehiculos', reportes_controller_1.reportesController.reportePorVehiculo);
// GET /api/reportes/choferes
router.get('/choferes', reportes_controller_1.reportesController.reportePorChofer);
// GET /api/reportes/clientes
router.get('/clientes', reportes_controller_1.reportesController.reportePorCliente);
// Export routes
router.get('/vehiculos/export', reportes_controller_1.reportesController.exportarReporteVehiculo);
router.get('/choferes/export', reportes_controller_1.reportesController.exportarReporteChofer);
router.get('/clientes/export', reportes_controller_1.reportesController.exportarReporteCliente);
// Reporte General Global
router.get('/general', reportes_controller_1.reportesController.reporteGeneral);
router.get('/general/export', reportes_controller_1.reportesController.exportarReporteGeneral);
// Reporte mensual comparativo
router.get('/mensual-comparativo', reportes_controller_1.reportesController.reporteMensualComparativo);
// Reporte de Cartera (Cuentas por Cobrar)
router.get('/cartera', reportes_controller_1.reportesController.reporteCartera);
exports.default = router;
//# sourceMappingURL=reportes.routes.js.map