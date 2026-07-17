import { useEffect, useState } from "react";
import { Sparkles, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "xogarag.nadiifi-banner-dismissed";

export function NadiifiBanner() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(localStorage.getItem(KEY) === "1");
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="relative flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground">Use clean data</div>
        <p className="mt-0.5 text-muted-foreground leading-relaxed">
          For the best results, upload cleaned and organized datasets. If yours still contains
          missing values, duplicates or inconsistent formatting, clean it first with NadiifiData.
        </p>
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
          <a
            href="https://nadiifi-data.vercel.app"
            target="_blank"
            rel="noreferrer noopener"
          >
            Clean Data
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
