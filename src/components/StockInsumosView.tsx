import React, { useState, useMemo } from 'react';
import { StockInsumo, Planta, Componente } from '../types';
import { exportStockInsumosPDF } from '../lib/pdfExport';
import {
  PackageSearch,
  Search,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Factory,
  CheckCircle2,
  X,
  Check,
  Download,
  Loader2,
  FileText,
} from 'lucide-react';

interface StockInsumosViewProps {
  stockList: StockInsumo[];
  plantas: Planta[];
  componentes: Componente[];
  onSaveStock: (item: StockInsumo) => void;
  onDeleteStock: (id: string) => void;
  userPlantaId?: string; // If user role
  isAdmin: boolean;
}

export const StockInsumosView: React.FC<StockInsumosViewProps> = ({
  stockList,
  plantas,
  componentes,
  onSaveStock,
  onDeleteStock,
  userPlantaId,
  isAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStock, setEditingStock] = useState<StockInsumo | null>(null);

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfEmitterName, setPdfEmitterName] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [formData, setFormData] = useState<Partial<StockInsumo>>({
    id_planta: userPlantaId || (plantas[0]?.id || ''),
    id_componente: componentes[0]?.id || '',
    descripcion: '',
    cant_minima: 5,
    cant_actual: 10,
  });

  // Filter & Grouping logic:
  // First filter by user's plant if user role
  // Then filter by search term
  // Group by id_planta, sort within each group placing items with alerts (cant_actual <= cant_minima) first, then by Componente
  const filteredAndGroupedStock = useMemo(() => {
    let list = [...stockList];

    if (userPlantaId) {
      list = list.filter((item) => item.id_planta === userPlantaId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((item) => {
        const plantaObj = plantas.find((p) => p.id === item.id_planta);
        const compObj = componentes.find((c) => c.id === item.id_componente);

        const textToSearch = [
          item.descripcion,
          plantaObj?.interno,
          plantaObj?.marca,
          compObj?.nmb_componente,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return textToSearch.includes(q);
      });
    }

    // Group by id_planta
    const groups: { [plantaId: string]: StockInsumo[] } = {};
    list.forEach((item) => {
      if (!groups[item.id_planta]) {
        groups[item.id_planta] = [];
      }
      groups[item.id_planta].push(item);
    });

    // Sort items inside each group:
    // 1) Alerta Stock (cant_actual <= cant_minima) first
    // 2) Componente name alphabetically
    Object.keys(groups).forEach((plantaId) => {
      groups[plantaId].sort((a, b) => {
        const aLow = Number(a.cant_actual) <= Number(a.cant_minima) ? 0 : 1;
        const bLow = Number(b.cant_actual) <= Number(b.cant_minima) ? 0 : 1;
        if (aLow !== bLow) {
          return aLow - bLow;
        }
        const compA = componentes.find((c) => c.id === a.id_componente)?.nmb_componente || '';
        const compB = componentes.find((c) => c.id === b.id_componente)?.nmb_componente || '';
        return compA.localeCompare(compB);
      });
    });

    return groups;
  }, [stockList, userPlantaId, searchTerm, plantas, componentes]);

  const handleOpenNewModal = () => {
    setEditingStock(null);
    setFormData({
      id_planta: userPlantaId || (plantas[0]?.id || ''),
      id_componente: componentes[0]?.id || '',
      descripcion: '',
      cant_minima: 5,
      cant_actual: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StockInsumo) => {
    setEditingStock(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcion || !formData.id_planta || !formData.id_componente) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const itemToSave: StockInsumo = {
      id: editingStock ? editingStock.id : `st-${Date.now()}`,
      descripcion: formData.descripcion!,
      id_planta: formData.id_planta!,
      id_componente: formData.id_componente!,
      cant_minima: Number(formData.cant_minima) || 0,
      cant_actual: Number(formData.cant_actual) || 0,
    };

    onSaveStock(itemToSave);
    setIsModalOpen(false);
  };

  // Export PDF Handler
  const handleExportPDF = async () => {
    if (!pdfEmitterName.trim()) return;
    setIsExportingPDF(true);
    try {
      const userPlantaObj = userPlantaId ? plantas.find((p) => p.id === userPlantaId) : null;
      const plantaFiltroNombre = userPlantaObj
        ? `${userPlantaObj.interno} — ${userPlantaObj.marca}`
        : 'Todas las Plantas';

      const itemsToExport = userPlantaId
        ? stockList.filter((s) => s.id_planta === userPlantaId)
        : stockList;

      await exportStockInsumosPDF({
        stockList: itemsToExport,
        plantas,
        componentes,
        plantaFiltroNombre,
        searchTerm,
        emitterName: pdfEmitterName.trim(),
      });

      setIsPdfModalOpen(false);
      setPdfEmitterName('');
    } catch (err) {
      console.error('Error al exportar PDF de Insumos:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Count total low stock items for alert summary
  const totalLowStockAlerts = useMemo(() => {
    const list = userPlantaId ? stockList.filter((s) => s.id_planta === userPlantaId) : stockList;
    return list.filter((s) => Number(s.cant_actual) <= Number(s.cant_minima)).length;
  }, [stockList, userPlantaId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] text-white p-6 border-2 border-slate-800 shadow-[4px_4px_0px_#cbd5e1]">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-extrabold text-[10px] uppercase tracking-[0.2em] italic">
            <PackageSearch className="w-4 h-4" />
            <span>Módulo de Control de Repuestos e Insumos</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1 italic">STOCK DE INSUMOS Y REPUESTOS</h2>
          <div className="h-0.5 w-16 bg-blue-500 my-2"></div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 border-2 border-amber-600 shadow-[3px_3px_0px_#92400e] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Informe PDF</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenNewModal}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Notification Summary Banner if low stock exists */}
      {totalLowStockAlerts > 0 && (
        <div className="p-4 bg-orange-50 border-2 border-orange-500 text-orange-900 flex items-center justify-between shadow-[4px_4px_0px_#fdba74]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-white font-black border border-orange-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-950">
                ¡Alerta de Reposición! Hay {totalLowStockAlerts} insumos con stock crítico o por debajo del mínimo.
              </h4>
              <p className="text-[11px] text-orange-800 font-medium">
                Solicitar reposición inmediata para mantener la operatividad de los componentes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 border-2 border-slate-200 shadow-[4px_4px_0px_#e2e8f0] flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar insumo por descripción, componente o planta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 font-bold text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Stock List grouped by Planta, then ordered by Componente */}
      {Object.keys(filteredAndGroupedStock).length === 0 ? (
        <div className="bg-white p-12 border-2 border-slate-200 text-center text-slate-400 shadow-[4px_4px_0px_#e2e8f0]">
          <PackageSearch className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">No hay insumos registrados en el stock para los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(filteredAndGroupedStock) as [string, StockInsumo[]][]).map(([plantaId, items]) => {
            const plantaObj = plantas.find((p) => p.id === plantaId);

            return (
              <div key={plantaId} className="bg-white border-2 border-slate-200 shadow-[4px_4px_0px_#e2e8f0] overflow-hidden">
                {/* Group Header by Planta */}
                <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-black uppercase tracking-wider text-slate-900 italic">
                      {plantaObj ? `${plantaObj.interno} — ${plantaObj.marca} (${plantaObj.modelo})` : `Planta ${plantaId}`}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                    {items.length} insumos registrados
                  </span>
                </div>

                {/* Table of Stock Items */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-[11px] font-black uppercase tracking-wider text-slate-100 border-b-2 border-slate-900">
                        <th className="py-3 px-4">Componente</th>
                        <th className="py-3 px-4">Descripción del Insumo</th>
                        <th className="py-3 px-4 text-center">Cant. Mínima</th>
                        <th className="py-3 px-4 text-center">Cant. Actual</th>
                        <th className="py-3 px-4 text-center">Estado Stock</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs text-slate-900 bg-white">
                      {items.map((item) => {
                        const compObj = componentes.find((c) => c.id === item.id_componente);
                        // Requirement: Alert indication when cant_actual <= cant_minima
                        const isLowStock = Number(item.cant_actual) <= Number(item.cant_minima);

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              isLowStock
                                ? 'bg-red-50 hover:bg-red-100/80 border-l-4 border-l-red-600'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-black text-blue-900 max-w-[180px] truncate">
                              {compObj ? compObj.nmb_componente : item.id_componente}
                            </td>

                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                              {item.descripcion}
                            </td>

                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">
                              {item.cant_minima}
                            </td>

                            <td className="py-3.5 px-4 text-center font-mono font-black text-sm">
                              <span className={isLowStock ? 'text-red-700 font-extrabold' : 'text-emerald-700 font-black'}>
                                {item.cant_actual}
                              </span>
                            </td>

                            {/* Alert Badge Indicator */}
                            <td className="py-3.5 px-4 text-center">
                              {isLowStock ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-900 border border-red-300 animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                                  ¡ALERTA STOCK MÍNIMO!
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  STOCK OK
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  title="Editar Insumo"
                                  className="p-1.5 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-300"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      if (confirm('¿Eliminar este insumo del inventario?')) {
                                        onDeleteStock(item.id);
                                      }
                                    }}
                                    title="Eliminar Insumo"
                                    className="p-1.5 hover:bg-red-100 text-slate-700 hover:text-red-900 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FORM MODAL for Stock Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase">
                <PackageSearch className="w-5 h-5" />
                <span>{editingStock ? 'Actualizar Insumo' : 'Nuevo Insumo en Stock'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Descripción del Insumo / Repuesto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Manga para casa de filtro"
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Planta *</label>
                  <select
                    value={formData.id_planta || ''}
                    onChange={(e) => setFormData({ ...formData, id_planta: e.target.value })}
                    required
                    disabled={!!userPlantaId}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {plantas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.interno} — {p.marca}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Componente *</label>
                  <select
                    value={formData.id_componente || ''}
                    onChange={(e) => setFormData({ ...formData, id_componente: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {componentes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nmb_componente}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Cantidad Mínima *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cant_minima ?? 0}
                    onChange={(e) => setFormData({ ...formData, cant_minima: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Cantidad Actual en Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cant_actual ?? 0}
                    onChange={(e) => setFormData({ ...formData, cant_actual: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Insumo</span>
                </button>
              </div>
            </form>
          </div>
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
                  Exportar Inventario de Insumos
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
                El informe se generará titulado <strong>"INVENTARIO DE INSUMOS Y REPUESTOS CRITICOS"</strong>,
                separado por Planta y agrupado por Componente. Incluirá en una hoja independiente el listado a comprar para alcanzar el stock mínimo.
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
                      handleExportPDF();
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
                onClick={handleExportPDF}
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
