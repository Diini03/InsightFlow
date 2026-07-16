import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Database, BarChart3, FileText, LayoutGrid, PieChart, Bell, Settings as SettingsIcon, LogOut, User, Search, Command } from "lucide-react";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger,
  SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/common/Logo";

const navGroups = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
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
      { title: "Dashboards", url: "/dashboards", icon: LayoutGrid },
      { title: "Visualizations", url: "/visualizations", icon: PieChart },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Settings", url: "/settings", icon: SettingsIcon },
    ],
  },
];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b h-16 flex items-center px-4">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 group"
          aria-label="XogArag home"
        >
          <LogoMark size={30} className="transition-transform group-hover:scale-105" />
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight leading-none">
              Xog<span className="text-primary">Arag</span>
            </span>
          )}
        </NavLink>
      </SidebarHeader>
      <SidebarContent className="py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium px-3">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-md h-9 px-2.5 text-sm transition-colors ${
                            isActive
                              ? "bg-primary-soft text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && !collapsed && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary" aria-hidden />
                            )}
                            <item.icon className="h-[18px] w-[18px] shrink-0" />
                            <span>{item.title}</span>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.email?.[0] ?? "U").toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-dvh flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b bg-background/85 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6">
            <SidebarTrigger aria-label="Toggle sidebar" />
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search datasets, reports…"
                className="pl-9 pr-16 h-9 bg-muted/50 border-0 focus-visible:ring-1"
                aria-label="Search"
              />
              <kbd className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background border rounded">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
            <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 ml-auto">
              <ThemeToggle />
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-medium">{initials}</AvatarFallback>
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
                    <User className="mr-2 h-4 w-4" />Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon className="mr-2 h-4 w-4" />Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
