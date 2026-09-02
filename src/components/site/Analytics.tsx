"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { labelSource } from "@/lib/analytics";
import { IS_SUPABASE_CONFIGURED } from "@/lib/env";

const SID_KEY = "kp_sid";

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "no-storage";
  }
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/**
 * Mesure d'audience intégrée, sans cookie (sessionStorage uniquement).
 * Monté dans le layout public : n'enregistre jamais les pages /admin.
 */
export function Analytics() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!IS_SUPABASE_CONFIGURED) return;
    if (!pathname || pathname.startsWith("/admin")) return;
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    let host: string | null = null;
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        if (u.hostname !== window.location.hostname) host = u.hostname;
      }
    } catch {
      /* ignore */
    }

    const creationMatch = pathname.match(/^\/galerie\/(.+)$/);

    const payload = {
      path: pathname.slice(0, 300),
      creation_slug: creationMatch ? creationMatch[1].slice(0, 120) : null,
      referrer: host,
      source: labelSource(host).slice(0, 60),
      device: detectDevice(),
      session_id: getSessionId(),
    };

    const supabase = createClient();
    void supabase
      .from("page_views")
      .insert(payload)
      .then(() => {
        /* silencieux : la mesure ne doit jamais gêner l'utilisateur */
      });
  }, [pathname]);

  return null;
}
