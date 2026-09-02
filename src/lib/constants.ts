export const SITE_NAME = "Keiito Painting";
export const INSTAGRAM_HANDLE = "@keiit0_painting";

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/galerie", label: "Galerie" },
  { href: "/services", label: "Services" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/statistiques", label: "Statistiques", icon: "BarChart3" },
  { href: "/admin/creations", label: "Créations", icon: "Images" },
  { href: "/admin/creations/new", label: "Ajouter une création", icon: "Plus" },
  { href: "/admin/categories", label: "Catégories", icon: "Tags" },
  { href: "/admin/demandes", label: "Demandes", icon: "Inbox" },
  { href: "/admin/tarifs", label: "Tarifs", icon: "Euro" },
  { href: "/admin/parametres", label: "Paramètres", icon: "Settings" },
] as const;

export const BACKGROUNDS = {
  hero: "/backgrounds/hero-figure.webp",
  workshop: "/backgrounds/workshop.webp",
  cave: "/backgrounds/cave.webp",
  grunge: "/backgrounds/grunge.webp",
} as const;

// Services : contenu quasi statique (rarement modifié).
export const SERVICES = [
  {
    slug: "peinture-figurines",
    icon: "Brush",
    title: "Peinture de figurines",
    text: "Peinture à l'unité, du tabletop à la pièce de collection, avec le niveau de finition de votre choix.",
    example: "Héros, personnages spéciaux, monstres.",
  },
  {
    slug: "peinture-armees",
    icon: "Users",
    title: "Peinture d'armées",
    text: "Une armée complète, cohérente et homogène, peinte selon un schéma de couleurs défini ensemble.",
    example: "Escouades, détachements, armées de tournoi.",
  },
  {
    slug: "personnages-heros",
    icon: "Crown",
    title: "Personnages / héros",
    text: "Un travail poussé sur les figurines qui comptent : contrastes, textures, regard, narration.",
    example: "Seigneurs, capitaines, mages.",
  },
  {
    slug: "pieces-exposition",
    icon: "Trophy",
    title: "Pièces d'exposition",
    text: "Techniques avancées (blending, OSL, SENMM, freehand) pour une pièce de vitrine ou de concours.",
    example: "Bustes, figurines 54mm+, dioramas.",
  },
  {
    slug: "soclage",
    icon: "Layers",
    title: "Soclage",
    text: "Des socles qui racontent une histoire : ruines, sol de bataille, neige, lave, verdure.",
    example: "Socles ronds, ovales, scéniques.",
  },
  {
    slug: "decors",
    icon: "Castle",
    title: "Décors",
    text: "Peinture de décors de jeu et d'éléments de table pour un rendu immersif.",
    example: "Ruines, bâtiments, terrains.",
  },
  {
    slug: "retouches",
    icon: "Wand2",
    title: "Retouches",
    text: "Reprise, finition ou réparation de figurines déjà peintes ou endommagées.",
    example: "Éclats, casse, harmonisation.",
  },
  {
    slug: "projets-personnalises",
    icon: "Sparkles",
    title: "Projets personnalisés",
    text: "Conversions, kitbash, schémas sur-mesure : parlons-en, tout est possible.",
    example: "Idées originales, commandes uniques.",
  },
] as const;

export const PROJECT_TYPES = [
  "Figurine unique",
  "Groupe / escouade",
  "Armée complète",
  "Personnage / héros",
  "Pièce d'exposition",
  "Soclage uniquement",
  "Décors",
  "Retouches",
  "Autre",
];

export const PAINT_LEVELS = ["Tabletop", "Tabletop +", "Premium", "Display", "Je ne sais pas encore"];

export const BUDGET_RANGES = [
  "Moins de 100 €",
  "100 - 300 €",
  "300 - 600 €",
  "600 - 1000 €",
  "Plus de 1000 €",
  "À définir ensemble",
];
