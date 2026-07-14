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
