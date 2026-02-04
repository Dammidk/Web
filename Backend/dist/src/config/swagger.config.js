"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
// Configuración de Swagger para documentación de API
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Sistema de Control de Transporte',
            version: '1.0.0',
            description: 'API REST para el sistema de control de transporte de carga pesada',
            contact: {
                name: 'Soporte API',
                email: 'soporte@transporte.com',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3001',
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenido del endpoint /api/auth/login',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        exito: {
                            type: 'boolean',
                            example: false,
                        },
                        mensaje: {
                            type: 'string',
                            example: 'Error descriptivo del problema',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        exito: {
                            type: 'boolean',
                            example: true,
                        },
                        mensaje: {
                            type: 'string',
                            example: 'Operación exitosa',
                        },
                        datos: {
                            type: 'object',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Rutas donde buscar anotaciones
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    // Ruta para la documentación Swagger UI
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'API Transporte - Documentación',
    }));
    // Ruta para obtener el JSON de Swagger
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    console.log('📚 Swagger UI disponible en: http://localhost:3001/api-docs');
};
exports.setupSwagger = setupSwagger;
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.config.js.map