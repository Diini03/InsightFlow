import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ComingSoonPage({ title, description, icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={`${title} is coming soon`}
        description="This module is on the roadmap for the next release. Upload a dataset to get started with the current tools."
        action={<Button asChild><Link to="/datasets/new">Upload a dataset</Link></Button>}
      />
    </motion.div>
  );
}
