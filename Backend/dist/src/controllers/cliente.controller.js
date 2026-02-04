"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarCliente = exports.actualizarCliente = exports.crearCliente = exports.obtenerCliente = exports.listarClientes = void 0;
const cliente_service_1 = require("../services/cliente.service");
// GET /api/clientes
const listarClientes = async (req, res, next) => {
    try {
        const { busqueda, estado } = req.query;
        const clientes = await cliente_service_1.clienteService.listar({
            busqueda: busqueda,
            estado: estado
        });
        res.json({ exito: true, datos: clientes });
    }
    catch (error) {
        next(error);
    }
};
exports.listarClientes = listarClientes;
// GET /api/clientes/:id
const obtenerCliente = async (req, res, next) => {
    try {
        const cliente = await cliente_service_1.clienteService.obtenerPorId(parseInt(req.params.id));
        if (!cliente) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        res.json({ cliente });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerCliente = obtenerCliente;
// POST /api/clientes
const crearCliente = async (req, res, next) => {
    try {
        const resultado = cliente_service_1.clienteSchema.safeParse(req.body);
        if (!resultado.success) {
            res.status(400).json({ error: 'Datos inválidos', detalles: resultado.error.flatten() });
            return;
        }
        const cliente = await cliente_service_1.clienteService.crear(resultado.data, req.usuario.id, req.ip || undefined);
        console.log(`✅ Cliente creado: ${cliente.nombreRazonSocial}`);
        res.status(201).json({ mensaje: 'Cliente creado exitosamente', cliente });
    }
    catch (error) {
        next(error);
    }
};
exports.crearCliente = crearCliente;
// PUT /api/clientes/:id
const actualizarCliente = async (req, res, next) => {
    try {
        const cliente = await cliente_service_1.clienteService.actualizar(parseInt(req.params.id), req.body, req.usuario.id, req.ip || undefined);
        console.log(`✅ Cliente actualizado: ${cliente.nombreRazonSocial}`);
        res.json({ mensaje: 'Cliente actualizado exitosamente', cliente });
    }
    catch (error) {
        next(error);
    }
};
exports.actualizarCliente = actualizarCliente;
// DELETE /api/clientes/:id
const eliminarCliente = async (req, res, next) => {
    try {
        const cliente = await cliente_service_1.clienteService.eliminar(parseInt(req.params.id), req.usuario.id, req.ip || undefined);
        console.log(`🗑️ Cliente eliminado: ${cliente.nombreRazonSocial}`);
        res.json({ mensaje: 'Cliente eliminado exitosamente', clienteEliminado: cliente });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarCliente = eliminarCliente;
//# sourceMappingURL=cliente.controller.js.map