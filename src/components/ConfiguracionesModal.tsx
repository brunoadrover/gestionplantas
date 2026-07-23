import React, { useState } from 'react';
import {
  UserLog,
  TipoPlanta,
  Componente,
  MotivoParada,
  Capa,
  TipoMant,
  Planta,
} from '../types';
import {
  Settings,
  X,
  Users,
  Tag,
  Wrench,
  Flame,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  UserCheck,
  Database,
  Loader2,
} from 'lucide-react';

interface ConfiguracionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'PLANTAS' | 'PRODUCCION' | 'MANTENIMIENTO' | 'STOCK';
  // Entities
  users: UserLog[];
  tiposPlanta: TipoPlanta[];
  componentes: Componente[];
  motivos: MotivoParada[];
  capas: Capa[];
  tipomantList: TipoMant[];
  plantas: Planta[];
  // Save/Delete Handlers
  onSaveUser: (u: UserLog) => Promise<void> | void;
  onDeleteUser: (id: string) => Promise<void> | void;
  onSaveTipo: (t: TipoPlanta) => Promise<void> | void;
  onDeleteTipo: (id: string) => Promise<void> | void;
  onSaveComponente: (c: Componente) => Promise<void> | void;
  onDeleteComponente: (id: string) => Promise<void> | void;
  onSaveMotivo: (m: MotivoParada) => Promise<void> | void;
  onDeleteMotivo: (id: string) => Promise<void> | void;
  onSaveCapa: (cp: Capa) => Promise<void> | void;
  onDeleteCapa: (id: string) => Promise<void> | void;
  onSaveTipomant: (tm: TipoMant) => Promise<void> | void;
  onDeleteTipomant: (id: string) => Promise<void> | void;
}

export const ConfiguracionesModal: React.FC<ConfiguracionesModalProps> = ({
  isOpen,
  onClose,
  activeView,
  users,
  tiposPlanta,
  componentes,
  motivos,
  capas,
  tipomantList,
  plantas,
  onSaveUser,
  onDeleteUser,
  onSaveTipo,
  onDeleteTipo,
  onSaveComponente,
  onDeleteComponente,
  onSaveMotivo,
  onDeleteMotivo,
  onSaveCapa,
  onDeleteCapa,
  onSaveTipomant,
  onDeleteTipomant,
}) => {
  if (!isOpen) return null;

  // Tab state inside configuration modal based on view context
  const getInitialTab = () => {
    if (activeView === 'PRODUCCION') return 'motivos';
    if (activeView === 'MANTENIMIENTO') return 'tipomant';
    return 'users';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Input states for creating/editing items
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingComp, setIsSavingComp] = useState(false);

  // User form
  const [userForm, setUserForm] = useState<Partial<UserLog>>({ usuario: '', pass: '', rol: 'USER', id_planta: '' });
  // Simple text input for single field entities
  const [textInput, setTextInput] = useState<string>('');
  const [textInput2, setTextInput2] = useState<string>('');

  const resetForm = () => {
    setEditingId(null);
    setUserForm({ usuario: '', pass: '', rol: 'USER', id_planta: '' });
    setTextInput('');
    setTextInput2('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-black text-base uppercase">
            <Settings className="w-5 h-5" />
            <span>Configuración del Sistema — GEyT</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection depending on current view */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {(activeView === 'PLANTAS' || activeView === 'STOCK') && (
            <>
              <button
                onClick={() => { setActiveTab('users'); resetForm(); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'users' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Usuarios</span>
              </button>

              <button
                onClick={() => { setActiveTab('tipos'); resetForm(); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tipos' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Tipos de Planta</span>
              </button>

              <button
                onClick={() => { setActiveTab('componentes'); resetForm(); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'componentes' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Componentes</span>
              </button>
            </>
          )}

          {activeView === 'PRODUCCION' && (
            <>
              <button
                onClick={() => { setActiveTab('motivos'); resetForm(); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'motivos' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Motivos de Parada</span>
              </button>

              <button
                onClick={() => { setActiveTab('capas'); resetForm(); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'capas' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Capas de Producción</span>
              </button>
            </>
          )}

          {activeView === 'MANTENIMIENTO' && (
            <button
              onClick={() => { setActiveTab('tipomant'); resetForm(); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tipomant' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Tipos de Mantenimiento</span>
            </button>
          )}
        </div>

        {/* TAB CONTENTS */}

        {/* 1. USERS (log) */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase">
                {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Usuario *"
                  value={userForm.usuario || ''}
                  onChange={(e) => setUserForm({ ...userForm, usuario: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="password"
                  placeholder="Contraseña *"
                  value={userForm.pass || ''}
                  onChange={(e) => setUserForm({ ...userForm, pass: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <select
                  value={userForm.rol || 'USER'}
                  onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ADMIN">ADMIN (Administrador)</option>
                  <option value="USER">USER (Operador Planta)</option>
                </select>
                <select
                  value={userForm.id_planta || ''}
                  onChange={(e) => setUserForm({ ...userForm, id_planta: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Planta Asignada (Si USER)...</option>
                  {plantas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.interno} - {p.marca}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                {editingId && (
                  <button onClick={resetForm} disabled={isSavingUser} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg">
                    Cancelar
                  </button>
                )}
                <button
                  disabled={isSavingUser}
                  onClick={async () => {
                    if (!userForm.usuario || !userForm.pass) return alert('Complete usuario y contraseña');
                    setIsSavingUser(true);
                    try {
                      await onSaveUser({
                        id: editingId || `u-${Date.now()}`,
                        usuario: userForm.usuario!.trim(),
                        pass: userForm.pass!.trim(),
                        rol: (userForm.rol || 'USER').toUpperCase(),
                        id_planta: userForm.id_planta,
                      });
                      resetForm();
                    } catch (err) {
                      console.error('Error al guardar usuario en BD log:', err);
                    } finally {
                      setIsSavingUser(false);
                    }
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isSavingUser ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando en BD log...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingId ? 'Actualizar Usuario' : 'Guardar Usuario'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {users.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic">
                  No hay usuarios en la tabla "log". Complete el formulario arriba para agregar uno.
                </div>
              ) : (
                users.map((u) => {
                  const pObj = plantas.find((p) => p.id === u.id_planta);
                  return (
                    <div key={u.id} className="p-3 flex items-center justify-between hover:bg-slate-900 transition-colors">
                      <div>
                        <span className="font-bold text-white mr-2">{u.usuario}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono text-[10px] mr-2">
                          {u.rol}
                        </span>
                        {pObj && <span className="text-slate-400 text-[11px]">Planta: {pObj.interno}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(u.id);
                            setUserForm({ ...u });
                          }}
                          className="p-1.5 hover:text-amber-400 text-slate-400 cursor-pointer"
                          title="Editar Usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`¿Eliminar al usuario "${u.usuario}" de la tabla log de la BD?`)) {
                              await onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 hover:text-red-400 text-slate-400 cursor-pointer"
                          title="Eliminar Usuario"
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

        {/* 2. TIPOS DE PLANTA (tipo) */}
        {activeTab === 'tipos' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del tipo de planta (ej: Planta de Asfalto)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (!textInput.trim()) return;
                  onSaveTipo({ id: editingId || `t-${Date.now()}`, tipo_planta: textInput });
                  resetForm();
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Actualizar' : 'Agregar Tipo'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {tiposPlanta.map((t) => (
                <div key={t.id} className="p-3 flex items-center justify-between hover:bg-slate-900">
                  <span className="font-semibold text-white">{t.tipo_planta}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(t.id); setTextInput(t.tipo_planta); }} className="p-1 hover:text-amber-400 text-slate-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteTipo(t.id)} className="p-1 hover:text-red-400 text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. COMPONENTES */}
        {activeTab === 'componentes' && (
          <div className="space-y-4">
            <div className="flex gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <input
                type="text"
                placeholder="Nombre del componente de planta (ej: Filtro de Mangas) *"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              {editingId && (
                <button
                  type="button"
                  disabled={isSavingComp}
                  onClick={resetForm}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                disabled={isSavingComp}
                onClick={async () => {
                  if (!textInput.trim()) return alert('Ingrese el nombre del componente');
                  setIsSavingComp(true);
                  try {
                    await onSaveComponente({ id: editingId || `c-${Date.now()}`, nmb_componente: textInput.trim() });
                    resetForm();
                  } catch (err) {
                    console.error('Error al guardar componente:', err);
                  } finally {
                    setIsSavingComp(false);
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
              >
                {isSavingComp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en BD...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{editingId ? 'Actualizar' : 'Agregar Componente'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {componentes.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic">
                  No hay componentes registrados en la tabla "componentes". Complete el campo arriba para agregar uno.
                </div>
              ) : (
                componentes.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <span className="font-semibold text-white">{c.nmb_componente}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setTextInput(c.nmb_componente);
                        }}
                        className="p-1.5 hover:text-amber-400 text-slate-400 cursor-pointer"
                        title="Editar Componente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`¿Eliminar el componente "${c.nmb_componente}" de la base de datos?`)) {
                            await onDeleteComponente(c.id);
                          }
                        }}
                        className="p-1.5 hover:text-red-400 text-slate-400 cursor-pointer"
                        title="Eliminar Componente de BD"
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

        {/* 4. MOTIVOS DE PARADA (motivo_parada) */}
        {activeTab === 'motivos' && (
          <div className="space-y-4">
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <input
                type="text"
                placeholder="Nombre del motivo de parada (ej: Mantenimiento Mecánico)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Comentarios / Descripción adicional"
                value={textInput2}
                onChange={(e) => setTextInput2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
              <div className="flex justify-end gap-2">
                {editingId && <button onClick={resetForm} className="px-3 py-1 bg-slate-800 text-xs rounded text-slate-300">Cancelar</button>}
                <button
                  onClick={() => {
                    if (!textInput.trim()) return;
                    onSaveMotivo({ id: editingId || `m-${Date.now()}`, motivo: textInput, comentario: textInput2 });
                    resetForm();
                  }}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingId ? 'Actualizar' : 'Agregar Motivo'}</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {motivos.map((m) => (
                <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-900">
                  <div>
                    <span className="font-semibold text-white">{m.motivo}</span>
                    {m.comentario && <p className="text-[11px] text-slate-400">{m.comentario}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(m.id); setTextInput(m.motivo); setTextInput2(m.comentario || ''); }} className="p-1 hover:text-amber-400 text-slate-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteMotivo(m.id)} className="p-1 hover:text-red-400 text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CAPAS DE PRODUCCION */}
        {activeTab === 'capas' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre de la capa de producción (ej: CAC-D19, Binder)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (!textInput.trim()) return;
                  onSaveCapa({ id: editingId || `cp-${Date.now()}`, capa: textInput });
                  resetForm();
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Actualizar' : 'Agregar Capa'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {capas.map((cp) => (
                <div key={cp.id} className="p-3 flex items-center justify-between hover:bg-slate-900">
                  <span className="font-semibold text-white">{cp.capa}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(cp.id); setTextInput(cp.capa); }} className="p-1 hover:text-amber-400 text-slate-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteCapa(cp.id)} className="p-1 hover:text-red-400 text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TIPOMANT */}
        {activeTab === 'tipomant' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre tipo de mantenimiento (ej: Preventivo, Correctivo)"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (!textInput.trim()) return;
                  onSaveTipomant({ id: editingId || `tm-${Date.now()}`, tipo: textInput });
                  resetForm();
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Actualizar' : 'Agregar Tipo'}</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
              {tipomantList.map((tm) => (
                <div key={tm.id} className="p-3 flex items-center justify-between hover:bg-slate-900">
                  <span className="font-semibold text-white">{tm.tipo}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingId(tm.id); setTextInput(tm.tipo); }} className="p-1 hover:text-amber-400 text-slate-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteTipomant(tm.id)} className="p-1 hover:text-red-400 text-slate-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
