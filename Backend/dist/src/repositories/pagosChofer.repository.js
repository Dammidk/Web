"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagosChoferRepository = void 0;
// Repositorio de Pagos a Choferes
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
exports.pagosChoferRepository = {
    async findAll(filtros) {
        const { choferId, fechaDesde, fechaHasta, estado } = filtros;
        return database_1.default.pagoChofer.findMany({
            where: {
                choferId,
                fecha: {
                    gte: fechaDesde,
                    lte: fechaHasta,
                },
                estado: estado || undefined,
            },
            include: {
                chofer: {
                    select: { nombres: true, apellidos: true, documentoId: true }
                },
                comprobante: true,
            },
            orderBy: { fecha: 'desc' },
        });
    },
    async findById(id) {
        return database_1.default.pagoChofer.findUnique({
            where: { id },
            include: {
                chofer: true,
                comprobante: true,
            },
        });
    },
    async create(datos, comprobanteId) {
        return database_1.default.pagoChofer.create({
            data: {
                choferId: datos.choferId,
                monto: datos.monto,
                fecha: datos.fecha,
                metodoPago: datos.metodoPago || client_1.MetodoPago.EFECTIVO,
                descripcion: datos.descripcion,
                comprobanteId,
                viajeId: datos.viajeId,
                estado: datos.estado || 'PENDIENTE' // Por defecto PENDIENTE
            },
            include: {
                chofer: true,
                comprobante: true,
                viaje: {
                    select: { origen: true, destino: true, tarifa: true }
                }
            },
        });
    },
    // NUEVO: Marcar pago como pagado
    async marcarPagado(id) {
        return database_1.default.pagoChofer.update({
            where: { id },
            data: {
                estado: 'PAGADO',
                fechaPagoReal: new Date()
            },
            include: {
                chofer: true,
                viaje: {
                    select: { origen: true, destino: true }
                }
            }
        });
    },
    async createComprobante(datos) {
        return database_1.default.comprobante.create({
            data: {
                tipo: datos.tipo,
                url: datos.url,
                publicId: datos.publicId,
                nombreArchivoOriginal: datos.nombreArchivoOriginal,
            },
        });
    },
    async update(id, datos) {
        return database_1.default.pagoChofer.update({
            where: { id },
            data: datos,
            include: { comprobante: true },
        });
    },
    async delete(id) {
        return database_1.default.pagoChofer.delete({ where: { id } });
    },
    // Sumar pagos a un chofer en un periodo (para balance)
    // Si choferId es undefined, suma todos los pagos de todos los choferes
    async sumarPagos(choferId, fechaDesde, fechaHasta) {
        const where = {};
        if (choferId) {
            where.choferId = choferId;
        }
        if (fechaDesde || fechaHasta) {
            where.fecha = {};
            if (fechaDesde)
                where.fecha.gte = fechaDesde;
            if (fechaHasta)
                where.fecha.lte = fechaHasta;
        }
        const result = await database_1.default.pagoChofer.aggregate({
            where,
            _sum: { monto: true },
        });
        return Number(result._sum.monto) || 0;
    },
    // Sumar pagos específicos de un viaje
    async sumarPagosPorViaje(viajeId) {
        const result = await database_1.default.pagoChofer.aggregate({
            where: { viajeId },
            _sum: { monto: true },
        });
        return Number(result._sum.monto) || 0;
    },
    // FIX #4: Verificar si ya existe un pago para un viaje específico
    async findByViaje(viajeId) {
        return database_1.default.pagoChofer.findFirst({
            where: { viajeId }
        });
    }
};
//# sourceMappingURL=pagosChofer.repository.js.map