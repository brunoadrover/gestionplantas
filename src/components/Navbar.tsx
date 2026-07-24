import React from 'react';
import { UserLog, Planta } from '../types';
import { Building2, LogOut, Shield, User as UserIcon, Factory, Wrench, Activity, Cylinder, RefreshCw } from 'lucide-react';

export type ViewType = 'PLANTAS' | 'PRODUCCION' | 'MANTENIMIENTO' | 'STOCK' | 'STOCK_TANQUES';

interface NavbarProps {
  currentUser: UserLog;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  onLogout: () => void;
  userPlanta?: Planta;
  isSyncing?: boolean;
  onSync?: () => void;
  lastSyncTime?: Date | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onLogout,
  userPlanta,
  isSyncing = false,
  onSync,
  lastSyncTime,
}) => {
  const isAdmin = currentUser.rol.toUpperCase() === 'ADMIN';

  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => isAdmin && setActiveView('PLANTAS')}>
            <img
              src="https://iqycgsgmwzqikribzdmj.supabase.co/storage/v1/object/public/imagenes/Roggio1.png"
              alt="Roggio Logo"
              className="h-10 w-auto object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Top view switcher (Producción / Mantenimiento / Stock Tanques / Plantas) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {isAdmin && (
              <button
                onClick={() => setActiveView('PLANTAS')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                  activeView === 'PLANTAS'
                    ? 'bg-white shadow-sm border border-slate-200 text-slate-900'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Factory className="w-3.5 h-3.5 text-blue-600" />
                <span>Plantas</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('PRODUCCION')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                activeView === 'PRODUCCION'
                  ? 'bg-white shadow-sm border border-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Producción</span>
            </button>

            <button
              onClick={() => setActiveView('MANTENIMIENTO')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                activeView === 'MANTENIMIENTO'
                  ? 'bg-white shadow-sm border border-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-sky-600" />
              <span>Mantenimiento</span>
            </button>

            <button
              onClick={() => setActiveView('STOCK_TANQUES')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                activeView === 'STOCK_TANQUES'
                  ? 'bg-white shadow-sm border border-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Cylinder className="w-3.5 h-3.5 text-indigo-600" />
              <span>Stock Tanques/Silos</span>
            </button>
          </div>

          {/* User Profile, Sync Button & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sync Button */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                title="Sincronizar y actualizar consulta con Supabase"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span className="hidden sm:inline uppercase text-[10px] tracking-wider font-bold">
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </span>
              </button>
            )}

            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase italic">
                {isAdmin ? <Shield className="w-3.5 h-3.5 text-blue-600" /> : <UserIcon className="w-3.5 h-3.5 text-sky-600" />}
                {currentUser.usuario}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isAdmin ? 'Superusuario' : `Operador ${userPlanta ? userPlanta.interno : ''}`}
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-red-600 hover:text-white border border-slate-200 rounded transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline uppercase text-[10px] tracking-wider font-bold">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
