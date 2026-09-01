import { Icon, TikTokIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { ContactSettings } from "@/lib/types";

export function SocialLinks({
  contact,
  className,
}: {
  contact: ContactSettings;
  className?: string;
}) {
  const items = [
    contact.instagram && { href: contact.instagram, label: "Instagram", node: <Icon name="Instagram" className="h-4 w-4" /> },
    contact.facebook && { href: contact.facebook, label: "Facebook", node: <Icon name="Facebook" className="h-4 w-4" /> },
    contact.tiktok && { href: contact.tiktok, label: "TikTok", node: <TikTokIcon className="h-4 w-4" /> },
  ].filter(Boolean) as { href: string; label: string; node: JSX.Element }[];

  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          className="grid h-9 w-9 place-items-center rounded-full border border-ink-border text-fog-muted transition-colors hover:border-violet-bright/60 hover:text-violet-bright"
        >
          {it.node}
        </a>
      ))}
    </div>
  );
}
