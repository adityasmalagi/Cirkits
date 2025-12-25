import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ArrowRight, Sparkles, Cpu, Zap, Users, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Project } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

export default function Index() {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: featuredProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, category:categories(*)')
        .eq('featured', true)
        .limit(4);
      if (error) throw error;
      return data as (Project & { category: Category })[];
    },
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Hardware Recommendations
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build Your Perfect
              <span className="text-gradient block">Hardware Project</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover curated PC builds, IoT projects, and get AI-powered recommendations for your next hardware adventure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/projects">
                <Button size="lg" className="gradient-primary text-primary-foreground gap-2 w-full sm:w-auto">
                  Browse Projects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ai-suggest">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  AI Suggestions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Cpu, value: '50+', label: 'Hardware Projects' },
              { icon: Zap, value: 'AI', label: 'Powered Suggestions' },
              { icon: Users, value: '1K+', label: 'Happy Builders' },
              { icon: Sparkles, value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <stat.icon className="h-8 w-8 mx-auto text-primary" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground mt-1">Explore projects across different platforms</p>
          </div>
          <Link to="/projects">
            <Button variant="ghost" className="gap-2">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))
          ) : (
            categories?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Projects</h2>
              <p className="text-muted-foreground mt-1">Hand-picked builds to get you started</p>
            </div>
            <Link to="/projects">
              <Button variant="ghost" className="gap-2">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))
            ) : (
              featuredProjects?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* AI CTA Section */}
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white/90 text-sm mb-4">
              <Sparkles className="h-4 w-4" />
              New Feature
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Let AI Build Your Perfect Project
            </h2>
            <p className="text-white/80 text-lg mb-6">
              Describe your idea and our AI will generate a custom parts list with compatible components tailored to your budget and needs.
            </p>
            <Link to="/ai-suggest">
              <Button size="lg" variant="secondary" className="gap-2">
                Try AI Suggestions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
