import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { ProjectBuildWizard } from '@/components/projects/ProjectBuildWizard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, IndianRupee, Heart, ShoppingCart, ExternalLink, Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Project, ProjectPart, Product } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { cn } from '@/lib/utils';

const difficultyColors = {
  beginner: 'bg-tech-green/10 text-tech-green border-tech-green/20',
  intermediate: 'bg-tech-orange/10 text-tech-orange border-tech-orange/20',
  advanced: 'bg-tech-pink/10 text-tech-pink border-tech-pink/20',
};

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addProjectItems } = useShoppingCart();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as (Project & { category: Category }) | null;
    },
  });

  const { data: parts, isLoading: partsLoading } = useQuery({
    queryKey: ['project-parts', project?.id],
    queryFn: async () => {
      if (!project) return [];
      const { data, error } = await supabase
        .from('project_parts')
        .select('*, product:products(*)')
        .eq('project_id', project.id);
      if (error) throw error;
      return data as (ProjectPart & { product: Product })[];
    },
    enabled: !!project,
  });

  const { data: isFavorite, refetch: refetchFavorite } = useQuery({
    queryKey: ['is-favorite', user?.id, project?.id],
    queryFn: async () => {
      if (!user || !project) return false;
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', project.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!project,
  });

  const toggleFavorite = async () => {
    if (!user || !project) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites.',
        variant: 'destructive',
      });
      return;
    }

    if (isFavorite) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('project_id', project.id);
    } else {
      await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, project_id: project.id });
    }

    refetchFavorite();
    toast({
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    });
  };

  const handleBuildThis = () => {
    if (!parts || parts.length === 0) {
      toast({
        title: 'No components',
        description: 'This project has no components listed yet.',
        variant: 'destructive',
      });
      return;
    }

    const items = parts
      .filter(part => part.product)
      .map(part => ({
        product: part.product,
        quantity: part.quantity || 1,
      }));

    addProjectItems(items, project?.title || 'Project');
    toast({
      title: 'Added to Cart!',
      description: `${items.length} components from ${project?.title} added to your cart.`,
    });
  };

  const totalCost = parts?.reduce((sum, part) => {
    return sum + (part.product?.price || 0) * (part.quantity || 1);
  }, 0) || 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Link to="/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Back button */}
        <Link to="/projects">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src={project.image_url || '/placeholder.svg'}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={toggleFavorite}
              >
                <Heart className={cn('h-5 w-5', isFavorite && 'fill-destructive text-destructive')} />
              </Button>
            </div>

            {/* Project Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {project.category && (
                  <Badge variant="secondary">{project.category.name}</Badge>
                )}
                <Badge variant="outline" className={difficultyColors[project.difficulty]}>
                  {project.difficulty}
                </Badge>
                {project.featured && (
                  <Badge className="gradient-primary border-0">Featured</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
              
              <p className="text-muted-foreground text-lg">{project.description}</p>

              <div className="flex items-center gap-6 text-muted-foreground">
                {project.estimated_cost && (
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    <span>Est. ₹{project.estimated_cost?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {project.estimated_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{project.estimated_time}</span>
                  </div>
                )}
              </div>

              {/* Build This Button */}
              {parts && parts.length > 0 && (
                <Button 
                  size="lg" 
                  className="gradient-primary text-primary-foreground gap-2"
                  onClick={handleBuildThis}
                >
                  <Wrench className="h-5 w-5" />
                  Build This Project - Add All to Cart
                </Button>
              )}
            </div>

            <Separator />

            {/* Build Guide Wizard */}
            {parts && parts.length > 0 && (
              <ProjectBuildWizard 
                project={project} 
                parts={parts} 
                onAddToCart={handleBuildThis}
              />
            )}

            <Separator />

            {/* Parts List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Parts List</h2>
              <div className="space-y-4">
                {partsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))
                ) : parts?.length === 0 ? (
                  <p className="text-muted-foreground">No parts listed for this project yet.</p>
                ) : (
                  parts?.map((part) => (
                    <ProductCard
                      key={part.id}
                      product={part.product}
                      quantity={part.quantity}
                      notes={part.notes || undefined}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Price Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parts && parts.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {parts?.map((part) => (
                        <div key={part.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate pr-2">
                            {part.product?.name} {part.quantity > 1 && `×${part.quantity}`}
                          </span>
                          <span>₹{((part.product?.price || 0) * (part.quantity || 1)).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>

                    <Button 
                      className="w-full gradient-primary text-primary-foreground gap-2"
                      onClick={handleBuildThis}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add All to Cart
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      * Prices are estimates and may vary. Click individual items to view current prices.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No components listed for this project yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
