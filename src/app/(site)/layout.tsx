import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AmbientBackground } from "@/components/site/AmbientBackground";
import { getSiteSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { contact } = await getSiteSettings();

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <SiteHeader contact={contact} />
      <main className="flex-1 pt-16 sm:pt-20">{children}</main>
      <SiteFooter contact={contact} />
    </div>
  );
}
