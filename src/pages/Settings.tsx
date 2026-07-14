import { motion } from "framer-motion";
import { LogOut, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/common/ThemeProvider";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { signOut, user } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Settings" description="Manage preferences and your workspace." />
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label htmlFor="theme">Dark mode</Label>
            </div>
            <Switch id="theme" checked={theme === "dark"} onCheckedChange={toggle} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Account</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user?.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Plan</div>
              <div className="font-medium">Free</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg text-destructive">Danger zone</CardTitle></CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={async () => { await signOut(); nav("/"); }}>
              <LogOut className="h-4 w-4 mr-2" />Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
