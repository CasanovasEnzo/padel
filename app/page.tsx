export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Padel</h1>
      <p className="text-sm text-black/70 dark:text-white/70">
        Gestión de socios, ranking amateur y perfiles de jugador. MVP en
        construcción — próximo paso: conectar Supabase y cargar el primer
        club.
      </p>
    </div>
  );
}
