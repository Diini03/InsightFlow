import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Database,
  BarChart3,
  FileText,
  LayoutGrid,
  PieChart,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  User,
  Search,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/common/Logo";
import { StatusBar } from "@/components/layout/StatusBar";
import { Inspector } from "@/components/layout/Inspector";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
      { title: "Dashboards", url: "/dashboards", icon: LayoutGrid },
    ],
  },
  {
    label: "Data",
    items: [
      { title: "Datasets", url: "/datasets", icon: Database },
      { title: "Reports", url: "/reports", icon: FileText },
    ],
  },
  {
    label: "Analyze",
    items: [
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Visualizations", url: "/visualizations", icon: PieChart },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Settings", url: "/settings", icon: SettingsIcon },
    ],
  },
];

const breadcrumbFor = (pathname: string) => {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) return ["Workspace"];
  return ["Workspace", ...segs.map((s) => s.charAt(0).toUpperCase() + s.slice(1))];
};

function NavRail({ collapsed }: { collapsed: boolean }) {
  return (
    <nav className="h-full flex flex-col bg-sidebar-background border-r">
      <div className="h-14 shrink-0 flex items-center border-b px-3">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 group"
          aria-label="XogArag home"
        >
          <LogoMark size={26} className="transition-transform group-hover:scale-105" />
          {!collapsed && (
            <span className="text-[14px] font-semibold tracking-tight leading-none">
              Xog<span className="text-primary">Arag</span>
            </span>
          )}
        </NavLink>
      </div>

      <div className="p-2">
        <Button
          asChild
          size="sm"
          className={cn(
            "w-full h-8 justify-center gap-1.5 text-[12.5px]",
            collapsed && "px-0",
          )}
        >
          <NavLink to="/datasets/new">
            <Plus className="h-3.5 w-3.5" />
            {!collapsed && "New dataset"}
          </NavLink>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.url === "/dashboard"}
                  title={collapsed ? item.title : undefined}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-2.5 rounded-md h-8 text-[13px] transition-colors",
                      collapsed ? "justify-center px-0" : "px-2.5",
                      isActive
                        ? "bg-primary-soft text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <span
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary"
                          aria-hidden
                        />
                      )}
                      <item.icon className="h-[15px] w-[15px] shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const initials = (user?.email?.[0] ?? "U").toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const crumbs = breadcrumbFor(pathname);

  return (
    <div className="h-dvh flex flex-col bg-background text-foreground overflow-hidden">
      {/* Command bar */}
      <header className="h-12 shrink-0 border-b bg-background flex items-center gap-2 px-2.5">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setNavCollapsed((v) => !v)}
          aria-label={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {navCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>

        <div className="hidden md:flex items-center gap-1 text-[12.5px] text-muted-foreground min-w-0">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
              <span
                className={cn(
                  "truncate",
                  i === crumbs.length - 1 && "text-foreground font-medium",
                )}
              >
                {c}
              </span>
            </span>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm mx-auto hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search datasets, dashboards, charts…"
            className="pl-8 pr-14 h-8 bg-muted/60 border-0 text-[12.5px] focus-visible:ring-1"
            aria-label="Search workspace"
          />
          <kbd className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background border rounded">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>

        <div className="flex items-center gap-0.5 ml-auto">
          <Button
            size="icon"
            variant="ghost"
            className={cn("h-8 w-8", inspectorOpen && "bg-muted text-foreground")}
            onClick={() => setInspectorOpen((v) => !v)}
            aria-label="Toggle inspector"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                aria-label="Account menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-[11px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium truncate">{user?.email}</div>
                <div className="text-xs text-muted-foreground">Free plan</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={navCollapsed ? 4 : 15}
            minSize={navCollapsed ? 4 : 12}
            maxSize={navCollapsed ? 5 : 22}
            className="min-w-[56px]"
          >
            <NavRail collapsed={navCollapsed} />
          </ResizablePanel>
          <ResizableHandle withHandle={false} />
          <ResizablePanel defaultSize={inspectorOpen ? 65 : 85} minSize={40}>
            <main className="h-full overflow-auto">
              <div className="p-5 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                <Outlet />
              </div>
            </main>
          </ResizablePanel>
          {inspectorOpen && (
            <>
              <ResizableHandle withHandle={false} />
              <ResizablePanel defaultSize={20} minSize={16} maxSize={34}>
                <Inspector onClose={() => setInspectorOpen(false)} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <StatusBar />
    </div>
  );
}
