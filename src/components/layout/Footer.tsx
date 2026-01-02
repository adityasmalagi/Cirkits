import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';
import cirkitLogo from '@/assets/cirkit-logo.png';

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container py-8 md:py-12 px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo and Description */}
          <div className="space-y-4 text-center">
            <Link to="/" className="inline-flex items-center">
              <img src={cirkitLogo} alt="Cirkit" className="h-12 w-auto logo-adaptive" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Your one-stop platform for hardware projects, PC builds, and AI-powered recommendations.
            </p>
          </div>

          {/* Connect */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4 justify-center">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors p-2 -m-2">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors p-2 -m-2">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors p-2 -m-2">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Cirkit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}