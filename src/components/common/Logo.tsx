import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * InsightFlow brand mark — three ascending bars fused with a flowing analytics
 * pulse line and a leading node. Uses currentColor + primary tokens so it
 * adapts to any surface.
 */
export function LogoMark({ className, size = 32 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="if-lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-hover))" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#if-lg)" />
      {/* ascending bars */}
      <rect x="6" y="19" width="3.5" height="7" rx="1.25" fill="hsl(var(--primary-foreground))" opacity="0.55" />
      <rect x="12" y="14" width="3.5" height="12" rx="1.25" fill="hsl(var(--primary-foreground))" opacity="0.75" />
      <rect x="18" y="9" width="3.5" height="17" rx="1.25" fill="hsl(var(--primary-foreground))" />
      {/* pulse line + node */}
      <path
        d="M6 12 L12 9 L18 5 L26 8"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      <circle cx="26" cy="8" r="2" fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}

export function LogoLockup({
  className,
  size = 32,
  wordmarkClassName,
}: LogoProps & { wordmarkClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark size={size} />
      <span className={cn("text-lg", wordmarkClassName)}>InsightFlow</span>
    </span>
  );
}
