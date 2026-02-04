"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehiculoRepository = void 0;
// Repositorio de Vehículos - Acceso a BD
const database_1 = __importDefault(require("../config/database"));
// Configuración de kilometraje para mantenimiento
const INTERVALO_MANTENIMIENTO_KM = 5000;
const KM_ALERTA_ANTES = 500;
exports.vehiculoRepository = {
    async findAll(filtros = {}) {
        const where = {};
        if (filtros.busqueda) {
            where.OR = [
                { placa: { contains: filtros.busqueda, mode: 'insensitive' } },
                { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
                { modelo: { contains: filtros.busqueda, mode: 'insensitive' } }
            ];
        }
        if (filtros.estado)
            where.estado = filtros.estado;
        const vehiculos = await database_1.default.vehiculo.findMany({
            where,
            orderBy: { placa: 'asc' },
            include: {
                mantenimientos: {
                    orderBy: { fecha: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        fecha: true,
                        kilometrajeAlMomento: true,
                        descripcion: true,
                        tipo: true
                    }
                }
            }
        });
        // Calcular estado de mantenimiento para cada vehículo
        return vehiculos.map(v => {
            const ultimoMant = v.mantenimientos[0];
            const kmUltimoMant = ultimoMant?.kilometrajeAlMomento || 0;
            const proximoMantKm = kmUltimoMant + INTERVALO_MANTENIMIENTO_KM;
            const kmParaProximoMant = proximoMantKm - v.kilometrajeActual;
            const necesitaMantenimiento = kmParaProximoMant <= KM_ALERTA_ANTES;
            const mantenimientoVencido = kmParaProximoMant <= 0;
            return {
                ...v,
                ultimoMantenimiento: ultimoMant || null,
                proximoMantenimientoKm: proximoMantKm,
                kmParaProximoMant,
                necesitaMantenimiento,
                mantenimientoVencido
            };
        });
    },
    async findById(id) {
        return database_1.default.vehiculo.findUnique({
            where: { id },
            include: {
                mantenimientos: {
                    orderBy: { fecha: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        fecha: true,
                        kilometrajeAlMomento: true,
                        descripcion: true,
                        tipo: true
                    }
                }
            }
        });
    },
    async findByPlaca(placa) {
        return database_1.default.vehiculo.findUnique({ where: { placa } });
    },
    async create(data) {
        return database_1.default.vehiculo.create({ data });
    },
    async update(id, data) {
        return database_1.default.vehiculo.update({ where: { id }, data });
    },
    async delete(id) {
        return database_1.default.vehiculo.delete({ where: { id } });
    },
    async countActivos() {
        return database_1.default.vehiculo.count({ where: { estado: 'ACTIVO' } });
    },
    async countTotal() {
        return database_1.default.vehiculo.count();
    }
};
//# sourceMappingURL=vehiculo.repository.js.map