-- Tipo de partido: define cómo se resuelve el 3er set cuando el resultado
-- queda 1-1 en sets. "amateur" usa súper tie-break a 10 puntos; "amistoso"
-- juega el 3er set completo.
alter table partidos
  add column tipo text not null default 'amistoso' check (tipo in ('amateur', 'amistoso'));
