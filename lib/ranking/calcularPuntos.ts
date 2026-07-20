import type { SetResultado, TipoPartido } from "@/lib/supabase/types";

const PUNTOS_VICTORIA = 10;
const PUNTOS_DERROTA = 2;

function equipoGanadorSet(set: SetResultado): 1 | 2 | null {
  const { equipo_1, equipo_2 } = set;
  if (equipo_1 === equipo_2) return null;

  const equipo = equipo_1 > equipo_2 ? 1 : 2;
  const ganador = Math.max(equipo_1, equipo_2);
  const perdedor = Math.min(equipo_1, equipo_2);

  const esValido = set.super_tiebreak
    ? ganador >= 10 && ganador - perdedor >= 2
    : (ganador === 6 && perdedor <= 4) ||
      (ganador === 7 && (perdedor === 5 || perdedor === 6));

  return esValido ? equipo : null;
}

/**
 * Valida un resultado de partido (mejor de 3 sets) y devuelve el equipo
 * ganador. En partidos "amateur" el 3er set, cuando hace falta, se juega
 * como súper tie-break a 10 puntos; en "amistoso" se juega un set completo.
 */
export function determinarGanadorPartido(
  sets: SetResultado[],
  tipo: TipoPartido,
): 1 | 2 {
  if (sets.length < 2 || sets.length > 3) {
    throw new Error("Un partido se define a 2 o 3 sets");
  }

  const [set1, set2, set3] = sets;

  if (set1.super_tiebreak || set2.super_tiebreak) {
    throw new Error("El súper tie-break solo puede jugarse como 3er set");
  }

  const ganador1 = equipoGanadorSet(set1);
  if (!ganador1) throw new Error("El resultado del set 1 no es válido");
  const ganador2 = equipoGanadorSet(set2);
  if (!ganador2) throw new Error("El resultado del set 2 no es válido");

  if (ganador1 === ganador2) {
    if (set3) {
      throw new Error("El partido ya se definió en 2 sets, no corresponde un 3ro");
    }
    return ganador1;
  }

  if (!set3) {
    throw new Error(
      tipo === "amateur"
        ? "Falta el súper tie-break para definir el partido"
        : "Falta el 3er set para definir el partido",
    );
  }

  const esperaSuperTiebreak = tipo === "amateur";
  if (Boolean(set3.super_tiebreak) !== esperaSuperTiebreak) {
    throw new Error(
      esperaSuperTiebreak
        ? "En partidos amateur el desempate se juega como súper tie-break a 10 puntos"
        : "En partidos amistosos el 3er set se juega completo, no como súper tie-break",
    );
  }

  const ganador3 = equipoGanadorSet(set3);
  if (!ganador3) {
    throw new Error(
      set3.super_tiebreak
        ? "El resultado del súper tie-break no es válido"
        : "El resultado del set 3 no es válido",
    );
  }
  return ganador3;
}

/** Puntos de ranking fijos: no dependen de la diferencia de games. */
export function calcularPuntosEquipo(equipo: 1 | 2, ganador: 1 | 2) {
  const gano = equipo === ganador;
  return { gano, total: gano ? PUNTOS_VICTORIA : PUNTOS_DERROTA };
}
