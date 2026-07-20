export type Club = {
  id: string;
  nombre: string;
  direccion: string | null;
  created_at: string;
};

export type Cancha = {
  id: string;
  club_id: string;
  nombre: string;
  created_at: string;
};

export type Socio = {
  id: string;
  club_id: string;
  nombre: string;
  apodo: string | null;
  email: string | null;
  telefono: string | null;
  fecha_alta: string;
  categoria: string | null;
  avatar_id: string | null;
  bio: string | null;
  puntos_totales: number;
  created_at: string;
};

export type SetResultado = {
  equipo_1: number;
  equipo_2: number;
  // Solo aplica al 3er set de un partido amateur: en vez de jugarse un set
  // completo, se define con un punto de oro a 10 (diferencia de 2).
  super_tiebreak?: boolean;
};

export type TipoPartido = "amateur" | "amistoso";

export type Partido = {
  id: string;
  club_id: string;
  cancha_id: string;
  fecha: string;
  categoria: string | null;
  tipo: TipoPartido;
  resultado_sets: SetResultado[];
  estado: "jugado" | "cancelado";
  created_at: string;
};

export type PartidoJugador = {
  id: string;
  partido_id: string;
  socio_id: string;
  equipo: 1 | 2;
  created_at: string;
};

export type PuntosHistorial = {
  id: string;
  partido_id: string;
  socio_id: string;
  puntos_delta: number;
  puntos_previos: number;
  puntos_nuevos: number;
  created_at: string;
};
