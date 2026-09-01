"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import type { QuoteStatus } from "@/lib/types";

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court.").max(120),
  email: z.string().trim().email("Email invalide.").max(160),
  phone: z.string().trim().max(40).optional().default(""),
  project_type: z.string().trim().max(80).optional().default(""),
  figure_count: z.string().trim().max(40).optional().default(""),
  figure_type: z.string().trim().max(120).optional().default(""),
  paint_level: z.string().trim().max(60).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  desired_date: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(10, "Décrivez un peu votre projet (10 caractères min).").max(4000),
  image_paths: z.array(z.string()).max(8).optional().default([]),
  consent: z.literal("on", { errorMap: () => ({ message: "Vous devez accepter la politique de confidentialité." }) }),
});

export interface QuoteFormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitQuote(
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    project_type: formData.get("project_type") ?? "",
    figure_count: formData.get("figure_count") ?? "",
    figure_type: formData.get("figure_type") ?? "",
    paint_level: formData.get("paint_level") ?? "",
    budget: formData.get("budget") ?? "",
    desired_date: formData.get("desired_date") ?? "",
    message: formData.get("message"),
    image_paths: formData.getAll("image_paths").map(String).filter(Boolean),
    consent: formData.get("consent"),
  };

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Merci de corriger les champs indiqués.", fieldErrors };
  }

  const v = parsed.data;
  const supabase = createClient();
  const { error } = await supabase.from("quote_requests").insert({
    name: v.name,
    email: v.email,
    phone: v.phone || null,
    project_type: v.project_type || null,
    figure_count: v.figure_count || null,
    figure_type: v.figure_type || null,
    paint_level: v.paint_level || null,
    budget: v.budget || null,
    desired_date: v.desired_date || null,
    message: v.message,
    image_paths: v.image_paths,
  });

  if (error) {
    return { error: "Une erreur est survenue lors de l'envoi. Réessayez dans un instant." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteQuote(id: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { error } = await supabase.from("quote_requests").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
  return { ok: true };
}
