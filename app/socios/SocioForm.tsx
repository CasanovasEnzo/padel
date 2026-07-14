import type { Cancha, Club, Socio } from "@/lib/supabase/types";

const inputClass =
  "rounded border border-black/[.15] dark:border-white/[.2] bg-transparent px-3 py-2 text-sm";

type Props = {
  clubes: Club[];
  canchas: Cancha[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  defaultValues?: Partial<Socio>;
  canchaIdsSeleccionadas?: string[];
};

export default function SocioForm({
  clubes,
  canchas,
  action,
  submitLabel,
  defaultValues,
  canchaIdsSeleccionadas = [],
}: Props) {
  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Nombre *
        <input
          name="nombre"
          required
          defaultValue={defaultValues?.nombre ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Apodo
        <input
          name="apodo"
          defaultValue={defaultValues?.apodo ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          defaultValue={defaultValues?.email ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Teléfono
        <input
          name="telefono"
          defaultValue={defaultValues?.telefono ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Categoría
        <input
          name="categoria"
          defaultValue={defaultValues?.categoria ?? ""}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Club *
        <select
          name="club_id"
          required
          defaultValue={defaultValues?.club_id ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Elegí un club
          </option>
          {clubes.map((club) => (
            <option key={club.id} value={club.id}>
              {club.nombre}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-1 text-sm">
        <legend>Canchas donde juega</legend>
        {canchas.map((cancha) => (
          <label key={cancha.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="cancha_ids"
              value={cancha.id}
              defaultChecked={canchaIdsSeleccionadas.includes(cancha.id)}
            />
            {cancha.nombre}
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1 text-sm">
        Bio
        <textarea
          name="bio"
          rows={3}
          defaultValue={defaultValues?.bio ?? ""}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        className="mt-2 self-start rounded-full bg-foreground px-4 py-2 text-sm text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
