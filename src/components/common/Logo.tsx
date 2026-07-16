import { cn } from "@/lib/utils";
import logoSrc from "@/assets/xogarag-logo.png";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * XogArag brand mark — eye-shaped analytics emblem combining ascending
 * chart bars with an observation motif. Rendered as an image asset so it
 * stays pixel-perfect at any size and across themes.
 */
export function LogoMark({ className, size = 32 }: LogoProps) {
  return (
    <img
      src={logoSrc}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}

export function LogoLockup({
  className,
  size = 32,
  wordmarkClassName,
}: LogoProps & { wordmarkClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground text-lg leading-none",
          wordmarkClassName,
        )}
      >
        Xog<span className="text-primary">Arag</span>
      </span>
    </span>
  );
}
