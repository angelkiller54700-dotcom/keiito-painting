/**
 * Image de fond plein cadre pour le bandeau en tête de chaque page.
 *
 * Ce sont des rendus larges (~16:9) avec la figurine à droite et une zone
 * sombre à gauche où se pose le texte. Pour changer l'image d'une page,
 * remplace le fichier correspondant dans `public/heroes/` (garde le même nom).
 *
 * `position` / `positionMobile` = valeur CSS `background-position` :
 *   "center 20%" descend l'image (on voit le haut / la tête de la figurine).
 */
export interface HeroBackground {
  image: string;
  position?: string;
  positionMobile?: string;
}

export const PAGE_HERO_BG: Record<string, HeroBackground> = {
  "/": { image: "/heroes/home.webp", position: "center", positionMobile: "72% center" },
  "/galerie": { image: "/heroes/galerie.webp", position: "center 32%", positionMobile: "68% 34%" },
  "/services": { image: "/heroes/services.webp", position: "center 12%", positionMobile: "72% 18%" },
  "/tarifs": { image: "/heroes/tarifs.webp", position: "center", positionMobile: "68% center" },
  "/a-propos": { image: "/heroes/a-propos.webp", position: "center 12%", positionMobile: "72% 18%" },
  "/contact": { image: "/heroes/contact.webp", position: "center 32%", positionMobile: "68% 34%" },
};

export function heroBgFor(path: string): HeroBackground {
  return PAGE_HERO_BG[path] ?? PAGE_HERO_BG["/"];
}
