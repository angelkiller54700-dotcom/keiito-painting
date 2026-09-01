import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="Keiito Painting - accueil"
    >
      <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-violet-bright/25 shadow-glow-sm sm:h-14 sm:w-14">
        <Image
          src="/logo.webp"
          alt="Keiito Painting"
          fill
          sizes="56px"
          className="object-cover"
          priority
        />
        <span className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_16px_rgba(5,5,8,0.6)]" />
        <span className="pointer-events-none absolute inset-0 bg-violet-bright/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
      {!compact && (
        <span className="hidden flex-col leading-none sm:flex">
          <span className="font-display text-base tracking-[0.14em] text-fog">KEIITO</span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.4em] text-violet-bright">
            Painting
          </span>
        </span>
      )}
    </Link>
  );
}
