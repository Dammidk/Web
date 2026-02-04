"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarVehiculo = exports.actualizarVehiculo = exports.crearVehiculo = exports.obtenerVehiculo = exports.listarVehiculos = void 0;
const vehiculo_service_1 = require("../services/vehiculo.service");
// GET /api/vehiculos
const listarVehiculos = async (req, res, next) => {
    try {
        const { busqueda, estado } = req.query;
        const vehiculos = await vehiculo_service_1.vehiculoService.listar({
            busqueda: busqueda,
            estado: estado
        });
        res.json({ exito: true, datos: vehiculos });
    }
    catch (error) {
        next(error);
    }
};
exports.listarVehiculos = listarVehiculos;
// GET /api/vehiculos/:id
const obtenerVehiculo = async (req, res, next) => {
    try {
        const vehiculo = await vehiculo_service_1.vehiculoService.obtenerPorId(parseInt(req.params.id));
        if (!vehiculo) {
            res.status(404).json({ error: 'Vehículo no encontrado' });
            return;
        }
        res.json({ vehiculo });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerVehiculo = obtenerVehiculo;
// POST /api/vehiculos
const crearVehiculo = async (req, res, next) => {
    try {
        // Validar con Zod
        const resultado = vehiculo_service_1.vehiculoSchema.safeParse(req.body);
        if (!resultado.success) {
            res.status(400).json({ error: 'Datos inválidos', detalles: resultado.error.flatten() });
            return;
        }
        const vehiculo = await vehiculo_service_1.vehiculoService.crear(resultado.data, req.usuario.id, req.ip || undefined);
        console.log(`✅ Vehículo creado: ${vehiculo.placa}`);
        res.status(201).json({ mensaje: 'Vehículo creado exitosamente', vehiculo });
    }
    catch (error) {
        next(error);
    }
};
exports.crearVehiculo = crearVehiculo;
// PUT /api/vehiculos/:id
const actualizarVehiculo = async (req, res, next) => {
    try {
        const vehiculo = await vehiculo_service_1.vehiculoService.actualizar(parseInt(req.params.id), req.body, req.usuario.id, req.ip || undefined);
        console.log(`✅ Vehículo actualizado: ${vehiculo.placa}`);
        res.json({ mensaje: 'Vehículo actualizado exitosamente', vehiculo });
    }
    catch (error) {
        next(error);
    }
};
exports.actualizarVehiculo = actualizarVehiculo;
// DELETE /api/vehiculos/:id
const eliminarVehiculo = async (req, res, next) => {
    try {
        const vehiculo = await vehiculo_service_1.vehiculoService.eliminar(parseInt(req.params.id), req.usuario.id, req.ip || undefined);
        console.log(`🗑️ Vehículo eliminado: ${vehiculo.placa}`);
        res.json({ mensaje: 'Vehículo eliminado exitosamente', vehiculoEliminado: vehiculo });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarVehiculo = eliminarVehiculo;
//# sourceMappingURL=vehiculo.controller.js.map