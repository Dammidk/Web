"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerAlertas = void 0;
const alertas_service_1 = require("../services/alertas.service");
const obtenerAlertas = async (req, res, next) => {
    try {
        const alertas = await alertas_service_1.alertasService.obtenerAlertas();
        res.json(alertas);
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerAlertas = obtenerAlertas;
//# sourceMappingURL=alertas.controller.js.map