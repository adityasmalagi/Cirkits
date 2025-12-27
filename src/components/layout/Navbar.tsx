import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Monitor, Cpu, Sparkles, User, LogOut, Settings, Heart, Menu, X, Home, ShoppingCart, UserCircle, Folder, Moon, Sun, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

const navLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: Monitor },
  { name: 'PC Build', href: '/pc-build', icon: Cpu },
  { name: 'AI Suggest', href: '/ai-suggest', icon: Sparkles },
];

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { getTotalItems, setIsOpen } = useShoppingCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          setDisplayName(data?.display_name || null);
        });
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const totalItems = getTotalItems();

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg md:text-xl flex-shrink-0">
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Cpu className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
          </div>
          <span className="text-gradient">Cirkit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button variant="ghost" className="gap-2">
                <link.icon className="h-4 w-4" />
                {link.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Cart Button - Always visible */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 md:h-10 md:w-10"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            {totalItems > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs gradient-primary border-0"
              >
                {totalItems}
              </Badge>
            )}
          </Button>

          {/* Theme Toggle - Hidden on mobile, shown in menu */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Notifications - Hidden on mobile, shown in menu */}
          <div className="hidden md:block">
            <NotificationsDropdown />
          </div>

          {/* User Menu - Desktop only */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover border border-border" align="end">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 border-b border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="gradient-primary text-primary-foreground">
                          {(displayName || user.email)?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">{displayName || user.email?.split('@')[0]}</p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/" className="flex items-center gap-2 cursor-pointer">
                        <Home className="h-4 w-4" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                        <Heart className="h-4 w-4" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-projects" className="flex items-center gap-2 cursor-pointer">
                        <Folder className="h-4 w-4" />
                        My Projects
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                            <Settings className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut} 
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="p-3 border-b border-border">
                      <p className="font-medium text-sm">Welcome to Cirkit</p>
                      <p className="text-xs text-muted-foreground">Sign in to access all features</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/auth" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth?tab=signup" className="flex items-center gap-2 cursor-pointer">
                        <Sparkles className="h-4 w-4" />
                        Create Account
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu - Full screen overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-background animate-fade-in">
          <div className="flex flex-col h-full overflow-y-auto pb-safe">
            {/* User Section */}
            {user ? (
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="gradient-primary text-primary-foreground text-lg">
                      {(displayName || user.email)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-semibold">{displayName || user.email?.split('@')[0]}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-border bg-muted/30">
                <p className="font-semibold mb-1">Welcome to Cirkit</p>
                <p className="text-sm text-muted-foreground">Sign in to access all features</p>
              </div>
            )}

            {/* Quick Actions for logged out users */}
            {!user && (
              <div className="p-4 flex gap-2">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" className="w-full h-11">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?tab=signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button className="w-full h-11 gradient-primary text-primary-foreground">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Account Section for logged in users */}
            {user && (
              <>
                <div className="p-2">
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                  <nav className="flex flex-col">
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                        <UserCircle className="h-5 w-5" />
                        Profile
                      </Button>
                    </Link>
                    <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                        <Heart className="h-5 w-5" />
                        Favorites
                      </Button>
                    </Link>
                    <Link to="/my-projects" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                        <Folder className="h-5 w-5" />
                        My Projects
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                          <Settings className="h-5 w-5" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                  </nav>
                </div>
                <Separator />
              </>
            )}

            {/* Settings - Always visible */}
            <div className="p-2">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</p>
              <div className="flex flex-col">
                {/* Theme Toggle */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12 text-base"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      Dark Mode
                    </>
                  )}
                </Button>
                
                {/* Notifications */}
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                  <Bell className="h-5 w-5" />
                  Notifications
                </Button>
              </div>
            </div>

            {/* Sign Out for logged in users */}
            {user && (
              <div className="mt-auto p-4 border-t border-border">
                <Button 
                  variant="destructive" 
                  className="w-full h-12 text-base gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}