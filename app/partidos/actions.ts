"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  calcularPuntosEquipo,
  determinarGanadorPartido,
} from "@/lib/ranking/calcularPuntos";
import type { SetResultado, TipoPartido } from "@/lib/supabase/types";

function parseSets(formData: FormData, tipo: TipoPartido): SetResultado[] {
  const sets: SetResultado[] = [];
  for (let i = 1; i <= 3; i++) {
    const equipo1 = formData.get(`set${i}_equipo1`);
    const equipo2 = formData.get(`set${i}_equipo2`);
    if (equipo1 === "" || equipo2 === "" || equipo1 === null || equipo2 === null) continue;
    const set: SetResultado = { equipo_1: Number(equipo1), equipo_2: Number(equipo2) };
    if (i === 3 && tipo === "amateur") set.super_tiebreak = true;
    sets.push(set);
  }
  return sets;
}

export async function crearPartido(formData: FormData) {
  const supabase = createClient();

  const canchaId = formData.get("cancha_id") as string;
  const categoria = (formData.get("categoria") as string)?.trim() || null;
  const tipo = formData.get("tipo") as TipoPartido;
  if (tipo !== "amateur" && tipo !== "amistoso") {
    throw new Error("Elegí el tipo de partido");
  }
  const jugadoresEquipo1 = [
    formData.get("equipo1_jugador1") as string,
    formData.get("equipo1_jugador2") as string,
  ];
  const jugadoresEquipo2 = [
    formData.get("equipo2_jugador1") as string,
    formData.get("equipo2_jugador2") as string,
  ];
  const todosLosJugadores = [...jugadoresEquipo1, ...jugadoresEquipo2];

  if (new Set(todosLosJugadores).size !== 4) {
    throw new Error("Los 4 jugadores deben ser socios distintos");
  }

  const sets = parseSets(formData, tipo);
  const ganador = determinarGanadorPartido(sets, tipo);

  const { data: cancha, error: canchaError } = await supabase
    .from("canchas")
    .select("club_id")
    .eq("id", canchaId)
    .single();
  if (canchaError || !cancha) throw new Error(canchaError?.message ?? "Cancha inválida");

  const { data: partido, error: partidoError } = await supabase
    .from("partidos")
    .insert({
      club_id: cancha.club_id,
      cancha_id: canchaId,
      categoria,
      tipo,
      resultado_sets: sets,
    })
    .select("id")
    .single();
  if (partidoError) throw new Error(partidoError.message);

  const jugadoresRows = [
    ...jugadoresEquipo1.map((socio_id) => ({ partido_id: partido.id, socio_id, equipo: 1 })),
    ...jugadoresEquipo2.map((socio_id) => ({ partido_id: partido.id, socio_id, equipo: 2 })),
  ];
  const { error: jugadoresError } = await supabase
    .from("partido_jugadores")
    .insert(jugadoresRows);
  if (jugadoresError) throw new Error(jugadoresError.message);

  const { data: sociosActuales, error: sociosError } = await supabase
    .from("socios")
    .select("id, puntos_totales")
    .in("id", todosLosJugadores);
  if (sociosError) throw new Error(sociosError.message);

  const puntosPreviosPorSocio = new Map(
    sociosActuales.map((s) => [s.id, s.puntos_totales]),
  );

  const historialRows = jugadoresRows.map(({ socio_id, equipo }) => {
    const puntosPrevios = puntosPreviosPorSocio.get(socio_id) ?? 0;
    const { total } = calcularPuntosEquipo(equipo as 1 | 2, ganador);
    return {
      partido_id: partido.id,
      socio_id,
      puntos_delta: total,
      puntos_previos: puntosPrevios,
      puntos_nuevos: puntosPrevios + total,
    };
  });

  const { error: historialError } = await supabase
    .from("puntos_historial")
    .insert(historialRows);
  if (historialError) throw new Error(historialError.message);

  revalidatePath("/partidos");
  revalidatePath("/socios");
  redirect("/partidos");
}
