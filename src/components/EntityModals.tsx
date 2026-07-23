import React, { useState } from 'react';
import {
  Planta,
  Tanque,
  Silo,
  Operador,
  Obra,
  TipoPlanta,
  Disposicion,
  Producto,
} from '../types';
import {
  X,
  Check,
  Factory,
  Cylinder,
  Container,
  Users,
  HardHat,
  Plus,
  Trash2,
  Edit2,
  Database,
  Loader2,
} from 'lucide-react';

interface EntityModalsProps {
  entityName: 'plantas' | 'tanques' | 'silos' | 'operador' | 'obras' | null;
  onClose: () => void;
  // Datasets
  plantas: Planta[];
  tiposPlanta: TipoPlanta[];
  obras: Obra[];
  disposiciones: Disposicion[];
  productos: Producto[];
  tanques: Tanque[];
  silos: Silo[];
  operadores: Operador[];
  // Save/Delete handlers
  onSavePlanta: (p: Planta) => void;
  onDeletePlanta: (id: string) => void;
  onSaveTanque: (t: Tanque) => void;
  onDeleteTanque: (id: string) => void;
  onSaveSilo: (s: Silo) => void;
  onDeleteSilo: (id: string) => void;
  onSaveOperador: (op: Operador) => void;
  onDeleteOperador: (id: string) => void;
  onSaveObra: (ob: Obra) => void;
  onDeleteObra: (id: string) => void;
}

export const EntityModals: React.FC<EntityModalsProps> = ({
  entityName,
  onClose,
  plantas,
  tiposPlanta,
  obras,
  disposiciones,
  productos,
  tanques,
  silos,
  operadores,
  onSavePlanta,
  onDeletePlanta,
  onSaveTanque,
  onDeleteTanque,
  onSaveSilo,
  onDeleteSilo,
  onSaveOperador,
  onDeleteOperador,
  onSaveObra,
  onDeleteObra,
}) => {
  if (!entityName) return null;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [plantaForm, setPlantaForm] = useState<Partial<Planta>>({});
  const [tanqueForm, setTanqueForm] = useState<Partial<Tanque>>({});
  const [siloForm, setSiloForm] = useState<Partial<Silo>>({});
  const [operadorForm, setOperadorForm] = useState<Partial<Operador>>({});
  const [obraForm, setObraForm] = useState<Partial<Obra>>({});

  const resetAll = () => {
    setEditingId(null);
    setPlantaForm({});
    setTanqueForm({});
    setSiloForm({});
    setOperadorForm({});
    setObraForm({});
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base uppercase">
            {entityName === 'plantas' && <Factory className="w-5 h-5" />}
            {entityName === 'tanques' && <Cylinder className="w-5 h-5 text-sky-400" />}
            {entityName === 'silos' && <Container className="w-5 h-5 text-emerald-400" />}
            {entityName === 'operador' && <Users className="w-5 h-5 text-indigo-400" />}
            {entityName === 'obras' && <HardHat className="w-5 h-5 text-orange-400" />}
            <span>Gestión de {entityName.toUpperCase()}</span>
          </div>
          <button
            onClick={() => {
              resetAll();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. PLANTAS FORM & LIST */}
        {entityName === 'plantas' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase">
                {editingId ? 'Editar Planta' : 'Agregar Nueva Planta'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Interno / Código *</label>
                  <input
                    type="text"
                    placeholder="Ej: E0879"
                    value={plantaForm.interno || ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, interno: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Marca *</label>
                  <input
                    type="text"
                    placeholder="Ej: Ciber"
                    value={plantaForm.marca || ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, marca: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej: UADM-150"
                    value={plantaForm.modelo || ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, modelo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                {/* Requirement: id_tipo is a dropdown fed by tipo_planta of table tipo */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tipo de Planta *</label>
                  <select
                    value={plantaForm.id_tipo || ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, id_tipo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">Seleccionar Tipo...</option>
                    {tiposPlanta.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tipo_planta}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requirement: id_obras fed by table obras */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Obra Asignada</label>
                  <select
                    value={plantaForm.id_obras || ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, id_obras: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">Seleccionar Obra...</option>
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>
                        N° {o.numero} — {o.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Capacidad (Tn/h)</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={plantaForm.capacidad ?? ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, capacidad: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Año de Fabricación</label>
                  <input
                    type="number"
                    placeholder="2021"
                    value={plantaForm.año ?? ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, año: parseInt(e.target.value) || 2020 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Horas de Marcha</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={plantaForm.horas ?? ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, horas: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tn Acumuladas</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={plantaForm.tn_acumuladas ?? ''}
                    onChange={(e) => setPlantaForm({ ...plantaForm, tn_acumuladas: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingId && (
                  <button onClick={resetAll} className="px-3 py-1.5 bg-slate-800 text-xs rounded text-slate-300">
                    Cancelar
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!plantaForm.interno || !plantaForm.marca) return alert('Ingrese interno y marca');
                    onSavePlanta({
                      id: editingId || `p-${Date.now()}`,
                      interno: plantaForm.interno!,
                      marca: plantaForm.marca!,
                      modelo: plantaForm.modelo || '',
                      id_tipo: plantaForm.id_tipo || tiposPlanta[0]?.id || '',
                      id_obras: plantaForm.id_obras,
                      capacidad: plantaForm.capacidad || 100,
                      año: plantaForm.año || 2021,
                      horas: plantaForm.horas || 0,
                      tn_acumuladas: plantaForm.tn_acumuladas || 0,
                      descripcion: plantaForm.descripcion,
                      estado: plantaForm.estado || 'OPERATIVA',
                    });
                    resetAll();
                  }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Actualizar Planta' : 'Guardar Planta'}</span>
                </button>
              </div>
            </div>

            {/* Existing Plants List */}
            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {plantas.map((p) => {
                const tipoObj = tiposPlanta.find((t) => t.id === p.id_tipo);
                const obraObj = obras.find((o) => o.id === p.id_obras);

                return (
                  <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-900">
                    <div>
                      <span className="font-bold text-amber-400 mr-2">{p.interno}</span>
                      <strong className="text-white mr-2">{p.marca} {p.modelo}</strong>
                      <span className="text-slate-400 text-[11px] mr-2">
                        • {tipoObj ? tipoObj.tipo_planta : 'Sin Tipo'}
                      </span>
                      {obraObj && <span className="text-orange-400 text-[11px]">• Obra: {obraObj.numero}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(p.id); setPlantaForm({ ...p }); }} className="p-1.5 hover:text-amber-400 text-slate-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeletePlanta(p.id)} className="p-1.5 hover:text-red-400 text-slate-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. TANQUES FORM & LIST */}
        {entityName === 'tanques' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase">
                {editingId ? 'Editar Tanque' : 'Agregar Nuevo Tanque'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Denominación *</label>
                  <input
                    type="text"
                    placeholder="Ej: Tanque Asfalto #1"
                    value={tanqueForm.denominacion || ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, denominacion: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Planta Perteneciente *</label>
                  <select
                    value={tanqueForm.id_plantas || ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, id_plantas: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar Planta...</option>
                    {plantas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.interno} — {p.marca}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej: Astec / Indumix"
                    value={tanqueForm.marca || ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, marca: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Disposición</label>
                  <select
                    value={tanqueForm.id_disposicion || ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, id_disposicion: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar Disposición...</option>
                    {disposiciones.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.disposicion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Producto Contenido</label>
                  <select
                    value={tanqueForm.id_producto || ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, id_producto: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Seleccionar Producto...</option>
                    {productos.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.producto}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Capacidad (Lts / Tn)</label>
                  <input
                    type="number"
                    placeholder="60000"
                    value={tanqueForm.capacidad ?? ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, capacidad: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    placeholder="40000"
                    value={tanqueForm.stock ?? ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, stock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Diámetro (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 2.5"
                    value={tanqueForm.diametro ?? ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, diametro: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Longitud (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 8.0"
                    value={tanqueForm.longitud ?? ''}
                    onChange={(e) => setTanqueForm({ ...tanqueForm, longitud: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Toggles section */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-2">
                  Equipamiento y Características
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Caldera toggle */}
                  <button
                    type="button"
                    onClick={() => setTanqueForm({ ...tanqueForm, caldera: !tanqueForm.caldera })}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      tanqueForm.caldera
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span>Caldera</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tanqueForm.caldera ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tanqueForm.caldera ? 'SÍ' : 'NO'}
                    </span>
                  </button>

                  {/* Calefaccionado toggle */}
                  <button
                    type="button"
                    onClick={() => setTanqueForm({ ...tanqueForm, calefaccionado: !tanqueForm.calefaccionado })}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      tanqueForm.calefaccionado
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span>Calefaccionado</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tanqueForm.calefaccionado ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tanqueForm.calefaccionado ? 'SÍ' : 'NO'}
                    </span>
                  </button>

                  {/* Agitadores toggle */}
                  <button
                    type="button"
                    onClick={() => setTanqueForm({ ...tanqueForm, agitadores: !tanqueForm.agitadores })}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      tanqueForm.agitadores
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span>Agitadores</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tanqueForm.agitadores ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tanqueForm.agitadores ? 'SÍ' : 'NO'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                {editingId && (
                  <button onClick={resetAll} className="px-3 py-1.5 bg-slate-800 text-xs rounded-xl text-slate-300 cursor-pointer">
                    Cancelar
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!tanqueForm.denominacion || !tanqueForm.id_plantas) return alert('Complete denominación y planta');
                    onSaveTanque({
                      id: editingId || `tq-${Date.now()}`,
                      denominacion: tanqueForm.denominacion!,
                      id_plantas: tanqueForm.id_plantas!,
                      marca: tanqueForm.marca || undefined,
                      id_disposicion: tanqueForm.id_disposicion,
                      id_producto: tanqueForm.id_producto,
                      capacidad: tanqueForm.capacidad || 0,
                      stock: tanqueForm.stock || 0,
                      diametro: tanqueForm.diametro ?? undefined,
                      longitud: tanqueForm.longitud ?? undefined,
                      caldera: Boolean(tanqueForm.caldera),
                      calefaccionado: Boolean(tanqueForm.calefaccionado),
                      agitadores: Boolean(tanqueForm.agitadores),
                    });
                    resetAll();
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Actualizar Tanque' : 'Guardar Tanque'}</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {tanques.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic">No hay tanques registrados.</div>
              ) : (
                tanques.map((t) => {
                  const pObj = plantas.find((p) => p.id === t.id_plantas);
                  const prObj = productos.find((pr) => pr.id === t.id_producto);
                  return (
                    <div key={t.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sky-400 text-sm">{t.denominacion}</span>
                          {t.marca && <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-semibold">Marca: {t.marca}</span>}
                          <span className="text-slate-300 text-xs">• Planta: {pObj ? pObj.interno : '-'}</span>
                          <span className="text-slate-400 text-xs">• Producto: {prObj ? prObj.producto : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                          {t.capacidad > 0 && <span>Capacidad: {t.capacidad.toLocaleString()} Lts/Tn</span>}
                          {t.stock > 0 && <span>• Stock: {t.stock.toLocaleString()} Lts/Tn</span>}
                          {t.diametro !== undefined && t.diametro !== null && <span>• Diámetro: {t.diametro}m</span>}
                          {t.longitud !== undefined && t.longitud !== null && <span>• Longitud: {t.longitud}m</span>}
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {t.caldera && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">Caldera</span>}
                          {t.calefaccionado && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">Calefaccionado</span>}
                          {t.agitadores && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">Agitadores</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(t.id);
                            setTanqueForm({ ...t });
                          }}
                          className="p-1.5 hover:text-amber-400 text-slate-400 cursor-pointer"
                          title="Editar Tanque"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTanque(t.id)}
                          className="p-1.5 hover:text-red-400 text-slate-400 cursor-pointer"
                          title="Eliminar Tanque"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. SILOS FORM & LIST */}
        {entityName === 'silos' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase">
                {editingId ? 'Editar Silo' : 'Agregar Nuevo Silo'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Denominación *</label>
                  <input
                    type="text"
                    placeholder="Ej: Silo Cal 01"
                    value={siloForm.denominacion || ''}
                    onChange={(e) => setSiloForm({ ...siloForm, denominacion: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Planta Perteneciente *</label>
                  <select
                    value={siloForm.id_plantas || ''}
                    onChange={(e) => setSiloForm({ ...siloForm, id_plantas: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">Seleccionar Planta...</option>
                    {plantas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.interno} — {p.marca}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Producto Almacenado</label>
                  <select
                    value={siloForm.id_producto || ''}
                    onChange={(e) => setSiloForm({ ...siloForm, id_producto: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">Seleccionar Producto...</option>
                    {productos.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.producto}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Capacidad (Tn)</label>
                  <input
                    type="number"
                    placeholder="40"
                    value={siloForm.capacidad ?? ''}
                    onChange={(e) => setSiloForm({ ...siloForm, capacidad: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingId && <button onClick={resetAll} className="px-3 py-1.5 bg-slate-800 text-xs rounded text-slate-300">Cancelar</button>}
                <button
                  onClick={() => {
                    if (!siloForm.denominacion || !siloForm.id_plantas) return alert('Complete denominación y planta');
                    onSaveSilo({
                      id: editingId || `sl-${Date.now()}`,
                      denominacion: siloForm.denominacion!,
                      id_plantas: siloForm.id_plantas!,
                      id_producto: siloForm.id_producto,
                      capacidad: siloForm.capacidad || 100,
                      stock: siloForm.stock || 0,
                    });
                    resetAll();
                  }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Actualizar Silo' : 'Guardar Silo'}</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {silos.map((s) => {
                const pObj = plantas.find((p) => p.id === s.id_plantas);
                return (
                  <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-900">
                    <div>
                      <span className="font-bold text-emerald-400 mr-2">{s.denominacion}</span>
                      <span className="text-slate-300 mr-2">• Planta: {pObj ? pObj.interno : '-'}</span>
                      <span className="text-slate-400 text-[11px]">• Capacidad: {s.capacidad} Tn</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(s.id); setSiloForm({ ...s }); }} className="p-1.5 hover:text-amber-400 text-slate-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteSilo(s.id)} className="p-1.5 hover:text-red-400 text-slate-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. OPERADORES FORM & LIST */}
        {entityName === 'operador' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase">
                {editingId ? 'Editar Operador' : 'Agregar Nuevo Operador'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre *"
                  value={operadorForm.nombre || ''}
                  onChange={(e) => setOperadorForm({ ...operadorForm, nombre: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Apellido *"
                  value={operadorForm.apellido || ''}
                  onChange={(e) => setOperadorForm({ ...operadorForm, apellido: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Rol (ej: Plantista)"
                  value={operadorForm.rol || ''}
                  onChange={(e) => setOperadorForm({ ...operadorForm, rol: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingId && <button onClick={resetAll} className="px-3 py-1.5 bg-slate-800 text-xs rounded text-slate-300">Cancelar</button>}
                <button
                  onClick={() => {
                    if (!operadorForm.nombre || !operadorForm.apellido) return alert('Ingrese nombre y apellido');
                    onSaveOperador({
                      id: editingId || `op-${Date.now()}`,
                      nombre: operadorForm.nombre!,
                      apellido: operadorForm.apellido!,
                      rol: operadorForm.rol || 'Operador',
                    });
                    resetAll();
                  }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Actualizar Operador' : 'Guardar Operador'}</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {operadores.map((op) => (
                <div key={op.id} className="p-3 flex items-center justify-between hover:bg-slate-900">
                  <div>
                    <span className="font-bold text-white mr-2">{op.nombre} {op.apellido}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 text-[10px]">{op.rol}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(op.id); setOperadorForm({ ...op }); }} className="p-1.5 hover:text-amber-400 text-slate-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteOperador(op.id)} className="p-1.5 hover:text-red-400 text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. OBRAS FORM & LIST */}
        {entityName === 'obras' && (
          <div className="space-y-6">
            {/* Obras Banner */}
            <div className="flex items-center justify-between bg-orange-950/40 border border-orange-500/30 p-3 rounded-xl text-xs text-orange-200">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="font-bold uppercase tracking-wide">
                  Gestión de Obras
                </span>
              </div>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                {obras.length} obra(s)
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase">
                {editingId ? 'Editar Obra' : 'Agregar Nueva Obra'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Número de Obra (ej: 1045) *"
                  value={obraForm.numero ?? ''}
                  onChange={(e) => setObraForm({ ...obraForm, numero: parseInt(e.target.value) || 0 })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Descripción de la obra *"
                  value={obraForm.descripcion || ''}
                  onChange={(e) => setObraForm({ ...obraForm, descripcion: e.target.value })}
                  className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingId && (
                  <button onClick={resetAll} disabled={isSaving} className="px-3 py-1.5 bg-slate-800 text-xs rounded text-slate-300">
                    Cancelar
                  </button>
                )}
                <button
                  disabled={isSaving}
                  onClick={async () => {
                    if (!obraForm.numero || !obraForm.descripcion) return alert('Ingrese número y descripción de obra');
                    setIsSaving(true);
                    try {
                      await onSaveObra({
                        id: editingId || `ob-${Date.now()}`,
                        numero: obraForm.numero!,
                        descripcion: obraForm.descripcion!,
                      });
                      resetAll();
                    } catch (err) {
                      console.error('Error al guardar obra:', err);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando en BD...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingId ? 'Actualizar Obra' : 'Guardar Obra'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {obras.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic">
                  No hay obras registradas en la tabla "obras". Ingrese los datos arriba para crear la primera.
                </div>
              ) : (
                obras.map((ob) => (
                  <div key={ob.id} className="p-3 flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <div>
                      <span className="font-bold text-orange-400 mr-2">Obra N° {ob.numero}</span>
                      <span className="text-slate-200">{ob.descripcion}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(ob.id);
                          setObraForm({ ...ob });
                        }}
                        className="p-1.5 hover:text-amber-400 text-slate-400 cursor-pointer"
                        title="Editar Obra"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`¿Eliminar la obra N° ${ob.numero} de la base de datos?`)) {
                            await onDeleteObra(ob.id);
                          }
                        }}
                        className="p-1.5 hover:text-red-400 text-slate-400 cursor-pointer"
                        title="Eliminar Obra de BD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
