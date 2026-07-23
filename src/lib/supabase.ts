import { createClient } from '@supabase/supabase-js';
import {
  Capa,
  Componente,
  Disposicion,
  Estado,
  EstadoRepuestos,
  Mantenimiento,
  MotivoParada,
  Obra,
  Operador,
  Planta,
  Producto,
  Produccion,
  RepuestoPedido,
  Silo,
  StockInsumo,
  Tanque,
  TipoMant,
  TipoPlanta,
  UserLog,
} from '../types';

const RAW_SUPABASE_URL = 'https://iqycgsgmwzqikribzdmj.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_i3munSzwKm1qGtdsZRE3rQ_ySW91Stj';

// Clean URL: createClient from @supabase/supabase-js requires the base project origin (without /rest/v1/)
export const SUPABASE_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initial local seed fallback data in case database is empty or restricted
export const DEFAULT_USERS: UserLog[] = [];

export const DEFAULT_TIPOS: TipoPlanta[] = [
  { id: 't-1', tipo_planta: 'Planta de Asfalto' },
  { id: 't-2', tipo_planta: 'Planta de Hormigón' },
  { id: 't-3', tipo_planta: 'Planta de Trituración' },
  { id: 't-4', tipo_planta: 'Planta Suelo Cemento' },
];

export const DEFAULT_ESTADOS: Estado[] = [
  { id: 'e-1', estado: 'PENDIENTE' },
  { id: 'e-2', estado: 'EN PROCESO' },
  { id: 'e-3', estado: 'FINALIZADO' },
];

export const DEFAULT_ESTADOS_REP: EstadoRepuestos[] = [
  { id: 'er-1', estadorep: 'Solicitado' },
  { id: 'er-2', estadorep: 'En Cotización' },
  { id: 'er-3', estadorep: 'En Camino' },
  { id: 'er-4', estadorep: 'Entregado' },
];

export const DEFAULT_COMPONENTES: Componente[] = [
  { id: 'c-1', nmb_componente: 'Mezclador Secador' },
  { id: 'c-2', nmb_componente: 'Cinta Transportadora Principal' },
  { id: 'c-3', nmb_componente: 'Filtro de Mangas' },
  { id: 'c-4', nmb_componente: 'Bomba de Asfalto' },
  { id: 'c-5', nmb_componente: 'Quemador de Fuel Oil / Gas' },
  { id: 'c-6', nmb_componente: 'Elevador de Cangilones' },
  { id: 'c-7', nmb_componente: 'Compresor de Aire' },
  { id: 'c-8', nmb_componente: 'Tablero Eléctrico / PLC' },
];

export const DEFAULT_DISPOSICIONES: Disposicion[] = [
  { id: 'd-1', disposicion: 'Aérea Vertical' },
  { id: 'd-2', disposicion: 'Horizontal Subterranea' },
  { id: 'd-3', disposicion: 'Horizontal Superficie' },
];

export const DEFAULT_PRODUCTOS: Producto[] = [
  { id: 'pr-1', producto: 'Asfalto AC-20' },
  { id: 'pr-2', producto: 'Asfalto Modificado SBS' },
  { id: 'pr-3', producto: 'Emulsión Catiónica' },
  { id: 'pr-4', producto: 'Combustible Fuel Oil' },
  { id: 'pr-5', producto: 'Gasoil Grado 3' },
  { id: 'pr-6', producto: 'Cemento Portland' },
  { id: 'pr-7', producto: 'Aditivo Plastificante' },
];

export const DEFAULT_CAPAS: Capa[] = [
  { id: 'cp-1', capa: 'Capa de Rodamiento (CAC-D19)' },
  { id: 'cp-2', capa: 'Capa Intermedia (Binder)' },
  { id: 'cp-3', capa: 'Base Asfáltica' },
  { id: 'cp-4', capa: 'Hormigón H-30' },
  { id: 'cp-5', capa: 'Hormigón H-20' },
];

export const DEFAULT_MOTIVOS: MotivoParada[] = [
  { id: 'm-1', motivo: 'Mantenimiento Mecánico' },
  { id: 'm-2', motivo: 'Mantenimiento Eléctrico' },
  { id: 'm-3', motivo: 'Falta de Insumos / Materia Prima' },
  { id: 'm-4', motivo: 'Falta de Camiones / Transporte' },
  { id: 'm-5', motivo: 'Condiciones Climáticas (Lluvia)' },
  { id: 'm-6', motivo: 'Otro' },
];

export const DEFAULT_OBRAS: Obra[] = [];

export const DEFAULT_OPERADORES: Operador[] = [
  { id: 'op-1', nombre: 'Carlos', apellido: 'Gómez', rol: 'Jefe de Planta' },
  { id: 'op-2', nombre: 'Roberto', apellido: 'Fernández', rol: 'Operador Principal' },
  { id: 'op-3', nombre: 'Marcelo', apellido: 'Rossi', rol: 'Técnico Calderista' },
  { id: 'op-4', nombre: 'Esteban', apellido: 'Benítez', rol: 'Mecánico de Mantenimiento' },
];

export const DEFAULT_TIPOMANT: TipoMant[] = [
  { id: 'tm-1', tipo: 'Mantenimiento Preventivo' },
  { id: 'tm-2', tipo: 'Mantenimiento Correctivo' },
  { id: 'tm-3', tipo: 'Inspección Periódica' },
  { id: 'tm-4', tipo: 'Calibración de Balanzas' },
];

export const DEFAULT_PLANTAS: Planta[] = [
  {
    id: 'p-101',
    interno: 'PL-01',
    marca: 'Ciber',
    modelo: 'UAM210',
    id_tipo: 't-1',
    capacidad: 180,
    año: 2021,
    descripcion: 'Planta continua de asfalto en caliente movil',
    tn_acumuladas: 45200,
    horas: 1840,
    id_obras: 'ob-1',
    estado: 'OPERATIVA',
  },
  {
    id: 'p-102',
    interno: 'PL-02',
    marca: 'Ammann',
    modelo: 'ABA 160',
    id_tipo: 't-1',
    capacidad: 160,
    año: 2019,
    descripcion: 'Planta de asfalto discontinuas estacionaria',
    tn_acumuladas: 89400,
    horas: 3450,
    id_obras: 'ob-2',
    estado: 'OPERATIVA',
  },
  {
    id: 'p-103',
    interno: 'HO-01',
    marca: 'Indumix',
    modelo: 'TH 60',
    id_tipo: 't-2',
    capacidad: 60,
    año: 2022,
    descripcion: 'Planta de hormigón dosificadora y mezcladora',
    tn_acumuladas: 18200,
    horas: 920,
    id_obras: 'ob-3',
    estado: 'EN MANTENIMIENTO',
  },
];

export const DEFAULT_STOCK: StockInsumo[] = [
  {
    id: 'st-1',
    descripcion: 'Mangueras hidráulicas de alta presión 3/4"',
    id_componente: 'c-4',
    id_planta: 'p-101',
    cant_minima: 10,
    cant_actual: 4, // ALERT! <= cant_minima
  },
  {
    id: 'st-2',
    descripcion: 'Mangas filtrantes Nomex para filtro de polvo',
    id_componente: 'c-3',
    id_planta: 'p-101',
    cant_minima: 25,
    cant_actual: 30,
  },
  {
    id: 'st-3',
    descripcion: 'Rodamientos Skf 22220 para elevador',
    id_componente: 'c-6',
    id_planta: 'p-101',
    cant_minima: 4,
    cant_actual: 2, // ALERT!
  },
  {
    id: 'st-4',
    descripcion: 'Aceite sintético térmico ISO VG 46 (Litros)',
    id_componente: 'c-1',
    id_planta: 'p-102',
    cant_minima: 200,
    cant_actual: 150, // ALERT!
  },
  {
    id: 'st-5',
    descripcion: 'Correa dentada transportadora 800mm',
    id_componente: 'c-2',
    id_planta: 'p-102',
    cant_minima: 2,
    cant_actual: 5,
  },
  {
    id: 'st-6',
    descripcion: 'Electroválvula de corte de gasoil 24V',
    id_componente: 'c-5',
    id_planta: 'p-103',
    cant_minima: 3,
    cant_actual: 1, // ALERT!
  },
];

export const DEFAULT_PRODUCCION: Produccion[] = [
  {
    id: 'prod-1',
    id_plantas: 'p-101',
    id_operador: 'op-1',
    fecha: '2026-07-22',
    hs_inicio: '07:00',
    hs_fin: '17:00',
    tn_producidas: 1250,
    hs_parada: 1.5,
    id_motivo_parada: 'm-5',
    observaciones: 'Parada temporaria por lluvia intensa a las 11hs.',
    id_obras: 'ob-1',
    calderista_1: 'Carlos Gómez',
    calderista_2: 'Marcelo Rossi',
    id_capa: 'cp-1',
  },
  {
    id: 'prod-2',
    id_plantas: 'p-101',
    id_operador: 'op-2',
    fecha: '2026-07-21',
    hs_inicio: '06:30',
    hs_fin: '18:00',
    tn_producidas: 1480,
    hs_parada: 0,
    id_motivo_parada: 'm-1',
    observaciones: 'Jornada continua con excelente rendimiento.',
    id_obras: 'ob-1',
    calderista_1: 'Roberto Fernández',
    id_capa: 'cp-1',
  },
  {
    id: 'prod-3',
    id_plantas: 'p-102',
    id_operador: 'op-2',
    fecha: '2026-07-20',
    hs_inicio: '08:00',
    hs_fin: '16:00',
    tn_producidas: 980,
    hs_parada: 2,
    id_motivo_parada: 'm-6',
    motivo_otro: 'Corte de suministro eléctrico externo en zona',
    observaciones: 'Afectó el rendimiento del turno tarde.',
    id_obras: 'ob-2',
    calderista_1: 'Marcelo Rossi',
    id_capa: 'cp-2',
  },
];

export const DEFAULT_REPUESTOS: RepuestoPedido[] = [
  {
    id: 'rp-1',
    fecha_pedido: '2026-07-15',
    fecha_necesidad: '2026-07-25',
    fecha_entrega: '2026-07-21',
    descripcion: 'Juego de paletas mezcladoras de fundición dura',
    id_componente: 'c-1',
    id_planta: 'p-101',
    cantidad: 12,
    proveedor: 'Metalúrgica Asfáltica S.A.',
    costo: 3400000,
    id_estadorepuestos: 'er-4',
  },
  {
    id: 'rp-2',
    fecha_pedido: '2026-07-18',
    fecha_necesidad: '2026-07-28',
    descripcion: 'Bomba centrífuga de asfalto caliente 3"',
    id_componente: 'c-4',
    id_planta: 'p-102',
    cantidad: 1,
    proveedor: 'Equipos Viamonte S.R.L.',
    costo: 8900000,
    id_estadorepuestos: 'er-3',
  },
];

export const DEFAULT_MANTENIMIENTO: Mantenimiento[] = [
  {
    id: 'mant-1',
    id_plantas: 'p-103',
    id_componente: 'c-5',
    id_tipomant: 'tm-2',
    fecha: '2026-07-22',
    fecha_inicio: '2026-07-22',
    id_repuesto_pedido: 'rp-2',
    id_estado: 'e-1', // PENDIENTE
    comentarios: 'Revisión urgente de inyector de combustible por humo denso.',
  },
  {
    id: 'mant-2',
    id_plantas: 'p-101',
    id_componente: 'c-1',
    id_tipomant: 'tm-1',
    fecha: '2026-07-20',
    fecha_inicio: '2026-07-21',
    id_repuesto_pedido: 'rp-1',
    id_estado: 'e-2', // EN PROCESO
    comentarios: 'Recambio preventivo de paletas de mezclador.',
  },
  {
    id: 'mant-3',
    id_plantas: 'p-102',
    id_componente: 'c-3',
    id_tipomant: 'tm-3',
    fecha: '2026-07-10',
    fecha_inicio: '2026-07-10',
    fecha_fin: '2026-07-11',
    id_estado: 'e-3', // FINALIZADO
    comentarios: 'Limpieza general de cámara de filtros de mangas.',
  },
];

export const DEFAULT_TANQUES: Tanque[] = [
  {
    id: 'tq-1',
    id_plantas: 'p-101',
    denominacion: 'Tanque Asfalto #1',
    marca: 'Ciber',
    tipo: 'Asfalto Termal',
    capacidad: 60000,
    caldera: true,
    calefaccionado: true,
    agitadores: true,
    id_disposicion: 'd-3',
    stock: 42000,
    id_producto: 'pr-1',
  },
  {
    id: 'tq-2',
    id_plantas: 'p-101',
    denominacion: 'Tanque Combustible Fuel Oil',
    marca: 'Ciber',
    tipo: 'Combustible',
    capacidad: 30000,
    caldera: false,
    calefaccionado: true,
    agitadores: false,
    id_disposicion: 'd-2',
    stock: 18500,
    id_producto: 'pr-4',
  },
];

export const DEFAULT_SILOS: Silo[] = [
  {
    id: 'sl-1',
    id_plantas: 'p-103',
    denominacion: 'Silo Cemento Portland #1',
    tipo: 'Cilíndrico Vertical',
    capacidad: 120,
    descripcion: 'Silo de almacenamiento de cemento a granel',
    id_disposicion: 'd-1',
    stock: 85,
    id_producto: 'pr-6',
  },
  {
    id: 'sl-2',
    id_plantas: 'p-101',
    denominacion: 'Silo Filler Calcáreo',
    tipo: 'Cilíndrico Vertical',
    capacidad: 50,
    id_disposicion: 'd-1',
    stock: 32,
    id_producto: 'pr-6',
  },
];

// Helper to query a Supabase table using both client and direct REST API, checking table candidates
const TABLE_CANDIDATES: Record<string, string[]> = {
  'log': ['log', 'logs', 'user_log', 'usuarios', 'users'],
  'tipo': ['tipo', 'tipos', 'tipo_planta', 'tipos_planta', 'tipos_plantas'],
  'componentes': ['componentes', 'componente'],
  'disposicion': ['disposicion', 'disposiciones'],
  'estado': ['estado', 'estados'],
  'estadorepuestos': ['estadorepuestos', 'estado_repuestos', 'estados_repuestos', 'estado_repuesto'],
  'capa': ['capa', 'capas'],
  'motivo_parada': ['motivo_parada', 'motivos_parada', 'motivo', 'motivos'],
  'obras': ['obras', 'obra'],
  'operador': ['operador', 'operadores'],
  'producto': ['producto', 'productos'],
  'tipomant': ['tipomant', 'tipo_mant', 'tipos_mantenimiento', 'tipo_mantenimiento'],
  'plantas': ['plantas', 'planta'],
  'stock_insumos': ['stock_insumos', 'stock', 'stock_insumo', 'insumos'],
  'produccion': ['produccion', 'producciones'],
  'repuesto_pedido': ['repuesto_pedido', 'pedidos_repuestos', 'repuesto_pedidos', 'repuestos'],
  'mantenimiento': ['mantenimiento', 'mantenimientos'],
  'tanques': ['tanques', 'tanque'],
  'silos': ['silos', 'silo'],
};

// Map items returned from Supabase to app expected schemas
function normalizeRecord(tableName: string, item: any, idx: number): any {
  if (!item || typeof item !== 'object') return item;
  const itemId = item.id ? String(item.id) : item.id_log ? String(item.id_log) : item.usuario ? String(item.usuario) : `id-${idx}`;

  switch (tableName) {
    case 'log':
      return {
        ...item,
        id: itemId,
        usuario: String(item.usuario || item.user || item.username || item.nombre || '').trim(),
        pass: String(item.pass || item.password || item.clave || '').trim(),
        rol: String(item.rol || item.role || 'USER').trim().toUpperCase(),
        id_planta: item.id_planta ? String(item.id_planta) : undefined,
      };
    case 'plantas':
      return {
        ...item,
        id: itemId,
        interno: String(item.interno || item.codigo || item.id_planta || '').trim(),
        marca: String(item.marca || '').trim(),
        modelo: String(item.modelo || '').trim(),
        id_tipo: item.id_tipo ? String(item.id_tipo) : '',
        capacidad: Number(item.capacidad || 0),
        año: Number(item.año || item.anio || item.year || 2022),
        descripcion: String(item.descripcion || '').trim(),
        tn_acumuladas: Number(item.tn_acumuladas || item.tn_acumulada || 0),
        horas: Number(item.horas || item.hs || 0),
        id_obras: item.id_obras ? String(item.id_obras) : undefined,
        estado: String(item.estado || 'OPERATIVA').trim(),
      };
    case 'obras':
      return {
        ...item,
        id: itemId,
        numero: Number(item.numero || item.num || item.nro || idx + 1),
        descripcion: String(item.descripcion || item.desc || '').trim(),
      };
    case 'operador':
      return {
        ...item,
        id: itemId,
        nombre: String(item.nombre || '').trim(),
        apellido: String(item.apellido || '').trim(),
        rol: String(item.rol || 'Operador').trim(),
      };
    case 'produccion':
      {
        const pId = item.id_plantas ? String(item.id_plantas) : item.id_planta ? String(item.id_planta) : '';
        return {
          ...item,
          id: itemId,
          id_plantas: pId,
          id_planta: pId,
          id_operador: item.id_operador ? String(item.id_operador) : undefined,
          fecha: String(item.fecha || new Date().toISOString().split('T')[0]),
          hs_inicio: item.hs_inicio ? String(item.hs_inicio) : undefined,
          hs_fin: item.hs_fin ? String(item.hs_fin) : undefined,
          tn_producidas: Number(item.tn_producidas || item.toneladas || 0),
          hs_parada: Number(item.hs_parada || 0),
          id_motivo_parada: item.id_motivo_parada ? String(item.id_motivo_parada) : item.id_motivo ? String(item.id_motivo) : undefined,
          observaciones: item.observaciones ? String(item.observaciones) : item.obs ? String(item.obs) : undefined,
          id_obras: item.id_obras ? String(item.id_obras) : item.id_obra ? String(item.id_obra) : undefined,
          id_capa: item.id_capa ? String(item.id_capa) : undefined,
        };
      }
    case 'stock_insumos':
      {
        const pId = item.id_planta ? String(item.id_planta) : item.id_plantas ? String(item.id_plantas) : '';
        return {
          ...item,
          id: itemId,
          descripcion: String(item.descripcion || '').trim(),
          id_componente: item.id_componente ? String(item.id_componente) : '',
          id_planta: pId,
          id_plantas: pId,
          cant_minima: Number(item.cant_minima || 0),
          cant_actual: Number(item.cant_actual || 0),
        };
      }
    case 'mantenimiento':
      {
        const pId = item.id_plantas ? String(item.id_plantas) : item.id_planta ? String(item.id_planta) : '';
        return {
          ...item,
          id: itemId,
          id_plantas: pId,
          id_planta: pId,
          id_componente: item.id_componente ? String(item.id_componente) : undefined,
          id_tipomant: item.id_tipomant ? String(item.id_tipomant) : item.id_tipo ? String(item.id_tipo) : undefined,
          fecha: String(item.fecha || item.fecha_inicio || new Date().toISOString().split('T')[0]),
          fecha_inicio: item.fecha_inicio ? String(item.fecha_inicio) : undefined,
          fecha_fin: item.fecha_fin ? String(item.fecha_fin) : undefined,
          id_repuesto_pedido: item.id_repuesto_pedido ? String(item.id_repuesto_pedido) : undefined,
          id_estado: item.id_estado ? String(item.id_estado) : undefined,
          comentarios: item.comentarios ? String(item.comentarios) : item.comentario ? String(item.comentario) : undefined,
        };
      }
    case 'tanques':
      {
        const pId = item.id_plantas ? String(item.id_plantas) : item.id_planta ? String(item.id_planta) : '';
        return {
          ...item,
          id: itemId,
          id_plantas: pId,
          id_planta: pId,
          denominacion: String(item.denominacion || item.nombre || 'Tanque').trim(),
          marca: item.marca ? String(item.marca) : undefined,
          tipo: item.tipo ? String(item.tipo) : undefined,
          capacidad: Number(item.capacidad || 0),
          descripcion: item.descripcion ? String(item.descripcion) : undefined,
          stock: Number(item.stock || 0),
          id_producto: item.id_producto ? String(item.id_producto) : undefined,
          id_disposicion: item.id_disposicion ? String(item.id_disposicion) : undefined,
          caldera: Boolean(item.caldera),
          calefaccionado: Boolean(item.calefaccionado),
          agitadores: Boolean(item.agitadores),
          diametro: item.diametro !== undefined && item.diametro !== null ? Number(item.diametro) : undefined,
          longitud: item.longitud !== undefined && item.longitud !== null ? Number(item.longitud) : undefined,
          altura_total: item.altura_total !== undefined && item.altura_total !== null ? Number(item.altura_total) : undefined,
          altura_vacio: item.altura_vacio !== undefined && item.altura_vacio !== null ? Number(item.altura_vacio) : undefined,
          fecha_actualizacion_vacio: item.fecha_actualizacion_vacio
            ? String(item.fecha_actualizacion_vacio)
            : (typeof window !== 'undefined' && localStorage.getItem(`vacio_date_${itemId}`))
              || (item.fecha_medicion ? String(item.fecha_medicion) : undefined),
        };
      }
    case 'silos':
      {
        const pId = item.id_plantas ? String(item.id_plantas) : item.id_planta ? String(item.id_planta) : '';
        return {
          ...item,
          id: itemId,
          id_plantas: pId,
          id_planta: pId,
          denominacion: String(item.denominacion || item.nombre || 'Silo').trim(),
          tipo: item.tipo ? String(item.tipo) : undefined,
          capacidad: Number(item.capacidad || 0),
          descripcion: item.descripcion ? String(item.descripcion) : undefined,
          stock: Number(item.stock || 0),
          id_producto: item.id_producto ? String(item.id_producto) : undefined,
          id_disposicion: item.id_disposicion ? String(item.id_disposicion) : undefined,
          altura_vacio: item.altura_vacio !== undefined && item.altura_vacio !== null ? Number(item.altura_vacio) : undefined,
          fecha_actualizacion_vacio: item.fecha_actualizacion_vacio
            ? String(item.fecha_actualizacion_vacio)
            : (typeof window !== 'undefined' && localStorage.getItem(`vacio_date_${itemId}`))
              || (item.fecha_medicion ? String(item.fecha_medicion) : undefined),
        };
      }
    case 'componentes':
      return {
        ...item,
        id: itemId,
        nmb_componente: String(item.nmb_componente || item.nombre || item.componente || '').trim(),
      };
    default:
      return {
        ...item,
        id: itemId,
      };
  }
}

// Direct fetch helper via REST PostgREST API
async function directRestFetch(candidate: string): Promise<any[] | null> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${candidate}?select=*`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (e) {
    console.warn(`Direct REST fetch error on "${candidate}":`, e);
  }
  return null;
}

// Helper to safely query a Supabase table with candidates & fallback
export async function fetchTableData<T>(tableName: string, fallbackData: T[]): Promise<T[]> {
  const candidates = TABLE_CANDIDATES[tableName] || [tableName];

  for (const cand of candidates) {
    // 1. Try Supabase JS client
    try {
      const { data, error } = await supabase.from(cand).select('*');
      if (!error && data && Array.isArray(data)) {
        const normalized = data.map((item: any, idx: number) => normalizeRecord(tableName, item, idx));
        localStorage.setItem(`geyt_table_${tableName}`, JSON.stringify(normalized));
        return normalized as unknown as T[];
      }
    } catch (err) {
      console.warn(`Supabase client query error on "${cand}":`, err);
    }

    // 2. Try direct REST API fetch
    const restData = await directRestFetch(cand);
    if (restData) {
      const normalized = restData.map((item: any, idx: number) => normalizeRecord(tableName, item, idx));
      localStorage.setItem(`geyt_table_${tableName}`, JSON.stringify(normalized));
      return normalized as unknown as T[];
    }
  }

  // 3. Fallback to localStorage cache
  const stored = localStorage.getItem(`geyt_table_${tableName}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = tableName === 'log'
          ? parsed.filter((u: any) => !u.id?.startsWith('u-geyt') && !u.id?.startsWith('u-admin') && !u.id?.startsWith('u-operador'))
          : parsed;
        if (filtered.length > 0) {
          return filtered.map((item: any, idx: number) => normalizeRecord(tableName, item, idx)) as unknown as T[];
        }
      }
    } catch (e) {
      console.warn(`Local storage parse error for ${tableName}:`, e);
    }
  }

  return fallbackData;
}

// Helper to save or edit a record directly in Supabase
export async function saveRecord<T extends { id?: string }>(tableName: string, record: T): Promise<T> {
  const recId = record.id ? String(record.id) : '';
  const isSynthetic = !recId ||
    recId.startsWith('new-') ||
    recId.startsWith('ob-') ||
    recId.startsWith('op-') ||
    recId.startsWith('p-') ||
    recId.startsWith('u-') ||
    recId.startsWith('t-') ||
    recId.startsWith('c-') ||
    recId.startsWith('st-') ||
    recId.startsWith('sl-') ||
    recId.startsWith('tq-') ||
    recId.startsWith('mant-') ||
    recId.startsWith('prod-') ||
    recId.startsWith('rp-') ||
    recId.startsWith('tm-') ||
    recId.startsWith('item-');

  const recordToSave: any = { ...record };
  if (!recordToSave.id) {
    recordToSave.id = crypto.randomUUID();
  }

  const candidates = TABLE_CANDIDATES[tableName] || [tableName];
  const primaryCand = candidates[0];

  // Build clean payload without non-database client UI properties
  let dbPayload: any = { ...recordToSave };
  delete dbPayload.itemType;
  delete dbPayload.planta;
  delete dbPayload.producto;
  delete dbPayload.disposicion;
  delete dbPayload.fecha_actualizacion_vacio;

  if (recordToSave.fecha_actualizacion_vacio && typeof window !== 'undefined') {
    try {
      localStorage.setItem(`vacio_date_${recordToSave.id}`, String(recordToSave.fecha_actualizacion_vacio));
    } catch (e) {
      // ignore
    }
  }

  // Handle plant foreign key column name per schema requirement
  const tableNameLower = tableName.toLowerCase();
  if (['produccion', 'mantenimiento', 'tanques', 'silos'].includes(tableNameLower)) {
    if (dbPayload.id_planta && !dbPayload.id_plantas) {
      dbPayload.id_plantas = dbPayload.id_planta;
    }
    delete dbPayload.id_planta;
  } else if (['stock_insumos', 'repuesto_pedido', 'log'].includes(tableNameLower)) {
    if (dbPayload.id_plantas && !dbPayload.id_planta) {
      dbPayload.id_planta = dbPayload.id_plantas;
    }
    delete dbPayload.id_plantas;
  }

  // Convert all empty string values to null so PostgreSQL UUID/numeric types do not fail
  Object.keys(dbPayload).forEach((key) => {
    if (dbPayload[key] === '' || dbPayload[key] === undefined) {
      dbPayload[key] = null;
    }
  });

  // Remove client synthetic ID before insert so database assigns primary key
  if (isSynthetic) {
    delete dbPayload.id;
  }

  let savedSuccessfully = false;

  // 1. Try Supabase JS client
  try {
    if (isSynthetic) {
      const { data, error } = await supabase.from(primaryCand).insert([dbPayload]).select();
      if (!error && data && data[0]) {
        const generatedId = data[0].id || data[0].id_obra || data[0].id_log || data[0].usuario;
        if (generatedId) recordToSave.id = String(generatedId);
        savedSuccessfully = true;
      } else if (error) {
        console.warn(`Supabase client insert error on "${primaryCand}":`, error);
      }
    } else {
      const { data, error } = await supabase.from(primaryCand).update(dbPayload).eq('id', recordToSave.id).select();
      if (!error && data && data[0]) {
        savedSuccessfully = true;
      } else if (!error) {
        savedSuccessfully = true;
      } else {
        const { error: errObra } = await supabase.from(primaryCand).update(dbPayload).eq('id_obra', recordToSave.id);
        if (!errObra) savedSuccessfully = true;
      }
    }
  } catch (err) {
    console.warn(`Supabase client save failed on "${primaryCand}":`, err);
  }

  // 2. Direct REST API fallback ONLY if step 1 failed
  if (!savedSuccessfully) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${primaryCand}`;
      if (isSynthetic) {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(dbPayload),
        });
        if (res.ok) {
          const resData = await res.json();
          if (Array.isArray(resData) && resData[0]) {
            const generatedId = resData[0].id || resData[0].id_obra;
            if (generatedId) recordToSave.id = String(generatedId);
          }
        }
      } else {
        await fetch(`${url}?id=eq.${recordToSave.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbPayload),
        });
      }
    } catch (e) {
      console.warn(`Direct REST save error on "${primaryCand}":`, e);
    }
  }

  // Update local storage cache
  const storedStr = localStorage.getItem(`geyt_table_${tableName}`);
  let list: any[] = storedStr ? JSON.parse(storedStr) : [];
  const existingIdx = list.findIndex((item) => item.id === recordToSave.id);
  if (existingIdx >= 0) {
    list[existingIdx] = recordToSave;
  } else {
    list.unshift(recordToSave);
  }
  localStorage.setItem(`geyt_table_${tableName}`, JSON.stringify(list));

  return recordToSave as T;
}

// Helper to delete a record directly in Supabase
export async function deleteRecord(tableName: string, id: string): Promise<boolean> {
  const candidates = TABLE_CANDIDATES[tableName] || [tableName];
  const primaryCand = candidates[0];
  let deletedSuccessfully = false;

  try {
    const { error } = await supabase.from(primaryCand).delete().eq('id', id);
    if (!error) {
      deletedSuccessfully = true;
    } else {
      const { error: errObra } = await supabase.from(primaryCand).delete().eq('id_obra', id);
      if (!errObra) deletedSuccessfully = true;
    }
  } catch (err) {
    console.warn(`Supabase client delete failed on "${primaryCand}":`, err);
  }

  if (!deletedSuccessfully) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${primaryCand}?id=eq.${id}`;
      await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
    } catch (e) {
      console.warn(`Direct REST delete error on "${primaryCand}":`, e);
    }
  }

  const storedStr = localStorage.getItem(`geyt_table_${tableName}`);
  if (storedStr) {
    let list: any[] = JSON.parse(storedStr);
    list = list.filter((item) => item.id !== id);
    localStorage.setItem(`geyt_table_${tableName}`, JSON.stringify(list));
  }
  return true;
}
