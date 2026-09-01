"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { Icon } from "@/components/ui/Icon";
import { ADMIN_NAV } from "@/lib/constants";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function AdminShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive(item.href)
              ? "bg-violet/15 text-fog"
              : "text-fog-muted hover:bg-white/5 hover:text-fog",
          )}
        >
          <Icon name={item.icon} className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-border bg-ink px-4 py-6 lg:flex">
        <Logo />
        <div className="mt-8 flex-1">{nav}</div>
        <SidebarFooter />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-ink-border bg-ink px-4 py-6">
            <Logo />
            <div className="mt-8 flex-1">{nav}</div>
            <SidebarFooter />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-border bg-ink px-4 py-3 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md border border-ink-border lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Icon name="Menu" className="h-5 w-5" />
          </button>
          <p className="text-sm text-fog-muted">
            Bonjour <span className="font-semibold text-fog">{displayName}</span>
          </p>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="btn-ghost !px-3 !py-1.5 text-[10px]">
              <Icon name="Eye" className="h-3.5 w-3.5" />
              Voir le site
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <form action={signOutAction} className="border-t border-ink-border pt-4">
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-fog-muted transition-colors hover:bg-white/5 hover:text-fog"
      >
        <Icon name="ArrowLeft" className="h-4 w-4" />
        Déconnexion
      </button>
    </form>
  );
}
