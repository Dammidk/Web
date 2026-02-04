"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// Configuración de Multer para manejo de archivos
const multer_1 = __importDefault(require("multer"));
// Almacenamiento en memoria para enviar directamente a Cloudinary
const storage = multer_1.default.memoryStorage();
// Filtro para validar tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y PDF.'));
    }
};
// Configuración de Multer
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Límite de 5MB
    },
});
exports.default = exports.upload;
//# sourceMappingURL=multer.config.js.map