"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditoriaService = void 0;
// Servicio de Auditoría
const auditoria_repository_1 = require("../repositories/auditoria.repository");
exports.auditoriaService = {
    async listar(filtros) {
        return auditoria_repository_1.auditoriaRepository.findAll(filtros);
    },
    async obtenerDetalle(id) {
        const registro = await auditoria_repository_1.auditoriaRepository.findById(id);
        if (!registro) {
            throw new Error('Registro de auditoría no encontrado');
        }
        return registro;
    },
    async getEntidadesUnicas() {
        return auditoria_repository_1.auditoriaRepository.getEntidadesUnicas();
    }
};
//# sourceMappingURL=auditoria.service.js.map