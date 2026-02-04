"use strict";
// Servicio de Tareas Programadas
// Ejecuta tareas automáticas en intervalos regulares
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarTareasProgramadas = iniciarTareasProgramadas;
const database_1 = __importDefault(require("../config/database"));
const client_1 = require("@prisma/client");
// Configuración de intervalos (en milisegundos)
const INTERVALO_VERIFICACION_VIAJES = 60 * 1000; // Cada 1 minuto
const INTERVALO_VERIFICACION_MANTENIMIENTOS = 5 * 60 * 1000; // Cada 5 minutos
// Configuración de kilometraje para mantenimiento
const INTERVALO_MANTENIMIENTO_KM = 5000;
const KM_ALERTA_ANTES = 500;
/**
 * Actualiza viajes PLANIFICADO a EN_CURSO cuando llega la fecha de salida
 */
async function actualizarViajesPlanificados() {
    try {
        const ahora = new Date();
        // Buscar viajes planificados cuya fecha de salida ya pasó
        const viajesParaIniciar = await database_1.default.viaje.findMany({
            where: {
                estado: client_1.EstadoViaje.PLANIFICADO,
                fechaSalida: { lte: ahora }
            },
            include: {
                vehiculo: { select: { id: true, placa: true } }
            }
        });
        if (viajesParaIniciar.length > 0) {
            console.log(`🔄 [Scheduler] Encontrados ${viajesParaIniciar.length} viaje(s) para iniciar automáticamente`);
            for (const viaje of viajesParaIniciar) {
                // Actualizar viaje a EN_CURSO
                await database_1.default.viaje.update({
                    where: { id: viaje.id },
                    data: { estado: client_1.EstadoViaje.EN_CURSO }
                });
                // Actualizar vehículo a EN_RUTA
                await database_1.default.vehiculo.update({
                    where: { id: viaje.vehiculoId },
                    data: { estado: client_1.EstadoVehiculo.EN_RUTA }
                });
                console.log(`   ✅ Viaje #${viaje.id} iniciado automáticamente (Vehículo: ${viaje.vehiculo.placa})`);
            }
        }
    }
    catch (error) {
        console.error('[Scheduler] Error al actualizar viajes planificados:', error);
    }
}
/**
 * Crea mantenimientos PENDIENTE automáticamente para vehículos que lo necesitan
 */
async function crearMantenimientosPendientes() {
    try {
        // Obtener todos los vehículos activos con su último mantenimiento
        const vehiculos = await database_1.default.vehiculo.findMany({
            where: {
                estado: { in: [client_1.EstadoVehiculo.ACTIVO, client_1.EstadoVehiculo.EN_RUTA] }
            },
            include: {
                mantenimientos: {
                    orderBy: { fecha: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        kilometrajeAlMomento: true,
                        estado: true
                    }
                }
            }
        });
        let mantenimientosCreados = 0;
        for (const vehiculo of vehiculos) {
            const ultimoMant = vehiculo.mantenimientos[0];
            const kmUltimoMant = ultimoMant?.kilometrajeAlMomento || 0;
            const proximoMantKm = kmUltimoMant + INTERVALO_MANTENIMIENTO_KM;
            const kmParaProximoMant = proximoMantKm - vehiculo.kilometrajeActual;
            // Verificar si necesita mantenimiento (dentro de los 500km o ya pasó)
            const necesitaMantenimiento = kmParaProximoMant <= KM_ALERTA_ANTES;
            if (necesitaMantenimiento) {
                // Verificar si ya existe un mantenimiento PENDIENTE o EN_CURSO para este vehículo
                const mantenimientoExistente = await database_1.default.mantenimiento.findFirst({
                    where: {
                        vehiculoId: vehiculo.id,
                        estado: { in: [client_1.EstadoMantenimiento.PENDIENTE, client_1.EstadoMantenimiento.EN_CURSO] }
                    }
                });
                if (!mantenimientoExistente) {
                    // Crear mantenimiento PENDIENTE automáticamente
                    const esUrgente = kmParaProximoMant <= 0;
                    await database_1.default.mantenimiento.create({
                        data: {
                            vehiculoId: vehiculo.id,
                            tipo: client_1.TipoMantenimiento.PREVENTIVO,
                            estado: client_1.EstadoMantenimiento.PENDIENTE,
                            descripcion: esUrgente
                                ? `⚠️ URGENTE: Vehículo pasó ${Math.abs(kmParaProximoMant).toLocaleString()} km del intervalo de mantenimiento`
                                : `🔧 Mantenimiento preventivo - Faltan ${kmParaProximoMant.toLocaleString()} km para el próximo servicio`,
                            fecha: new Date(),
                            kilometrajeAlMomento: vehiculo.kilometrajeActual,
                            proximoKilometraje: vehiculo.kilometrajeActual + INTERVALO_MANTENIMIENTO_KM,
                            costoTotal: 0
                        }
                    });
                    mantenimientosCreados++;
                    console.log(`   🔧 Mantenimiento PENDIENTE creado para ${vehiculo.placa} (Km actual: ${vehiculo.kilometrajeActual.toLocaleString()})`);
                }
            }
        }
        if (mantenimientosCreados > 0) {
            console.log(`🔧 [Scheduler] ${mantenimientosCreados} mantenimiento(s) pendiente(s) creado(s) automáticamente`);
        }
    }
    catch (error) {
        console.error('[Scheduler] Error al crear mantenimientos pendientes:', error);
    }
}
/**
 * Genera pagos PENDIENTE para choferes mensuales
 * ROBUSTO: Verifica todos los pagos que deberían existir para el mes actual,
 * incluso si el backend estuvo apagado. Genera pagos 3 días antes del día configurado.
 */
async function generarPagosMensuales() {
    try {
        const hoy = new Date();
        const diaActual = hoy.getDate();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();
        // Buscar TODOS los choferes MENSUAL activos
        const choferesMensuales = await database_1.default.chofer.findMany({
            where: {
                modalidadPago: 'MENSUAL',
                estado: 'ACTIVO',
                deletedAt: null,
                sueldoMensual: { not: null }
            }
        });
        let pagosCreados = 0;
        const mesNombre = hoy.toLocaleString('es-EC', { month: 'long', year: 'numeric' });
        for (const chofer of choferesMensuales) {
            if (!chofer.sueldoMensual || !chofer.diaPago)
                continue;
            // Fecha de creación del chofer (para no generar pagos a recién contratados)
            const fechaCreacion = new Date(chofer.creadoEn);
            // ========================================
            // 1. VERIFICAR PAGO DE QUINCENA (DÍA 15)
            // ========================================
            if (chofer.pagoQuincenal) {
                const fechaQuincena = new Date(anioActual, mesActual, 15);
                const diasParaQuincena = 15 - diaActual;
                // Fecha límite: el chofer debe haber sido creado ANTES de 3 días antes del día 15
                // Es decir, creado antes del día 12 para recibir la quincena del 15
                const fechaLimiteCreacionQuincena = new Date(anioActual, mesActual, 12);
                // Generar 3 días antes O si ya pasó la fecha (recuperación)
                // PERO solo si el chofer fue creado antes de la fecha límite
                if (diasParaQuincena <= 3 && diasParaQuincena >= -7 && fechaCreacion < fechaLimiteCreacionQuincena) {
                    const montoQuincena = Number(chofer.sueldoMensual) / 2;
                    // Verificar si ya existe pago de quincena para este mes
                    const pagoQuincenaExistente = await database_1.default.pagoChofer.findFirst({
                        where: {
                            choferId: chofer.id,
                            fecha: fechaQuincena,
                            viajeId: null,
                            descripcion: { contains: 'quincena' }
                        }
                    });
                    if (!pagoQuincenaExistente) {
                        await database_1.default.pagoChofer.create({
                            data: {
                                choferId: chofer.id,
                                monto: montoQuincena,
                                fecha: fechaQuincena,
                                metodoPago: chofer.metodoPago,
                                estado: 'PENDIENTE',
                                descripcion: `Primera quincena ${mesNombre}`
                            }
                        });
                        pagosCreados++;
                        console.log(`   💰 Quincena PENDIENTE: ${chofer.nombres} ${chofer.apellidos} - $${montoQuincena} (día 15)`);
                    }
                }
            }
            // ========================================
            // 2. VERIFICAR PAGO PRINCIPAL (DÍA CONFIGURADO)
            // ========================================
            const fechaPago = new Date(anioActual, mesActual, chofer.diaPago);
            const diasParaPago = chofer.diaPago - diaActual;
            // Fecha límite: el chofer debe haber sido creado ANTES de 3 días antes del día de pago
            // Ejemplo: si cobra el día 8, debe haber sido creado antes del día 5
            const fechaLimiteCreacion = new Date(anioActual, mesActual, chofer.diaPago - 3);
            // Generar 3 días antes O si ya pasó la fecha (recuperación hasta 7 días atrás)
            // PERO solo si el chofer fue creado antes de la fecha límite
            if (diasParaPago <= 3 && diasParaPago >= -7 && fechaCreacion < fechaLimiteCreacion) {
                // Si tiene pago quincenal, el pago del día configurado es solo 50%
                const montoAPagar = chofer.pagoQuincenal
                    ? Number(chofer.sueldoMensual) / 2
                    : Number(chofer.sueldoMensual);
                const descripcionPago = chofer.pagoQuincenal
                    ? `Segunda quincena ${mesNombre}`
                    : `Sueldo mensual ${mesNombre}`;
                // Verificar si ya existe pago para esta fecha
                const pagoExistente = await database_1.default.pagoChofer.findFirst({
                    where: {
                        choferId: chofer.id,
                        fecha: fechaPago,
                        viajeId: null,
                        descripcion: {
                            contains: chofer.pagoQuincenal ? 'Segunda quincena' : 'Sueldo mensual'
                        }
                    }
                });
                if (!pagoExistente) {
                    await database_1.default.pagoChofer.create({
                        data: {
                            choferId: chofer.id,
                            monto: montoAPagar,
                            fecha: fechaPago,
                            metodoPago: chofer.metodoPago,
                            estado: 'PENDIENTE',
                            descripcion: descripcionPago
                        }
                    });
                    pagosCreados++;
                    console.log(`   💰 Pago PENDIENTE: ${chofer.nombres} ${chofer.apellidos} - $${montoAPagar} (día ${chofer.diaPago})`);
                }
            }
        }
        if (pagosCreados > 0) {
            console.log(`💰 [Scheduler] ${pagosCreados} pago(s) mensual(es) PENDIENTE(s) creado(s)`);
        }
    }
    catch (error) {
        console.error('[Scheduler] Error al generar pagos mensuales:', error);
    }
}
// Intervalo para verificar pagos mensuales (cada 1 hora para mayor robustez)
const INTERVALO_VERIFICACION_PAGOS = 1 * 60 * 60 * 1000;
/**
 * Inicia todas las tareas programadas
 */
function iniciarTareasProgramadas() {
    console.log('⏰ Iniciando tareas programadas...');
    // Ejecutar una vez al inicio
    actualizarViajesPlanificados();
    crearMantenimientosPendientes();
    generarPagosMensuales();
    // Programar ejecución periódica
    setInterval(actualizarViajesPlanificados, INTERVALO_VERIFICACION_VIAJES);
    setInterval(crearMantenimientosPendientes, INTERVALO_VERIFICACION_MANTENIMIENTOS);
    setInterval(generarPagosMensuales, INTERVALO_VERIFICACION_PAGOS);
    console.log(`   📋 Verificación de viajes: cada ${INTERVALO_VERIFICACION_VIAJES / 1000} segundos`);
    console.log(`   🔧 Verificación de mantenimientos: cada ${INTERVALO_VERIFICACION_MANTENIMIENTOS / 1000} segundos`);
    console.log(`   💰 Verificación de pagos mensuales: cada ${INTERVALO_VERIFICACION_PAGOS / (60 * 60 * 1000)} horas`);
}
exports.default = { iniciarTareasProgramadas };
//# sourceMappingURL=scheduler.service.js.map