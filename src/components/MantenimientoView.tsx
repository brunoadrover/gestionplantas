import React, { useState, useMemo } from 'react';
import {
  Mantenimiento,
  Planta,
  Componente,
  TipoMant,
  Estado,
  RepuestoPedido,
  EstadoRepuestos,
} from '../types';
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Edit2,
  Trash2,
  X,
  Check,
  ExternalLink,
  DollarSign,
  Truck,
  Download,
  Loader2,
} from 'lucide-react';
import { exportMantenimientoPDF } from '../lib/pdfExport';

interface MantenimientoViewProps {
  mantenimientoList: Mantenimiento[];
  plantas: Planta[];
  componentes: Componente[];
  tipomantList: TipoMant[];
  estados: Estado[];
  repuestosList: RepuestoPedido[];
  estadosRepuestos: EstadoRepuestos[];
  onSaveMantenimiento: (record: Mantenimiento) => void;
  onDeleteMantenimiento: (id: string) => void;
  onSaveRepuesto: (repuesto: RepuestoPedido) => void;
  userPlantaId?: string;
}

export const MantenimientoView: React.FC<MantenimientoViewProps> = ({
  mantenimientoList,
  plantas,
  componentes,
  tipomantList,
  estados,
  repuestosList,
  estadosRepuestos,
  onSaveMantenimiento,
  onDeleteMantenimiento,
  onSaveRepuesto,
  userPlantaId,
}) => {
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [selectedPlanta, setSelectedPlanta] = useState<string>(userPlantaId || 'TODAS');

  // Maintenance Modal Form State
  const [isMantModalOpen, setIsMantModalOpen] = useState<boolean>(false);
  const [editingMant, setEditingMant] = useState<Mantenimiento | null>(null);
  const [mantFormData, setMantFormData] = useState<Partial<Mantenimiento>>({
    id_plantas: userPlantaId || (plantas[0]?.id || ''),
    fecha: new Date().toISOString().split('T')[0],
    fecha_inicio: new Date().toISOString().split('T')[0],
    comentarios: '',
  });

  // Repuesto Pedido Linked Modal State
  const [isRepuestoModalOpen, setIsRepuestoModalOpen] = useState<boolean>(false);
  const [activeMantForRepuesto, setActiveMantForRepuesto] = useState<Mantenimiento | null>(null);
  const [repuestoFormData, setRepuestoFormData] = useState<Partial<RepuestoPedido>>({
    descripcion: '',
    cantidad: 1,
    costo: 0,
    proveedor: '',
    fecha_pedido: new Date().toISOString().split('T')[0],
  });

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfEmitterName, setPdfEmitterName] = useState<string>('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Strict sorting order as required by Requirement 3b:
  // 1. Order by status (id_estado): PENDIENTES first, then EN PROCESO, then FINALIZADOS
  // 2. Order by fecha_inicio
  // 3. Order by id_tipoMant
  const sortedAndFilteredRecords = useMemo(() => {
    let result = [...mantenimientoList];

    // Plant Filter
    if (userPlantaId) {
      result = result.filter((m) => m.id_plantas === userPlantaId);
    } else if (selectedPlanta && selectedPlanta !== 'TODAS') {
      result = result.filter((m) => m.id_plantas === selectedPlanta);
    }

    // Date Range Filters
    if (fechaDesde) {
      result = result.filter((m) => (m.fecha_inicio || m.fecha) >= fechaDesde);
    }
    if (fechaHasta) {
      result = result.filter((m) => (m.fecha_inicio || m.fecha) <= fechaHasta);
    }

    // Search term across fields
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((m) => {
        const plantaObj = plantas.find((p) => p.id === m.id_plantas);
        const compObj = componentes.find((c) => c.id === m.id_componente);
        const tipoObj = tipomantList.find((t) => t.id === m.id_tipomant);
        const estadoObj = estados.find((e) => e.id === m.id_estado);

        const textToSearch = [
          plantaObj?.interno,
          plantaObj?.marca,
          plantaObj?.modelo,
          compObj?.nmb_componente,
          tipoObj?.tipo,
          estadoObj?.estado,
          m.comentarios,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return textToSearch.includes(q);
      });
    }

    // Custom helper to rank status: PENDIENTE = 1, EN PROCESO = 2, FINALIZADO = 3
    const getStatusWeight = (estadoId?: string) => {
      const estadoObj = estados.find((e) => e.id === estadoId);
      const txt = (estadoObj?.estado || '').toUpperCase();
      if (txt.includes('PENDIENTE')) return 1;
      if (txt.includes('PROCESO') || txt.includes('CURSO')) return 2;
      if (txt.includes('FINALIZADO') || txt.includes('COMPLETADO')) return 3;
      return 4;
    };

    return result.sort((a, b) => {
      // 1. By status
      const weightA = getStatusWeight(a.id_estado);
      const weightB = getStatusWeight(b.id_estado);
      if (weightA !== weightB) return weightA - weightB;

      // 2. By fecha_inicio (descending / recent first)
      const dateA = a.fecha_inicio || a.fecha || '';
      const dateB = b.fecha_inicio || b.fecha || '';
      if (dateA !== dateB) return dateB.localeCompare(dateA);

      // 3. By tipomant
      const tipoA = a.id_tipomant || '';
      const tipoB = b.id_tipomant || '';
      return tipoA.localeCompare(tipoB);
    });
  }, [mantenimientoList, selectedPlanta, fechaDesde, fechaHasta, searchTerm, plantas, componentes, tipomantList, estados]);

  // Group records by Planta for PDF export
  const groupedForPdf = useMemo(() => {
    const groups: { [plantaId: string]: Mantenimiento[] } = {};
    sortedAndFilteredRecords.forEach((item) => {
      const pId = item.id_plantas || 'sin-planta';
      if (!groups[pId]) groups[pId] = [];
      groups[pId].push(item);
    });
    return groups;
  }, [sortedAndFilteredRecords]);

  const handleOpenNewMant = () => {
    setEditingMant(null);
    setMantFormData({
      id_plantas: userPlantaId || (selectedPlanta !== 'TODAS' ? selectedPlanta : plantas[0]?.id || ''),
      id_componente: componentes[0]?.id || '',
      id_tipomant: tipomantList[0]?.id || '',
      id_estado: estados.find((e) => e.estado.toUpperCase().includes('PENDIENTE'))?.id || estados[0]?.id || '',
      fecha: new Date().toISOString().split('T')[0],
      fecha_inicio: new Date().toISOString().split('T')[0],
      comentarios: '',
    });
    setIsMantModalOpen(true);
  };

  const handleOpenEditMant = (m: Mantenimiento) => {
    setEditingMant(m);
    setMantFormData({ ...m });
    setIsMantModalOpen(true);
  };

  const handleSaveMantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mantFormData.id_plantas || !mantFormData.id_componente) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    const recordToSave: Mantenimiento = {
      id: editingMant ? editingMant.id : `mant-${Date.now()}`,
      id_plantas: mantFormData.id_plantas!,
      id_componente: mantFormData.id_componente,
      id_tipomant: mantFormData.id_tipomant,
      fecha: mantFormData.fecha || new Date().toISOString().split('T')[0],
      fecha_inicio: mantFormData.fecha_inicio,
      fecha_fin: mantFormData.fecha_fin,
      id_repuesto_pedido: mantFormData.id_repuesto_pedido,
      id_estado: mantFormData.id_estado,
      comentarios: mantFormData.comentarios,
    };

    onSaveMantenimiento(recordToSave);
    setIsMantModalOpen(false);
  };

  // Open Repuesto Pedido Modal linked to a specific Maintenance
  const handleOpenRepuestoModal = (mant: Mantenimiento, targetRepuesto?: RepuestoPedido | null) => {
    setActiveMantForRepuesto(mant);
    let existingRepuesto = targetRepuesto;
    if (existingRepuesto === undefined) {
      existingRepuesto = repuestosList.find((r) => r.id === mant.id_repuesto_pedido) || null;
    }

    if (existingRepuesto) {
      setRepuestoFormData({ ...existingRepuesto });
    } else {
      setRepuestoFormData({
        id: `rp-${Date.now()}`,
        id_planta: mant.id_plantas,
        id_componente: mant.id_componente,
        descripcion: '',
        cantidad: 1,
        costo: 0,
        proveedor: '',
        id_estadorepuestos: estadosRepuestos[0]?.id || '',
        fecha_pedido: new Date().toISOString().split('T')[0],
      });
    }
    setIsRepuestoModalOpen(true);
  };

  const handleSaveRepuestoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repuestoFormData.descripcion || !activeMantForRepuesto) return;

    const repuestoToSave: RepuestoPedido = {
      id: repuestoFormData.id || `rp-${Date.now()}`,
      descripcion: repuestoFormData.descripcion!,
      cantidad: Number(repuestoFormData.cantidad) || 1,
      costo: Number(repuestoFormData.costo) || 0,
      proveedor: repuestoFormData.proveedor,
      id_componente: repuestoFormData.id_componente || activeMantForRepuesto.id_componente,
      id_planta: repuestoFormData.id_planta || activeMantForRepuesto.id_plantas,
      id_estadorepuestos: repuestoFormData.id_estadorepuestos,
      fecha_pedido: repuestoFormData.fecha_pedido,
      fecha_necesidad: repuestoFormData.fecha_necesidad,
      fecha_entrega: repuestoFormData.fecha_entrega,
    };

    onSaveRepuesto(repuestoToSave);

    // Link repuesto id back to maintenance if not already linked
    if (activeMantForRepuesto.id_repuesto_pedido !== repuestoToSave.id) {
      onSaveMantenimiento({
        ...activeMantForRepuesto,
        id_repuesto_pedido: repuestoToSave.id,
      });
    }

    setIsRepuestoModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Prominent Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a] text-white p-6 border-2 border-slate-800 shadow-[4px_4px_0px_#cbd5e1]">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-extrabold text-[10px] uppercase tracking-[0.2em] italic">
            <Wrench className="w-4 h-4" />
            <span>Módulo de Control de Mantenimiento</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1 italic">GESTIÓN DE MANTENIMIENTOS E INTERVENCIONES</h2>
          <div className="h-0.5 w-16 bg-blue-500 my-2"></div>
        </div>

        {/* Action Buttons: New Maintenance & Export PDF */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a] border border-slate-700 active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Download className="w-4 h-4 text-blue-400 stroke-[2.5]" />
            <span>Exportar Informe PDF</span>
          </button>

          <button
            onClick={handleOpenNewMant}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Mantenimiento</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white p-5 border-2 border-slate-200 shadow-[4px_4px_0px_#e2e8f0] flex flex-wrap items-center justify-between gap-4">
        {/* Keyword Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por planta, componente, comentarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-200 font-bold text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Plant Filter */}
        {!userPlantaId && (
          <div className="min-w-[160px]">
            <select
              value={selectedPlanta}
              onChange={(e) => setSelectedPlanta(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 font-bold px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="TODAS">Todas las Plantas</option>
              {plantas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.interno} — {p.marca}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Filters */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="bg-slate-50 border-2 border-slate-200 font-bold px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <span>a</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="bg-slate-50 border-2 border-slate-200 font-bold px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        {(searchTerm || fechaDesde || fechaHasta || selectedPlanta !== 'TODAS') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFechaDesde('');
              setFechaHasta('');
              if (!userPlantaId) setSelectedPlanta('TODAS');
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 px-3 py-2 border border-blue-200"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Maintenance List */}
      <div className="bg-white border-2 border-slate-200 shadow-[4px_4px_0px_#e2e8f0] overflow-hidden">
        <div className="p-4 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-600" />
            Mantenimiento/Intervenciones
          </h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {sortedAndFilteredRecords.length} registros
          </span>
        </div>

        {sortedAndFilteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Wrench className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-base font-semibold text-slate-700">No se encontraron mantenimientos con los criterios ingresados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-[11px] uppercase tracking-wider text-white border-b-2 border-slate-900">
                  <th className="py-3 px-4 font-black">Estado</th>
                  <th className="py-3 px-4 font-black">Planta / Componente</th>
                  <th className="py-3 px-4 font-black">Tipo Mantenimiento</th>
                  <th className="py-3 px-4 font-black">Fechas (Inicio / Fin)</th>
                  <th className="py-3 px-4 font-black">Repuesto Pedido</th>
                  <th className="py-3 px-4 font-black">Comentarios</th>
                  <th className="py-3 px-4 text-center font-black">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs bg-white text-slate-900">
                {sortedAndFilteredRecords.map((item) => {
                  const plantaObj = plantas.find((p) => p.id === item.id_plantas);
                  const compObj = componentes.find((c) => c.id === item.id_componente);
                  const tipoMantObj = tipomantList.find((t) => t.id === item.id_tipomant);
                  const estadoObj = estados.find((e) => e.id === item.id_estado);

                  // Associated repuestos from repuesto_pedido table
                  const associatedRepuestos = repuestosList.filter((r) => {
                    if (r.id === item.id_repuesto_pedido) return true;
                    if (item.id_componente && r.id_componente === item.id_componente && r.id_planta === item.id_plantas) return true;
                    return false;
                  });

                  const estadoTxt = (estadoObj?.estado || '').toUpperCase();
                  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';

                  if (estadoTxt.includes('PENDIENTE')) {
                    badgeColor = 'bg-red-100 text-red-900 border-red-300 font-black';
                  } else if (estadoTxt.includes('PROCESO') || estadoTxt.includes('CURSO')) {
                    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300 font-black';
                  } else if (estadoTxt.includes('FINALIZADO') || estadoTxt.includes('COMPLETADO')) {
                    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                      {/* Estado Badge */}
                      <td className="py-3.5 px-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${badgeColor}`}>
                          {estadoTxt.includes('PENDIENTE') && <AlertCircle className="w-3.5 h-3.5" />}
                          {estadoTxt.includes('PROCESO') && <Clock className="w-3.5 h-3.5" />}
                          {estadoTxt.includes('FINALIZADO') && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {estadoObj?.estado || 'Sin estado'}
                        </span>
                      </td>

                      {/* Planta & Componente */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-extrabold text-slate-900 text-xs uppercase">
                          {plantaObj ? `${plantaObj.interno} (${plantaObj.marca})` : item.id_plantas}
                        </div>
                        <div className="text-[11px] font-bold text-blue-900 mt-0.5">
                          {compObj ? compObj.nmb_componente : 'Componente no def.'}
                        </div>
                      </td>

                      {/* Tipo Mantenimiento */}
                      <td className="py-3.5 px-4 align-top font-bold text-slate-900">
                        {tipoMantObj ? tipoMantObj.tipo : '-'}
                      </td>

                      {/* Fechas */}
                      <td className="py-3.5 px-4 align-top font-mono text-[11px]">
                        <div className="font-bold text-slate-900">
                          <span className="text-slate-500 font-semibold">Inicio:</span> {item.fecha_inicio || item.fecha}
                        </div>
                        {item.fecha_fin && (
                          <div className="text-emerald-800 font-bold mt-0.5">
                            <span className="text-slate-500 font-semibold">Fin:</span> {item.fecha_fin}
                          </div>
                        )}
                      </td>

                      {/* Repuestos Pedidos list */}
                      <td className="py-3.5 px-4 align-top min-w-[180px]">
                        {associatedRepuestos.length > 0 ? (
                          <div className="space-y-1.5">
                            {associatedRepuestos.map((rep) => {
                              const estRepObj = estadosRepuestos.find((e) => e.id === rep.id_estadorepuestos);
                              return (
                                <div
                                  key={rep.id}
                                  onClick={() => handleOpenRepuestoModal(item, rep)}
                                  className="bg-purple-50 border border-purple-200 rounded-lg p-2 hover:bg-purple-100 transition-colors cursor-pointer text-slate-900 shadow-sm"
                                  title="Haz clic para editar repuesto"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-slate-900 text-xs">{rep.descripcion}</span>
                                    <span className="text-[10px] font-extrabold bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded border border-purple-300 shrink-0">
                                      Cant: {rep.cantidad}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-700 font-medium">
                                    <span>{estRepObj?.estadorep || 'Solicitado'}</span>
                                    {rep.costo ? <span className="font-bold text-slate-900">${rep.costo.toLocaleString()}</span> : null}
                                  </div>
                                </div>
                              );
                            })}
                            <button
                              onClick={() => handleOpenRepuestoModal(item, null)}
                              className="text-[10px] font-bold text-purple-800 hover:text-purple-950 underline flex items-center gap-1 mt-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Solicitar Nuevo Repuesto</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenRepuestoModal(item, null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                          >
                            <Package className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                            <span>+ Solicitar Repuesto</span>
                          </button>
                        )}
                      </td>

                      {/* Comentarios */}
                      <td className="py-3.5 px-4 align-top max-w-[200px] text-slate-900 font-semibold leading-snug break-words">
                        {item.comentarios || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditMant(item)}
                            title="Editar Mantenimiento"
                            className="p-1.5 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar esta orden de mantenimiento?')) {
                                onDeleteMantenimiento(item.id);
                              }
                            }}
                            title="Eliminar Mantenimiento"
                            className="p-1.5 hover:bg-red-100 text-slate-700 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
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
        )}
      </div>

      {/* MODAL: Maintenance Form */}
      {isMantModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-8 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase">
                <Wrench className="w-5 h-5" />
                <span>{editingMant ? 'Editar Mantenimiento' : 'Nuevo Registro de Mantenimiento'}</span>
              </div>
              <button
                onClick={() => setIsMantModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMantSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Planta */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Planta *</label>
                  <select
                    value={mantFormData.id_plantas || ''}
                    onChange={(e) => setMantFormData({ ...mantFormData, id_plantas: e.target.value })}
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

                {/* Componente */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Componente *</label>
                  <select
                    value={mantFormData.id_componente || ''}
                    onChange={(e) => setMantFormData({ ...mantFormData, id_componente: e.target.value })}
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

                {/* Tipo Mantenimiento */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tipo de Mantenimiento</label>
                  <select
                    value={mantFormData.id_tipomant || ''}
                    onChange={(e) => setMantFormData({ ...mantFormData, id_tipomant: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {tipomantList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tipo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Estado de la Intervención</label>
                  <select
                    value={mantFormData.id_estado || ''}
                    onChange={(e) => setMantFormData({ ...mantFormData, id_estado: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.estado}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha Inicio */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={mantFormData.fecha_inicio || ''}
                    onChange={(e) => setMantFormData({ ...mantFormData, fecha_inicio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Fecha Fin */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Fecha Finalización</label>
                  <input
                    type="date"
                    value={mantFormData.fecha_fin || ''}
                    onChange={(e) => setMantFormData({ ...mantFormData, fecha_fin: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Comentarios */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Comentarios / Diagnóstico</label>
                <textarea
                  rows={3}
                  placeholder="Escriba los comentarios técnicos del mantenimiento..."
                  value={mantFormData.comentarios || ''}
                  onChange={(e) => setMantFormData({ ...mantFormData, comentarios: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMantModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMant ? 'Guardar Cambios' : 'Registrar Mantenimiento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Repuesto Pedido (Linked directly via id_repuesto_pedido) */}
      {isRepuestoModalOpen && activeMantForRepuesto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 my-8 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase">
                <Package className="w-5 h-5" />
                <span>
                  {repuestoFormData.id && repuestosList.some((r) => r.id === repuestoFormData.id)
                    ? 'Editar Repuesto Pedido'
                    : 'Solicitar Nuevo Repuesto'}
                </span>
              </div>
              <button
                onClick={() => setIsRepuestoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Asociado a Mantenimiento de{' '}
              <strong className="text-amber-400">
                {plantas.find((p) => p.id === activeMantForRepuesto.id_plantas)?.interno}
              </strong>{' '}
              ({componentes.find((c) => c.id === activeMantForRepuesto.id_componente)?.nmb_componente})
            </p>

            <form onSubmit={handleSaveRepuestoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Descripción Repuesto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Juego de mangueras, Rodamiento SKF..."
                  value={repuestoFormData.descripcion || ''}
                  onChange={(e) => setRepuestoFormData({ ...repuestoFormData, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Cantidad *</label>
                  <input
                    type="number"
                    min="1"
                    value={repuestoFormData.cantidad ?? 1}
                    onChange={(e) => setRepuestoFormData({ ...repuestoFormData, cantidad: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Costo Estimado ($)</label>
                  <input
                    type="number"
                    step="100"
                    value={repuestoFormData.costo ?? 0}
                    onChange={(e) => setRepuestoFormData({ ...repuestoFormData, costo: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Proveedor</label>
                  <input
                    type="text"
                    placeholder="Nombre del proveedor"
                    value={repuestoFormData.proveedor || ''}
                    onChange={(e) => setRepuestoFormData({ ...repuestoFormData, proveedor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Estado del Pedido</label>
                  <select
                    value={repuestoFormData.id_estadorepuestos || ''}
                    onChange={(e) => setRepuestoFormData({ ...repuestoFormData, id_estadorepuestos: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {estadosRepuestos.map((er) => (
                      <option key={er.id} value={er.id}>
                        {er.estadorep}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Fecha Pedido</label>
                  <input
                    type="date"
                    value={repuestoFormData.fecha_pedido || ''}
                    onChange={(e) => setRepuestoFormData({ ...repuestoFormData, fecha_pedido: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Fecha Necesidad</label>
                  <input
                    type="date"
                    value={repuestoFormData.fecha_necesidad || ''}
                    onChange={(e) => setRepuestoFormData({ ...repuestoFormData, fecha_necesidad: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Fecha Entrega</label>
                  <input
                    type="date"
                    value={repuestoFormData.fecha_entrega || ''}
                    onChange={(e) => setRepuestoFormData({ ...repuestoFormData, fecha_entrega: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRepuestoModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Repuesto Pedido</span>
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
                Exportar Informe de Mantenimiento
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

                  await exportMantenimientoPDF({
                    groupedRecords: groupedForPdf,
                    plantas,
                    componentes,
                    tipomantList,
                    estados,
                    repuestosList,
                    estadosRepuestos,
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
                  placeholder="Ej: Ing. Juan Pérez"
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
