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
import { motion, AnimatePresence } from 'framer-motion';
import cirkitLogo from '@/assets/cirkits-logo.png';

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

  const handleCartClick = () => {
    if (!user) {
      navigate('/auth');
    } else {
      setIsOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src={cirkitLogo} alt="Cirkit" className="h-10 md:h-12 w-auto rounded-lg object-contain" />
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
            onClick={handleCartClick}
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

          {/* Theme Toggle - Visible on mobile beside cart */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden relative overflow-hidden"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Sun className="h-4 w-4 text-tech-orange" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Moon className="h-4 w-4 text-tech-purple" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Theme Toggle - Desktop */}
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

          {/* Mobile Menu - Dropdown like desktop */}
          <div className="md:hidden">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
                    {/* Navigation Links */}
                    {navLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link to={link.href} className="flex items-center gap-2 cursor-pointer">
                          <link.icon className="h-4 w-4" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <UserCircle className="h-4 w-4" />
                        Profile
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
                    {/* Theme Toggle - Prominent in mobile */}
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer font-medium"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4 text-tech-orange" /> : <Moon className="h-4 w-4 text-tech-purple" />}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
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
                    {/* Navigation Links for non-logged users */}
                    {navLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link to={link.href} className="flex items-center gap-2 cursor-pointer">
                          <link.icon className="h-4 w-4" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer font-medium"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4 text-tech-orange" /> : <Moon className="h-4 w-4 text-tech-purple" />}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}