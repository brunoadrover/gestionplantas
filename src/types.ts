export interface Capa {
  id: string;
  capa: string;
}

export interface Componente {
  id: string;
  nmb_componente: string;
}

export interface Disposicion {
  id: string;
  disposicion: string;
}

export interface Estado {
  id: string;
  estado: string; // e.g. "PENDIENTE", "EN PROCESO", "FINALIZADO"
}

export interface EstadoRepuestos {
  id: string;
  estadorep: string; // e.g. "Solicitado", "En Camino", "Entregado", "Cancelado"
}

export interface MotivoParada {
  id: string;
  motivo: string;
  comentario?: string;
}

export interface Obra {
  id: string;
  numero: number;
  descripcion: string;
}

export interface Operador {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export interface Producto {
  id: string;
  producto: string;
}

export interface TipoPlanta {
  id: string;
  tipo_planta: string;
}

export interface TipoMant {
  id: string;
  tipo: string;
}

export interface Planta {
  id: string;
  interno: string;
  marca: string;
  modelo: string;
  id_tipo: string;
  capacidad: number;
  año: number;
  descripcion?: string;
  tn_acumuladas: number;
  horas: number;
  id_obras?: string;
  estado?: string;
  // joined fields
  tipo_rel?: TipoPlanta;
  obra_rel?: Obra;
}

export interface UserLog {
  id: string;
  usuario: string;
  pass: string;
  rol: 'ADMIN' | 'USER' | string;
  id_planta?: string;
  // joined fields
  planta_rel?: Planta;
}

export interface Produccion {
  id: string;
  id_plantas: string;
  id_operador?: string;
  fecha: string; // YYYY-MM-DD
  hs_inicio?: string; // HH:MM
  hs_fin?: string; // HH:MM
  tn_producidas: number;
  hs_parada?: number;
  id_motivo_parada?: string;
  motivo_otro?: string;
  observaciones?: string;
  id_obras?: string;
  calderista_1?: string;
  calderista_2?: string;
  calderista_3?: string;
  calderista_4?: string;
  id_capa?: string;
  // Joined fields
  planta_rel?: Planta;
  operador_rel?: Operador;
  motivo_rel?: MotivoParada;
  obra_rel?: Obra;
  capa_rel?: Capa;
}

export interface RepuestoPedido {
  id: string;
  fecha_pedido?: string;
  fecha_necesidad?: string;
  fecha_entrega?: string;
  descripcion: string;
  id_componente?: string;
  id_planta?: string;
  cantidad: number;
  proveedor?: string;
  costo?: number;
  id_estadorepuestos?: string;
  // Joined
  componente_rel?: Componente;
  planta_rel?: Planta;
  estado_rep_rel?: EstadoRepuestos;
}

export interface Silo {
  id: string;
  id_plantas: string;
  denominacion: string;
  tipo?: string;
  capacidad: number;
  descripcion?: string;
  id_disposicion?: string;
  diametro?: number;
  longitud?: number;
  altura_total?: number;
  altura_vacio?: number;
  fecha_actualizacion_vacio?: string;
  stock: number;
  id_producto?: string;
  // Joined
  planta_rel?: Planta;
  disposicion_rel?: Disposicion;
  producto_rel?: Producto;
}

export interface StockInsumo {
  id: string;
  descripcion: string;
  id_componente: string;
  id_planta: string;
  cant_minima: number;
  cant_actual: number;
  // Joined
  componente_rel?: Componente;
  planta_rel?: Planta;
}

export interface Tanque {
  id: string;
  id_plantas: string;
  denominacion: string;
  marca?: string;
  tipo?: string;
  capacidad: number;
  descripcion?: string;
  caldera?: boolean;
  calefaccionado?: boolean;
  agitadores?: boolean;
  id_disposicion?: string;
  diametro?: number;
  longitud?: number;
  altura_total?: number;
  altura_vacio?: number;
  fecha_actualizacion_vacio?: string;
  stock: number;
  id_producto?: string;
  // Joined
  planta_rel?: Planta;
  disposicion_rel?: Disposicion;
  producto_rel?: Producto;
}

export interface Mantenimiento {
  id: string;
  id_plantas: string;
  id_componente?: string;
  id_tipomant?: string;
  fecha: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_repuesto_pedido?: string;
  id_estado?: string;
  comentarios?: string;
  // Joined
  planta_rel?: Planta;
  componente_rel?: Componente;
  tipomant_rel?: TipoMant;
  estado_rel?: Estado;
  repuesto_rel?: RepuestoPedido;
}
