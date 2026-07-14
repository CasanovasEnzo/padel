import Link from "next/link";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/socios", label: "Socios" },
  { href: "/ranking", label: "Ranking" },
  { href: "/partidos", label: "Partidos" },
];

export default function NavBar() {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
        <span className="font-semibold">🎾 Padel</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm hover:underline hover:underline-offset-4"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
