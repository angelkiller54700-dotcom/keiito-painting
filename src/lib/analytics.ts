export interface PageViewInput {
  path: string;
  creation_slug: string | null;
  referrer: string | null;
  source: string | null;
  device: "mobile" | "tablet" | "desktop" | null;
  session_id: string;
}

const SOURCE_RULES: [RegExp, string][] = [
  [/(^|\.)instagram\.com$|instagr\.am$/i, "Instagram"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$/i, "Facebook"],
  [/(^|\.)tiktok\.com$/i, "TikTok"],
  [/(^|\.)google\./i, "Google"],
  [/(^|\.)bing\.com$/i, "Bing"],
  [/(^|\.)duckduckgo\.com$/i, "DuckDuckGo"],
  [/(^|\.)ecosia\.org$/i, "Ecosia"],
  [/(^|\.)qwant\.com$/i, "Qwant"],
  [/(^|\.)yahoo\./i, "Yahoo"],
  [/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/i, "X / Twitter"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, "YouTube"],
  [/(^|\.)reddit\.com$/i, "Reddit"],
  [/(^|\.)pinterest\./i, "Pinterest"],
  [/(^|\.)linkedin\.com$|lnkd\.in$/i, "LinkedIn"],
  [/(^|\.)discord\.com$|discord\.gg$/i, "Discord"],
];

/** Transforme un hôte de référent en libellé de source lisible. */
export function labelSource(host: string | null): string {
  if (!host) return "Direct";
  for (const [re, label] of SOURCE_RULES) {
    if (re.test(host)) return label;
  }
  return host.replace(/^www\./, "");
}

/** Chemin joli pour l'affichage (ex: "/galerie/xxx" -> "Création : xxx"). */
export function prettyPath(path: string): string {
  if (path === "/") return "Accueil";
  const map: Record<string, string> = {
    "/galerie": "Galerie",
    "/services": "Services",
    "/tarifs": "Tarifs",
    "/a-propos": "À propos",
    "/contact": "Contact",
    "/confidentialite": "Confidentialité",
  };
  if (map[path]) return map[path];
  const m = path.match(/^\/galerie\/(.+)$/);
  if (m) return `Création : ${m[1]}`;
  return path;
}
