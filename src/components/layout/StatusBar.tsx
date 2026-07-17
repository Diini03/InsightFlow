import { useLocation } from "react-router-dom";
import { Circle, Wifi } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/datasets": "Datasets",
  "/datasets/new": "Upload dataset",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/dashboards": "Dashboards",
  "/visualizations": "Visualizations",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function StatusBar() {
  const { pathname } = useLocation();
  const label =
    routeLabels[pathname] ??
    (pathname.startsWith("/datasets/") ? "Dataset details" : "Workspace");

  return (
    <div className="h-7 shrink-0 border-t bg-background/95 backdrop-blur px-4 flex items-center justify-between text-[11px] font-medium text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5">
          <Circle className="h-2 w-2 fill-success text-success" />
          Ready
        </span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="tabular-nums">XogArag · v1.0</span>
        <span className="inline-flex items-center gap-1.5">
          <Wifi className="h-3 w-3" />
          Synced
        </span>
      </div>
    </div>
  );
}
