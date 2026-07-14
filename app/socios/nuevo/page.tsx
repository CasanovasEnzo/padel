import { createClient } from "@/lib/supabase/server";
import SocioForm from "../SocioForm";
import { crearSocio } from "../actions";

export const dynamic = "force-dynamic";

export default async function NuevoSocioPage() {
  const supabase = createClient();
  const [{ data: clubes, error: clubesError }, { data: canchas, error: canchasError }] =
    await Promise.all([
      supabase.from("clubes").select("*").order("nombre"),
      supabase.from("canchas").select("*").order("nombre"),
    ]);

  if (clubesError) throw new Error(clubesError.message);
  if (canchasError) throw new Error(canchasError.message);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nuevo socio</h1>
      <SocioForm
        clubes={clubes}
        canchas={canchas}
        action={crearSocio}
        submitLabel="Crear socio"
      />
    </div>
  );
}
