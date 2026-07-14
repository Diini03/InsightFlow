import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface Notification { id: string; type: string; title: string; body: string | null; read: boolean; created_at: string; }

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setItems((data ?? []) as Notification[]);
      setLoading(false);
    });
  }, [user]);

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Notifications"
        description="Recent activity in your workspace."
        actions={items.some((n) => !n.read) && <Button variant="outline" onClick={markAllRead}><Check className="h-4 w-4 mr-2" />Mark all as read</Button>}
      />
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates here when datasets are uploaded, reports are generated, or AI insights are ready." />
      ) : (
        <Card><CardContent className="p-0">
          <div className="divide-y">
            {items.map((n) => (
              <div key={n.id} className="p-4 flex items-start gap-3">
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                <div className="flex-1">
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="text-sm text-muted-foreground mt-0.5">{n.body}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
      )}
    </motion.div>
  );
}
