import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brush,
  Castle,
  Check,
  ChevronRight,
  Clock,
  Crown,
  Euro,
  Eye,
  EyeOff,
  Facebook,
  Images,
  Inbox,
  Instagram,
  Layers,
  LayoutDashboard,
  Loader2,
  Menu,
  Plus,
  Settings,
  Sparkles,
  Star,
  Tags,
  Trash2,
  Trophy,
  Upload,
  Users,
  Wand2,
  X,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brush,
  Castle,
  Check,
  ChevronRight,
  Clock,
  Crown,
  Euro,
  Eye,
  EyeOff,
  Facebook,
  Images,
  Inbox,
  Instagram,
  Layers,
  LayoutDashboard,
  Loader2,
  Menu,
  Plus,
  Settings,
  Sparkles,
  Star,
  Tags,
  Trash2,
  Trophy,
  Upload,
  Users,
  Wand2,
  X,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = MAP[name] ?? Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}

// TikTok n'est pas dans lucide : petit SVG maison.
export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.5 3c.3 2.2 1.5 3.6 3.6 3.8v2.5c-1.3.1-2.5-.3-3.6-1v6.7c0 4.3-3.6 6.9-7.2 5.6-2.4-.9-3.9-3.2-3.6-5.7.3-2.7 2.6-4.7 5.3-4.6.3 0 .6 0 .9.1v2.7c-.3-.1-.6-.2-1-.2-1.4 0-2.5 1.2-2.4 2.6.1 1.3 1.2 2.3 2.5 2.3 1.4 0 2.5-1.1 2.5-2.5V3h3.5Z" />
    </svg>
  );
}
