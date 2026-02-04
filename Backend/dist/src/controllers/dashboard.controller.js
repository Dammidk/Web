"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerResumen = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
// GET /api/dashboard
const obtenerResumen = async (req, res, next) => {
    try {
        const resumen = await dashboard_service_1.dashboardService.obtenerResumen();
        res.json({ resumen });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerResumen = obtenerResumen;
//# sourceMappingURL=dashboard.controller.js.map