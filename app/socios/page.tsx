import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { eliminarSocio } from "./actions";

export const dynamic = "force-dynamic";

export default async function SociosPage() {
  const supabase = createClient();
  const { data: socios, error } = await supabase
    .from("socios")
    .select("*, clubes(nombre), socio_canchas(canchas(nombre))")
    .order("nombre");

  if (error) throw new Error(error.message);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Socios</h1>
        <Link
          href="/socios/nuevo"
          className="rounded-full bg-foreground px-4 py-2 text-sm text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          + Nuevo socio
        </Link>
      </div>

      {socios.length === 0 ? (
        <p className="text-sm text-black/70 dark:text-white/70">
          Todavía no hay socios cargados.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[.08] dark:border-white/[.145]">
              <th className="py-2 pr-4">Nombre</th>
              <th className="py-2 pr-4">Categoría</th>
              <th className="py-2 pr-4">Club</th>
              <th className="py-2 pr-4">Canchas</th>
              <th className="py-2 pr-4">Puntos</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {socios.map((socio) => (
              <tr
                key={socio.id}
                className="border-b border-black/[.08] dark:border-white/[.145]"
              >
                <td className="py-2 pr-4">
                  {socio.nombre}
                  {socio.apodo ? ` (${socio.apodo})` : ""}
                </td>
                <td className="py-2 pr-4">{socio.categoria ?? "—"}</td>
                <td className="py-2 pr-4">{socio.clubes?.nombre ?? "—"}</td>
                <td className="py-2 pr-4">
                  {socio.socio_canchas
                    .map((sc: { canchas: { nombre: string } | null }) => sc.canchas?.nombre)
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>
                <td className="py-2 pr-4">{socio.puntos_totales}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-3">
                    <Link
                      href={`/socios/${socio.id}/editar`}
                      className="hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={eliminarSocio.bind(null, socio.id)}>
                      <button type="submit" className="hover:underline">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
