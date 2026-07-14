import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow">
          <Sparkles className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="text-7xl font-bold text-gradient mb-2">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild><Link to="/"><Home className="h-4 w-4 mr-2" />Back to home</Link></Button>
      </div>
    </div>
  );
}
