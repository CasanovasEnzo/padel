export type SetResultado = {
  equipo_1: number;
  equipo_2: number;
};

const PUNTOS_BASE_VICTORIA = 10;
const PUNTOS_BASE_DERROTA = 2;
const BONUS_DIFERENCIA_MIN = -5;
const BONUS_DIFERENCIA_MAX = 10;

/**
 * Puntos por partido = base por resultado (victoria/derrota) + bonus según la
 * diferencia acumulada de games a favor/en contra, acotado para que una
 * goleada puntual no desestabilice el ranking.
 */
export function calcularPuntosPartido(
  resultadoSets: SetResultado[],
  equipo: 1 | 2,
) {
  const rival = equipo === 1 ? 2 : 1;

  const setsGanados = resultadoSets.filter(
    (set) => set[`equipo_${equipo}`] > set[`equipo_${rival}`],
  ).length;
  const gano = setsGanados > resultadoSets.length / 2;

  const diferenciaGames = resultadoSets.reduce(
    (acc, set) => acc + (set[`equipo_${equipo}`] - set[`equipo_${rival}`]),
    0,
  );
  const bonusDiferencia = Math.max(
    BONUS_DIFERENCIA_MIN,
    Math.min(BONUS_DIFERENCIA_MAX, diferenciaGames),
  );

  const puntosBase = gano ? PUNTOS_BASE_VICTORIA : PUNTOS_BASE_DERROTA;

  return {
    gano,
    puntosBase,
    bonusDiferencia,
    total: puntosBase + bonusDiferencia,
  };
}
