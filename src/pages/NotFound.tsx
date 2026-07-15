import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/common/Logo";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-hero p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <LogoLockup size={36} wordmarkClassName="text-xl" />
        </div>
        <div className="text-7xl font-bold text-gradient mb-2 tracking-tight">404</div>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" asChild>
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Go to dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/"><Home className="h-4 w-4 mr-2" />Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
