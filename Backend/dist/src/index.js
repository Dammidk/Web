"use strict";
// Punto de entrada principal del servidor
// Sistema de Control de Transporte de Carga Pesada
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
// Validar variables de entorno ANTES de continuar
const env_validation_1 = __importDefault(require("./config/env.validation"));
(0, env_validation_1.default)();
// Importar configuraciones de seguridad
const helmet_config_1 = require("./config/helmet.config");
const rateLimiter_config_1 = require("./config/rateLimiter.config");
const logger_config_1 = __importDefault(require("./config/logger.config"));
const swagger_config_1 = require("./config/swagger.config");
// Importar rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const vehiculo_routes_1 = __importDefault(require("./routes/vehiculo.routes"));
const chofer_routes_1 = __importDefault(require("./routes/chofer.routes"));
const cliente_routes_1 = __importDefault(require("./routes/cliente.routes"));
const material_routes_1 = __importDefault(require("./routes/material.routes"));
const auditoria_routes_1 = __importDefault(require("./routes/auditoria.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const viajes_routes_1 = __importDefault(require("./routes/viajes.routes"));
const gastos_routes_1 = __importDefault(require("./routes/gastos.routes"));
const mantenimiento_routes_1 = __importDefault(require("./routes/mantenimiento.routes"));
const pagosChofer_routes_1 = __importDefault(require("./routes/pagosChofer.routes"));
const reportes_routes_1 = __importDefault(require("./routes/reportes.routes"));
const alertas_routes_1 = __importDefault(require("./routes/alertas.routes"));
// Importar servicio de tareas programadas
const scheduler_service_1 = require("./services/scheduler.service");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares de seguridad (DEBEN ir primero)
// Helmet: Headers de seguridad HTTP
app.use(helmet_config_1.helmetConfig);
// Rate Limiting general
app.use('/api', rateLimiter_config_1.generalLimiter);
// Middlewares globales
// Configurar CORS - permitir acceso desde red local en desarrollo
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sin origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }
        // En desarrollo, permitir cualquier origen de red local (192.168.x.x, 10.x.x.x, etc.)
        if (process.env.NODE_ENV !== 'production') {
            const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
            if (isLocalNetwork) {
                return callback(null, true);
            }
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Limitar tamaño del body para prevenir ataques DoS
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Middleware para logging de peticiones con Winston
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_config_1.default.info('HTTP Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
        });
    });
    next();
});
// Configurar Swagger (antes de las rutas)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    (0, swagger_config_1.setupSwagger)(app);
}
// Rutas de la API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/vehiculos', vehiculo_routes_1.default);
app.use('/api/choferes', chofer_routes_1.default);
app.use('/api/clientes', cliente_routes_1.default);
app.use('/api/materiales', material_routes_1.default);
app.use('/api/auditoria', auditoria_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/viajes', viajes_routes_1.default);
app.use('/api/gastos', gastos_routes_1.default);
app.use('/api/mantenimientos', mantenimiento_routes_1.default);
app.use('/api/pagos-choferes', pagosChofer_routes_1.default);
app.use('/api/reportes', reportes_routes_1.default);
app.use('/api/alertas', alertas_routes_1.default);
// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({
        estado: 'ok',
        mensaje: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});
// Manejo global de errores (DEBE ir antes de las rutas para capturar todos los errores)
const error_middleware_1 = require("./middlewares/error.middleware");
// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        ruta: req.path
    });
});
// Error handler global (debe ser el último middleware)
app.use(error_middleware_1.globalErrorHandler);
// Iniciar servidor
app.listen(PORT, () => {
    logger_config_1.default.info('Servidor iniciado', {
        port: PORT,
        url: `http://0.0.0.0:${PORT}`,
        environment: process.env.NODE_ENV || 'development',
    });
    console.log('='.repeat(50));
    console.log('🚛 SISTEMA DE CONTROL DE TRANSPORTE');
    console.log('='.repeat(50));
    console.log(`✅ Servidor iniciado en puerto ${PORT}`);
    console.log(`📍 URL Local: http://localhost:${PORT}`);
    console.log(`🌐 URL Red: http://0.0.0.0:${PORT} (accesible desde cualquier IP)`);
    console.log(`🕐 Fecha/Hora: ${new Date().toLocaleString('es-EC')}`);
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
        console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
    }
    console.log('='.repeat(50));
    // Iniciar tareas programadas
    (0, scheduler_service_1.iniciarTareasProgramadas)();
});
exports.default = app;
//# sourceMappingURL=index.js.map