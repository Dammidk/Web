"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportesController = void 0;
const reportes_service_1 = require("../services/reportes.service");
exports.reportesController = {
    async reportePorVehiculo(req, res, next) {
        try {
            const { vehiculoId, fechaDesde, fechaHasta } = req.query;
            if (!vehiculoId || !fechaDesde || !fechaHasta) {
                return res.status(400).json({ exito: false, mensaje: 'Faltan parámetros (vehiculoId, fechaDesde, fechaHasta)' });
            }
            const data = await reportes_service_1.reportesService.reportePorVehiculo(Number(vehiculoId), new Date(fechaDesde), new Date(fechaHasta));
            res.json({ exito: true, datos: data });
        }
        catch (error) {
            next(error);
        }
    },
    async reportePorChofer(req, res, next) {
        try {
            const { choferId, fechaDesde, fechaHasta } = req.query;
            if (!choferId || !fechaDesde || !fechaHasta) {
                return res.status(400).json({ exito: false, mensaje: 'Faltan parámetros (choferId, fechaDesde, fechaHasta)' });
            }
            const data = await reportes_service_1.reportesService.reportePorChofer(Number(choferId), new Date(fechaDesde), new Date(fechaHasta));
            res.json({ exito: true, datos: data });
        }
        catch (error) {
            next(error);
        }
    },
    async reportePorCliente(req, res, next) {
        try {
            const { clienteId, fechaDesde, fechaHasta } = req.query;
            if (!clienteId || !fechaDesde || !fechaHasta) {
                return res.status(400).json({ exito: false, mensaje: 'Faltan parámetros (clienteId, fechaDesde, fechaHasta)' });
            }
            const data = await reportes_service_1.reportesService.reportePorCliente(Number(clienteId), new Date(fechaDesde), new Date(fechaHasta));
            res.json({ exito: true, datos: data });
        }
        catch (error) {
            next(error);
        }
    },
    // Exportación (Mock simple por ahora: devuelve JSON con headers para forzar descarga si se desea,
    // o el frontend convierte a CSV. El usuario dijo: "Backend toma los datos... convierte a CSV... setea headers".
    // Vamos a hacer una implementación simple de CSV aquí.)
    async exportarReporteVehiculo(req, res, next) {
        try {
            const { vehiculoId, fechaDesde, fechaHasta } = req.query;
            const data = await reportes_service_1.reportesService.reportePorVehiculo(Number(vehiculoId), new Date(fechaDesde), new Date(fechaHasta));
            // Simple CSV construction
            const headers = ['Concepto', 'Valor'];
            const rows = [
                ['Vehículo', data.vehiculo?.placa || ''],
                ['Periodo Desde', fechaDesde],
                ['Periodo Hasta', fechaHasta],
                ['Ingresos Viajes', data.ingresosViajes],
                ['Gastos Viáticos', data.gastosViaticos],
                ['Pagos Choferes', data.pagosChoferes],
                ['Gastos Mantenimiento', data.gastosMantenimientos],
                ['Gastos Totales', data.gastosTotales],
                ['Ganancia Neta', data.gananciaNeta]
            ];
            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.join(','))
            ].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_vehiculo_${vehiculoId}.csv`);
            res.status(200).send(csvContent);
        }
        catch (error) {
            next(error);
        }
    },
    async exportarReporteChofer(req, res, next) {
        try {
            const { choferId, fechaDesde, fechaHasta } = req.query;
            const data = await reportes_service_1.reportesService.reportePorChofer(Number(choferId), new Date(fechaDesde), new Date(fechaHasta));
            const headers = ['Concepto', 'Valor'];
            const rows = [
                ['Chofer', `${data.chofer.nombres} ${data.chofer.apellidos}`],
                ['Periodo Desde', fechaDesde],
                ['Periodo Hasta', fechaHasta],
                ['Viajes Realizados', data.viajesRealizados],
                ['Ingresos Generados', data.ingresosGenerados],
                ['Pagos Realizados', data.pagosRealizados],
                ['Saldo Pendiente', data.saldoPendiente]
            ];
            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.join(','))
            ].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_chofer_${choferId}.csv`);
            res.status(200).send(csvContent);
        }
        catch (error) {
            next(error);
        }
    },
    async exportarReporteCliente(req, res, next) {
        try {
            const { clienteId, fechaDesde, fechaHasta } = req.query;
            const data = await reportes_service_1.reportesService.reportePorCliente(Number(clienteId), new Date(fechaDesde), new Date(fechaHasta));
            const headers = ['Concepto', 'Valor'];
            const rows = [
                ['Cliente', data.cliente.nombreRazonSocial],
                ['Periodo Desde', fechaDesde],
                ['Periodo Hasta', fechaHasta],
                ['Viajes Realizados', data.viajesRealizados],
                ['Ingresos Totales', data.ingresosTotales],
                ['Material Frecuente', data.materialMasFrecuente]
            ];
            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.join(','))
            ].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_cliente_${clienteId}.csv`);
            res.status(200).send(csvContent);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/reportes/mensual-comparativo
     * Reporte mensual comparativo
     */
    async reporteMensualComparativo(req, res, next) {
        try {
            const anio = req.query.anio ? parseInt(req.query.anio) : new Date().getFullYear();
            const meses = req.query.meses ? req.query.meses.split(',').map(m => parseInt(m)) : undefined;
            const reporte = await reportes_service_1.reportesService.reporteMensualComparativo(anio, meses);
            res.json({ exito: true, datos: reporte });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/reportes/cartera
     * Reporte de cuentas por cobrar (cartera)
     */
    async reporteCartera(req, res, next) {
        try {
            const data = await reportes_service_1.reportesService.reporteCartera();
            res.json({ exito: true, datos: data });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/reportes/general
     * Reporte general de ingresos y gastos
     */
    async reporteGeneral(req, res, next) {
        try {
            const { fechaDesde, fechaHasta } = req.query;
            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({ exito: false, mensaje: 'Faltan parámetros (fechaDesde, fechaHasta)' });
            }
            const fDesde = new Date(fechaDesde);
            const fHasta = new Date(fechaHasta);
            fHasta.setHours(23, 59, 59, 999);
            const data = await reportes_service_1.reportesService.reporteGeneral(fDesde, fHasta);
            res.json({ exito: true, datos: data });
        }
        catch (error) {
            next(error);
        }
    },
    async exportarReporteGeneral(req, res, next) {
        try {
            const { fechaDesde, fechaHasta } = req.query;
            const fDesde = new Date(fechaDesde);
            const fHasta = new Date(fechaHasta);
            fHasta.setHours(23, 59, 59, 999);
            const data = await reportes_service_1.reportesService.reporteGeneral(fDesde, fHasta);
            const headers = ['Concepto', 'Valor'];
            const rows = [
                ['Reporte', 'Global de Flota'],
                ['Desde', fechaDesde],
                ['Hasta', fechaHasta],
                ['Ingresos Totales', data.ingresos],
                ['Gastos Operativos', data.gastos.total],
                [' - Mantenimientos', data.gastos.mantenimientos],
                [' - Pagos Choferes', data.gastos.pagosChoferes],
                [' - Viáticos', data.gastos.viaticos],
                ['Ganancia Neta', data.gananciaNeta]
            ];
            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.join(','))
            ].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_general_${new Date().getTime()}.csv`);
            res.status(200).send(csvContent);
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=reportes.controller.js.map