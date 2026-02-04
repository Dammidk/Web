"use strict";
// Rutas de Clientes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cliente_controller_1 = require("../controllers/cliente.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.verificarToken);
router.get('/', auth_middleware_1.puedeLeer, cliente_controller_1.listarClientes);
router.get('/:id', auth_middleware_1.puedeLeer, cliente_controller_1.obtenerCliente);
router.post('/', auth_middleware_1.puedeEscribir, cliente_controller_1.crearCliente);
router.put('/:id', auth_middleware_1.puedeEscribir, cliente_controller_1.actualizarCliente);
router.delete('/:id', auth_middleware_1.puedeEscribir, cliente_controller_1.eliminarCliente);
exports.default = router;
//# sourceMappingURL=cliente.routes.js.map