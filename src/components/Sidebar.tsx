import React from 'react';
import { UserLog } from '../types';
import { ViewType } from './Navbar';
import {
  Factory,
  Cylinder,
  Container,
  Users,
  HardHat,
  PackageSearch,
  Settings,
  Flame,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  currentUser: UserLog;
  activeView: ViewType;
  onOpenEntityModal: (entityName: 'plantas' | 'tanques' | 'silos' | 'operador' | 'obras' | 'stock_insumos') => void;
  onOpenConfigModal: () => void;
  lowStockCount?: number;
  setActiveView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeView,
  onOpenEntityModal,
  onOpenConfigModal,
  lowStockCount = 0,
  setActiveView,
}) => {
  const isAdmin = currentUser.rol.toUpperCase() === 'ADMIN';

  if (!isAdmin) {
    // USER role sidebar - strictly Stock Insumos only
    return (
      <aside className="w-full lg:w-64 bg-[#0f172a] border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic flex items-center gap-2">
            <span>Menú Operador</span>
            <span className="flex-1 h-[1px] bg-slate-800"></span>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView('STOCK')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-none text-xs font-bold transition-all cursor-pointer ${
                activeView === 'STOCK'
                  ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-bold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <PackageSearch className="w-4 h-4 text-blue-400" />
                <span className="uppercase tracking-wider">Stock Insumos</span>
              </div>
              {lowStockCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-none bg-orange-500 text-white uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
          GEyT — Control Operativo
        </div>
      </aside>
    );
  }

  // ADMIN role sidebar with all options
  return (
    <aside className="w-full lg:w-64 bg-[#0f172a] border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Main Entity Management Options */}
        <div>
          <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 italic flex items-center gap-2">
            <span>Gestión Entidades</span>
            <span className="flex-1 h-[1px] bg-slate-800"></span>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveView('PLANTAS');
                onOpenEntityModal('plantas');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-none text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Factory className="w-4 h-4 text-blue-400" />
              <span>Plantas</span>
            </button>

            <button
              onClick={() => onOpenEntityModal('tanques')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-none text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Cylinder className="w-4 h-4 text-sky-400" />
              <span>Tanques</span>
            </button>

            <button
              onClick={() => onOpenEntityModal('silos')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-none text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Container className="w-4 h-4 text-emerald-400" />
              <span>Silos</span>
            </button>

            <button
              onClick={() => onOpenEntityModal('operador')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-none text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Operadores</span>
            </button>

            <button
              onClick={() => onOpenEntityModal('obras')}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-none text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer uppercase tracking-wider"
            >
              <HardHat className="w-4 h-4 text-orange-400" />
              <span>Obras</span>
            </button>

            <button
              onClick={() => {
                setActiveView('STOCK');
                onOpenEntityModal('stock_insumos');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-none text-xs font-bold transition-all cursor-pointer uppercase tracking-wider ${
                activeView === 'STOCK'
                  ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <PackageSearch className="w-4 h-4 text-purple-400" />
                <span>Stock Insumos</span>
              </div>
              {lowStockCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-none bg-orange-500 text-white uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Dynamic Configurations based on current active view */}
        <div>
          <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center justify-between italic">
            <span>Configuración</span>
            <span className="text-[10px] text-blue-400 font-mono not-italic font-bold">
              [{activeView === 'PRODUCCION' ? 'PROD' : activeView === 'MANTENIMIENTO' ? 'MANT' : 'GEN'}]
            </span>
          </div>

          <button
            onClick={onOpenConfigModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-none text-xs font-bold bg-slate-800/90 border border-slate-700 text-blue-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform text-blue-400" />
              <div className="text-left">
                <div className="text-white text-xs font-black uppercase tracking-wider">
                  {activeView === 'PRODUCCION' && 'Config. Producción'}
                  {activeView === 'MANTENIMIENTO' && 'Config. Mantenimiento'}
                  {(activeView === 'PLANTAS' || activeView === 'STOCK') && 'Ajustes Generales'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {activeView === 'PRODUCCION' && 'Motivos parada y Capas'}
                  {activeView === 'MANTENIMIENTO' && 'Tipos de mantenimiento'}
                  {(activeView === 'PLANTAS' || activeView === 'STOCK') && 'Usuarios y Componentes'}
                </div>
              </div>
            </div>
            {activeView === 'PRODUCCION' && <Flame className="w-4 h-4 text-amber-500" />}
            {activeView === 'MANTENIMIENTO' && <Wrench className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center italic">
        GEyT Admin • Supabase Rest v1
      </div>
    </aside>
  );
};
