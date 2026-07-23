import React, { useState } from 'react';
import { Tanque, Silo, Planta, Disposicion, Producto } from '../types';
import { exportStockPDF } from '../lib/pdfExport';
import {
  Cylinder,
  Container,
  Factory,
  Search,
  Save,
  Check,
  AlertCircle,
  Ruler,
  Layers,
  Clock,
  Percent,
  Download,
  Loader2,
  FileText,
  X,
  Package,
} from 'lucide-react';

export interface CalculationResult {
  isCalculated: boolean;
  volumenTotal: number; // in m³
  volumen: number; // in m³ (Stock actual)
  capacidadDisponible: number; // in m³
  porcentajeLlenado: number; // 0 to 100
  disposicionTipo: 'Horizontal' | 'Vertical' | 'Desconocido';
  radio: number;
  lleno: number;
  vacio: number;
  errorMsg?: string;
}

export function calculateTankStock(
  disposicionNombre: string | undefined,
  alturaTotal: number | undefined,
  alturaVacio: number | undefined,
  longitud: number | undefined,
  diametro: number | undefined
): CalculationResult {
  const vacio = Number(alturaVacio ?? 0);
  const dispText = (disposicionNombre || '').toLowerCase();
  const isHorizontal = dispText.includes('horizontal');
  const isVertical = dispText.includes('vertical');

  if (vacio < 0) {
    return {
      isCalculated: false,
      volumenTotal: 0,
      volumen: 0,
      capacidadDisponible: 0,
      porcentajeLlenado: 0,
      disposicionTipo: isHorizontal ? 'Horizontal' : isVertical ? 'Vertical' : 'Desconocido',
      radio: 0,
      lleno: 0,
      vacio,
      errorMsg: 'Altura de vacío no puede ser negativa',
    };
  }

  if (isHorizontal) {
    const diam = Number(diametro || 0);
    const hTotal = Number(alturaTotal || diam || 0);
    const largo = Number(longitud || 0);
    const radio = (diam || hTotal) / 2;

    if (hTotal <= 0 || largo <= 0 || radio <= 0) {
      return {
        isCalculated: false,
        volumenTotal: 0,
        volumen: 0,
        capacidadDisponible: 0,
        porcentajeLlenado: 0,
        disposicionTipo: 'Horizontal',
        radio: 0,
        lleno: 0,
        vacio,
        errorMsg: 'Faltan dimensiones (Diámetro o Longitud)',
      };
    }

    const lleno = Math.max(0, hTotal - vacio);
    const volumenTotal = largo * 3.14159 * (radio ** 2);

    let volumen = 0;
    if (vacio > radio) {
      const cosArg = Math.max(-1, Math.min(1, (radio - lleno) / radio));
      const sqrtArg = Math.max(0, 2 * radio * lleno - (lleno ** 2));
      volumen = largo * ((radio ** 2) * Math.acos(cosArg) - (radio - lleno) * Math.sqrt(sqrtArg));
    } else {
      const cosArg = Math.max(-1, Math.min(1, (radio - vacio) / radio));
      const sqrtArg = Math.max(0, 2 * radio * vacio - (vacio ** 2));
      volumen = volumenTotal - largo * ((radio ** 2) * Math.acos(cosArg) - (radio - vacio) * Math.sqrt(sqrtArg));
    }

    volumen = Math.max(0, Math.min(volumenTotal, volumen));
    const capacidadDisponible = Math.max(0, volumenTotal - volumen);
    const porcentajeLlenado = volumenTotal > 0 ? (volumen / volumenTotal) * 100 : 0;

    return {
      isCalculated: true,
      volumenTotal,
      volumen,
      capacidadDisponible,
      porcentajeLlenado,
      disposicionTipo: 'Horizontal',
      radio,
      lleno,
      vacio,
    };
  } else if (isVertical) {
    const diam = Number(diametro || 0);
    const hTotal = Number(alturaTotal || longitud || 0);
    const radio = diam / 2;
    const lleno = Math.max(0, hTotal - vacio);

    if (diam <= 0 || hTotal <= 0 || radio <= 0) {
      return {
        isCalculated: false,
        volumenTotal: 0,
        volumen: 0,
        capacidadDisponible: 0,
        porcentajeLlenado: 0,
        disposicionTipo: 'Vertical',
        radio: 0,
        lleno: 0,
        vacio,
        errorMsg: 'Faltan dimensiones (Diámetro o Longitud)',
      };
    }

    const volumenTotal = 3.14159 * (radio ** 2) * hTotal;
    const volumen = Math.max(0, Math.min(volumenTotal, 3.14159 * (radio ** 2) * lleno));
    const capacidadDisponible = Math.max(0, volumenTotal - volumen);
    const porcentajeLlenado = volumenTotal > 0 ? (volumen / volumenTotal) * 100 : 0;

    return {
      isCalculated: true,
      volumenTotal,
      volumen,
      capacidadDisponible,
      porcentajeLlenado,
      disposicionTipo: 'Vertical',
      radio,
      lleno,
      vacio,
    };
  } else {
    const diam = Number(diametro || 0);
    const hTotal = Number(alturaTotal || longitud || diam || 0);
    const radio = (diam || hTotal) / 2;
    const lleno = Math.max(0, hTotal - vacio);

    if (hTotal <= 0 || radio <= 0) {
      return {
        isCalculated: false,
        volumenTotal: 0,
        volumen: 0,
        capacidadDisponible: 0,
        porcentajeLlenado: 0,
        disposicionTipo: 'Desconocido',
        radio: 0,
        lleno: 0,
        vacio,
        errorMsg: 'Sin disposición asignada (Horizontal/Vertical)',
      };
    }

    const volumenTotal = 3.14159 * (radio ** 2) * hTotal;
    const volumen = 3.14159 * (radio ** 2) * lleno;
    const capacidadDisponible = Math.max(0, volumenTotal - volumen);
    const porcentajeLlenado = volumenTotal > 0 ? (volumen / volumenTotal) * 100 : 0;

    return {
      isCalculated: true,
      volumenTotal,
      volumen,
      capacidadDisponible,
      porcentajeLlenado,
      disposicionTipo: 'Vertical',
      radio,
      lleno,
      vacio,
    };
  }
}

interface StockTanquesViewProps {
  tanques: Tanque[];
  silos: Silo[];
  plantas: Planta[];
  disposiciones: Disposicion[];
  productos: Producto[];
  onSaveTanque: (tanque: Tanque) => void;
  onSaveSilo: (silo: Silo) => void;
  userPlantaId?: string;
  initialPlantaId?: string;
}

export const StockTanquesView: React.FC<StockTanquesViewProps> = ({
  tanques,
  silos,
  plantas,
  disposiciones,
  productos,
  onSaveTanque,
  onSaveSilo,
  userPlantaId,
  initialPlantaId,
}) => {
  const [selectedPlantaFilter, setSelectedPlantaFilter] = useState<string>(
    userPlantaId || initialPlantaId || ''
  );
  const [filterCategory, setFilterCategory] = useState<'TODOS' | 'TANQUES' | 'SILOS'>('TODOS');
  const [filterDisposicion, setFilterDisposicion] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Local draft state for inputs to allow typing before saving
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfEmitterName, setPdfEmitterName] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const displayPlantas = userPlantaId
    ? plantas.filter((p) => p.id === userPlantaId)
    : plantas;

  // Combine items
  const combinedItems = [
    ...tanques.map((t) => ({ ...t, itemType: 'TANQUE' as const })),
    ...silos.map((s) => ({ ...s, itemType: 'SILO' as const })),
  ];

  // Filter items
  const filteredItems = combinedItems.filter((item) => {
    if (selectedPlantaFilter && item.id_plantas !== selectedPlantaFilter) {
      return false;
    }
    if (userPlantaId && item.id_plantas !== userPlantaId) {
      return false;
    }

    if (filterCategory === 'TANQUES' && item.itemType !== 'TANQUE') return false;
    if (filterCategory === 'SILOS' && item.itemType !== 'SILO') return false;

    if (filterDisposicion) {
      const dispObj = disposiciones.find((d) => d.id === item.id_disposicion);
      const dispName = dispObj ? dispObj.disposicion : '';
      if (item.id_disposicion !== filterDisposicion && !dispName.toLowerCase().includes(filterDisposicion.toLowerCase())) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const pObj = plantas.find((p) => p.id === item.id_plantas);
      const prObj = productos.find((pr) => pr.id === item.id_producto);
      const matchName = (item.denominacion || '').toLowerCase().includes(term);
      const matchMarca = ('marca' in item && item.marca ? item.marca : '').toLowerCase().includes(term);
      const matchPlanta = (pObj ? pObj.interno + ' ' + pObj.marca : '').toLowerCase().includes(term);
      const matchProd = (prObj ? prObj.producto : '').toLowerCase().includes(term);
      if (!matchName && !matchMarca && !matchPlanta && !matchProd) return false;
    }

    return true;
  });

  // Export PDF Handler
  const handleExportStockPDF = async () => {
    if (!pdfEmitterName.trim()) return;
    setIsExportingPDF(true);
    try {
      const selectedPlanta = displayPlantas.find((p) => p.id === selectedPlantaFilter);
      const plantaFiltroNombre = selectedPlanta
        ? `${selectedPlanta.interno} — ${selectedPlanta.marca}`
        : selectedPlantaFilter
        ? 'Planta Filtrada'
        : 'Todas las Plantas';

      await exportStockPDF({
        groupedRecords: groupedByPlanta,
        plantas,
        disposiciones,
        productos,
        plantaFiltroNombre,
        categoriaFiltro: filterCategory,
        emitterName: pdfEmitterName.trim(),
      });
      setIsPdfModalOpen(false);
      setPdfEmitterName('');
    } catch (err) {
      console.error('Error al exportar PDF de Stock:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Save handler for item (Tanque or Silo)
  const handleSaveItem = (item: (Tanque | Silo) & { itemType: 'TANQUE' | 'SILO' }) => {
    const draftVal = inputDrafts[item.id];
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (item.itemType === 'TANQUE') {
      const newVacio = draftVal !== undefined ? parseFloat(draftVal) || 0 : (item.altura_vacio || 0);
      const dispObj = disposiciones.find((d) => d.id === item.id_disposicion);
      const calc = calculateTankStock(
        dispObj?.disposicion,
        item.altura_total,
        newVacio,
        item.longitud,
        item.diametro
      );
      const calculatedStockLiters = Math.round(calc.volumen * 1000);

      onSaveTanque({
        ...(item as Tanque),
        altura_vacio: newVacio,
        fecha_actualizacion_vacio: formattedDate,
        stock: calculatedStockLiters > 0 ? calculatedStockLiters : item.stock,
      });
    } else {
      const newPorcentajeRaw = draftVal !== undefined ? parseFloat(draftVal) || 0 : (item.altura_total || 0);
      const newPorcentaje = Math.max(0, Math.min(100, newPorcentajeRaw));
      const capTn = item.capacidad || 0;
      const calculatedStockTn = Math.round(capTn * (newPorcentaje / 100) * 100) / 100;

      onSaveSilo({
        ...(item as Silo),
        altura_total: newPorcentaje, // Guardar el % de vacío/stock en el campo altura_total de la BD
        stock: calculatedStockTn, // Guardar stock calculated en Tn
        fecha_actualizacion_vacio: formattedDate,
      });
    }

    const nextDrafts = { ...inputDrafts };
    delete nextDrafts[item.id];
    setInputDrafts(nextDrafts);

    setSavedSuccessId(item.id);
    setTimeout(() => {
      setSavedSuccessId(null);
    }, 2500);
  };

  // Group filtered items by Planta
  const groupedByPlanta: { planta: Planta | null; items: typeof filteredItems }[] = [];

  displayPlantas.forEach((p) => {
    const itemsInPlant = filteredItems.filter((i) => i.id_plantas === p.id);
    if (itemsInPlant.length > 0) {
      groupedByPlanta.push({ planta: p, items: itemsInPlant });
    }
  });

  const unassignedItems = filteredItems.filter(
    (i) => !displayPlantas.some((p) => p.id === i.id_plantas)
  );
  if (unassignedItems.length > 0) {
    groupedByPlanta.push({ planta: null, items: unassignedItems });
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#0f172a] text-white p-6 border-2 border-slate-800 shadow-[4px_4px_0px_#cbd5e1] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-extrabold text-[10px] uppercase tracking-[0.2em] italic">
            <Cylinder className="w-4 h-4" />
            <span>GEyT • Gestión de Almacenamiento</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1 italic uppercase">
            STOCK TANQUES / SILOS
          </h2>
        </div>

        {/* Action Button: Export PDF */}
        <div>
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 border-2 border-amber-600 shadow-[3px_3px_0px_#92400e] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Informe PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border-2 border-slate-200 p-4 shadow-[3px_3px_0px_#e2e8f0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200 rounded-lg">
          <button
            onClick={() => setFilterCategory('TODOS')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
              filterCategory === 'TODOS'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Todos ({combinedItems.length})
          </button>
          <button
            onClick={() => setFilterCategory('TANQUES')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'TANQUES'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cylinder className="w-3.5 h-3.5 text-sky-600" />
            <span>Tanques ({tanques.length})</span>
          </button>
          <button
            onClick={() => setFilterCategory('SILOS')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              filterCategory === 'SILOS'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Container className="w-3.5 h-3.5 text-emerald-600" />
            <span>Silos ({silos.length})</span>
          </button>
        </div>

        {/* Dropdowns & Search */}
        <div className="flex items-center gap-3 flex-wrap flex-1 md:flex-none">
          {!userPlantaId && (
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedPlantaFilter}
                onChange={(e) => setSelectedPlantaFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="">Todas las Plantas</option>
                {displayPlantas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.interno} — {p.marca} {p.modelo}
                  </option>
                ))}
              </select>
            </div>
          )}

          <select
            value={filterDisposicion}
            onChange={(e) => setFilterDisposicion(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="">Todas las Disposiciones</option>
            <option value="Horizontal">Horizontal</option>
            <option value="Vertical">Vertical</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por tanque, silo, producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Render Items Grouped by Planta */}
      {groupedByPlanta.length === 0 ? (
        <div className="bg-white border-2 border-slate-200 p-12 text-center text-slate-500 font-medium">
          <Cylinder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold uppercase text-slate-700">No se encontraron tanques ni silos</p>
          <p className="text-xs text-slate-400 mt-1">
            Intenta cambiando los filtros o agregando nuevos tanques/silos en la sección de gestión.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByPlanta.map(({ planta, items }) => {
            // Compute stock per product for this plant
            const plantProductMap: {
              [pId: string]: {
                productName: string;
                stock: number;
                capacidadTotal: number;
                disponibleRecibir: number;
                isTank: boolean;
                isSilo: boolean;
              };
            } = {};

            items.forEach((item) => {
              const prodObj = productos.find((pr) => pr.id === item.id_producto);
              const pId = item.id_producto || 'unassigned';
              const pName = prodObj ? prodObj.producto : 'Sin Asignar';

              if (!plantProductMap[pId]) {
                plantProductMap[pId] = {
                  productName: pName,
                  stock: 0,
                  capacidadTotal: 0,
                  disponibleRecibir: 0,
                  isTank: false,
                  isSilo: false,
                };
              }

              const draftVal = inputDrafts[item.id];
              if (item.itemType === 'TANQUE') {
                plantProductMap[pId].isTank = true;
                const dispObj = disposiciones.find((d) => d.id === item.id_disposicion);
                const currentVacio = draftVal !== undefined ? parseFloat(draftVal) : (item.altura_vacio ?? 0);
                const calc = calculateTankStock(
                  dispObj?.disposicion,
                  item.altura_total,
                  currentVacio,
                  item.longitud,
                  item.diametro
                );
                if (calc.isCalculated) {
                  plantProductMap[pId].stock += calc.volumen;
                  plantProductMap[pId].capacidadTotal += calc.volumenTotal;
                  plantProductMap[pId].disponibleRecibir += calc.capacidadDisponible;
                }
              } else {
                plantProductMap[pId].isSilo = true;
                const currentPorcentaje = draftVal !== undefined ? parseFloat(draftVal) : (item.altura_total ?? 0);
                const capTn = item.capacidad || 0;
                const pctClamped = Math.max(0, Math.min(100, currentPorcentaje || 0));
                const stockTn = capTn * (pctClamped / 100);
                const dispTn = Math.max(0, capTn - stockTn);

                plantProductMap[pId].stock += stockTn;
                plantProductMap[pId].capacidadTotal += capTn;
                plantProductMap[pId].disponibleRecibir += dispTn;
              }
            });

            return (
              <div key={planta ? planta.id : 'unassigned'} className="space-y-4">
                {/* Group Header for Planta with dynamic per-product indicators */}
                <div className="bg-slate-900 text-white p-4 px-5 border-l-4 border-amber-500 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <Factory className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <h3 className="text-sm md:text-base font-black uppercase tracking-wider italic flex items-center gap-2">
                        <span>{planta ? `${planta.interno} — ${planta.marca}` : 'Sin Planta Asignada'}</span>
                        {planta?.modelo && (
                          <span className="text-xs font-normal text-slate-300 font-mono">({planta.modelo})</span>
                        )}
                      </h3>
                      {(planta?.obra_rel?.descripcion || planta?.descripcion) && (
                        <p className="text-xs text-slate-400 font-medium">
                          {planta.obra_rel ? `Obra: ${planta.obra_rel.descripcion}` : planta.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Product Stock Indicators for this Plant */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {Object.values(plantProductMap).map((prodInfo, pIdx) => {
                      const unit = prodInfo.isTank && !prodInfo.isSilo ? 'm³' : prodInfo.isSilo && !prodInfo.isTank ? 'Tn' : 'Tn / m³';
                      return (
                        <div
                          key={pIdx}
                          className="bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-1.5 flex flex-col justify-center text-right shadow-inner min-w-[130px]"
                        >
                          <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1 justify-end">
                            <Package className="w-3 h-3" />
                            Stock {prodInfo.productName}
                          </span>
                          <span className="text-sm font-black font-mono text-white">
                            {prodInfo.stock.toLocaleString('es-AR', { maximumFractionDigits: 1 })} {unit}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-400 font-mono">
                            Disp: {prodInfo.disponibleRecibir.toLocaleString('es-AR', { maximumFractionDigits: 1 })} {unit}
                          </span>
                        </div>
                      );
                    })}
                    <span className="text-xs font-mono font-bold bg-slate-800 text-slate-400 px-3 py-2 rounded-lg border border-slate-700 shrink-0 flex items-center">
                      {items.length} {items.length === 1 ? 'Equipo' : 'Equipos'}
                    </span>
                  </div>
                </div>

                {/* Grid of Tank / Silo Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {items.map((item) => {
                  const dispObj = disposiciones.find((d) => d.id === item.id_disposicion);
                  const productoObj = productos.find((pr) => pr.id === item.id_producto);
                  const draftVal = inputDrafts[item.id];
                  const isSaved = savedSuccessId === item.id;

                  // ---------------- TANQUE CARD ----------------
                  if (item.itemType === 'TANQUE') {
                    const currentVacio = draftVal !== undefined ? parseFloat(draftVal) : (item.altura_vacio ?? 0);
                    const calc = calculateTankStock(
                      dispObj?.disposicion,
                      item.altura_total,
                      currentVacio,
                      item.longitud,
                      item.diametro
                    );

                    return (
                      <div
                        key={item.id}
                        className="bg-white border-2 border-slate-200 hover:border-sky-600 transition-all p-5 shadow-[4px_4px_0px_#cbd5e1] flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-sky-50 text-sky-800 border-sky-200">
                                  TANQUE
                                </span>
                                {dispObj && (
                                  <span className="text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5">
                                    {dispObj.disposicion}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">
                                {item.denominacion}
                              </h3>
                              {'marca' in item && item.marca && (
                                <p className="text-xs text-slate-500 font-bold">Marca: {item.marca}</p>
                              )}
                            </div>

                            <div className="bg-slate-900 text-amber-300 border border-slate-800 px-3 py-1.5 rounded-lg text-right shrink-0">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Producto</span>
                              <span className="text-xs font-black uppercase">{productoObj ? productoObj.producto : 'No asignado'}</span>
                            </div>
                          </div>

                          {/* Dimensions Specs */}
                          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs grid grid-cols-3 gap-2 font-mono">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Diámetro</span>
                              <span className="font-black text-slate-800">{item.diametro ? `${item.diametro} m` : '-'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Longitud</span>
                              <span className="font-black text-slate-800">{item.longitud ? `${item.longitud} m` : '-'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Radio Calc.</span>
                              <span className="font-black text-sky-700">{calc.radio ? `${calc.radio.toFixed(2)} m` : '-'}</span>
                            </div>
                          </div>

                          {/* Input Box: Altura Vacío */}
                          <div className="bg-sky-50/60 border border-sky-200 p-3 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Ruler className="w-5 h-5 text-sky-600 shrink-0" />
                              <div>
                                <label className="text-xs font-black text-sky-950 uppercase tracking-wider block">
                                  Ingresar Altura Vacío (m)
                                </label>
                                <span className="text-[10px] text-sky-700 font-medium block">
                                  Medición del espacio libre desde el tope
                                </span>
                                {item.fecha_actualizacion_vacio && (
                                  <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>Última act: {item.fecha_actualizacion_vacio}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={draftVal !== undefined ? draftVal : (item.altura_vacio ?? '')}
                                onChange={(e) => {
                                  setInputDrafts({
                                    ...inputDrafts,
                                    [item.id]: e.target.value,
                                  });
                                }}
                                className="w-24 bg-white border-2 border-sky-400 rounded-lg p-2 text-sm font-mono font-black text-sky-950 focus:outline-none focus:border-sky-600 text-center shadow-inner"
                              />
                              <button
                                onClick={() => handleSaveItem(item)}
                                className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                                  isSaved
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                                }`}
                                title="Guardar medición y calcular stock"
                              >
                                {isSaved ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Guardado</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    <span>Guardar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Calculations Results */}
                          {calc.isCalculated ? (
                            <div className="space-y-3 pt-1">
                              <div>
                                <div className="flex items-center justify-between text-xs font-bold mb-1">
                                  <span className="text-slate-600 uppercase flex items-center gap-1 text-[11px]">
                                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                                    Nivel de Llenado del Tanque
                                  </span>
                                  <span className={`font-mono font-black ${
                                    calc.porcentajeLlenado > 90
                                      ? 'text-red-600'
                                      : calc.porcentajeLlenado > 50
                                      ? 'text-sky-700'
                                      : 'text-amber-600'
                                  }`}>
                                    {calc.porcentajeLlenado.toFixed(1)}% Ocupado
                                  </span>
                                </div>
                                <div className="w-full h-3.5 bg-slate-100 border border-slate-300 rounded-full overflow-hidden p-0.5">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      calc.porcentajeLlenado > 90
                                        ? 'bg-red-500'
                                        : calc.porcentajeLlenado > 50
                                        ? 'bg-sky-500'
                                        : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, calc.porcentajeLlenado))}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
                                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                                    Stock Actual Calculado
                                  </span>
                                  <span className="text-xl font-black font-mono text-sky-300">
                                    {calc.volumen.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m³
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono font-medium mt-0.5">
                                    ~{(calc.volumen * 1000).toLocaleString('es-AR')} Litros / Tn
                                  </span>
                                </div>

                                <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
                                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                    Capacidad Disponible
                                  </span>
                                  <span className="text-xl font-black font-mono text-emerald-300">
                                    {calc.capacidadDisponible.toLocaleString('es-AR', { maximumFractionDigits: 2 })} m³
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono font-medium mt-0.5">
                                    ~{(calc.capacidadDisponible * 1000).toLocaleString('es-AR')} Litros / Tn
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>{calc.errorMsg || 'Incomplete dimensions for geometry calculation'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // ---------------- SILO CARD ----------------
                  const currentPorcentaje = draftVal !== undefined ? parseFloat(draftVal) : (item.altura_total ?? 0);
                  const porcentajeClamped = Math.max(0, Math.min(100, currentPorcentaje || 0));
                  const capacidadTn = item.capacidad || 0;
                  const stockTn = capacidadTn * (porcentajeClamped / 100);
                  const capacidadDisponibleTn = Math.max(0, capacidadTn - stockTn);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border-2 border-emerald-200 hover:border-emerald-600 transition-all p-5 shadow-[4px_4px_0px_#cbd5e1] flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1">
                                <Container className="w-3 h-3" />
                                SILO
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">
                              {item.denominacion}
                            </h3>
                          </div>

                          <div className="bg-slate-900 text-emerald-300 border border-slate-800 px-3 py-1.5 rounded-lg text-right shrink-0">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Producto</span>
                            <span className="text-xs font-black uppercase">{productoObj ? productoObj.producto : 'No asignado'}</span>
                          </div>
                        </div>

                        {/* Specs Row */}
                        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs grid grid-cols-3 gap-2 font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacidad</span>
                            <span className="font-black text-slate-800">{capacidadTn} Tn</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Stock %</span>
                            <span className="font-black text-emerald-700">{porcentajeClamped.toFixed(1)} %</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Disponible</span>
                            <span className="font-black text-sky-700">{capacidadDisponibleTn.toFixed(1)} Tn</span>
                          </div>
                        </div>

                        {/* Input Box: Stock en porcentaje */}
                        <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                                Stock en porcentaje
                              </label>
                              <span className="text-[10px] text-emerald-800 font-medium block">
                                Porcentaje de llenado del silo (%)
                              </span>
                              {item.fecha_actualizacion_vacio && (
                                <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>Última act: {item.fecha_actualizacion_vacio}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="0.0"
                                value={draftVal !== undefined ? draftVal : (item.altura_total ?? '')}
                                onChange={(e) => {
                                  setInputDrafts({
                                    ...inputDrafts,
                                    [item.id]: e.target.value,
                                  });
                                }}
                                className="w-24 bg-white border-2 border-emerald-400 rounded-lg p-2 text-sm font-mono font-black text-emerald-950 focus:outline-none focus:border-emerald-600 text-center shadow-inner pr-6"
                              />
                              <span className="absolute right-2 top-2.5 text-xs font-bold text-emerald-700 font-mono">%</span>
                            </div>
                            <button
                              onClick={() => handleSaveItem(item)}
                              className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                                isSaved
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                              }`}
                              title="Guardar porcentaje y calcular stock en Tn"
                            >
                              {isSaved ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Guardado</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  <span>Guardar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Calculations Results for Silo */}
                        <div className="space-y-3 pt-1">
                          {/* Fill Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                              <span className="text-slate-600 uppercase flex items-center gap-1 text-[11px]">
                                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                Nivel de Llenado del Silo
                              </span>
                              <span className={`font-mono font-black ${
                                porcentajeClamped > 90
                                  ? 'text-red-600'
                                  : porcentajeClamped > 50
                                  ? 'text-emerald-700'
                                  : 'text-amber-600'
                              }`}>
                                {porcentajeClamped.toFixed(1)}% Ocupado
                              </span>
                            </div>
                            <div className="w-full h-3.5 bg-slate-100 border border-slate-300 rounded-full overflow-hidden p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  porcentajeClamped > 90
                                    ? 'bg-red-500'
                                    : porcentajeClamped > 50
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${porcentajeClamped}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Cards: Stock Actual (Tn) & Capacidad Disponible (Tn) */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                Stock Actual (Tn)
                              </span>
                              <span className="text-xl font-black font-mono text-emerald-300">
                                {stockTn.toLocaleString('es-AR', { maximumFractionDigits: 2 })} Tn
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono font-medium mt-0.5">
                                Calculado como {porcentajeClamped.toFixed(1)}% de {capacidadTn} Tn
                              </span>
                            </div>

                            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
                              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                                Capacidad Disponible (Tn)
                              </span>
                              <span className="text-xl font-black font-mono text-sky-300">
                                {capacidadDisponibleTn.toLocaleString('es-AR', { maximumFractionDigits: 2 })} Tn
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono font-medium mt-0.5">
                                Diferencia (Capacidad - Stock)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* PDF Emitter Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#0f172a] max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-900">
                <FileText className="w-6 h-6 text-amber-500" />
                <h3 className="font-black text-lg uppercase tracking-tight italic">
                  Exportar Informe de Stock
                </h3>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                El informe de stock se generará agrupado por planta con detalle por equipo,
                stock de cada producto y capacidad disponible para recibir material.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-800 tracking-wider block">
                  Nombre de quien emite el informe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ing. Juan Pérez"
                  value={pdfEmitterName}
                  onChange={(e) => setPdfEmitterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pdfEmitterName.trim()) {
                      handleExportStockPDF();
                    }
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 border-2 border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExportStockPDF}
                disabled={!pdfEmitterName.trim() || isExportingPDF}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-2 border-2 border-amber-600 shadow-[2px_2px_0px_#92400e] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generar PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
