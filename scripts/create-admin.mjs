#!/usr/bin/env node
/**
 * Crée (ou promeut) le compte administrateur du site.
 *
 * Usage :
 *   node scripts/create-admin.mjs email@exemple.fr "MotDePasseSolide" "Keiito"
 *
 * ou via variables d'environnement (.env.local) :
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... node scripts/create-admin.mjs
 *
 * Nécessite dans .env.local :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { existsSync } from "node:fs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) config({ path: f });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\n❌  NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local\n",
  );
  process.exit(1);
}

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;
const displayName = process.argv[4] || process.env.ADMIN_NAME || "Keiito";

if (!email || !password) {
  console.error(
    '\n❌  Usage : node scripts/create-admin.mjs <email> <mot de passe> ["Nom affiché"]\n',
  );
  process.exit(1);
}
if (password.length < 8) {
  console.error("\n❌  Le mot de passe doit faire au moins 8 caractères.\n");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target) {
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function main() {
  console.log(`\n→ Compte admin pour ${email} …`);

  let user = await findUserByEmail(email);

  if (user) {
    console.log("  Utilisateur déjà existant — mise à jour du mot de passe.");
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error) throw error;
    user = data.user;
    console.log("  Utilisateur créé.");
  }

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "admin", display_name: displayName }, { onConflict: "id" });
  if (upsertError) throw upsertError;

  console.log("\n✅  Compte administrateur prêt. Connecte-toi sur /admin/login\n");
}

main().catch((err) => {
  console.error("\n❌  Erreur :", err.message || err, "\n");
  process.exit(1);
});
