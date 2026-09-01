import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="text-3xl uppercase text-fog sm:text-4xl md:text-5xl">{title}</h2>
      {description && (
        <p className={cn("max-w-2xl text-[15px] leading-relaxed text-fog-muted")}>{description}</p>
      )}
    </Reveal>
  );
}
