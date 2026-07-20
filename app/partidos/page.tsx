import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { SetResultado } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function formatearSets(sets: SetResultado[]) {
  return sets
    .map((s) =>
      s.super_tiebreak ? `STB ${s.equipo_1}-${s.equipo_2}` : `${s.equipo_1}-${s.equipo_2}`,
    )
    .join(", ");
}

export default async function PartidosPage() {
  const supabase = createClient();
  const { data: partidos, error } = await supabase
    .from("partidos")
    .select(
      "*, canchas(nombre), partido_jugadores(equipo, socios(id, nombre, apodo)), puntos_historial(socio_id, puntos_delta)",
    )
    .order("fecha", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Partidos</h1>
        <Link
          href="/partidos/nuevo"
          className="rounded-full bg-foreground px-4 py-2 text-sm text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          + Nuevo partido
        </Link>
      </div>

      {partidos.length === 0 ? (
        <p className="text-sm text-black/70 dark:text-white/70">
          Todavía no hay partidos cargados.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {partidos.map((partido) => {
            const equipo1 = partido.partido_jugadores.filter(
              (pj: { equipo: number }) => pj.equipo === 1,
            );
            const equipo2 = partido.partido_jugadores.filter(
              (pj: { equipo: number }) => pj.equipo === 2,
            );
            const puntosPorSocio = new Map<string, number>(
              partido.puntos_historial.map(
                (ph: { socio_id: string; puntos_delta: number }): [string, number] => [
                  ph.socio_id,
                  ph.puntos_delta,
                ],
              ),
            );

            const nombreJugador = (pj: {
              socios: { id: string; nombre: string; apodo: string | null } | null;
            }) => {
              const delta = pj.socios ? puntosPorSocio.get(pj.socios.id) : undefined;
              const signo = delta !== undefined && delta >= 0 ? "+" : "";
              return `${pj.socios?.nombre ?? "?"}${
                delta !== undefined ? ` (${signo}${delta})` : ""
              }`;
            };

            return (
              <div
                key={partido.id}
                className="rounded border border-black/[.08] p-4 text-sm dark:border-white/[.145]"
              >
                <div className="flex items-center justify-between text-xs text-black/60 dark:text-white/60">
                  <span>
                    {new Date(partido.fecha).toLocaleDateString("es-AR")} ·{" "}
                    {partido.canchas?.nombre ?? "—"} ·{" "}
                    {partido.tipo === "amateur" ? "Amateur" : "Amistoso"}
                    {partido.categoria ? ` · ${partido.categoria}` : ""}
                  </span>
                  <span>{formatearSets(partido.resultado_sets)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span>{equipo1.map(nombreJugador).join(" / ")}</span>
                  <span className="text-black/40 dark:text-white/40">vs</span>
                  <span>{equipo2.map(nombreJugador).join(" / ")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
