-- Semilla mínima para poder dar de alta socios: un club y una cancha de
-- ejemplo. Renombrarlos (o reemplazarlos por los reales) desde Supabase o
-- desde el futuro CRUD de clubes/canchas.

insert into clubes (nombre, direccion)
select 'Mi Club', null
where not exists (select 1 from clubes);

insert into canchas (club_id, nombre)
select c.id, 'Cancha 1'
from clubes c
where c.nombre = 'Mi Club'
  and not exists (select 1 from canchas where nombre = 'Cancha 1');
