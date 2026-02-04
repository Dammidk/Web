"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed de base de datos...\n');
    // Limpiar base de datos
    console.log('🗑️  Limpiando base de datos...');
    await prisma.registroAuditoria.deleteMany();
    await prisma.pagoChofer.deleteMany();
    await prisma.gastoViaje.deleteMany();
    await prisma.mantenimiento.deleteMany();
    await prisma.comprobante.deleteMany();
    await prisma.viaje.deleteMany();
    await prisma.chofer.deleteMany();
    await prisma.vehiculo.deleteMany();
    await prisma.material.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.usuario.deleteMany();
    console.log('✅ Base de datos limpiada\n');
    // Solo crear usuarios
    console.log('👤 Creando usuarios...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
        data: {
            nombreUsuario: 'admin',
            nombreCompleto: 'Administrador Sistema',
            email: 'admin@transporte.ec',
            passwordHash: passwordHash,
            rol: 'ADMIN',
            activo: true
        }
    });
    await prisma.usuario.create({
        data: {
            nombreUsuario: 'auditor',
            nombreCompleto: 'Usuario Auditor',
            email: 'auditor@transporte.ec',
            passwordHash: passwordHash,
            rol: 'AUDITOR',
            activo: true
        }
    });
    console.log('✅ 2 usuarios creados\n');
    console.log('='.repeat(40));
    console.log('🔐 CREDENCIALES:');
    console.log('   admin / admin123');
    console.log('   auditor / admin123');
    console.log('='.repeat(40));
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map