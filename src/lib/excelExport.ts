import * as XLSX from 'xlsx';
import {
  Produccion,
  Mantenimiento,
  Tanque,
  Silo,
  Planta,
  Operador,
  Obra,
  MotivoParada,
  Capa,
  Componente,
  TipoMant,
  Estado,
  RepuestoPedido,
  EstadoRepuestos,
  Disposicion,
  Producto,
  StockInsumo,
} from '../types';
import { calculateTankStock } from '../components/StockTanquesView';

export interface ExcelProduccionExportOptions {
  groupedRecords: { [plantaId: string]: Produccion[] };
  plantas: Planta[];
  operadores: Operador[];
  obras: Obra[];
  motivos: MotivoParada[];
  capas: Capa[];
  fechaDesde?: string;
  fechaHasta?: string;
  plantaFiltroNombre?: string;
  emitterName: string;
}

export interface ExcelMantenimientoExportOptions {
  groupedRecords: { [plantaId: string]: Mantenimiento[] };
  plantas: Planta[];
  componentes: Componente[];
  tipomantList: TipoMant[];
  estados: Estado[];
  repuestosList: RepuestoPedido[];
  estadosRepuestos: EstadoRepuestos[];
  fechaDesde?: string;
  fechaHasta?: string;
  plantaFiltroNombre?: string;
  emitterName: string;
}

export interface ExcelStockExportOptions {
  groupedRecords: { planta: Planta | null; items: ((Tanque | Silo) & { itemType: 'TANQUE' | 'SILO' })[] }[];
  plantas: Planta[];
  disposiciones: Disposicion[];
  productos: Producto[];
  plantaFiltroNombre?: string;
  categoriaFiltro?: string;
  emitterName: string;
}

export interface ExcelStockInsumosExportOptions {
  stockList: StockInsumo[];
  plantas: Planta[];
  componentes: Componente[];
  plantaFiltroNombre?: string;
  searchTerm?: string;
  emitterName: string;
}

// ----------------------------------------------------------------------
// 1. EXPORT PRODUCCIÓN TO EXCEL
// ----------------------------------------------------------------------
export const exportProduccionExcel = async ({
  groupedRecords,
  plantas,
  operadores,
  obras,
  motivos,
  capas,
  fechaDesde,
  fechaHasta,
  plantaFiltroNombre,
  emitterName,
}: ExcelProduccionExportOptions) => {
  const now = new Date();
  const fechaEmisionStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

  const rows: (string | number)[][] = [];

  // Header information block
  rows.push(['INFORME DE PRODUCCIÓN - GEYT GESTIÓN DE PLANTAS']);
  rows.push(['Fecha de Emisión:', fechaEmisionStr]);
  rows.push(['Emitido por:', emitterName || 'No especificado']);
  rows.push(['Filtro Planta:', plantaFiltroNombre || 'Todas las Plantas']);
  rows.push(['Rango de Fechas:', `${fechaDesde || 'Inicio'} a ${fechaHasta || 'Hoy'}`]);
  rows.push([]); // blank line

  // Column titles
  const headers = [
    'Planta (Interno - Marca)',
    'Fecha',
    'Hs Inicio',
    'Hs Fin',
    'Obra Número',
    'Obra Descripción',
    'Capa Asfáltica',
    'Tn Producidas',
    'Hs Parada',
    'Motivo Parada',
    'Detalle Motivo / Otro',
    'Operador',
    'Calderistas',
    'Observaciones',
  ];
  rows.push(headers);

  let grandTotalTn = 0;
  let grandTotalHsParada = 0;
  let totalRecords = 0;

  // Process grouped records
  Object.entries(groupedRecords).forEach(([plantaId, items]) => {
    if (items.length === 0) return;

    const plantaObj = plantas.find((p) => p.id === plantaId);
    const plantName = plantaObj
      ? `${plantaObj.interno} - ${plantaObj.marca} (${plantaObj.modelo || 'Sin modelo'})`
      : `Planta ID: ${plantaId}`;

    let plantTn = 0;
    let plantHsParada = 0;

    items.forEach((item) => {
      const obraObj = obras.find((o) => o.id === item.id_obras);
      const operadorObj = operadores.find((op) => op.id === item.id_operador);
      const motivoObj = motivos.find((m) => m.id === item.id_motivo_parada);
      const capaObj = capas.find((c) => c.id === item.id_capa);

      const tn = Number(item.tn_producidas) || 0;
      const hsParada = Number(item.hs_parada) || 0;

      plantTn += tn;
      plantHsParada += hsParada;
      grandTotalTn += tn;
      grandTotalHsParada += hsParada;
      totalRecords++;

      const calderistasList = [item.calderista_1, item.calderista_2, item.calderista_3, item.calderista_4]
        .filter(Boolean)
        .join(', ');

      rows.push([
        plantName,
        item.fecha,
        item.hs_inicio || '',
        item.hs_fin || '',
        obraObj ? obraObj.numero : '',
        obraObj ? obraObj.descripcion : 'Sin obra asignada',
        capaObj ? capaObj.capa : '',
        tn,
        hsParada,
        motivoObj ? motivoObj.motivo : '-',
        item.motivo_otro || '',
        operadorObj ? `${operadorObj.nombre} ${operadorObj.apellido}` : '-',
        calderistasList || '-',
        item.observaciones || '',
      ]);
    });

    // Subtotal row per plant
    rows.push([
      `SUBTOTAL ${plantName.toUpperCase()}`,
      '',
      '',
      '',
      '',
      '',
      '',
      plantTn,
      plantHsParada,
      '',
      '',
      '',
      '',
      `Registros: ${items.length}`,
    ]);
    rows.push([]); // blank separator
  });

  // Grand Total Summary
  rows.push([]);
  rows.push(['RESUMEN GENERAL']);
  rows.push(['Total Registros:', totalRecords]);
  rows.push(['Total Tn Producidas:', grandTotalTn]);
  rows.push(['Total Hs de Parada:', grandTotalHsParada]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Column width configuration
  worksheet['!cols'] = [
    { wch: 32 }, // Planta
    { wch: 12 }, // Fecha
    { wch: 10 }, // Hs Inicio
    { wch: 10 }, // Hs Fin
    { wch: 14 }, // Obra Num
    { wch: 28 }, // Obra Desc
    { wch: 20 }, // Capa
    { wch: 16 }, // Tn Producidas
    { wch: 14 }, // Hs Parada
    { wch: 25 }, // Motivo
    { wch: 25 }, // Motivo Otro
    { wch: 25 }, // Operador
    { wch: 30 }, // Calderistas
    { wch: 40 }, // Observaciones
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Producción');

  const fileName = `Informe_Produccion_${now.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// ----------------------------------------------------------------------
// 2. EXPORT MANTENIMIENTO TO EXCEL
// ----------------------------------------------------------------------
export const exportMantenimientoExcel = async ({
  groupedRecords,
  plantas,
  componentes,
  tipomantList,
  estados,
  repuestosList,
  estadosRepuestos,
  fechaDesde,
  fechaHasta,
  plantaFiltroNombre,
  emitterName,
}: ExcelMantenimientoExportOptions) => {
  const now = new Date();
  const fechaEmisionStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

  const rows: (string | number)[][] = [];

  // Header metadata
  rows.push(['INFORME DE MANTENIMIENTO - GEYT GESTIÓN DE PLANTAS']);
  rows.push(['Fecha de Emisión:', fechaEmisionStr]);
  rows.push(['Emitido por:', emitterName || 'No especificado']);
  rows.push(['Filtro Planta:', plantaFiltroNombre || 'Todas las Plantas']);
  rows.push(['Rango de Fechas:', `${fechaDesde || 'Inicio'} a ${fechaHasta || 'Hoy'}`]);
  rows.push([]);

  // Column headers
  const headers = [
    'Planta (Interno - Marca)',
    'Estado',
    'Componente Afectado',
    'Tipo Mantenimiento',
    'Fecha Inicio',
    'Fecha Fin',
    'Repuestos Vinculados (Descripción / Cant / Costo / Estado)',
    'Comentarios / Intervención Realizada',
  ];
  rows.push(headers);

  let grandTotalMant = 0;
  let totalPendientes = 0;
  let totalEnProceso = 0;
  let totalFinalizados = 0;

  Object.entries(groupedRecords).forEach(([plantaId, items]) => {
    if (items.length === 0) return;

    const plantaObj = plantas.find((p) => p.id === plantaId);
    const plantName = plantaObj
      ? `${plantaObj.interno} - ${plantaObj.marca} (${plantaObj.modelo || 'Sin modelo'})`
      : `Planta ID: ${plantaId}`;

    let plantPend = 0;
    let plantProc = 0;
    let plantFin = 0;

    items.forEach((item) => {
      const compObj = componentes.find((c) => c.id === item.id_componente);
      const tipoObj = tipomantList.find((t) => t.id === item.id_tipomant);
      const estadoObj = estados.find((e) => e.id === item.id_estado);

      const estadoTxt = (estadoObj?.estado || 'Sin estado').toUpperCase();
      if (estadoTxt.includes('PENDIENTE')) plantPend++;
      else if (estadoTxt.includes('PROCESO') || estadoTxt.includes('CURSO')) plantProc++;
      else if (estadoTxt.includes('FINALIZADO') || estadoTxt.includes('COMPLETADO')) plantFin++;

      grandTotalMant++;

      const associatedRepuestos = repuestosList.filter((r) => {
        if (r.id === item.id_repuesto_pedido) return true;
        if (item.id_componente && r.id_componente === item.id_componente && r.id_planta === item.id_plantas) return true;
        return false;
      });

      let repuestosStr = '-';
      if (associatedRepuestos.length > 0) {
        repuestosStr = associatedRepuestos
          .map((rep) => {
            const estRepObj = estadosRepuestos.find((e) => e.id === rep.id_estadorepuestos);
            let s = `${rep.descripcion} (Cant: ${rep.cantidad})`;
            if (rep.costo) s += ` - $${rep.costo.toLocaleString()}`;
            if (estRepObj) s += ` [${estRepObj.estadorep}]`;
            return s;
          })
          .join(' | ');
      }

      rows.push([
        plantName,
        estadoTxt,
        compObj ? compObj.nmb_componente : 'No def.',
        tipoObj ? tipoObj.tipo : '-',
        item.fecha_inicio || item.fecha || '-',
        item.fecha_fin || '-',
        repuestosStr,
        item.comentarios || '',
      ]);
    });

    totalPendientes += plantPend;
    totalEnProceso += plantProc;
    totalFinalizados += plantFin;

    // Subtotal plant row
    rows.push([
      `TOTAL ${plantName.toUpperCase()}`,
      `Total: ${items.length} (Pend: ${plantPend} | Proc: ${plantProc} | Fin: ${plantFin})`,
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
    rows.push([]);
  });

  // Summary at bottom
  rows.push([]);
  rows.push(['RESUMEN GENERAL DE MANTENIMIENTO']);
  rows.push(['Total Intervenciones:', grandTotalMant]);
  rows.push(['Pendientes:', totalPendientes]);
  rows.push(['En Proceso:', totalEnProceso]);
  rows.push(['Finalizados:', totalFinalizados]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 32 }, // Planta
    { wch: 18 }, // Estado
    { wch: 28 }, // Componente
    { wch: 25 }, // Tipo
    { wch: 14 }, // Fecha Inicio
    { wch: 14 }, // Fecha Fin
    { wch: 45 }, // Repuestos
    { wch: 50 }, // Comentarios
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mantenimiento');

  const fileName = `Informe_Mantenimiento_${now.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// ----------------------------------------------------------------------
// 3. EXPORT STOCK TANQUES Y SILOS TO EXCEL
// ----------------------------------------------------------------------
export const exportStockExcel = async ({
  groupedRecords,
  plantas,
  disposiciones,
  productos,
  plantaFiltroNombre,
  categoriaFiltro,
  emitterName,
}: ExcelStockExportOptions) => {
  const now = new Date();
  const fechaEmisionStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

  const rows: (string | number)[][] = [];

  rows.push(['INFORME DE STOCK DE TANQUES Y SILOS - GEYT GESTIÓN DE PLANTAS']);
  rows.push(['Fecha de Emisión:', fechaEmisionStr]);
  rows.push(['Emitido por:', emitterName || 'No especificado']);
  rows.push(['Filtro Planta:', plantaFiltroNombre || 'Todas las Plantas']);
  rows.push(['Filtro Categoría:', categoriaFiltro || 'Todos']);
  rows.push([]);

  const headers = [
    'Planta (Interno - Marca)',
    'Tipo de Depósito',
    'Disposición',
    'Denominación',
    'Marca',
    'Producto Asignado',
    'Nivel Medido / Vacío',
    '% Llenado',
    'Stock Actual (m³ o Tn)',
    'Unidad',
    'Stock Aprox (Litros)',
    'Capacidad Total',
    'Capacidad Disp. p/ Recibir',
    'Capacidad Disp. (Litros)',
    'Última Actualización Medición',
  ];
  rows.push(headers);

  // Global map for totals by product
  const globalProductTotals: {
    [prodName: string]: {
      stock: number;
      capacidadTotal: number;
      disponibleRecibir: number;
      units: Set<string>;
    };
  } = {};

  groupedRecords.forEach(({ planta, items }) => {
    if (items.length === 0) return;

    const plantName = planta
      ? `${planta.interno} - ${planta.marca} (${planta.modelo || 'Sin modelo'})`
      : 'Sin Planta Asignada';

    items.forEach((item) => {
      const prodObj = productos.find((p) => p.id === item.id_producto);
      const prodName = prodObj ? prodObj.producto : 'Sin Producto Asignado';

      if (!globalProductTotals[prodName]) {
        globalProductTotals[prodName] = { stock: 0, capacidadTotal: 0, disponibleRecibir: 0, units: new Set() };
      }

      if (item.itemType === 'TANQUE') {
        const dispObj = disposiciones.find((d) => d.id === item.id_disposicion);
        const calc = calculateTankStock(
          dispObj?.disposicion,
          item.altura_total,
          item.altura_vacio,
          item.longitud,
          item.diametro
        );

        const tanqueItem = item as Tanque;
        const dispStr = dispObj ? dispObj.disposicion : '-';
        const nivelMedido = `Vacío: ${item.altura_vacio ?? 0}m`;
        const porcLleno = calc.porcentajeLlenado;
        const stockM3 = calc.volumen;
        const stockLts = Math.round(calc.volumen * 1000);
        const capTotalM3 = calc.volumenTotal;
        const dispRecibirM3 = calc.capacidadDisponible;
        const dispRecibirLts = Math.round(calc.capacidadDisponible * 1000);

        if (calc.isCalculated) {
          globalProductTotals[prodName].stock += calc.volumen;
          globalProductTotals[prodName].capacidadTotal += calc.volumenTotal;
          globalProductTotals[prodName].disponibleRecibir += calc.capacidadDisponible;
          globalProductTotals[prodName].units.add('m³');
        }

        rows.push([
          plantName,
          'TANQUE',
          dispStr,
          tanqueItem.denominacion,
          tanqueItem.marca || '-',
          prodName,
          nivelMedido,
          `${porcLleno.toFixed(1)}%`,
          Number(stockM3.toFixed(2)),
          'm³',
          stockLts,
          Number(capTotalM3.toFixed(2)),
          Number(dispRecibirM3.toFixed(2)),
          dispRecibirLts,
          item.fecha_actualizacion_vacio || '-',
        ]);
      } else {
        const porcentaje = Math.max(0, Math.min(100, item.altura_total ?? 0));
        const capTn = item.capacidad || 0;
        const stockTn = capTn * (porcentaje / 100);
        const dispTn = Math.max(0, capTn - stockTn);

        globalProductTotals[prodName].stock += stockTn;
        globalProductTotals[prodName].capacidadTotal += capTn;
        globalProductTotals[prodName].disponibleRecibir += dispTn;
        globalProductTotals[prodName].units.add('Tn');

        rows.push([
          plantName,
          'SILO',
          'Vertical',
          item.denominacion,
          '-',
          prodName,
          `Stock: ${porcentaje.toFixed(1)}%`,
          `${porcentaje.toFixed(1)}%`,
          Number(stockTn.toFixed(2)),
          'Tn',
          '-',
          Number(capTn.toFixed(2)),
          Number(dispTn.toFixed(2)),
          '-',
          item.fecha_actualizacion_vacio || '-',
        ]);
      }
    });

    rows.push([]); // blank separator
  });

  // Summary by Product
  rows.push([]);
  rows.push(['RESUMEN GENERAL DE STOCK Y CAPACIDAD DISPONIBLE PARA RECIBIR']);
  rows.push(['Producto', 'Stock Actual', 'Capacidad Total', 'Capacidad Disp. p/ Recibir', 'Unidad']);

  Object.entries(globalProductTotals).forEach(([pName, pData]) => {
    const unit = Array.from(pData.units).join('/') || 'Tn';
    rows.push([
      pName,
      Number(pData.stock.toFixed(2)),
      Number(pData.capacidadTotal.toFixed(2)),
      Number(pData.disponibleRecibir.toFixed(2)),
      unit,
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 32 }, // Planta
    { wch: 16 }, // Tipo
    { wch: 18 }, // Disposicion
    { wch: 25 }, // Denominacion
    { wch: 20 }, // Marca
    { wch: 25 }, // Producto
    { wch: 20 }, // Nivel Medido
    { wch: 14 }, // % Llenado
    { wch: 20 }, // Stock Actual
    { wch: 10 }, // Unidad
    { wch: 20 }, // Stock Lts
    { wch: 18 }, // Cap Total
    { wch: 24 }, // Cap Disp Recibir
    { wch: 20 }, // Cap Disp Lts
    { wch: 22 }, // Ultima act
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Tanques y Silos');

  const fileName = `Informe_Stock_${now.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// ----------------------------------------------------------------------
// 4. EXPORT STOCK INSUMOS Y REPUESTOS TO EXCEL
// ----------------------------------------------------------------------
export const exportStockInsumosExcel = async ({
  stockList,
  plantas,
  componentes,
  plantaFiltroNombre,
  searchTerm,
  emitterName,
}: ExcelStockInsumosExportOptions) => {
  const now = new Date();
  const fechaEmisionStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

  const workbook = XLSX.utils.book_new();

  // -------------------------
  // SHEET 1: INVENTARIO GENERAL
  // -------------------------
  const invRows: (string | number)[][] = [];

  invRows.push(['INVENTARIO DE INSUMOS Y REPUESTOS CRÍTICOS - GEYT GESTIÓN DE PLANTAS']);
  invRows.push(['Fecha de Emisión:', fechaEmisionStr]);
  invRows.push(['Emitido por:', emitterName || 'No especificado']);
  invRows.push(['Filtro Planta:', plantaFiltroNombre || 'Todas las Plantas']);
  if (searchTerm && searchTerm.trim()) {
    invRows.push(['Filtro Búsqueda:', searchTerm.trim()]);
  }
  invRows.push([]);

  invRows.push([
    'Planta (Interno - Marca)',
    'Componente de Planta',
    'Descripción del Insumo / Repuesto',
    'Stock Mínimo Requerido',
    'Stock Actual en Planta',
    'Estado del Stock',
    'Unidades Faltantes p/ Mínimo',
  ]);

  let totalItems = 0;
  let totalAlerts = 0;
  let totalOk = 0;
  let totalUnitsToBuy = 0;

  // Group by planta
  const groupedMap: { [plantaId: string]: StockInsumo[] } = {};
  stockList.forEach((item) => {
    const pId = item.id_planta || 'unassigned';
    if (!groupedMap[pId]) groupedMap[pId] = [];
    groupedMap[pId].push(item);
  });

  Object.entries(groupedMap).forEach(([plantaId, items]) => {
    if (items.length === 0) return;

    const plantaObj = plantas.find((p) => p.id === plantaId);
    const plantName = plantaObj
      ? `${plantaObj.interno} - ${plantaObj.marca} (${plantaObj.modelo || 'Sin modelo'})`
      : 'Planta no asignada';

    // Sort items
    items.sort((a, b) => {
      const compA = componentes.find((c) => c.id === a.id_componente)?.nmb_componente || '';
      const compB = componentes.find((c) => c.id === b.id_componente)?.nmb_componente || '';
      if (compA !== compB) return compA.localeCompare(compB);
      return a.descripcion.localeCompare(b.descripcion);
    });

    items.forEach((item) => {
      totalItems++;
      const compObj = componentes.find((c) => c.id === item.id_componente);
      const compName = compObj ? compObj.nmb_componente : item.id_componente || 'Sin componente';
      const cantActual = Number(item.cant_actual) || 0;
      const cantMinima = Number(item.cant_minima) || 0;
      const isLowStock = cantActual <= cantMinima;
      const faltante = cantActual < cantMinima ? cantMinima - cantActual : 0;

      if (isLowStock) {
        totalAlerts++;
        totalUnitsToBuy += faltante;
      } else {
        totalOk++;
      }

      invRows.push([
        plantName,
        compName,
        item.descripcion,
        cantMinima,
        cantActual,
        isLowStock ? '¡ALERTA STOCK MÍNIMO!' : 'STOCK ÓPTIMO',
        faltante > 0 ? faltante : 0,
      ]);
    });

    invRows.push([]);
  });

  // Summary block
  invRows.push([]);
  invRows.push(['RESUMEN DE INVENTARIO']);
  invRows.push(['Total Insumos / Repuestos Registrados:', totalItems]);
  invRows.push(['Artículos en Nivel Óptimo:', totalOk]);
  invRows.push(['Artículos en Alerta de Stock Mínimo:', totalAlerts]);
  invRows.push(['Total Unidades Requeridas para Reposición:', totalUnitsToBuy]);

  const invWorksheet = XLSX.utils.aoa_to_sheet(invRows);
  invWorksheet['!cols'] = [
    { wch: 32 }, // Planta
    { wch: 28 }, // Componente
    { wch: 45 }, // Descripcion
    { wch: 22 }, // Cant Min
    { wch: 22 }, // Cant Actual
    { wch: 25 }, // Estado
    { wch: 25 }, // Faltante
  ];
  XLSX.utils.book_append_sheet(workbook, invWorksheet, 'Inventario Insumos');

  // -------------------------
  // SHEET 2: LISTADO A COMPRAR (REPOSICIÓN)
  // -------------------------
  const buyRows: (string | number)[][] = [];

  buyRows.push(['LISTADO A COMPRAR - REPOSICIÓN DE STOCK MÍNIMO OPERATIVO']);
  buyRows.push(['Fecha de Emisión:', fechaEmisionStr]);
  buyRows.push(['Emitido por:', emitterName || 'No especificado']);
  buyRows.push(['Filtro Planta:', plantaFiltroNombre || 'Todas las Plantas']);
  buyRows.push([]);

  buyRows.push([
    'Planta Destino',
    'Componente Afectado',
    'Descripción Insumo / Repuesto a Comprar',
    'Stock Actual en Planta',
    'Stock Mínimo Requerido',
    'CANTIDAD REQUERIDA A COMPRAR',
  ]);

  const itemsToBuy = stockList.filter(
    (item) => Number(item.cant_actual) < Number(item.cant_minima)
  );

  if (itemsToBuy.length === 0) {
    buyRows.push(['TODOS LOS INSUMOS SE ENCUENTRAN EN NIVEL ÓPTIMO. NO HAY COMPRAS PENDIENTES.']);
  } else {
    itemsToBuy.forEach((item) => {
      const plantaObj = plantas.find((p) => p.id === item.id_planta);
      const plantName = plantaObj
        ? `${plantaObj.interno} - ${plantaObj.marca}`
        : 'Planta no asignada';
      const compObj = componentes.find((c) => c.id === item.id_componente);
      const compName = compObj ? compObj.nmb_componente : item.id_componente || 'Sin componente';
      const cantActual = Number(item.cant_actual) || 0;
      const cantMinima = Number(item.cant_minima) || 0;
      const faltante = cantMinima - cantActual;

      buyRows.push([
        plantName,
        compName,
        item.descripcion,
        cantActual,
        cantMinima,
        faltante,
      ]);
    });

    buyRows.push([]);
    buyRows.push(['TOTAL DE UNIDADES A COMPRAR:', totalUnitsToBuy]);
  }

  const buyWorksheet = XLSX.utils.aoa_to_sheet(buyRows);
  buyWorksheet['!cols'] = [
    { wch: 32 }, // Planta
    { wch: 28 }, // Componente
    { wch: 45 }, // Descripcion
    { wch: 22 }, // Cant Actual
    { wch: 22 }, // Cant Min
    { wch: 30 }, // Cant a Comprar
  ];
  XLSX.utils.book_append_sheet(workbook, buyWorksheet, 'Listado a Comprar');

  const fileName = `Informe_Stock_Insumos_${now.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
