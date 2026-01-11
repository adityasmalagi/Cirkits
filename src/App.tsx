import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { ShoppingCartProvider } from "@/hooks/useShoppingCart";
import { FontSizeProvider } from "@/hooks/useFontSize";
import { ShoppingCartDrawer } from "@/components/cart/ShoppingCartDrawer";
import { PageTransition } from "@/components/layout/PageTransition";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import MyProjects from "./pages/MyProjects";
import PCBuild from "./pages/PCBuild";
import AISuggest from "./pages/AISuggest";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Laptops from "./pages/Laptops";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/projects/:slug" element={<PageTransition><ProjectDetail /></PageTransition>} />
        <Route path="/my-projects" element={<PageTransition><MyProjects /></PageTransition>} />
        <Route path="/pc-build" element={<PageTransition><PCBuild /></PageTransition>} />
        <Route path="/laptops" element={<PageTransition><Laptops /></PageTransition>} />
        <Route path="/ai-suggest" element={<PageTransition><AISuggest /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShoppingCartProvider>
          <FontSizeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ShoppingCartDrawer />
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </FontSizeProvider>
        </ShoppingCartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
