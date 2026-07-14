"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function campoOpcional(formData: FormData, nombre: string) {
  const valor = formData.get(nombre);
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
}

export async function crearSocio(formData: FormData) {
  const supabase = createClient();
  const canchaIds = formData.getAll("cancha_ids").filter(Boolean) as string[];

  const { data: socio, error } = await supabase
    .from("socios")
    .insert({
      club_id: formData.get("club_id") as string,
      nombre: (formData.get("nombre") as string).trim(),
      apodo: campoOpcional(formData, "apodo"),
      email: campoOpcional(formData, "email"),
      telefono: campoOpcional(formData, "telefono"),
      categoria: campoOpcional(formData, "categoria"),
      bio: campoOpcional(formData, "bio"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (canchaIds.length > 0) {
    const { error: canchasError } = await supabase.from("socio_canchas").insert(
      canchaIds.map((cancha_id) => ({ socio_id: socio.id, cancha_id })),
    );
    if (canchasError) throw new Error(canchasError.message);
  }

  revalidatePath("/socios");
  redirect("/socios");
}

export async function actualizarSocio(id: string, formData: FormData) {
  const supabase = createClient();
  const canchaIds = formData.getAll("cancha_ids").filter(Boolean) as string[];

  const { error } = await supabase
    .from("socios")
    .update({
      club_id: formData.get("club_id") as string,
      nombre: (formData.get("nombre") as string).trim(),
      apodo: campoOpcional(formData, "apodo"),
      email: campoOpcional(formData, "email"),
      telefono: campoOpcional(formData, "telefono"),
      categoria: campoOpcional(formData, "categoria"),
      bio: campoOpcional(formData, "bio"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const { error: deleteError } = await supabase
    .from("socio_canchas")
    .delete()
    .eq("socio_id", id);
  if (deleteError) throw new Error(deleteError.message);

  if (canchaIds.length > 0) {
    const { error: canchasError } = await supabase.from("socio_canchas").insert(
      canchaIds.map((cancha_id) => ({ socio_id: id, cancha_id })),
    );
    if (canchasError) throw new Error(canchasError.message);
  }

  revalidatePath("/socios");
  redirect("/socios");
}

export async function eliminarSocio(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("socios").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/socios");
}
