"use strict";
// Rutas de Vehículos
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehiculo_controller_1 = require("../controllers/vehiculo.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.verificarToken);
// GET /api/vehiculos - Listar (Admin y Auditor pueden ver)
router.get('/', auth_middleware_1.puedeLeer, vehiculo_controller_1.listarVehiculos);
// GET /api/vehiculos/:id - Detalle (Admin y Auditor pueden ver)
router.get('/:id', auth_middleware_1.puedeLeer, vehiculo_controller_1.obtenerVehiculo);
// POST /api/vehiculos - Crear (Solo Admin)
router.post('/', auth_middleware_1.puedeEscribir, vehiculo_controller_1.crearVehiculo);
// PUT /api/vehiculos/:id - Actualizar (Solo Admin)
router.put('/:id', auth_middleware_1.puedeEscribir, vehiculo_controller_1.actualizarVehiculo);
// DELETE /api/vehiculos/:id - Eliminar (Solo Admin)
router.delete('/:id', auth_middleware_1.puedeEscribir, vehiculo_controller_1.eliminarVehiculo);
exports.default = router;
//# sourceMappingURL=vehiculo.routes.js.map