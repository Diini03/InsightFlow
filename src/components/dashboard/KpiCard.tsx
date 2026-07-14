import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: number;
  hint?: string;
  loading?: boolean;
  accent?: "default" | "success" | "warning";
}

export function KpiCard({ label, value, icon: Icon, delta, hint, loading, accent = "default" }: KpiCardProps) {
  if (loading) {
    return (
      <Card><CardContent className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-20" />
      </CardContent></Card>
    );
  }
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
          {Icon && (
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              accent === "success" ? "bg-success/10 text-success" : accent === "warning" ? "bg-warning/10 text-warning" : "bg-primary-soft text-primary"
            }`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {(delta !== undefined || hint) && (
          <div className="mt-2 text-xs flex items-center gap-1">
            {delta !== undefined && (
              <span className={`inline-flex items-center gap-0.5 font-medium ${positive ? "text-success" : "text-destructive"}`}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {positive ? "+" : ""}{delta.toFixed(1)}%
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
