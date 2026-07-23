import React, { useState, useMemo } from 'react';
import {
  Produccion,
  Planta,
  Operador,
  Obra,
  MotivoParada,
  Capa,
} from '../types';
import {
  Plus,
  Filter,
  Calendar,
  Flame,
  Clock,
  Building2,
  Factory,
  HardHat,
  Layers,
  FileText,
  UserCheck,
  Edit2,
  Trash2,
  X,
  Check,
  Database,
  Loader2,
  Download,
} from 'lucide-react';
import { exportProduccionPDF } from '../lib/pdfExport';

interface ProduccionViewProps {
  produccionList: Produccion[];
  plantas: Planta[];
  operadores: Operador[];
  obras: Obra[];
  motivos: MotivoParada[];
  capas: Capa[];
  onSaveProduccion: (record: Produccion) => Promise<void> | void;
  onDeleteProduccion: (id: string) => Promise<void> | void;
  userPlantaId?: string; // If restricted user
}

export const ProduccionView: React.FC<ProduccionViewProps> = ({
  produccionList,
  plantas,
  operadores,
  obras,
  motivos,
  capas,
  onSaveProduccion,
  onDeleteProduccion,
  userPlantaId,
}) => {
  // Filters state
  const [selectedPlanta, setSelectedPlanta] = useState<string>(userPlantaId || 'TODAS');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<Produccion | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState<Partial<Produccion>>({
    id_plantas: userPlantaId || (plantas[0]?.id || ''),
    fecha: new Date().toISOString().split('T')[0],
    hs_inicio: '07:00',
    hs_fin: '17:00',
    tn_producidas: 0,
    hs_parada: 0,
    calderista_1: '',
    calderista_2: '',
    calderista_3: '',
    calderista_4: '',
  });

  // PDF Modal & Emitter state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfEmitterName, setPdfEmitterName] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Filter and sort records from newest to oldest
  const filteredRecords = useMemo(() => {
    let result = [...produccionList];

    if (userPlantaId) {
      result = result.filter((p) => p.id_plantas === userPlantaId);
    } else if (selectedPlanta && selectedPlanta !== 'TODAS') {
      result = result.filter((p) => p.id_plantas === selectedPlanta);
    }

    if (fechaDesde) {
      result = result.filter((p) => p.fecha >= fechaDesde);
    }

    if (fechaHasta) {
      result = result.filter((p) => p.fecha <= fechaHasta);
    }

    // Sort newest to oldest by date and start time
    return result.sort((a, b) => {
      const dateA = `${a.fecha}T${a.hs_inicio || '00:00'}`;
      const dateB = `${b.fecha}T${b.hs_inicio || '00:00'}`;
      return dateB.localeCompare(dateA);
    });
  }, [produccionList, selectedPlanta, fechaDesde, fechaHasta]);

  // Group records by Planta, maintaining newest-to-oldest order within each group
  const groupedAndSortedRecords = useMemo(() => {
    const groups: { [plantaId: string]: Produccion[] } = {};
    filteredRecords.forEach((item) => {
      const pId = item.id_plantas || 'sin-planta';
      if (!groups[pId]) {
        groups[pId] = [];
      }
      groups[pId].push(item);
    });

    Object.keys(groups).forEach((plantaId) => {
      groups[plantaId].sort((a, b) => {
        const dateA = `${a.fecha}T${a.hs_inicio || '00:00'}`;
        const dateB = `${b.fecha}T${b.hs_inicio || '00:00'}`;
        return dateB.localeCompare(dateA);
      });
    });

    return groups;
  }, [filteredRecords]);

  // Total accumulated tons produced according to active filters
  const totalTnProducidas = useMemo(() => {
    return filteredRecords.reduce((sum, item) => sum + (Number(item.tn_producidas) || 0), 0);
  }, [filteredRecords]);

  // Total stopped hours
  const totalHsParada = useMemo(() => {
    return filteredRecords.reduce((sum, item) => sum + (Number(item.hs_parada) || 0), 0);
  }, [filteredRecords]);

  const handleOpenNewModal = () => {
    setEditingRecord(null);
    setFormData({
      id_plantas: userPlantaId || selectedPlanta !== 'TODAS' ? selectedPlanta : plantas[0]?.id || '',
      id_operador: operadores[0]?.id || '',
      fecha: new Date().toISOString().split('T')[0],
      hs_inicio: '07:00',
      hs_fin: '17:00',
      tn_producidas: 1000,
      hs_parada: 0,
      id_motivo_parada: motivos[0]?.id || '',
      motivo_otro: '',
      observaciones: '',
      id_obras: obras[0]?.id || '',
      id_capa: capas[0]?.id || '',
      calderista_1: '',
      calderista_2: '',
      calderista_3: '',
      calderista_4: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: Produccion) => {
    setEditingRecord(rec);
    setFormData({ ...rec });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_plantas || !formData.fecha) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    setIsSaving(true);
    try {
      const recordToSave: Produccion = {
        id: editingRecord ? editingRecord.id : `prod-${Date.now()}`,
        id_plantas: formData.id_plantas!,
        id_operador: formData.id_operador,
        fecha: formData.fecha!,
        hs_inicio: formData.hs_inicio,
        hs_fin: formData.hs_fin,
        tn_producidas: Number(formData.tn_producidas) || 0,
        hs_parada: Number(formData.hs_parada) || 0,
        id_motivo_parada: formData.id_motivo_parada,
        motivo_otro: formData.motivo_otro,
        observaciones: formData.observaciones,
        id_obras: formData.id_obras,
        calderista_1: formData.calderista_1,
        calderista_2: formData.calderista_2,
        calderista_3: formData.calderista_3,
        calderista_4: formData.calderista_4,
        id_capa: formData.id_capa,
      };

      await onSaveProduccion(recordToSave);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al guardar registro de producción:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to check if selected motivo is "Otro"
  const selectedMotivoObj = motivos.find((m) => m.id === formData.id_motivo_parada);
  const isMotivoOtroSelected =
    selectedMotivoObj &&
    (selectedMotivoObj.motivo.toLowerCase().includes('otro') ||
      selectedMotivoObj.id === 'm-6');

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] text-white p-6 border-2 border-slate-800 shadow-[4px_4px_0px_#cbd5e1]">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-extrabold text-[10px] uppercase tracking-[0.2em] italic">
            <Flame className="w-4 h-4" />
            <span>Módulo de Control de Producción</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1 italic">REGISTROS DE PRODUCCIÓN DIARIA</h2>
          <div className="h-0.5 w-16 bg-blue-500 my-2"></div>
        </div>

        {/* Action Buttons: New Record and PDF Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a] border border-slate-700 active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Download className="w-4 h-4 text-blue-400 stroke-[2.5]" />
            <span>Exportar Informe PDF</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-5 border-2 border-slate-200 shadow-[4px_4px_0px_#e2e8f0] flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic w-full sm:w-auto">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filtros:</span>
        </div>

        {!userPlantaId && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Planta</label>
            <select
              value={selectedPlanta}
              onChange={(e) => setSelectedPlanta(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 font-bold px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="TODAS">Todas las Plantas</option>
              {plantas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.interno} — {p.marca} ({p.modelo})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Desde Fecha</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 font-bold px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hasta Fecha</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 font-bold px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        {(fechaDesde || fechaHasta || selectedPlanta !== 'TODAS') && (
          <button
            onClick={() => {
              setFechaDesde('');
              setFechaHasta('');
              if (!userPlantaId) setSelectedPlanta('TODAS');
            }}
            className="mt-5 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 px-3 py-1.5 border border-blue-200"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Production Records List grouped by Planta */}
      {Object.keys(groupedAndSortedRecords).length === 0 ? (
        <div className="bg-white p-12 border-2 border-slate-200 text-center text-slate-400 shadow-[4px_4px_0px_#e2e8f0]">
          <Flame className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">No hay registros de producción que coincidan con los filtros.</p>
          <p className="text-xs text-slate-400 mt-1">
            Haga clic en "Nuevo Registro" para ingresar uno.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedAndSortedRecords) as [string, Produccion[]][]).map(([plantaId, items]) => {
            const plantaObj = plantas.find((p) => p.id === plantaId);
            const plantTn = items.reduce((sum, item) => sum + (Number(item.tn_producidas) || 0), 0);
            const plantHsParada = items.reduce((sum, item) => sum + (Number(item.hs_parada) || 0), 0);

            return (
              <div key={plantaId} className="bg-white border-2 border-slate-200 shadow-[4px_4px_0px_#e2e8f0] overflow-hidden">
                {/* Group Header Rectangle by Planta with Individual Metrics */}
                <div className="bg-slate-100 p-4 border-b-2 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Factory className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-sm font-black uppercase tracking-wider text-slate-900 italic">
                      {plantaObj ? `${plantaObj.interno} — ${plantaObj.marca} (${plantaObj.modelo})` : `Planta ${plantaId}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Indicador Acumulado Toneladas por Planta */}
                    <div className="bg-white px-3 py-1.5 border-2 border-blue-200 rounded-lg flex items-center gap-2 shadow-xs">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Acumulado Toneladas:</span>
                      <span className="text-xs font-black font-mono text-blue-700">
                        {plantTn.toLocaleString('es-AR')} Tn
                      </span>
                    </div>

                    {/* Indicador Paradas Totales por Planta */}
                    <div className="bg-white px-3 py-1.5 border-2 border-amber-200 rounded-lg flex items-center gap-2 shadow-xs">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Paradas Totales:</span>
                      <span className="text-xs font-black font-mono text-amber-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {plantHsParada} hs
                      </span>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full bg-slate-800 text-slate-300">
                      {items.length} {items.length === 1 ? 'registro' : 'registros'}
                    </span>
                  </div>
                </div>

                {/* Table for this Planta */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-[11px] font-black uppercase tracking-wider text-slate-100 border-b-2 border-slate-900">
                        <th className="py-3 px-4">Fecha / Horario</th>
                        <th className="py-3 px-4">Obra / Capa</th>
                        <th className="py-3 px-4 text-right">Tn Producidas</th>
                        <th className="py-3 px-4 text-right">Hs Parada</th>
                        <th className="py-3 px-4">Motivo Parada</th>
                        <th className="py-3 px-4">Operador / Calderistas</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs text-slate-800 font-medium">
                      {items.map((item) => {
                        const obraObj = obras.find((o) => o.id === item.id_obras);
                        const operadorObj = operadores.find((op) => op.id === item.id_operador);
                        const motivoObj = motivos.find((m) => m.id === item.id_motivo_parada);
                        const capaObj = capas.find((c) => c.id === item.id_capa);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-mono">
                              <div className="font-black text-slate-900">{item.fecha}</div>
                              <div className="text-[10px] text-slate-500 font-bold">
                                {item.hs_inicio || '00:00'} - {item.hs_fin || '00:00'}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 max-w-[200px] truncate">
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <HardHat className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                <span className="truncate">{obraObj ? `${obraObj.numero} - ${obraObj.descripcion}` : 'Sin obra'}</span>
                              </div>
                              {capaObj && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-bold">
                                  <Layers className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="truncate">{capaObj.capa}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono font-black text-blue-700 text-sm">
                              {Number(item.tn_producidas).toLocaleString('es-AR')} Tn
                            </td>

                            <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-800">
                              {item.hs_parada ? `${item.hs_parada} hs` : '-'}
                            </td>

                            <td className="py-3.5 px-4 max-w-[180px]">
                              {motivoObj ? (
                                <div>
                                  <span className="font-semibold text-slate-800">{motivoObj.motivo}</span>
                                  {item.motivo_otro && (
                                    <p className="text-[11px] text-amber-800 font-medium italic mt-0.5">"{item.motivo_otro}"</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">
                                {operadorObj ? `${operadorObj.nombre} ${operadorObj.apellido}` : '-'}
                              </div>
                              {item.calderista_1 && (
                                <div className="text-[11px] text-slate-700 font-medium mt-0.5">
                                  Calderistas: <span className="font-semibold text-slate-900">{[item.calderista_1, item.calderista_2, item.calderista_3, item.calderista_4].filter(Boolean).join(', ')}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  title="Editar registro"
                                  className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('¿Eliminar este registro de producción de la base de datos?')) {
                                      await onDeleteProduccion(item.id);
                                    }
                                  }}
                                  title="Eliminar registro"
                                  className="p-1.5 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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

      {/* FORM MODAL for New or Edit Production Record */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase">
                <Flame className="w-5 h-5" />
                <span>{editingRecord ? 'Editar Registro de Producción' : 'Nuevo Registro de Producción'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Supabase Connection Info */}
            <div className="flex items-center justify-between bg-blue-950/40 border border-blue-500/30 p-3 rounded-xl text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Conectado directamente con la tabla <strong className="text-white font-semibold">"produccion"</strong> de la BD Supabase.
                </span>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                {produccionList.length} registro(s)
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Planta */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Planta de Producción *
                  </label>
                  <select
                    value={formData.id_plantas || ''}
                    onChange={(e) => setFormData({ ...formData, id_plantas: e.target.value })}
                    required
                    disabled={!!userPlantaId}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {plantas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.interno} — {p.marca} ({p.modelo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha || ''}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Horario Inicio */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={formData.hs_inicio || ''}
                    onChange={(e) => setFormData({ ...formData, hs_inicio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Horario Fin */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={formData.hs_fin || ''}
                    onChange={(e) => setFormData({ ...formData, hs_fin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Tn Producidas */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Toneladas Producidas (Tn) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tn_producidas ?? ''}
                    onChange={(e) => setFormData({ ...formData, tn_producidas: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Obra */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Obra
                  </label>
                  <select
                    value={formData.id_obras || ''}
                    onChange={(e) => setFormData({ ...formData, id_obras: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar Obra...</option>
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        Obra N° {o.numero} — {o.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capa */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Capa de Producción
                  </label>
                  <select
                    value={formData.id_capa || ''}
                    onChange={(e) => setFormData({ ...formData, id_capa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar Capa...</option>
                    {capas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.capa}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operador / Jefe */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Operador / Responsable
                  </label>
                  <select
                    value={formData.id_operador || ''}
                    onChange={(e) => setFormData({ ...formData, id_operador: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar Operador...</option>
                    {operadores.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.nombre} {op.apellido} ({op.rol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hs Parada */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Horas de Parada
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hs_parada ?? 0}
                    onChange={(e) => setFormData({ ...formData, hs_parada: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Motivo Parada */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Motivo de Parada
                  </label>
                  <select
                    value={formData.id_motivo_parada || ''}
                    onChange={(e) => setFormData({ ...formData, id_motivo_parada: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Ninguno / Sin parada</option>
                    {motivos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.motivo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirement 3b: If id_motivo_parada is "Otro", enable field "motivo_otro" */}
              {isMotivoOtroSelected && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl animate-fade-in">
                  <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                    Especificar Motivo Otro *
                  </label>
                  <input
                    type="text"
                    placeholder="Escriba el detalle del motivo de la parada..."
                    value={formData.motivo_otro || ''}
                    onChange={(e) => setFormData({ ...formData, motivo_otro: e.target.value })}
                    required={isMotivoOtroSelected}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Calderistas section */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                  Personal Calderistas (Turnos / Apoyos)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Calderista 1"
                    value={formData.calderista_1 || ''}
                    onChange={(e) => setFormData({ ...formData, calderista_1: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Calderista 2"
                    value={formData.calderista_2 || ''}
                    onChange={(e) => setFormData({ ...formData, calderista_2: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Calderista 3"
                    value={formData.calderista_3 || ''}
                    onChange={(e) => setFormData({ ...formData, calderista_3: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Calderista 4"
                    value={formData.calderista_4 || ''}
                    onChange={(e) => setFormData({ ...formData, calderista_4: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Observaciones adicionales
                </label>
                <textarea
                  rows={2}
                  placeholder="Comentarios sobre la jornada de producción..."
                  value={formData.observaciones || ''}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando en BD...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingRecord ? 'Guardar Cambios' : 'Registrar Producción'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for PDF Emitter Name */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#0f172a] max-w-md w-full p-6">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 italic">
                <FileText className="w-4 h-4 text-blue-600" />
                Exportar Reporte de Producción
              </h3>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 font-medium">
              Antes de exportar el archivo, ingrese el nombre de la persona que emite el informe (figurará a modo de firma):
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!pdfEmitterName.trim()) {
                  alert('Por favor ingrese el nombre de quien emite el informe.');
                  return;
                }
                setIsGeneratingPDF(true);
                try {
                  const plantaFiltroObj = plantas.find((p) => p.id === selectedPlanta);
                  const plantaFiltroNombre = selectedPlanta === 'TODAS'
                    ? 'Todas las Plantas'
                    : plantaFiltroObj ? `${plantaFiltroObj.interno} - ${plantaFiltroObj.marca}` : selectedPlanta;

                  await exportProduccionPDF({
                    groupedRecords: groupedAndSortedRecords,
                    plantas,
                    operadores,
                    obras,
                    motivos,
                    capas,
                    fechaDesde,
                    fechaHasta,
                    plantaFiltroNombre,
                    emitterName: pdfEmitterName.trim(),
                  });

                  setIsPdfModalOpen(false);
                } catch (err) {
                  console.error('Error al generar PDF:', err);
                  alert('Ocurrió un error al generar el archivo PDF.');
                } finally {
                  setIsGeneratingPDF(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Nombre de quien emite el informe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ing. Carlos Rodríguez"
                  value={pdfEmitterName}
                  onChange={(e) => setPdfEmitterName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2 border-2 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingPDF}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Generar e Imprimir PDF</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
