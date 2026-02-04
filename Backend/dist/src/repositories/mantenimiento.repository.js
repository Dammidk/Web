"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mantenimientosRepository = void 0;
// Repositorio de Mantenimientos
const database_1 = __importDefault(require("../config/database"));
exports.mantenimientosRepository = {
    async findAll(filtros) {
        const { vehiculoId, fechaDesde, fechaHasta, tipo, estado } = filtros;
        const where = {};
        if (vehiculoId)
            where.vehiculoId = vehiculoId;
        if (tipo)
            where.tipo = tipo;
        if (estado)
            where.estado = estado;
        if (fechaDesde || fechaHasta) {
            where.fecha = {};
            if (fechaDesde)
                where.fecha.gte = fechaDesde;
            if (fechaHasta)
                where.fecha.lte = fechaHasta;
        }
        return database_1.default.mantenimiento.findMany({
            where,
            include: {
                vehiculo: {
                    select: { id: true, placa: true, marca: true, modelo: true, kilometrajeActual: true }
                },
                comprobante: true,
            },
            orderBy: [
                { estado: 'asc' }, // PENDIENTE y EN_CURSO primero
                { fecha: 'desc' }
            ],
        });
    },
    async findById(id) {
        return database_1.default.mantenimiento.findUnique({
            where: { id },
            include: {
                vehiculo: true,
                comprobante: true,
            },
        });
    },
    async create(datos, comprobanteId) {
        return database_1.default.mantenimiento.create({
            data: {
                vehiculoId: datos.vehiculoId,
                tipo: datos.tipo,
                descripcion: datos.descripcion,
                taller: datos.taller,
                esExterno: datos.esExterno ?? true,
                costoManoObra: datos.costoManoObra || 0,
                costoRepuestos: datos.costoRepuestos || 0,
                costoTotal: datos.costoTotal,
                fecha: datos.fecha,
                kilometrajeAlMomento: datos.kilometrajeAlMomento,
                proximaFecha: datos.proximaFecha,
                proximoKilometraje: datos.proximoKilometraje,
                comprobanteId,
            },
            include: {
                vehiculo: true,
                comprobante: true,
            },
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
        return database_1.default.mantenimiento.update({
            where: { id },
            data: {
                ...(datos.tipo && { tipo: datos.tipo }),
                ...(datos.descripcion && { descripcion: datos.descripcion }),
                ...(datos.taller && { taller: datos.taller }),
                ...(datos.esExterno !== undefined && { esExterno: datos.esExterno }),
                ...(datos.costoManoObra && { costoManoObra: datos.costoManoObra }),
                ...(datos.costoRepuestos && { costoRepuestos: datos.costoRepuestos }),
                ...(datos.costoTotal && { costoTotal: datos.costoTotal }),
                ...(datos.fecha && { fecha: datos.fecha }),
                ...(datos.kilometrajeAlMomento && { kilometrajeAlMomento: datos.kilometrajeAlMomento }),
                ...(datos.proximaFecha && { proximaFecha: datos.proximaFecha }),
                ...(datos.proximoKilometraje && { proximoKilometraje: datos.proximoKilometraje }),
                ...(datos.fechaInicio && { fechaInicio: datos.fechaInicio }),
            },
            include: { comprobante: true },
        });
    },
    async delete(id) {
        return database_1.default.mantenimiento.delete({ where: { id } });
    },
    // Sumar costos de mantenimiento (para reportes)
    // SOLO suma mantenimientos COMPLETADOS, ya que los pendientes/cancelados no son gasto real aún.
    async sumarCostos(vehiculoId, fechaDesde, fechaHasta) {
        const where = {
            estado: 'COMPLETADO'
        };
        if (vehiculoId) {
            where.vehiculoId = vehiculoId;
        }
        if (fechaDesde || fechaHasta) {
            where.fecha = {};
            if (fechaDesde)
                where.fecha.gte = fechaDesde;
            if (fechaHasta)
                where.fecha.lte = fechaHasta;
        }
        const result = await database_1.default.mantenimiento.aggregate({
            where,
            _sum: { costoTotal: true },
        });
        return Number(result._sum.costoTotal) || 0;
    }
};
//# sourceMappingURL=mantenimiento.repository.js.map