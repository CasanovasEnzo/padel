-- Padel MVP schema: multi-club, dobles-only, ranking por diferencia de sets/games.
--
-- NOTA: las policies "dev_allow_all" al final son un placeholder para desarrollo
-- local sin auth todavia. Antes de exponer el proyecto (o de tener mas de un club
-- real usando el sistema) hay que reemplazarlas por policies que aislen datos por
-- club_id segun el mecanismo de auth que se elija.

create extension if not exists pgcrypto;

-- ============================================================================
-- Clubes / canchas
-- ============================================================================

create table clubes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  created_at timestamptz not null default now()
);

create table canchas (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubes(id) on delete cascade,
  nombre text not null,
  created_at timestamptz not null default now()
);

create index canchas_club_id_idx on canchas(club_id);

-- ============================================================================
-- Avatares (set predefinido de ilustraciones)
-- ============================================================================

create table avatares_preset (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  url_imagen text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Socios
-- ============================================================================

create table socios (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubes(id) on delete cascade,
  nombre text not null,
  apodo text,
  email text,
  telefono text,
  fecha_alta date not null default current_date,
  categoria text,
  avatar_id uuid references avatares_preset(id),
  bio text,
  puntos_totales integer not null default 0,
  created_at timestamptz not null default now()
);

create index socios_club_id_idx on socios(club_id);

-- Un socio puede jugar en mas de una cancha (incluso de otros clubes).
create table socio_canchas (
  socio_id uuid not null references socios(id) on delete cascade,
  cancha_id uuid not null references canchas(id) on delete cascade,
  primary key (socio_id, cancha_id)
);

-- ============================================================================
-- Partidos (dobles: 2 equipos de 2 jugadores)
-- ============================================================================

create table partidos (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubes(id) on delete cascade,
  cancha_id uuid not null references canchas(id) on delete cascade,
  fecha timestamptz not null default now(),
  categoria text,
  -- Array de sets: [{"equipo_1": 6, "equipo_2": 4}, ...]
  resultado_sets jsonb not null,
  estado text not null default 'jugado' check (estado in ('jugado', 'cancelado')),
  created_at timestamptz not null default now()
);

create index partidos_club_id_idx on partidos(club_id);
create index partidos_cancha_id_idx on partidos(cancha_id);

create table partido_jugadores (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  socio_id uuid not null references socios(id) on delete cascade,
  equipo smallint not null check (equipo in (1, 2)),
  created_at timestamptz not null default now(),
  unique (partido_id, socio_id)
);

create index partido_jugadores_partido_id_idx on partido_jugadores(partido_id);
create index partido_jugadores_socio_id_idx on partido_jugadores(socio_id);

-- ============================================================================
-- Puntos: historial (trazabilidad) + total denormalizado en socios
-- ============================================================================

create table puntos_historial (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  socio_id uuid not null references socios(id) on delete cascade,
  puntos_delta integer not null,
  puntos_previos integer not null,
  puntos_nuevos integer not null,
  created_at timestamptz not null default now()
);

create index puntos_historial_socio_id_idx on puntos_historial(socio_id);
create index puntos_historial_partido_id_idx on puntos_historial(partido_id);

-- Mantiene socios.puntos_totales sincronizado cada vez que se registra un
-- movimiento de puntos, para poder ordenar el ranking general sin agregar.
create function fn_sync_puntos_totales() returns trigger as $$
begin
  update socios set puntos_totales = new.puntos_nuevos where id = new.socio_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_sync_puntos_totales
  after insert on puntos_historial
  for each row execute function fn_sync_puntos_totales();

-- ============================================================================
-- Vistas de ranking por cancha / categoria (agregan puntos_historial en vivo,
-- ya que el total en socios solo sirve para el ranking general).
-- ============================================================================

create view v_ranking_por_cancha as
select
  sc.cancha_id,
  ph.socio_id,
  sum(ph.puntos_delta) as puntos,
  count(*) as partidos_jugados
from puntos_historial ph
join partido_jugadores pj on pj.partido_id = ph.partido_id and pj.socio_id = ph.socio_id
join partidos p on p.id = ph.partido_id
join socio_canchas sc on sc.socio_id = ph.socio_id and sc.cancha_id = p.cancha_id
group by sc.cancha_id, ph.socio_id;

create view v_ranking_por_categoria as
select
  p.categoria,
  ph.socio_id,
  sum(ph.puntos_delta) as puntos,
  count(*) as partidos_jugados
from puntos_historial ph
join partidos p on p.id = ph.partido_id
where p.categoria is not null
group by p.categoria, ph.socio_id;

-- ============================================================================
-- RLS (placeholder de desarrollo -- ver nota al inicio del archivo)
-- ============================================================================

alter table clubes enable row level security;
alter table canchas enable row level security;
alter table avatares_preset enable row level security;
alter table socios enable row level security;
alter table socio_canchas enable row level security;
alter table partidos enable row level security;
alter table partido_jugadores enable row level security;
alter table puntos_historial enable row level security;

create policy "dev_allow_all" on clubes for all using (true) with check (true);
create policy "dev_allow_all" on canchas for all using (true) with check (true);
create policy "dev_allow_all" on avatares_preset for all using (true) with check (true);
create policy "dev_allow_all" on socios for all using (true) with check (true);
create policy "dev_allow_all" on socio_canchas for all using (true) with check (true);
create policy "dev_allow_all" on partidos for all using (true) with check (true);
create policy "dev_allow_all" on partido_jugadores for all using (true) with check (true);
create policy "dev_allow_all" on puntos_historial for all using (true) with check (true);
