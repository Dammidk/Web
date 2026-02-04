"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarMaterial = exports.actualizarMaterial = exports.crearMaterial = exports.obtenerMaterial = exports.listarMateriales = void 0;
const material_service_1 = require("../services/material.service");
// GET /api/materiales
const listarMateriales = async (req, res, next) => {
    try {
        const { busqueda } = req.query;
        const materiales = await material_service_1.materialService.listar({ busqueda: busqueda });
        res.json({ total: materiales.length, materiales });
    }
    catch (error) {
        next(error);
    }
};
exports.listarMateriales = listarMateriales;
// GET /api/materiales/:id
const obtenerMaterial = async (req, res, next) => {
    try {
        const material = await material_service_1.materialService.obtenerPorId(parseInt(req.params.id));
        if (!material) {
            res.status(404).json({ error: 'Material no encontrado' });
            return;
        }
        res.json({ material });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerMaterial = obtenerMaterial;
// POST /api/materiales
const crearMaterial = async (req, res, next) => {
    try {
        const resultado = material_service_1.materialSchema.safeParse(req.body);
        if (!resultado.success) {
            res.status(400).json({ error: 'Datos inválidos', detalles: resultado.error.flatten() });
            return;
        }
        const material = await material_service_1.materialService.crear(resultado.data, req.usuario.id, req.ip || undefined);
        console.log(`✅ Material creado: ${material.nombre}`);
        res.status(201).json({ mensaje: 'Material creado exitosamente', material });
    }
    catch (error) {
        next(error);
    }
};
exports.crearMaterial = crearMaterial;
// PUT /api/materiales/:id
const actualizarMaterial = async (req, res, next) => {
    try {
        const material = await material_service_1.materialService.actualizar(parseInt(req.params.id), req.body, req.usuario.id, req.ip || undefined);
        console.log(`✅ Material actualizado: ${material.nombre}`);
        res.json({ mensaje: 'Material actualizado exitosamente', material });
    }
    catch (error) {
        next(error);
    }
};
exports.actualizarMaterial = actualizarMaterial;
// DELETE /api/materiales/:id
const eliminarMaterial = async (req, res, next) => {
    try {
        const material = await material_service_1.materialService.eliminar(parseInt(req.params.id), req.usuario.id, req.ip || undefined);
        console.log(`🗑️ Material eliminado: ${material.nombre}`);
        res.json({ mensaje: 'Material eliminado exitosamente', materialEliminado: material });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarMaterial = eliminarMaterial;
//# sourceMappingURL=material.controller.js.map