import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center", className)}
      aria-label="Keiito Painting - accueil"
    >
      <span className="relative block h-11 w-[92px] overflow-hidden rounded-md ring-1 ring-violet-bright/25 shadow-glow-sm sm:h-14 sm:w-[118px]">
        <Image
          src="/logo.webp"
          alt="Keiito Painting"
          fill
          sizes="118px"
          className="object-cover"
          priority
        />
        <span className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_0_14px_rgba(5,5,8,0.55)]" />
        <span className="pointer-events-none absolute inset-0 bg-violet-bright/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </Link>
  );
}
