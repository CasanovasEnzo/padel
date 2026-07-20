import { createClient } from "@/lib/supabase/server";
import { crearPartido } from "../actions";

export const dynamic = "force-dynamic";

const inputClass =
  "rounded border border-black/[.15] dark:border-white/[.2] bg-transparent px-3 py-2 text-sm";
const selectClass = inputClass;

export default async function NuevoPartidoPage() {
  const supabase = createClient();
  const [{ data: canchas, error: canchasError }, { data: socios, error: sociosError }] =
    await Promise.all([
      supabase.from("canchas").select("*").order("nombre"),
      supabase.from("socios").select("*").order("nombre"),
    ]);

  if (canchasError) throw new Error(canchasError.message);
  if (sociosError) throw new Error(sociosError.message);

  if (socios.length < 4) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Nuevo partido</h1>
        <p className="text-sm text-black/70 dark:text-white/70">
          Hacen falta al menos 4 socios cargados para armar un partido de
          dobles. Cargalos primero desde{" "}
          <a href="/socios" className="underline">
            Socios
          </a>
          .
        </p>
      </div>
    );
  }

  const jugadorSelect = (name: string) => (
    <select name={name} required defaultValue="" className={selectClass}>
      <option value="" disabled>
        Elegí un socio
      </option>
      {socios.map((socio) => (
        <option key={socio.id} value={socio.id}>
          {socio.nombre}
          {socio.apodo ? ` (${socio.apodo})` : ""}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nuevo partido</h1>
      <form action={crearPartido} className="flex max-w-lg flex-col gap-6">
        <label className="flex flex-col gap-1 text-sm">
          Cancha *
          <select name="cancha_id" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Elegí una cancha
            </option>
            {canchas.map((cancha) => (
              <option key={cancha.id} value={cancha.id}>
                {cancha.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Categoría
          <input name="categoria" className={inputClass} />
        </label>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="font-medium">Tipo de partido *</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="tipo" value="amateur" required />
            Amateur — el 3er set, si hace falta, es un súper tie-break a 10
            puntos
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="tipo" value="amistoso" required />
            Amistoso — el 3er set, si hace falta, se juega completo
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="font-medium">Equipo 1</legend>
          {jugadorSelect("equipo1_jugador1")}
          {jugadorSelect("equipo1_jugador2")}
        </fieldset>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="font-medium">Equipo 2</legend>
          {jugadorSelect("equipo2_jugador1")}
          {jugadorSelect("equipo2_jugador2")}
        </fieldset>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="font-medium">Resultado</legend>
          <p className="text-xs text-black/60 dark:text-white/60">
            Sets 1 y 2: hasta 6 games (diferencia de 2) o 7-6 con tie-break.
            Set 3 (si el partido queda 1-1): súper tie-break a 10 puntos en
            partidos amateur, o set completo en amistosos.
          </p>
          {[1, 2].map((set) => (
            <div key={set} className="flex items-center gap-2">
              <span className="w-12">Set {set}</span>
              <input
                type="number"
                min={0}
                max={7}
                name={`set${set}_equipo1`}
                required={set === 1}
                className={`${inputClass} w-16`}
                aria-label={`Set ${set} equipo 1`}
              />
              <span>-</span>
              <input
                type="number"
                min={0}
                max={7}
                name={`set${set}_equipo2`}
                required={set === 1}
                className={`${inputClass} w-16`}
                aria-label={`Set ${set} equipo 2`}
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-12">Set 3</span>
            <input
              type="number"
              min={0}
              max={30}
              name="set3_equipo1"
              className={`${inputClass} w-16`}
              aria-label="Set 3 equipo 1"
            />
            <span>-</span>
            <input
              type="number"
              min={0}
              max={30}
              name="set3_equipo2"
              className={`${inputClass} w-16`}
              aria-label="Set 3 equipo 2"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="self-start rounded-full bg-foreground px-4 py-2 text-sm text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Cargar partido
        </button>
      </form>
    </div>
  );
}
