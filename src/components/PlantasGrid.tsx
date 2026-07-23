import React, { useState } from 'react';
import { Planta, TipoPlanta, Obra, Silo, Tanque } from '../types';
import {
  Factory,
  HardHat,
  Clock,
  Flame,
  ChevronRight,
  Cylinder,
  Container,
  Activity,
  Wrench,
  Gauge,
  Tag,
} from 'lucide-react';

interface PlantasGridProps {
  plantas: Planta[];
  tiposPlanta: TipoPlanta[];
  obras: Obra[];
  silos: Silo[];
  tanques: Tanque[];
  onSelectPlantaForView: (plantaId: string, view: 'PRODUCCION' | 'MANTENIMIENTO' | 'STOCK_TANQUES') => void;
  userPlantaId?: string; // If user role, filter to only that plant
}

export const PlantasGrid: React.FC<PlantasGridProps> = ({
  plantas,
  tiposPlanta,
  obras,
  silos,
  tanques,
  onSelectPlantaForView,
  userPlantaId,
}) => {
  const [selectedPlantaDetail, setSelectedPlantaDetail] = useState<Planta | null>(null);

  const displayPlantas = userPlantaId
    ? plantas.filter((p) => p.id === userPlantaId)
    : plantas;

  // Group plants by plant type id_tipo
  const groupedByTipo = tiposPlanta.map((tipo) => ({
    tipo,
    plantas: displayPlantas.filter((p) => p.id_tipo === tipo.id),
  })).filter((group) => group.plantas.length > 0);

  // Ungrouped fallback if any plant has unknown id_tipo
  const unassignedPlantas = displayPlantas.filter(
    (p) => !tiposPlanta.some((t) => t.id === p.id_tipo)
  );

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0f172a] text-white p-6 border-2 border-slate-800 shadow-[4px_4px_0px_#cbd5e1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-extrabold text-[10px] uppercase tracking-[0.2em] italic">
            <Factory className="w-4 h-4" />
            <span>Gerencia de Equipos y Transporte</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1 italic">
            {userPlantaId ? 'Mi Planta Asignada' : 'GESTIÓN DE PLANTAS'}
          </h2>
          <div className="h-0.5 w-16 bg-blue-500 my-2"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-300">
            Total Plantas: <span className="text-blue-400 font-mono font-black text-sm ml-1">{displayPlantas.length}</span>
          </div>
        </div>
      </div>

      {/* Plant Cards grouped by Plant Type */}
      {groupedByTipo.map(({ tipo, plantas: groupPlantas }) => (
        <section key={tipo.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 italic">{tipo.tipo_planta}</h3>
            <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 font-mono font-bold">
              {groupPlantas.length}
            </span>
            <span className="flex-1 h-[2px] bg-slate-200"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupPlantas.map((planta) => {
              const obraObj = obras.find((o) => o.id === planta.id_obras);
              const plantSilos = silos.filter((s) => s.id_plantas === planta.id);
              const plantTanques = tanques.filter((t) => t.id_plantas === planta.id);
              const isOperativa = (planta.estado || 'OPERATIVA').toUpperCase().includes('OPERATIVA');

              return (
                <div
                  key={planta.id}
                  className="bg-white border-2 border-slate-200 hover:border-blue-600 p-6 shadow-[4px_4px_0px_#e2e8f0] transition-all flex flex-col justify-between group relative"
                >
                  {/* Top Status Bar */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-mono font-black bg-blue-50 text-blue-700 px-2.5 py-1 border border-blue-200 uppercase tracking-wider">
                          {planta.interno}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-2 uppercase italic group-hover:text-blue-600 transition-colors">
                          {planta.marca} {planta.modelo}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border ${
                          isOperativa
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {planta.estado || 'OPERATIVA'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">
                      {planta.descripcion || `Planta ${tipo.tipo_planta} Capacidad: ${planta.capacidad} Tn/h`}
                    </p>

                    {/* Key Attributes List */}
                    <div className="space-y-2 text-xs py-3 border-y border-slate-200 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <HardHat className="w-3.5 h-3.5 text-orange-500" />
                          Obra Actual:
                        </span>
                        <span className="font-bold text-slate-800 max-w-[180px] truncate text-right">
                          {obraObj ? `${obraObj.numero} - ${obraObj.descripcion}` : 'Sin Obra'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          Horas de Marcha:
                        </span>
                        <span className="font-mono font-black text-slate-900">
                          {planta.horas ? `${planta.horas.toLocaleString('es-AR')} hs` : '0 hs'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-blue-600" />
                          Tn Acumuladas:
                        </span>
                        <span className="font-mono font-black text-blue-700">
                          {planta.tn_acumuladas ? `${planta.tn_acumuladas.toLocaleString('es-AR')} Tn` : '0 Tn'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-slate-600" />
                          Capacidad Nominal:
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {planta.capacidad} Tn/h ({planta.año})
                        </span>
                      </div>
                    </div>

                    {/* Tanques & Silos count badges */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase text-slate-700 flex items-center gap-1">
                        <Cylinder className="w-3 h-3 text-sky-600" />
                        {plantTanques.length} Tanques
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase text-slate-700 flex items-center gap-1">
                        <Container className="w-3 h-3 text-emerald-600" />
                        {plantSilos.length} Silos
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => onSelectPlantaForView(planta.id, 'PRODUCCION')}
                      className="py-2 px-2 bg-[#0f172a] hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm rounded"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Producción</span>
                    </button>

                    <button
                      onClick={() => onSelectPlantaForView(planta.id, 'MANTENIMIENTO')}
                      className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm rounded"
                    >
                      <Wrench className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">Mantenimiento</span>
                    </button>

                    <button
                      onClick={() => onSelectPlantaForView(planta.id, 'STOCK_TANQUES')}
                      className="py-2 px-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-sm rounded"
                      title="Ver Stock Tanques / Silos"
                    >
                      <Cylinder className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">Stock Tanques</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {unassignedPlantas.length > 0 && (
        <section className="space-y-4 pt-4 border-t-2 border-slate-200">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 italic">Otras Plantas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unassignedPlantas.map((planta) => (
              <div key={planta.id} className="bg-white border-2 border-slate-200 p-6 shadow-[3px_3px_0px_#e2e8f0]">
                <h4 className="text-base font-black text-slate-900 uppercase italic">{planta.interno} — {planta.marca}</h4>
                <p className="text-xs text-slate-500 font-mono font-bold mt-1">Horas: {planta.horas} hs | Tn: {planta.tn_acumuladas} Tn</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
