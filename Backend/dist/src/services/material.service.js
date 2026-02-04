"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialService = exports.materialSchema = void 0;
// Servicio de Materiales - Lógica de negocio
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const material_repository_1 = require("../repositories/material.repository");
const auditoria_repository_1 = require("../repositories/auditoria.repository");
exports.materialSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'Nombre requerido'),
    unidadMedida: zod_1.z.string().min(1, 'Unidad de medida requerida'),
    esPeligroso: zod_1.z.boolean().optional().default(false),
    descripcion: zod_1.z.string().optional().nullable()
});
exports.materialService = {
    async listar(filtros) {
        return material_repository_1.materialRepository.findAll(filtros);
    },
    async obtenerPorId(id) {
        return material_repository_1.materialRepository.findById(id);
    },
    async crear(datos, usuarioId, ip) {
        const nombreNormalizado = datos.nombre.trim();
        const existente = await material_repository_1.materialRepository.findByNombre(nombreNormalizado);
        if (existente)
            throw new Error(`Ya existe un material con el nombre ${nombreNormalizado}`);
        const dataToSave = {
            nombre: nombreNormalizado,
            unidadMedida: datos.unidadMedida.trim(),
            esPeligroso: datos.esPeligroso || false,
            descripcion: datos.descripcion?.trim() || null
        };
        const material = await material_repository_1.materialRepository.create(dataToSave);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.CREAR,
            entidad: 'Material',
            entidadId: material.id,
            datosNuevos: material,
            ipAddress: ip
        });
        return material;
    },
    async actualizar(id, datos, usuarioId, ip) {
        const anterior = await material_repository_1.materialRepository.findById(id);
        if (!anterior)
            throw new Error('Material no encontrado');
        if (datos.nombre && datos.nombre !== anterior.nombre) {
            const existente = await material_repository_1.materialRepository.findByNombre(datos.nombre);
            if (existente)
                throw new Error(`El nombre ${datos.nombre} ya está en uso`);
        }
        const dataToUpdate = {};
        if (datos.nombre)
            dataToUpdate.nombre = datos.nombre.trim();
        if (datos.unidadMedida)
            dataToUpdate.unidadMedida = datos.unidadMedida.trim();
        if (datos.esPeligroso !== undefined)
            dataToUpdate.esPeligroso = datos.esPeligroso;
        if (datos.descripcion !== undefined)
            dataToUpdate.descripcion = datos.descripcion?.trim() || null;
        const material = await material_repository_1.materialRepository.update(id, dataToUpdate);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.EDITAR,
            entidad: 'Material',
            entidadId: id,
            datosAnteriores: anterior,
            datosNuevos: material,
            ipAddress: ip
        });
        return material;
    },
    async eliminar(id, usuarioId, ip) {
        const material = await material_repository_1.materialRepository.findById(id);
        if (!material)
            throw new Error('Material no encontrado');
        // NUEVO: Verificar si el material está siendo usado en viajes
        const viajesConMaterial = await database_1.default.viaje.count({
            where: { materialId: id }
        });
        if (viajesConMaterial > 0) {
            throw new Error(`No se puede eliminar: El material está siendo usado en ${viajesConMaterial} viaje(s). Considere desactivarlo en su lugar.`);
        }
        await material_repository_1.materialRepository.delete(id);
        await auditoria_repository_1.auditoriaRepository.create(usuarioId, {
            accion: client_1.AccionAuditoria.ELIMINAR,
            entidad: 'Material',
            entidadId: id,
            datosAnteriores: material,
            ipAddress: ip
        });
        return material;
    }
};
//# sourceMappingURL=material.service.js.map