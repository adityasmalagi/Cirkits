import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProjectsPage = location.pathname === '/projects';
  const isProjectDetailPage = location.pathname.startsWith('/projects/') && location.pathname !== '/projects';

  // Determine back link
  const getBackLink = () => {
    if (isProjectDetailPage) {
      return { to: '/projects', label: 'Back to Projects' };
    }
    return { to: '/', label: 'Back to Home' };
  };

  const backLink = getBackLink();
  const showBackButton = !isHomePage;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {showBackButton && (
          <div className="container mx-auto px-4 pt-4 md:hidden">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
              <Link to={backLink.to}>
                <ArrowLeft className="h-4 w-4" />
                {backLink.label}
              </Link>
            </Button>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
