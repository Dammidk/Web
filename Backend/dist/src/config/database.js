"use strict";
// Configuración del cliente Prisma
// Singleton para evitar múltiples conexiones en desarrollo
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = global.prisma || new client_1.PrismaClient({
    log: ['error', 'warn'],
});
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
// Verificar conexión
exports.prisma.$connect()
    .then(() => {
    console.log('✅ Conexión a base de datos establecida');
})
    .catch((error) => {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    console.error('❌ La aplicación no puede funcionar sin conexión a la base de datos.');
    process.exit(1);
});
exports.default = exports.prisma;
//# sourceMappingURL=database.js.map