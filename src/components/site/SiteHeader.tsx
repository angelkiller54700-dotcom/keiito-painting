"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { Icon } from "@/components/ui/Icon";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ContactSettings } from "@/lib/types";

export function SiteHeader({ contact }: { contact: ContactSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-ink-border bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-ink/70 to-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
                isActive(link.href) ? "text-fog" : "text-fog-muted hover:text-fog",
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-px bg-violet-bright shadow-glow-sm transition-all duration-300",
                  isActive(link.href) ? "w-full" : "w-0",
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <SocialLinks contact={contact} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md border border-ink-border text-fog lg:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          <Icon name={open ? "X" : "Menu"} className="h-5 w-5" />
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden bg-ink transition-[max-height,opacity] duration-300 ease-out lg:hidden",
          open ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div>
          <div className="container-page border-t border-ink-border bg-ink/95 pb-8 pt-2 backdrop-blur-md">
            <nav className="flex flex-col" aria-label="Navigation mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "border-b border-ink-border/60 py-4 text-sm font-semibold uppercase tracking-[0.2em]",
                    isActive(link.href) ? "text-violet-bright" : "text-fog-muted",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6">
              <SocialLinks contact={contact} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
