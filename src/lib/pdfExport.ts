import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
} from '../types';
import { calculateTankStock } from '../components/StockTanquesView';

interface PDFExportOptions {
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

interface PDFMantenimientoExportOptions {
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

interface PDFStockExportOptions {
  groupedRecords: { planta: Planta | null; items: ((Tanque | Silo) & { itemType: 'TANQUE' | 'SILO' })[] }[];
  plantas: Planta[];
  disposiciones: Disposicion[];
  productos: Producto[];
  plantaFiltroNombre?: string;
  categoriaFiltro?: string;
  emitterName: string;
}

const LOGO_URL = 'https://iqycgsgmwzqikribzdmj.supabase.co/storage/v1/object/public/imagenes/Roggio1.png';

// Helper to load logo as base64
const getLogoBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not load logo for PDF:', err);
    return null;
  }
};

export const exportProduccionPDF = async ({
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
}: PDFExportOptions) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const logoBase64 = await getLogoBase64(LOGO_URL);

  const now = new Date();
  const fechaEmisionStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

  // Header banner on first page
  let startY = 15;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 10, 40, 14);
    } catch (e) {
      console.warn('Error adding logo image to PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INFORME DE PRODUCCIÓN', logoBase64 ? 60 : 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600

  // Filter line
  let filterText = `Plantas: ${plantaFiltroNombre || 'Todas'}`;
  if (fechaDesde || fechaHasta) {
    filterText += `  |  Rango: ${fechaDesde || 'Inicio'} a ${fechaHasta || 'Hoy'}`;
  }
  doc.text(filterText, logoBase64 ? 60 : 14, 24);

  // Emission info right aligned
  doc.setFont('helvetica', 'bold');
  doc.text(`Fecha de Emisión: ${fechaEmisionStr}`, 283, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Emitido por: ${emitterName}`, 283, 22, { align: 'right' });

  // Divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, 28, 283, 28);

  startY = 34;

  let grandTotalTn = 0;
  let grandTotalHsParada = 0;
  let totalRecordsCount = 0;

  const plantEntries = Object.entries(groupedRecords);

  plantEntries.forEach(([plantaId, items], index) => {
    if (items.length === 0) return;

    const plantaObj = plantas.find((p) => p.id === plantaId);
    const plantName = plantaObj
      ? `${plantaObj.interno} — ${plantaObj.marca} (${plantaObj.modelo})`
      : `Planta ID: ${plantaId}`;

    const plantTn = items.reduce((sum, item) => sum + (Number(item.tn_producidas) || 0), 0);
    const plantHsParada = items.reduce((sum, item) => sum + (Number(item.hs_parada) || 0), 0);

    grandTotalTn += plantTn;
    grandTotalHsParada += plantHsParada;
    totalRecordsCount += items.length;

    // Check if space left on current page for plant title + table header (need ~40mm)
    if (startY > 160 && index > 0) {
      doc.addPage();
      startY = 15;
    }

    // Plant Title Block
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, startY, 269, 10, 'F');
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.rect(14, startY, 269, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`PLANTA: ${plantName.toUpperCase()}`, 18, startY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text(`Acumulado: ${plantTn.toLocaleString('es-AR')} Tn`, 170, startY + 6.5);

    doc.setTextColor(180, 83, 9); // amber-700
    doc.text(`Paradas Totales: ${plantHsParada} hs`, 230, startY + 6.5);

    startY += 12;

    // Table rows data
    const tableBody = items.map((item) => {
      const obraObj = obras.find((o) => o.id === item.id_obras);
      const operadorObj = operadores.find((op) => op.id === item.id_operador);
      const motivoObj = motivos.find((m) => m.id === item.id_motivo_parada);
      const capaObj = capas.find((c) => c.id === item.id_capa);

      const fechaHorario = `${item.fecha}\n${item.hs_inicio || '00:00'} - ${item.hs_fin || '00:00'}`;
      const obraCapa = `${obraObj ? `Obra: ${obraObj.numero} - ${obraObj.descripcion}` : 'Sin obra'}${
        capaObj ? `\nCapa: ${capaObj.capa}` : ''
      }`;
      const tnStr = `${Number(item.tn_producidas).toLocaleString('es-AR')} Tn`;
      const hsParadaStr = item.hs_parada ? `${item.hs_parada} hs` : '-';

      let motivoStr = motivoObj ? motivoObj.motivo : '-';
      if (item.motivo_otro) {
        motivoStr += ` (${item.motivo_otro})`;
      }

      const calderistasList = [item.calderista_1, item.calderista_2, item.calderista_3, item.calderista_4]
        .filter(Boolean)
        .join(', ');
      
      let personalStr = operadorObj ? `Op: ${operadorObj.nombre} ${operadorObj.apellido}` : '-';
      if (calderistasList) {
        personalStr += `\nCald: ${calderistasList}`;
      }

      const obsStr = item.observaciones || '-';

      return [fechaHorario, obraCapa, tnStr, hsParadaStr, motivoStr, personalStr, obsStr];
    });

    autoTable(doc, {
      startY: startY,
      head: [
        [
          'Fecha / Horario',
          'Obra / Capa',
          'Tn Producidas',
          'Hs Parada',
          'Motivo Parada',
          'Operador / Calderistas',
          'Observaciones',
        ],
      ],
      body: tableBody,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      columnStyles: {
        0: { cellWidth: 28 }, // Fecha/Horario
        1: { cellWidth: 50 }, // Obra/Capa
        2: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }, // Tn Producidas
        3: { cellWidth: 20, halign: 'right' }, // Hs Parada
        4: { cellWidth: 40 }, // Motivo
        5: { cellWidth: 50 }, // Personal
        6: { cellWidth: 'auto' }, // Observaciones
      },
      didDrawPage: (data) => {
        startY = data.cursor ? data.cursor.y + 8 : startY + 20;
      },
    });

    // space after table
    startY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : startY + 15;
  });

  // Check space for Grand Totals + Signature block
  if (startY > 140) {
    doc.addPage();
    startY = 20;
  }

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, startY, 269, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, startY, 269, 16, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMEN GENERAL DEL INFORME:', 18, startY + 10);

  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text(`Total Tn Producidas: ${grandTotalTn.toLocaleString('es-AR')} Tn`, 100, startY + 10);

  doc.setTextColor(180, 83, 9);
  doc.text(`Total Horas Parada: ${grandTotalHsParada} hs`, 180, startY + 10);

  doc.setTextColor(71, 85, 105);
  doc.text(`Total Registros: ${totalRecordsCount}`, 240, startY + 10);

  startY += 26;

  // Signature Block
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(200, startY + 12, 270, startY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FIRMA / EMISIÓN', 235, startY + 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Emitido por: ${emitterName}`, 235, startY + 22, { align: 'center' });
  doc.text(`Fecha: ${now.toLocaleDateString('es-AR')}`, 235, startY + 26, { align: 'center' });

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    // Footer text
    doc.text('GEyT - Gestión de Plantas', 14, 202);
    doc.text(`Página ${i} de ${totalPages}`, 283, 202, { align: 'right' });
  }

  // Save PDF file
  const fileName = `Informe_Produccion_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportMantenimientoPDF = async ({
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
}: PDFMantenimientoExportOptions) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const logoBase64 = await getLogoBase64(LOGO_URL);

  const now = new Date();
  const fechaEmisionStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

  // Header banner on first page
  let startY = 15;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 10, 40, 14);
    } catch (e) {
      console.warn('Error adding logo image to PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INFORME DE MANTENIMIENTO', logoBase64 ? 60 : 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600

  // Filter line
  let filterText = `Plantas: ${plantaFiltroNombre || 'Todas'}`;
  if (fechaDesde || fechaHasta) {
    filterText += `  |  Rango: ${fechaDesde || 'Inicio'} a ${fechaHasta || 'Hoy'}`;
  }
  doc.text(filterText, logoBase64 ? 60 : 14, 24);

  // Emission info right aligned
  doc.setFont('helvetica', 'bold');
  doc.text(`Fecha de Emisión: ${fechaEmisionStr}`, 283, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Emitido por: ${emitterName}`, 283, 22, { align: 'right' });

  // Divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, 28, 283, 28);

  startY = 34;

  let grandTotalMant = 0;
  let totalPendientes = 0;
  let totalEnProceso = 0;
  let totalFinalizados = 0;

  const plantEntries = Object.entries(groupedRecords);

  plantEntries.forEach(([plantaId, items], index) => {
    if (items.length === 0) return;

    const plantaObj = plantas.find((p) => p.id === plantaId);
    const plantName = plantaObj
      ? `${plantaObj.interno} — ${plantaObj.marca} (${plantaObj.modelo})`
      : `Planta ID: ${plantaId}`;

    let plantPend = 0;
    let plantProc = 0;
    let plantFin = 0;

    items.forEach((item) => {
      const estadoObj = estados.find((e) => e.id === item.id_estado);
      const txt = (estadoObj?.estado || '').toUpperCase();
      if (txt.includes('PENDIENTE')) plantPend++;
      else if (txt.includes('PROCESO') || txt.includes('CURSO')) plantProc++;
      else if (txt.includes('FINALIZADO') || txt.includes('COMPLETADO')) plantFin++;
    });

    grandTotalMant += items.length;
    totalPendientes += plantPend;
    totalEnProceso += plantProc;
    totalFinalizados += plantFin;

    // Check space left on current page for plant title block (need ~40mm)
    if (startY > 160 && index > 0) {
      doc.addPage();
      startY = 15;
    }

    // Plant Title Block
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, startY, 269, 10, 'F');
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.rect(14, startY, 269, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`PLANTA: ${plantName.toUpperCase()}`, 18, startY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138);
    doc.text(`Total: ${items.length}`, 180, startY + 6.5);

    doc.setTextColor(185, 28, 28); // red-700
    doc.text(`Pend: ${plantPend}`, 210, startY + 6.5);

    doc.setTextColor(180, 83, 9); // amber-700
    doc.text(`En Proc: ${plantProc}`, 235, startY + 6.5);

    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text(`Fin: ${plantFin}`, 260, startY + 6.5);

    startY += 12;

    // Table rows data
    const tableBody = items.map((item) => {
      const compObj = componentes.find((c) => c.id === item.id_componente);
      const tipoObj = tipomantList.find((t) => t.id === item.id_tipomant);
      const estadoObj = estados.find((e) => e.id === item.id_estado);

      const associatedRepuestos = repuestosList.filter((r) => {
        if (r.id === item.id_repuesto_pedido) return true;
        if (item.id_componente && r.id_componente === item.id_componente && r.id_planta === item.id_plantas) return true;
        return false;
      });

      const estadoTxt = (estadoObj?.estado || 'Sin estado').toUpperCase();
      const compStr = compObj ? compObj.nmb_componente : 'No def.';
      const tipoStr = tipoObj ? tipoObj.tipo : '-';

      let fechaStr = `Inicio: ${item.fecha_inicio || item.fecha || '-'}`;
      if (item.fecha_fin) {
        fechaStr += `\nFin: ${item.fecha_fin}`;
      }

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
          .join('\n');
      }

      const obsStr = item.comentarios || '-';

      return [estadoTxt, compStr, tipoStr, fechaStr, repuestosStr, obsStr];
    });

    autoTable(doc, {
      startY: startY,
      head: [
        [
          'Estado',
          'Componente Afectado',
          'Tipo Mantenimiento',
          'Fechas (Inicio / Fin)',
          'Repuestos / Pedidos Vinculados',
          'Comentarios / Intervención',
        ],
      ],
      body: tableBody,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: 'bold' }, // Estado
        1: { cellWidth: 45, fontStyle: 'bold' }, // Componente
        2: { cellWidth: 35 }, // Tipo
        3: { cellWidth: 32 }, // Fechas
        4: { cellWidth: 60 }, // Repuestos
        5: { cellWidth: 'auto' }, // Comentarios
      },
      didDrawPage: (data) => {
        startY = data.cursor ? data.cursor.y + 8 : startY + 20;
      },
    });

    startY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : startY + 15;
  });

  // Check space for Grand Totals + Signature block
  if (startY > 140) {
    doc.addPage();
    startY = 20;
  }

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, startY, 269, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, startY, 269, 16, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMEN GENERAL DE MANTENIMIENTOS:', 18, startY + 10);

  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text(`Total Intervenciones: ${grandTotalMant}`, 115, startY + 10);

  doc.setTextColor(185, 28, 28);
  doc.text(`Pendientes: ${totalPendientes}`, 175, startY + 10);

  doc.setTextColor(180, 83, 9);
  doc.text(`En Proceso: ${totalEnProceso}`, 215, startY + 10);

  doc.setTextColor(21, 128, 61);
  doc.text(`Finalizados: ${totalFinalizados}`, 252, startY + 10);

  startY += 26;

  // Signature Block
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(200, startY + 12, 270, startY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FIRMA / EMISIÓN', 235, startY + 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Emitido por: ${emitterName}`, 235, startY + 22, { align: 'center' });
  doc.text(`Fecha: ${now.toLocaleDateString('es-AR')}`, 235, startY + 26, { align: 'center' });

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    // Footer text
    doc.text('GEyT - Gestión de Plantas', 14, 202);
    doc.text(`Página ${i} de ${totalPages}`, 283, 202, { align: 'right' });
  }

  // Save PDF file
  const fileName = `Informe_Mantenimiento_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportStockPDF = async ({
  groupedRecords,
  plantas,
  disposiciones,
  productos,
  plantaFiltroNombre,
  categoriaFiltro,
  emitterName,
}: PDFStockExportOptions) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const logoBase64 = await getLogoBase64(LOGO_URL);

  const now = new Date();
  const fechaEmisionStr = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

  // Header banner on first page
  let startY = 15;

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 14, 10, 40, 14);
    } catch (e) {
      console.warn('Error adding logo image to PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INFORME DE STOCK', logoBase64 ? 60 : 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600

  // Filter line
  let filterText = `Plantas: ${plantaFiltroNombre || 'Todas'}`;
  if (categoriaFiltro && categoriaFiltro !== 'TODOS') {
    filterText += `  |  Categoría: ${categoriaFiltro}`;
  }
  doc.text(filterText, logoBase64 ? 60 : 14, 24);

  // Emission info right aligned
  doc.setFont('helvetica', 'bold');
  doc.text(`Fecha de Emisión: ${fechaEmisionStr}`, 283, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Emitido por: ${emitterName}`, 283, 22, { align: 'right' });

  // Divider line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, 28, 283, 28);

  startY = 34;

  // Global map by product name to track overall stock and available receiving capacity
  const globalProductTotals: {
    [prodName: string]: {
      stock: number;
      capacidadTotal: number;
      disponibleRecibir: number;
      units: Set<string>;
    };
  } = {};

  groupedRecords.forEach(({ planta, items }, index) => {
    if (items.length === 0) return;

    const plantName = planta
      ? `${planta.interno} — ${planta.marca} (${planta.modelo || 'Sin modelo'})`
      : 'Sin Planta Asignada';

    // Calculate per-product summary for this plant
    const plantProductMap: {
      [prodName: string]: {
        stock: number;
        capacidadTotal: number;
        disponibleRecibir: number;
        units: Set<string>;
      };
    } = {};

    items.forEach((item) => {
      const prodObj = productos.find((p) => p.id === item.id_producto);
      const prodName = prodObj ? prodObj.producto : 'Sin Producto Asignado';

      if (!plantProductMap[prodName]) {
        plantProductMap[prodName] = { stock: 0, capacidadTotal: 0, disponibleRecibir: 0, units: new Set() };
      }
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
        const unitStr = 'm³';

        if (calc.isCalculated) {
          plantProductMap[prodName].stock += calc.volumen;
          plantProductMap[prodName].capacidadTotal += calc.volumenTotal;
          plantProductMap[prodName].disponibleRecibir += calc.capacidadDisponible;
          plantProductMap[prodName].units.add(unitStr);

          globalProductTotals[prodName].stock += calc.volumen;
          globalProductTotals[prodName].capacidadTotal += calc.volumenTotal;
          globalProductTotals[prodName].disponibleRecibir += calc.capacidadDisponible;
          globalProductTotals[prodName].units.add(unitStr);
        }
      } else {
        const porcentaje = Math.max(0, Math.min(100, item.altura_total ?? 0));
        const capTn = item.capacidad || 0;
        const stockTn = capTn * (porcentaje / 100);
        const dispTn = Math.max(0, capTn - stockTn);
        const unitStr = 'Tn';

        plantProductMap[prodName].stock += stockTn;
        plantProductMap[prodName].capacidadTotal += capTn;
        plantProductMap[prodName].disponibleRecibir += dispTn;
        plantProductMap[prodName].units.add(unitStr);

        globalProductTotals[prodName].stock += stockTn;
        globalProductTotals[prodName].capacidadTotal += capTn;
        globalProductTotals[prodName].disponibleRecibir += dispTn;
        globalProductTotals[prodName].units.add(unitStr);
      }
    });

    // Page overflow check for plant block
    if (startY > 160 && index > 0) {
      doc.addPage();
      startY = 15;
    }

    // Plant Title Block
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, startY, 269, 10, 'F');
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.rect(14, startY, 269, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`PLANTA: ${plantName.toUpperCase()}`, 18, startY + 6.5);

    // Short summary text in header
    const summaryParts = Object.entries(plantProductMap).map(([pName, pData]) => {
      const unit = Array.from(pData.units).join('/') || 'Tn';
      return `${pName}: Stock ${pData.stock.toLocaleString('es-AR', { maximumFractionDigits: 1 })} ${unit} (Disp. Recibir: ${pData.disponibleRecibir.toLocaleString('es-AR', { maximumFractionDigits: 1 })} ${unit})`;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    doc.text(summaryParts.join('  |  '), 280, startY + 6.5, { align: 'right' });

    startY += 12;

    // Table rows data
    const tableBody = items.map((item) => {
      const prodObj = productos.find((p) => p.id === item.id_producto);
      const prodStr = prodObj ? prodObj.producto : 'Sin asignar';
      const lastAct = item.fecha_actualizacion_vacio || '-';

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
        const tipoStr = `TANQUE (${dispObj ? dispObj.disposicion : 'Desc.'})`;
        const denStr = tanqueItem.denominacion + (tanqueItem.marca ? `\nMarca: ${tanqueItem.marca}` : '');
        const medicionStr = `Vacío: ${item.altura_vacio ?? 0}m\n(${calc.porcentajeLlenado.toFixed(1)}% Lleno)`;

        const stockStr = `${calc.volumen.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m³\n(~${Math.round(calc.volumen * 1000).toLocaleString('es-AR')} Lts)`;
        const capStr = `${calc.volumenTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m³`;
        const dispRecibirStr = `${calc.capacidadDisponible.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m³\n(~${Math.round(calc.capacidadDisponible * 1000).toLocaleString('es-AR')} Lts)`;

        return [tipoStr, denStr, prodStr, medicionStr, stockStr, capStr, dispRecibirStr, lastAct];
      } else {
        const porcentaje = Math.max(0, Math.min(100, item.altura_total ?? 0));
        const capTn = item.capacidad || 0;
        const stockTn = capTn * (porcentaje / 100);
        const dispTn = Math.max(0, capTn - stockTn);

        const tipoStr = 'SILO';
        const denStr = item.denominacion;
        const medicionStr = `Stock: ${porcentaje.toFixed(1)}%`;
        const stockStr = `${stockTn.toLocaleString('es-AR', { maximumFractionDigits: 2 })} Tn`;
        const capStr = `${capTn.toLocaleString('es-AR', { maximumFractionDigits: 2 })} Tn`;
        const dispRecibirStr = `${dispTn.toLocaleString('es-AR', { maximumFractionDigits: 2 })} Tn`;

        return [tipoStr, denStr, prodStr, medicionStr, stockStr, capStr, dispRecibirStr, lastAct];
      }
    });

    autoTable(doc, {
      startY: startY,
      head: [
        [
          'Tipo / Disposición',
          'Denominación / Marca',
          'Producto',
          'Medición Nivel',
          'Stock Actual',
          'Capacidad Total',
          'Cap. Disponible p/ Recibir',
          'Última Act.',
        ],
      ],
      body: tableBody,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      columnStyles: {
        0: { cellWidth: 32, fontStyle: 'bold' }, // Tipo/Disp
        1: { cellWidth: 42, fontStyle: 'bold' }, // Denom/Marca
        2: { cellWidth: 32 }, // Producto
        3: { cellWidth: 32 }, // Medicion
        4: { cellWidth: 32, fontStyle: 'bold', halign: 'right' }, // Stock
        5: { cellWidth: 30, halign: 'right' }, // Cap Total
        6: { cellWidth: 38, fontStyle: 'bold', halign: 'right' }, // Cap Disponible p/ Recibir
        7: { cellWidth: 'auto' }, // Ultima act
      },
      didDrawPage: (data) => {
        startY = data.cursor ? data.cursor.y + 8 : startY + 20;
      },
    });

    startY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : startY + 15;
  });

  // Check space for Grand Totals + Signature block
  if (startY > 140) {
    doc.addPage();
    startY = 20;
  }

  // Summary box by Product
  const prodEntries = Object.entries(globalProductTotals);
  const summaryBoxHeight = 14 + Math.max(1, prodEntries.length) * 6;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, startY, 269, summaryBoxHeight, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, startY, 269, summaryBoxHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMEN GENERAL DE STOCK Y CAPACIDAD DISPONIBLE PARA RECIBIR:', 18, startY + 7);

  let summaryY = startY + 13;
  prodEntries.forEach(([pName, pData]) => {
    const unit = Array.from(pData.units).join('/') || 'Tn';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text(`• ${pName.toUpperCase()}:`, 22, summaryY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Stock Actual: ${pData.stock.toLocaleString('es-AR', { maximumFractionDigits: 1 })} ${unit}`,
      85,
      summaryY
    );

    doc.text(
      `Capacidad Total: ${pData.capacidadTotal.toLocaleString('es-AR', { maximumFractionDigits: 1 })} ${unit}`,
      155,
      summaryY
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text(
      `Capacidad Disponible p/ Recibir: ${pData.disponibleRecibir.toLocaleString('es-AR', { maximumFractionDigits: 1 })} ${unit}`,
      215,
      summaryY
    );

    summaryY += 5.5;
  });

  startY += summaryBoxHeight + 10;

  // Signature Block
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(200, startY + 12, 270, startY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FIRMA / EMISIÓN', 235, startY + 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Emitido por: ${emitterName}`, 235, startY + 22, { align: 'center' });
  doc.text(`Fecha: ${now.toLocaleDateString('es-AR')}`, 235, startY + 26, { align: 'center' });

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    // Footer text
    doc.text('GEyT - Gestión de Plantas', 14, 202);
    doc.text(`Página ${i} de ${totalPages}`, 283, 202, { align: 'right' });
  }

  // Save PDF file
  const fileName = `Informe_Stock_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

