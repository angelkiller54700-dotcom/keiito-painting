import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6 text-center">
      <div>
        <p className="font-brush text-3xl text-violet-bright">Oups</p>
        <h1 className="mt-2 font-display text-5xl uppercase text-fog">Page introuvable</h1>
        <p className="mt-3 text-sm text-fog-muted">
          Cette page a peut-être été déplacée ou n&apos;existe plus.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
