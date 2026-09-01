# Keiito Painting

Portfolio premium + interface d'administration pour un peintre de figurines Warhammer / miniatures.

- **Front public** : accueil, galerie filtrable, page projet, services, tarifs, à propos, contact / devis.
- **Administration** (`/admin`) : gestion complète des créations, catégories, tarifs, demandes de devis et textes du site, sans toucher au code.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Style | Tailwind CSS |
| Base de données / Auth / Stockage | Supabase (PostgreSQL, Auth, Storage) |
| Animations | Framer Motion |
| Images | `next/image` + compression WebP côté navigateur avant upload |

Hébergeable sur **Vercel** ou un **VPS Node.js** (`npm run build && npm run start`).

---

## 1. Installation locale

Prérequis : **Node.js 22 ou plus récent**.

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs (étape 3)
npm run dev
```

Le site tourne sur http://localhost:3000. Sans Supabase configuré, les pages
publiques s'affichent avec des états vides et `/admin` renvoie vers une page
d'aide.

> **Réseau avec antivirus / proxy qui inspecte le HTTPS ?** Les scripts npm
> (`dev`, `build`, `start`, `create-admin`) passent déjà `NODE_OPTIONS=--use-system-ca`
> pour que Node fasse confiance aux certificats du système. Rien à faire.

---

## 2. Créer le projet Supabase

1. Crée un compte sur https://supabase.com puis un nouveau projet.
2. Dans le dashboard, ouvre **SQL Editor** et exécute, dans l'ordre, le contenu de :
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_rls.sql`
   3. `supabase/migrations/0003_seed.sql` (catégories + niveaux de tarifs + textes par défaut)
3. Les buckets de stockage `creations` (public) et `quote-uploads` (privé) sont
   créés automatiquement par `0001_schema.sql`.
4. Dans **Authentication → Providers**, laisse **Email** activé et **désactive
   « Enable email signups »** (aucune inscription publique : seul le compte admin
   créé à l'étape 4 doit exister). Désactive aussi « Confirm email » si tu veux,
   le script d'admin confirme l'email lui-même.

> Row Level Security est activée sur toutes les tables. Le public ne peut lire
> que les créations publiées et les catégories publiques, et ne peut qu'**insérer**
> une demande de devis (jamais la lire). Seul un profil `role = 'admin'` peut
> écrire.

---

## 3. Variables d'environnement

Copie `.env.example` vers `.env.local` et renseigne (Project Settings → API) :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # clé "anon / public"
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # clé "service_role" - SECRETE, serveur uniquement
NEXT_PUBLIC_SITE_URL=http://localhost:3000      # en prod: https://tondomaine.fr
```

La `SUPABASE_SERVICE_ROLE_KEY` n'est utilisée que par le script de création
d'admin (`scripts/create-admin.mjs`). Elle n'est jamais exposée au navigateur.

---

## 4. Créer le compte administrateur

Une fois `.env.local` rempli :

```bash
npm run create-admin -- keiito@exemple.fr "MotDePasseSolide123" "Keiito"
```

Le script crée l'utilisateur (email confirmé) et lui attribue le rôle `admin`.
Relancer la commande avec un compte existant met simplement à jour le mot de passe.

Connexion ensuite sur **/admin/login**.

---

## 5. Utilisation de l'administration

1. `/admin/login` → connexion email + mot de passe.
2. **Ajouter une création** : glisser les photos (converties en WebP et
   compressées automatiquement), écrire le titre, choisir une catégorie, rédiger
   la description, cocher éventuellement « Afficher sur la page d'accueil »,
   cliquer sur **Publier**.
3. La création publiée apparaît immédiatement dans la galerie publique.
4. **Catégories**, **Tarifs**, **Demandes** et **Paramètres** (textes du hero, de
   la section à propos, réseaux sociaux, SEO, mot de passe) se gèrent depuis le
   menu latéral.

Les chiffres de la page d'accueil (« +150 figurines »…) sont **désactivés par
défaut** : active-les et renseigne de vraies valeurs dans *Paramètres* si tu le
souhaites. Aucun avis client, chiffre ou récompense n'est inventé.

---

## 6. Déploiement

### Vercel (recommandé)

1. Pousse le dépôt sur GitHub / GitLab.
2. Importe le projet sur Vercel.
3. Ajoute les 4 variables d'environnement (mêmes valeurs que `.env.local`, avec
   `NEXT_PUBLIC_SITE_URL` = URL de production).
4. Vercel → *Settings → General → Node.js Version* : choisis **22.x** (le
   `package.json` le demande déjà via `engines`).
5. Deploy. Le build lance `next build` automatiquement.
6. Dans Supabase → **Authentication → URL Configuration**, ajoute l'URL de prod
   dans *Site URL* et *Redirect URLs*.

### VPS Node.js

```bash
npm ci
npm run build
npm run start          # écoute sur le port 3000 (configurable via PORT)
```

Place un reverse proxy (Nginx / Caddy) devant, avec HTTPS. Renseigne les
variables d'environnement dans l'environnement du service (systemd, PM2, Docker…).

---

## Structure

```
src/
  app/
    (site)/            pages publiques (header + footer partagés)
    admin/
      login/           page de connexion
      (panel)/         dashboard protégé (requireAdmin)
    robots.ts, sitemap.ts
  components/
    site/              Hero, galerie, cartes, formulaire de contact…
    admin/             CreationForm, ImageUploader, tables, managers…
    ui/                Icônes
  lib/
    supabase/          clients (browser / server / static / middleware)
    actions/           Server Actions (CRUD sécurisé)
    queries.ts         lectures publiques
    admin-queries.ts   lectures admin
    settings.ts        réglages éditables + valeurs par défaut
supabase/migrations/   schéma SQL, RLS, seed
scripts/create-admin.mjs
public/backgrounds/    wallpapers fournis (optimisés en WebP)
```

## Notes techniques

- Les polices (Inter, Anton, Permanent Marker) sont **auto-hébergées**
  (`src/fonts/`) : aucun appel à Google Fonts au build ni au runtime.
- Les images de créations sont stockées dans Supabase Storage
  (`creations/<dossier-projet>/*.webp`), jamais en base64 en base.
- Les images jointes aux devis vont dans un bucket **privé**
  (`quote-uploads`), consultables uniquement par l'admin via URL signée.
- La connexion admin se fait côté navigateur (`@supabase/ssr` browser client) ;
  le middleware protège ensuite toutes les routes `/admin`.
- `prefers-reduced-motion` est respecté (animations désactivées).
- Aucune dépendance à Framer Motion : les animations sont en CSS/Tailwind.
```
