import { Link } from 'react-router-dom';
import { Cpu, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container py-8 md:py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4 text-center sm:text-left col-span-1 sm:col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-gradient">Cirkit</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your one-stop platform for hardware projects, PC builds, and AI-powered recommendations.
            </p>
          </div>

          {/* Projects */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Projects</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/projects?category=pc-builds" className="hover:text-foreground transition-colors">PC Builds</Link></li>
              <li><Link to="/projects?category=arduino" className="hover:text-foreground transition-colors">Arduino</Link></li>
              <li><Link to="/projects?category=raspberry-pi" className="hover:text-foreground transition-colors">Raspberry Pi</Link></li>
              <li><Link to="/projects?category=esp32" className="hover:text-foreground transition-colors">ESP32</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/pc-build" className="hover:text-foreground transition-colors">PC Build</Link></li>
              <li><Link to="/ai-suggest" className="hover:text-foreground transition-colors">AI Suggestions</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4 justify-center sm:justify-start">
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