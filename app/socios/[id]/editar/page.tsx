import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SocioForm from "../../SocioForm";
import { actualizarSocio } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditarSocioPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [
    { data: socio, error: socioError },
    { data: clubes, error: clubesError },
    { data: canchas, error: canchasError },
    { data: socioCanchas, error: socioCanchasError },
  ] = await Promise.all([
    supabase.from("socios").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("clubes").select("*").order("nombre"),
    supabase.from("canchas").select("*").order("nombre"),
    supabase.from("socio_canchas").select("cancha_id").eq("socio_id", params.id),
  ]);

  if (socioError) throw new Error(socioError.message);
  if (clubesError) throw new Error(clubesError.message);
  if (canchasError) throw new Error(canchasError.message);
  if (socioCanchasError) throw new Error(socioCanchasError.message);
  if (!socio) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Editar socio</h1>
      <SocioForm
        clubes={clubes}
        canchas={canchas}
        defaultValues={socio}
        canchaIdsSeleccionadas={socioCanchas.map((sc) => sc.cancha_id)}
        action={actualizarSocio.bind(null, params.id)}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
