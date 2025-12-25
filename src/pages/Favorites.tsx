import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { LaptopCard } from '@/components/laptops/LaptopCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Monitor, Laptop } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Project, Category, Laptop as LaptopType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Favorites() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: favoriteProjects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['favorite-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_favorites')
        .select('project_id, projects(*, category:categories(*))')
        .eq('user_id', user.id)
        .not('project_id', 'is', null);
      if (error) throw error;
      return data.map(f => f.projects).filter(Boolean) as (Project & { category: Category })[];
    },
    enabled: !!user,
  });

  const { data: favoriteLaptops, isLoading: laptopsLoading, refetch: refetchLaptops } = useQuery({
    queryKey: ['favorite-laptops', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_favorites')
        .select('laptop_id, laptops(*)')
        .eq('user_id', user.id)
        .not('laptop_id', 'is', null);
      if (error) throw error;
      return data.map(f => f.laptops).filter(Boolean) as LaptopType[];
    },
    enabled: !!user,
  });

  const removeFavoriteProject = async (projectId: string) => {
    if (!user) return;
    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('project_id', projectId);
    refetchProjects();
    toast({ title: 'Removed from favorites' });
  };

  const removeFavoriteLaptop = async (laptopId: string) => {
    if (!user) return;
    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('laptop_id', laptopId);
    refetchLaptops();
    toast({ title: 'Removed from favorites' });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">Your saved projects and laptops</p>
          </div>
        </div>

        <Tabs defaultValue="projects">
          <TabsList className="mb-6">
            <TabsTrigger value="projects" className="gap-2">
              <Monitor className="h-4 w-4" />
              Projects ({favoriteProjects?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="laptops" className="gap-2">
              <Laptop className="h-4 w-4" />
              Laptops ({favoriteLaptops?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            ) : favoriteProjects?.length === 0 ? (
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorite projects yet</h3>
                <p className="text-muted-foreground mb-4">Browse projects and click the heart icon to save them here.</p>
                <Link to="/projects">
                  <Button>Browse Projects</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProjects?.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isFavorite={true}
                    onToggleFavorite={() => removeFavoriteProject(project.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="laptops">
            {laptopsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            ) : favoriteLaptops?.length === 0 ? (
              <div className="text-center py-12">
                <Laptop className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorite laptops yet</h3>
                <p className="text-muted-foreground mb-4">Browse laptops and click the heart icon to save them here.</p>
                <Link to="/laptops">
                  <Button>Browse Laptops</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteLaptops?.map((laptop) => (
                  <LaptopCard
                    key={laptop.id}
                    laptop={laptop}
                    isFavorite={true}
                    onToggleFavorite={() => removeFavoriteLaptop(laptop.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
