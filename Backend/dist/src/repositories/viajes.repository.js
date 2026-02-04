"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viajesRepository = void 0;
// Repositorio de Viajes - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
exports.viajesRepository = {
    async findAll(filtros = {}) {
        const where = {};
        if (filtros.estado)
            where.estado = filtros.estado;
        if (filtros.estadoPagoCliente)
            where.estadoPagoCliente = filtros.estadoPagoCliente;
        if (filtros.vehiculoId)
            where.vehiculoId = filtros.vehiculoId;
        if (filtros.choferId)
            where.choferId = filtros.choferId;
        if (filtros.clienteId)
            where.clienteId = filtros.clienteId;
        if (filtros.fechaDesde || filtros.fechaHasta) {
            where.fechaSalida = {};
            if (filtros.fechaDesde)
                where.fechaSalida.gte = filtros.fechaDesde;
            if (filtros.fechaHasta)
                where.fechaSalida.lte = filtros.fechaHasta;
        }
        const [viajes, total] = await Promise.all([
            database_1.default.viaje.findMany({
                where,
                include: {
                    vehiculo: { select: { id: true, placa: true, marca: true, modelo: true } },
                    chofer: { select: { id: true, nombres: true, apellidos: true, telefono: true } },
                    cliente: { select: { id: true, nombreRazonSocial: true } },
                    material: { select: { id: true, nombre: true } },
                    pagos: { select: { monto: true, estado: true } }, // Incluir estado para filtrar
                },
                orderBy: { fechaSalida: 'desc' },
                skip: filtros.skip || 0,
                take: filtros.take || 50,
            }),
            database_1.default.viaje.count({ where }),
        ]);
        // Calcular totales de pagos al chofer por viaje
        const viajesConPagos = viajes.map(viaje => {
            const pagadoChofer = viaje.pagos?.reduce((sum, p) => {
                return p.estado === 'PAGADO' ? sum + Number(p.monto) : sum;
            }, 0) || 0;
            return {
                ...viaje,
                pagadoChofer, // Monto total pagado al chofer para este viaje
            };
        });
        return { viajes: viajesConPagos, total };
    },
    async findById(id) {
        return database_1.default.viaje.findUnique({
            where: { id },
            include: {
                vehiculo: { select: { id: true, placa: true, marca: true, modelo: true, tipo: true } },
                chofer: { select: { id: true, nombres: true, apellidos: true, telefono: true, correo: true } },
                cliente: { select: { id: true, nombreRazonSocial: true, telefono: true, correo: true } },
                material: { select: { id: true, nombre: true, unidadMedida: true, esPeligroso: true } },
                gastos: {
                    include: {
                        comprobante: true,
                    },
                    orderBy: { fecha: 'desc' },
                },
                pagos: {
                    orderBy: { fecha: 'desc' },
                },
            },
        });
    },
    async create(datos) {
        // Calcular fecha límite de pago si hay días de crédito
        let fechaLimitePago;
        if (datos.diasCredito && datos.diasCredito > 0) {
            fechaLimitePago = new Date(datos.fechaSalida);
            fechaLimitePago.setDate(fechaLimitePago.getDate() + datos.diasCredito);
        }
        return database_1.default.viaje.create({
            data: {
                vehiculoId: datos.vehiculoId,
                choferId: datos.choferId,
                clienteId: datos.clienteId,
                materialId: datos.materialId,
                origen: datos.origen,
                destino: datos.destino,
                fechaSalida: datos.fechaSalida,
                fechaLlegadaEstimada: datos.fechaLlegadaEstimada,
                kilometrosEstimados: datos.kilometrosEstimados,
                tarifa: datos.tarifa,
                montoPagoChofer: datos.montoPagoChofer,
                diasCredito: datos.diasCredito || 0,
                fechaLimitePago,
                observaciones: datos.observaciones,
                estado: client_1.EstadoViaje.PLANIFICADO,
            },
        });
    },
    async update(id, datos) {
        return database_1.default.viaje.update({
            where: { id },
            data: datos,
        });
    },
    async delete(id) {
        return database_1.default.viaje.delete({ where: { id } });
    },
    // Verificar que existan entidades relacionadas
    async validarEntidadesRelacionadas(vehiculoId, choferId, clienteId, materialId) {
        const [vehiculo, chofer, cliente, material] = await Promise.all([
            database_1.default.vehiculo.findFirst({ where: { id: vehiculoId, estado: 'ACTIVO' } }),
            database_1.default.chofer.findFirst({ where: { id: choferId, estado: 'ACTIVO' } }),
            database_1.default.cliente.findFirst({ where: { id: clienteId, estado: 'ACTIVO' } }),
            database_1.default.material.findUnique({ where: { id: materialId } }),
        ]);
        const errores = [];
        if (!vehiculo)
            errores.push('Vehículo no encontrado o inactivo');
        if (!chofer)
            errores.push('Chofer no encontrado o inactivo');
        if (!cliente)
            errores.push('Cliente no encontrado o inactivo');
        if (!material)
            errores.push('Material no encontrado');
        // Validar licencia de chofer
        if (chofer && chofer.fechaVencimientoLicencia) {
            const hoy = new Date();
            // Resetear horas para comparar solo fechas
            const fechaVencimiento = new Date(chofer.fechaVencimientoLicencia);
            fechaVencimiento.setHours(23, 59, 59, 999);
            if (fechaVencimiento < hoy) {
                errores.push(`La licencia del chofer ${chofer.nombres} ${chofer.apellidos} venció el ${fechaVencimiento.toLocaleDateString()}`);
            }
        }
        return { valido: errores.length === 0, errores };
    },
    /**
     * Verificar si hay solapamiento de viajes para un vehículo o chofer
     */
    async checkSolapamiento(fechaInicio, fechaFin, vehiculoId, choferId, excluirViajeId) {
        // Si no hay fecha fin (ej: llegada estimada), asumimos 24 horas por defecto para la validación
        const fin = fechaFin ? new Date(fechaFin) : new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000);
        // Criterio de solapamiento: (StartA <= EndB) and (EndA >= StartB)
        // Buscamos viajes que estén activos (PLANIFICADO o EN_CURSO)
        const where = {
            estado: { in: [client_1.EstadoViaje.PLANIFICADO, client_1.EstadoViaje.EN_CURSO] },
            AND: [
                { fechaSalida: { lte: fin } },
                { fechaLlegadaEstimada: { gte: fechaInicio } }
            ],
            OR: [
                { vehiculoId },
                { choferId }
            ]
        };
        if (excluirViajeId) {
            where.id = { not: excluirViajeId };
        }
        const conflictos = await database_1.default.viaje.findMany({
            where,
            select: {
                id: true,
                fechaSalida: true,
                fechaLlegadaEstimada: true,
                vehiculoId: true,
                choferId: true,
                estado: true
            }
        });
        return conflictos;
    },
    // Estadísticas para dashboard
    async getEstadisticasMensuales(anio, mes) {
        const inicioMes = new Date(anio, mes - 1, 1);
        const finMes = new Date(anio, mes, 0, 23, 59, 59);
        const [viajesCompletados, totalViajes] = await Promise.all([
            database_1.default.viaje.findMany({
                where: {
                    estado: client_1.EstadoViaje.COMPLETADO,
                    fechaSalida: { gte: inicioMes, lte: finMes },
                },
                select: { tarifa: true },
            }),
            database_1.default.viaje.count({
                where: {
                    fechaSalida: { gte: inicioMes, lte: finMes },
                },
            }),
        ]);
        const ingresosTotales = viajesCompletados.reduce((sum, v) => sum + Number(v.tarifa), 0);
        return {
            totalViajes,
            viajesCompletados: viajesCompletados.length,
            ingresosTotales,
        };
    },
};
//# sourceMappingURL=viajes.repository.js.map