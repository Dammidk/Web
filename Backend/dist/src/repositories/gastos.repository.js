"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gastosRepository = void 0;
// Repositorio de Gastos de Viaje - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
exports.gastosRepository = {
    async findByViajeId(viajeId) {
        return database_1.default.gastoViaje.findMany({
            where: { viajeId },
            include: {
                comprobante: true,
            },
            orderBy: { fecha: 'desc' },
        });
    },
    async findById(id) {
        return database_1.default.gastoViaje.findUnique({
            where: { id },
            include: { comprobante: true },
        });
    },
    async create(datos, comprobanteId) {
        return database_1.default.gastoViaje.create({
            data: {
                viajeId: datos.viajeId,
                tipoGasto: datos.tipoGasto,
                monto: datos.monto,
                fecha: datos.fecha,
                metodoPago: datos.metodoPago || client_1.MetodoPago.EFECTIVO,
                descripcion: datos.descripcion,
                comprobanteId,
            },
            include: { comprobante: true },
        });
    },
    async update(id, datos) {
        return database_1.default.gastoViaje.update({
            where: { id },
            data: datos,
            include: { comprobante: true },
        });
    },
    async delete(id) {
        return database_1.default.gastoViaje.delete({ where: { id } });
    },
    // Crear comprobante
    async createComprobante(datos) {
        return database_1.default.comprobante.create({
            data: {
                tipo: datos.tipo,
                referenciaId: datos.referenciaId,
                url: datos.url,
                publicId: datos.publicId,
                nombreArchivoOriginal: datos.nombreArchivoOriginal,
            },
        });
    },
    // Sumar gastos de un viaje
    async sumarGastosViaje(viajeId) {
        const result = await database_1.default.gastoViaje.aggregate({
            where: { viajeId },
            _sum: { monto: true },
        });
        return Number(result._sum.monto) || 0;
    },
    // Gastos totales del mes (para dashboard)
    async getGastosMensuales(anio, mes) {
        const inicioMes = new Date(anio, mes - 1, 1);
        const finMes = new Date(anio, mes, 0, 23, 59, 59);
        const result = await database_1.default.gastoViaje.aggregate({
            where: {
                fecha: { gte: inicioMes, lte: finMes },
            },
            _sum: { monto: true },
        });
        return Number(result._sum.monto) || 0;
    },
};
//# sourceMappingURL=gastos.repository.js.map