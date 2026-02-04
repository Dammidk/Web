"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambiarEstadoViajeSchema = exports.updateViajeSchema = exports.createViajeSchema = void 0;
const zod_1 = require("zod");
exports.createViajeSchema = zod_1.z.object({
    body: zod_1.z.object({
        vehiculoId: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseInt(val, 10))]),
        choferId: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseInt(val, 10))]),
        clienteId: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseInt(val, 10))]),
        materialId: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseInt(val, 10))]),
        origen: zod_1.z.string().min(3, 'El origen debe tener al menos 3 caracteres'),
        destino: zod_1.z.string().min(3, 'El destino debe tener al menos 3 caracteres'),
        // FIX #14: Validar fechaSalida no muy en el pasado
        fechaSalida: zod_1.z.string()
            .transform(str => new Date(str))
            .refine((fecha) => {
            const hace30Dias = new Date();
            hace30Dias.setDate(hace30Dias.getDate() - 30);
            return fecha >= hace30Dias;
        }, {
            message: 'La fecha de salida no puede ser mayor a 30 días en el pasado'
        }),
        tarifa: zod_1.z.union([zod_1.z.number().positive(), zod_1.z.string().transform(val => parseFloat(val))]),
        // Opcionales
        fechaLlegadaEstimada: zod_1.z.string().optional()
            .transform(str => str ? new Date(str) : undefined),
        kilometrosEstimados: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseInt(val, 10))]).optional(),
        montoPagoChofer: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseFloat(val))]).optional(),
        observaciones: zod_1.z.string().optional(),
        // FIX #9: Validar días de crédito con valores estándar
        diasCredito: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseInt(val, 10))])
            .optional()
            .default(0)
            .refine((val) => [0, 15, 30, 60, 90].includes(val), {
            message: 'Los días de crédito deben ser 0, 15, 30, 60 o 90 días'
        })
    })
});
exports.updateViajeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform(val => parseInt(val, 10))
    }),
    body: zod_1.z.object({
        vehiculoId: zod_1.z.number().optional(),
        choferId: zod_1.z.number().optional(),
        clienteId: zod_1.z.number().optional(),
        origen: zod_1.z.string().optional(),
        destino: zod_1.z.string().optional(),
        fechaSalida: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        tarifa: zod_1.z.number().optional(),
        montoPagoChofer: zod_1.z.number().optional(),
    }).partial()
});
exports.cambiarEstadoViajeSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform(val => parseInt(val, 10))
    }),
    body: zod_1.z.object({
        estado: zod_1.z.enum(['PLANIFICADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO']),
        fechaLlegadaReal: zod_1.z.string().optional().transform(str => str ? new Date(str) : undefined),
        kilometrosReales: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(val => parseInt(val, 10))]).optional()
    })
});
//# sourceMappingURL=viajes.schema.js.map