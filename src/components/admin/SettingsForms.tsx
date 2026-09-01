"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { updateSetting, updateAccount } from "@/lib/actions/settings";
import type {
  AboutSettings,
  ContactSettings,
  HeroSettings,
  SeoSettings,
  SiteSettings,
  StatsSettings,
} from "@/lib/types";

function SaveBar({ pending, saved }: { pending: boolean; saved: boolean }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button type="submit" className="btn-primary !py-2" disabled={pending}>
        {pending ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : "Enregistrer"}
      </button>
      {saved && <span className="text-xs text-emerald-300">Enregistré ✓</span>}
    </div>
  );
}

function useSaver() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Erreur.");
      else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  return { pending, saved, error, save };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-surface space-y-4 p-5">
      <h2 className="font-display text-sm uppercase tracking-wide text-fog">{title}</h2>
      {children}
    </section>
  );
}

/* ------------------------------- HERO ------------------------------- */
function HeroForm({ value }: { value: HeroSettings }) {
  const [v, setV] = useState(value);
  const { pending, saved, error, save } = useSaver();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(() => updateSetting("hero", v));
      }}
    >
      <Card title="Section Hero (accueil)">
        {error && <p className="text-xs text-red-300">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Petit texte violet" value={v.eyebrow} onChange={(x) => setV({ ...v, eyebrow: x })} />
          <Field label="Grand titre" value={v.title} onChange={(x) => setV({ ...v, title: x })} />
        </div>
        <Field label="Texte manuscrit" value={v.brush} onChange={(x) => setV({ ...v, brush: x })} />
        <Area label="Description" value={v.description} onChange={(x) => setV({ ...v, description: x })} />
        <div className="grid gap-3 sm:grid-cols-3">
          {v.perks.map((p, i) => (
            <div key={i} className="space-y-2 rounded-md border border-ink-border p-3">
              <Field
                label={`Avantage ${i + 1}`}
                value={p.title}
                onChange={(x) => {
                  const perks = [...v.perks];
                  perks[i] = { ...perks[i], title: x };
                  setV({ ...v, perks });
                }}
              />
              <Field
                label="Sous-texte"
                value={p.text}
                onChange={(x) => {
                  const perks = [...v.perks];
                  perks[i] = { ...perks[i], text: x };
                  setV({ ...v, perks });
                }}
              />
            </div>
          ))}
        </div>
        <SaveBar pending={pending} saved={saved} />
      </Card>
    </form>
  );
}

/* ------------------------------- ABOUT ------------------------------- */
function AboutForm({ value }: { value: AboutSettings }) {
  const [v, setV] = useState(value);
  const { pending, saved, error, save } = useSaver();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(() => updateSetting("about", v));
      }}
    >
      <Card title="Section À propos">
        {error && <p className="text-xs text-red-300">{error}</p>}
        <Field label="Titre" value={v.title} onChange={(x) => setV({ ...v, title: x })} />
        <Area label="Texte" value={v.body} onChange={(x) => setV({ ...v, body: x })} rows={5} />
        <div className="grid gap-3 sm:grid-cols-3">
          {v.points.map((p, i) => (
            <div key={i} className="space-y-2 rounded-md border border-ink-border p-3">
              <Field
                label={`Point ${i + 1}`}
                value={p.title}
                onChange={(x) => {
                  const points = [...v.points];
                  points[i] = { ...points[i], title: x };
                  setV({ ...v, points });
                }}
              />
              <Field
                label="Détail"
                value={p.text}
                onChange={(x) => {
                  const points = [...v.points];
                  points[i] = { ...points[i], text: x };
                  setV({ ...v, points });
                }}
              />
            </div>
          ))}
        </div>
        <SaveBar pending={pending} saved={saved} />
      </Card>
    </form>
  );
}

/* ------------------------------- STATS ------------------------------- */
function StatsForm({ value }: { value: StatsSettings }) {
  const [v, setV] = useState(value);
  const { pending, saved, error, save } = useSaver();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(() => updateSetting("stats", v));
      }}
    >
      <Card title="Bandeau de chiffres (accueil)">
        {error && <p className="text-xs text-red-300">{error}</p>}
        <label className="flex items-center gap-2 text-sm text-fog-muted">
          <input
            type="checkbox"
            checked={v.enabled}
            onChange={(e) => setV({ ...v, enabled: e.target.checked })}
            className="h-4 w-4 accent-violet-bright"
          />
          Afficher ce bandeau
        </label>
        <p className="text-xs text-fog-muted">
          Laisse un champ « valeur » vide pour masquer une colonne. N&apos;indique que des chiffres
          réels.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {v.items.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-ink-border p-3">
              <Field
                label="Valeur"
                value={s.value}
                onChange={(x) => {
                  const items = [...v.items];
                  items[i] = { ...items[i], value: x };
                  setV({ ...v, items });
                }}
              />
              <Field
                label="Libellé"
                value={s.label}
                onChange={(x) => {
                  const items = [...v.items];
                  items[i] = { ...items[i], label: x };
                  setV({ ...v, items });
                }}
              />
            </div>
          ))}
        </div>
        <SaveBar pending={pending} saved={saved} />
      </Card>
    </form>
  );
}

/* ------------------------------- CONTACT ------------------------------- */
function ContactForm({ value }: { value: ContactSettings }) {
  const [v, setV] = useState(value);
  const { pending, saved, error, save } = useSaver();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(() => updateSetting("contact", v));
      }}
    >
      <Card title="Contact & réseaux sociaux">
        {error && <p className="text-xs text-red-300">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email public" value={v.email} onChange={(x) => setV({ ...v, email: x })} />
          <Field label="Instagram (URL)" value={v.instagram} onChange={(x) => setV({ ...v, instagram: x })} />
          <Field label="Facebook (URL)" value={v.facebook} onChange={(x) => setV({ ...v, facebook: x })} />
          <Field label="TikTok (URL)" value={v.tiktok} onChange={(x) => setV({ ...v, tiktok: x })} />
        </div>
        <Area label="Phrase d'intro du formulaire" value={v.intro} onChange={(x) => setV({ ...v, intro: x })} />
        <SaveBar pending={pending} saved={saved} />
      </Card>
    </form>
  );
}

/* ------------------------------- SEO ------------------------------- */
function SeoForm({ value }: { value: SeoSettings }) {
  const [v, setV] = useState(value);
  const { pending, saved, error, save } = useSaver();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(() => updateSetting("seo", v));
      }}
    >
      <Card title="Référencement (SEO)">
        {error && <p className="text-xs text-red-300">{error}</p>}
        <Field label="Nom du site" value={v.siteName} onChange={(x) => setV({ ...v, siteName: x })} />
        <Field label="Titre par défaut" value={v.defaultTitle} onChange={(x) => setV({ ...v, defaultTitle: x })} />
        <Area
          label="Description par défaut"
          value={v.defaultDescription}
          onChange={(x) => setV({ ...v, defaultDescription: x })}
        />
        <SaveBar pending={pending} saved={saved} />
      </Card>
    </form>
  );
}

/* ------------------------------- ACCOUNT ------------------------------- */
function AccountForm({ displayName }: { displayName: string }) {
  const [name, setName] = useState(displayName);
  const [pw, setPw] = useState("");
  const { pending, saved, error, save } = useSaver();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(async () => {
          const res = await updateAccount({ displayName: name, newPassword: pw || undefined });
          if (res.ok) setPw("");
          return res;
        });
      }}
    >
      <Card title="Mon compte">
        {error && <p className="text-xs text-red-300">{error}</p>}
        <Field label="Nom affiché" value={name} onChange={setName} />
        <Field
          label="Nouveau mot de passe (laisser vide pour ne pas changer)"
          value={pw}
          onChange={setPw}
          type="password"
        />
        <SaveBar pending={pending} saved={saved} />
      </Card>
    </form>
  );
}

/* ------------------------------- helpers ------------------------------- */
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="field-input resize-y"
      />
    </label>
  );
}

export function SettingsForms({
  settings,
  displayName,
}: {
  settings: SiteSettings;
  displayName: string;
}) {
  return (
    <div className="space-y-6">
      <HeroForm value={settings.hero} />
      <AboutForm value={settings.about} />
      <StatsForm value={settings.stats} />
      <ContactForm value={settings.contact} />
      <SeoForm value={settings.seo} />
      <AccountForm displayName={displayName} />
    </div>
  );
}
