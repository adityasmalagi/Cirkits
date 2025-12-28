import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ShoppingCartProvider } from "@/hooks/useShoppingCart";
import { ShoppingCartDrawer } from "@/components/cart/ShoppingCartDrawer";
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

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShoppingCartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ShoppingCartDrawer />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/my-projects" element={<MyProjects />} />
                <Route path="/pc-build" element={<PCBuild />} />
                <Route path="/ai-suggest" element={<AISuggest />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ShoppingCartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
