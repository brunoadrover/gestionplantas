import React, { useState, useEffect } from 'react';
import {
  UserLog,
  TipoPlanta,
  Componente,
  Disposicion,
  Estado,
  EstadoRepuestos,
  MotivoParada,
  Obra,
  Operador,
  Producto,
  Planta,
  Produccion,
  RepuestoPedido,
  Silo,
  StockInsumo,
  Tanque,
  Mantenimiento,
  TipoMant,
} from './types';
import {
  fetchTableData,
  saveRecord,
  deleteRecord,
  DEFAULT_USERS,
  DEFAULT_TIPOS,
  DEFAULT_ESTADOS,
  DEFAULT_ESTADOS_REP,
  DEFAULT_COMPONENTES,
  DEFAULT_DISPOSICIONES,
  DEFAULT_PRODUCTOS,
  DEFAULT_CAPAS,
  DEFAULT_MOTIVOS,
  DEFAULT_OBRAS,
  DEFAULT_OPERADORES,
  DEFAULT_TIPOMANT,
  DEFAULT_PLANTAS,
  DEFAULT_STOCK,
  DEFAULT_PRODUCCION,
  DEFAULT_REPUESTOS,
  DEFAULT_MANTENIMIENTO,
  DEFAULT_TANQUES,
  DEFAULT_SILOS,
} from './lib/supabase';

import { LoginScreen } from './components/LoginScreen';
import { Navbar, ViewType } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PlantasGrid } from './components/PlantasGrid';
import { ProduccionView } from './components/ProduccionView';
import { MantenimientoView } from './components/MantenimientoView';
import { StockInsumosView } from './components/StockInsumosView';
import { StockTanquesView } from './components/StockTanquesView';
import { ConfiguracionesModal } from './components/ConfiguracionesModal';
import { EntityModals } from './components/EntityModals';
import { Building2, Loader2 } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserLog | null>(null);

  // Active View State
  const [activeView, setActiveView] = useState<ViewType>('PLANTAS');
  const [selectedPlantaViewId, setSelectedPlantaViewId] = useState<string | undefined>(undefined);

  // Database Tables State
  const [users, setUsers] = useState<UserLog[]>([]);
  const [tiposPlanta, setTiposPlanta] = useState<TipoPlanta[]>([]);
  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [disposiciones, setDisposiciones] = useState<Disposicion[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [estadosRepuestos, setEstadosRepuestos] = useState<EstadoRepuestos[]>([]);
  const [capas, setCapas] = useState<any[]>([]);
  const [motivos, setMotivos] = useState<MotivoParada[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tipomantList, setTipomantList] = useState<TipoMant[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [stockList, setStockList] = useState<StockInsumo[]>([]);
  const [produccionList, setProduccionList] = useState<Produccion[]>([]);
  const [repuestosList, setRepuestosList] = useState<RepuestoPedido[]>([]);
  const [mantenimientoList, setMantenimientoList] = useState<Mantenimiento[]>([]);
  const [tanques, setTanques] = useState<Tanque[]>([]);
  const [silos, setSilos] = useState<Silo[]>([]);

  // Modals state
  const [activeEntityModal, setActiveEntityModal] = useState<
    'plantas' | 'tanques' | 'silos' | 'operador' | 'obras' | 'stock_insumos' | null
  >(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Load all data from Supabase
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [
          uData,
          tData,
          cData,
          dData,
          eData,
          erData,
          cpData,
          mData,
          oData,
          opData,
          prData,
          tmData,
          pData,
          stData,
          prodData,
          rpData,
          mantData,
          tqData,
          slData,
        ] = await Promise.all([
          fetchTableData<UserLog>('log', DEFAULT_USERS),
          fetchTableData<TipoPlanta>('tipo', DEFAULT_TIPOS),
          fetchTableData<Componente>('componentes', DEFAULT_COMPONENTES),
          fetchTableData<Disposicion>('disposicion', DEFAULT_DISPOSICIONES),
          fetchTableData<Estado>('estado', DEFAULT_ESTADOS),
          fetchTableData<EstadoRepuestos>('estadorepuestos', DEFAULT_ESTADOS_REP),
          fetchTableData<any>('capa', DEFAULT_CAPAS),
          fetchTableData<MotivoParada>('motivo_parada', DEFAULT_MOTIVOS),
          fetchTableData<Obra>('obras', DEFAULT_OBRAS),
          fetchTableData<Operador>('operador', DEFAULT_OPERADORES),
          fetchTableData<Producto>('producto', DEFAULT_PRODUCTOS),
          fetchTableData<TipoMant>('tipomant', DEFAULT_TIPOMANT),
          fetchTableData<Planta>('plantas', DEFAULT_PLANTAS),
          fetchTableData<StockInsumo>('stock_insumos', DEFAULT_STOCK),
          fetchTableData<Produccion>('produccion', DEFAULT_PRODUCCION),
          fetchTableData<RepuestoPedido>('repuesto_pedido', DEFAULT_REPUESTOS),
          fetchTableData<Mantenimiento>('mantenimiento', DEFAULT_MANTENIMIENTO),
          fetchTableData<Tanque>('tanques', DEFAULT_TANQUES),
          fetchTableData<Silo>('silos', DEFAULT_SILOS),
        ]);

        setUsers(uData);
        setTiposPlanta(tData);
        setComponentes(cData);
        setDisposiciones(dData);
        setEstados(eData);
        setEstadosRepuestos(erData);
        setCapas(cpData);
        setMotivos(mData);
        setObras(oData);
        setOperadores(opData);
        setProductos(prData);
        setTipomantList(tmData);
        setPlantas(pData);
        setStockList(stData);
        setProduccionList(prodData);
        setRepuestosList(rpData);
        setMantenimientoList(mantData);
        setTanques(tqData);
        setSilos(slData);
      } catch (error) {
        console.error('Error loading database tables:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Handle Login
  const handleLogin = (user: UserLog) => {
    setCurrentUser(user);
    if (user.rol.toUpperCase() === 'USER') {
      setActiveView('PRODUCCION');
    } else {
      setActiveView('PLANTAS');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Generic Entity Persist Handlers
  const handleSavePlanta = async (p: Planta) => {
    const saved = await saveRecord<Planta>('plantas', p);
    setPlantas((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeletePlanta = async (id: string) => {
    await deleteRecord('plantas', id);
    setPlantas((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveProduccion = async (prod: Produccion) => {
    const saved = await saveRecord<Produccion>('produccion', prod);
    setProduccionList((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteProduccion = async (id: string) => {
    await deleteRecord('produccion', id);
    setProduccionList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveMantenimiento = async (m: Mantenimiento) => {
    const saved = await saveRecord<Mantenimiento>('mantenimiento', m);
    setMantenimientoList((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteMantenimiento = async (id: string) => {
    await deleteRecord('mantenimiento', id);
    setMantenimientoList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveStock = async (st: StockInsumo) => {
    const saved = await saveRecord<StockInsumo>('stock_insumos', st);
    setStockList((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteStock = async (id: string) => {
    await deleteRecord('stock_insumos', id);
    setStockList((prev) => prev.filter((st) => st.id !== id));
  };

  const handleSaveRepuesto = async (rp: RepuestoPedido) => {
    const saved = await saveRecord<RepuestoPedido>('repuesto_pedido', rp);
    setRepuestosList((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleSaveTanque = async (t: Tanque) => {
    const saved = await saveRecord<Tanque>('tanques', t);
    setTanques((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteTanque = async (id: string) => {
    await deleteRecord('tanques', id);
    setTanques((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveSilo = async (s: Silo) => {
    const saved = await saveRecord<Silo>('silos', s);
    setSilos((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteSilo = async (id: string) => {
    await deleteRecord('silos', id);
    setSilos((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveOperador = async (op: Operador) => {
    const saved = await saveRecord<Operador>('operador', op);
    setOperadores((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteOperador = async (id: string) => {
    await deleteRecord('operador', id);
    setOperadores((prev) => prev.filter((op) => op.id !== id));
  };

  const handleSaveObra = async (ob: Obra) => {
    const saved = await saveRecord<Obra>('obras', ob);
    setObras((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteObra = async (id: string) => {
    await deleteRecord('obras', id);
    setObras((prev) => prev.filter((o) => o.id !== id));
  };

  // Configuraciones handlers
  const handleSaveUser = async (u: UserLog) => {
    const saved = await saveRecord<UserLog>('log', u);
    setUsers((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteUser = async (id: string) => {
    await deleteRecord('log', id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSaveTipo = async (t: TipoPlanta) => {
    const saved = await saveRecord<TipoPlanta>('tipo', t);
    setTiposPlanta((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteTipo = async (id: string) => {
    await deleteRecord('tipo', id);
    setTiposPlanta((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveComponente = async (c: Componente) => {
    const saved = await saveRecord<Componente>('componentes', c);
    setComponentes((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteComponente = async (id: string) => {
    await deleteRecord('componentes', id);
    setComponentes((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveMotivo = async (m: MotivoParada) => {
    const saved = await saveRecord<MotivoParada>('motivo_parada', m);
    setMotivos((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteMotivo = async (id: string) => {
    await deleteRecord('motivo_parada', id);
    setMotivos((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveCapa = async (cp: any) => {
    const saved = await saveRecord<any>('capa', cp);
    setCapas((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteCapa = async (id: string) => {
    await deleteRecord('capa', id);
    setCapas((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveTipomant = async (tm: TipoMant) => {
    const saved = await saveRecord<TipoMant>('tipomant', tm);
    setTipomantList((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteTipomant = async (id: string) => {
    await deleteRecord('tipomant', id);
    setTipomantList((prev) => prev.filter((t) => t.id !== id));
  };

  // Low stock count alert calculation
  const lowStockCount = stockList.filter(
    (s) =>
      (!currentUser?.id_planta || s.id_planta === currentUser.id_planta) &&
      Number(s.cant_actual) <= Number(s.cant_minima)
  ).length;

  // Loader screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-16 h-16 bg-blue-600 text-white rounded flex items-center justify-center border-2 border-blue-400 mb-4 animate-bounce font-black text-xl italic shadow-[4px_4px_0px_#1e293b]">
          GE
        </div>
        <div className="flex items-center gap-3 text-blue-400 font-bold text-sm tracking-wider uppercase">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Sincronizando Sistema GEyT...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.rol.toUpperCase() === 'ADMIN';
  const userPlantaObj = plantas.find((p) => p.id === currentUser.id_planta);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        userPlanta={userPlantaObj}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar Menu */}
        <Sidebar
          currentUser={currentUser}
          activeView={activeView}
          onOpenEntityModal={(entityName) => {
            if (entityName === 'stock_insumos') {
              setActiveView('STOCK');
            } else if (entityName === 'plantas') {
              setActiveView('PLANTAS');
              setActiveEntityModal('plantas');
            } else {
              setActiveEntityModal(entityName);
            }
          }}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          lowStockCount={lowStockCount}
          setActiveView={setActiveView}
        />

        {/* Central Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
          {activeView === 'PLANTAS' && (
            <PlantasGrid
              plantas={plantas}
              tiposPlanta={tiposPlanta}
              obras={obras}
              silos={silos}
              tanques={tanques}
              userPlantaId={isAdmin ? undefined : currentUser.id_planta}
              onSelectPlantaForView={(plantaId, view) => {
                setSelectedPlantaViewId(plantaId);
                setActiveView(view);
              }}
            />
          )}

          {activeView === 'PRODUCCION' && (
            <ProduccionView
              produccionList={produccionList}
              plantas={plantas}
              operadores={operadores}
              obras={obras}
              motivos={motivos}
              capas={capas}
              onSaveProduccion={handleSaveProduccion}
              onDeleteProduccion={handleDeleteProduccion}
              userPlantaId={isAdmin ? undefined : currentUser.id_planta}
            />
          )}

          {activeView === 'MANTENIMIENTO' && (
            <MantenimientoView
              mantenimientoList={mantenimientoList}
              plantas={plantas}
              componentes={componentes}
              tipomantList={tipomantList}
              estados={estados}
              repuestosList={repuestosList}
              estadosRepuestos={estadosRepuestos}
              onSaveMantenimiento={handleSaveMantenimiento}
              onDeleteMantenimiento={handleDeleteMantenimiento}
              onSaveRepuesto={handleSaveRepuesto}
              userPlantaId={isAdmin ? undefined : currentUser.id_planta}
            />
          )}

          {activeView === 'STOCK' && (
            <StockInsumosView
              stockList={stockList}
              plantas={plantas}
              componentes={componentes}
              onSaveStock={handleSaveStock}
              onDeleteStock={handleDeleteStock}
              userPlantaId={isAdmin ? undefined : currentUser.id_planta}
              isAdmin={isAdmin}
            />
          )}

          {activeView === 'STOCK_TANQUES' && (
            <StockTanquesView
              tanques={tanques}
              silos={silos}
              plantas={plantas}
              disposiciones={disposiciones}
              productos={productos}
              onSaveTanque={handleSaveTanque}
              onSaveSilo={handleSaveSilo}
              userPlantaId={isAdmin ? undefined : currentUser.id_planta}
              initialPlantaId={selectedPlantaViewId}
            />
          )}
        </main>
      </div>

      {/* Footer Alerts Bar */}
      <div className="h-10 bg-[#0f172a] text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center px-6 justify-between border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-4 italic">
          {lowStockCount > 0 ? (
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Alerta de Stock: {lowStockCount} ítem(s) crítico(s)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Stock de insumos en nivel óptimo
            </span>
          )}
          <span className="w-[1px] h-3 bg-slate-700"></span>
          <span className="text-slate-300">Base de Datos: Conectada</span>
        </div>
        <div className="text-slate-500 font-medium tracking-widest hidden sm:block">
          SISTEMA DE GESTIÓN DE PLANTAS — GEyT v2.4.0
        </div>
      </div>

      {/* Entity Modals for Plantas, Tanques, Silos, Operadores, Obras */}
      <EntityModals
        entityName={activeEntityModal}
        onClose={() => setActiveEntityModal(null)}
        plantas={plantas}
        tiposPlanta={tiposPlanta}
        obras={obras}
        disposiciones={disposiciones}
        productos={productos}
        tanques={tanques}
        silos={silos}
        operadores={operadores}
        onSavePlanta={handleSavePlanta}
        onDeletePlanta={handleDeletePlanta}
        onSaveTanque={handleSaveTanque}
        onDeleteTanque={handleDeleteTanque}
        onSaveSilo={handleSaveSilo}
        onDeleteSilo={handleDeleteSilo}
        onSaveOperador={handleSaveOperador}
        onDeleteOperador={handleDeleteOperador}
        onSaveObra={handleSaveObra}
        onDeleteObra={handleDeleteObra}
      />

      {/* Configuraciones Modal with contextual options based on current view */}
      <ConfiguracionesModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        activeView={activeView}
        users={users}
        tiposPlanta={tiposPlanta}
        componentes={componentes}
        motivos={motivos}
        capas={capas}
        tipomantList={tipomantList}
        plantas={plantas}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
        onSaveTipo={handleSaveTipo}
        onDeleteTipo={handleDeleteTipo}
        onSaveComponente={handleSaveComponente}
        onDeleteComponente={handleDeleteComponente}
        onSaveMotivo={handleSaveMotivo}
        onDeleteMotivo={handleDeleteMotivo}
        onSaveCapa={handleSaveCapa}
        onDeleteCapa={handleDeleteCapa}
        onSaveTipomant={handleSaveTipomant}
        onDeleteTipomant={handleDeleteTipomant}
      />
    </div>
  );
}
