import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { IS_SUPABASE_CONFIGURED } from "@/lib/env";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="font-display text-2xl uppercase text-fog">Administration</h1>
            <p className="text-sm text-fog-muted">Connexion réservée au propriétaire du site.</p>
          </div>
        </div>

        {IS_SUPABASE_CONFIGURED ? (
          <Suspense fallback={<p className="text-center text-sm text-fog-muted">Chargement…</p>}>
            <LoginForm />
          </Suspense>
        ) : (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Supabase n&apos;est pas encore configuré. Renseigne les variables dans{" "}
            <code>.env.local</code> puis relance le serveur (voir le README).
          </p>
        )}

        <Link
          href="/"
          className="mt-8 block text-center text-xs uppercase tracking-widest text-fog-muted hover:text-fog"
        >
          ← Retour au site
        </Link>
      </div>
    </div>
  );
}
