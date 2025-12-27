import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, Cpu, Zap, ChevronRight, CircuitBoard, Wrench, Bot, Shield, Headphones, Upload, Monitor } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Project } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

const services = [
  {
    icon: CircuitBoard,
    title: 'Hardware Projects',
    description: 'Curated projects for Arduino, ESP32, Raspberry Pi, Jetson Nano and more with complete parts lists.',
  },
  {
    icon: Upload,
    title: 'Upload Your Project',
    description: 'Share your hardware creations with the community and help others learn from your builds.',
  },
  {
    icon: Wrench,
    title: 'PC Building',
    description: 'Build your dream PC with curated component lists and compatibility checks.',
  },
  {
    icon: Bot,
    title: 'AI Suggestions',
    description: 'Get personalized hardware recommendations powered by AI based on your requirements.',
  },
  {
    icon: Shield,
    title: 'Trusted Components',
    description: 'All products are vetted and linked to trusted sellers for safe purchasing.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our AI assistant is always available to help you with your hardware questions.',
  },
];

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
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-[90vh] flex items-center">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
        
        {/* Floating circuit elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          {/* Large rotating ring */}
          <div className="absolute -top-20 -right-20 w-96 h-96 opacity-10">
            <div className="w-full h-full border-4 border-primary rounded-full animate-spin-slow" />
          </div>
          
          {/* Floating circuit boards */}
          <div className="absolute top-20 left-10 animate-float" style={{ animationDelay: '0s' }}>
            <div className="w-16 h-16 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
              <CircuitBoard className="h-8 w-8 text-primary/40" />
            </div>
          </div>
          
          <div className="absolute top-40 right-20 animate-float-reverse" style={{ animationDelay: '1s' }}>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-purple-500/40" />
            </div>
          </div>
          
          <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
            <div className="w-14 h-14 rounded-lg bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20 flex items-center justify-center">
              <Zap className="h-7 w-7 text-cyan-500/40" />
            </div>
          </div>
          
          <div className="absolute bottom-40 right-32 animate-float-reverse" style={{ animationDelay: '0.5s' }}>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 backdrop-blur-sm border border-green-500/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-green-500/40" />
            </div>
          </div>
          
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] hidden sm:block" />
        
        <div className="container relative py-12 md:py-20 lg:py-32 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
              AI-Powered Hardware Recommendations
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Your Complete
              <span className="text-gradient block">Electronics Platform</span>
            </h1>
            
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Discover curated hardware projects for Arduino, ESP32, Raspberry Pi, and more. Get AI-powered recommendations for your next build.
            </p>

            <div className="flex flex-col gap-3 justify-center pt-2 md:pt-4 px-4 md:flex-row md:gap-4">
              <Link to="/projects" className="w-full md:w-auto">
                <Button size="lg" className="gradient-primary text-primary-foreground gap-2 w-full shadow-glow hover:shadow-lg transition-shadow h-12">
                  Browse Projects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ai-suggest" className="w-full md:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full backdrop-blur-sm h-12">
                  <Sparkles className="h-4 w-4" />
                  AI Suggestions
                </Button>
              </Link>
              <Link to="/pc-build" className="w-full md:hidden">
                <Button size="lg" variant="outline" className="gap-2 w-full backdrop-blur-sm h-12">
                  <Cpu className="h-4 w-4" />
                  PC Build
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card/50">
        <div className="container py-8 md:py-12 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Cpu, value: '50+', label: 'Hardware Projects' },
              { icon: Zap, value: 'AI', label: 'Powered Suggestions' },
              { icon: Monitor, value: 'Custom', label: 'PC Build Suggestion' },
              { icon: Sparkles, value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-1 md:space-y-2">
                <stat.icon className="h-6 w-6 md:h-8 md:w-8 mx-auto text-primary" />
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container py-10 md:py-16 px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Our Services</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Everything you need to bring your hardware projects to life, from component selection to AI-powered recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg gradient-primary flex items-center justify-center">
                  <service.icon className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold">{service.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted/50 py-10 md:py-16">
        <div className="container px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Browse by Category</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Explore projects across different platforms</p>
            </div>
            <Link to="/projects">
              <Button variant="ghost" className="gap-2">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 md:h-40" />
              ))
            ) : (
              categories?.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="container py-10 md:py-16 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Featured Projects</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Hand-picked builds to get you started</p>
          </div>
          <Link to="/projects">
            <Button variant="ghost" className="gap-2">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {projectsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 md:h-80" />
            ))
          ) : (
            featuredProjects?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </section>

      {/* AI CTA Section */}
      <section className="container py-10 md:py-16 px-4">
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl gradient-primary p-6 md:p-8 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs md:text-sm mb-3 md:mb-4">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
              New Feature
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
              Let AI Build Your Perfect Project
            </h2>
            <p className="text-white/80 text-sm md:text-lg mb-4 md:mb-6">
              Describe your idea and our AI will generate a custom parts list with compatible components tailored to your budget and needs.
            </p>
            <Link to="/ai-suggest">
              <Button size="lg" variant="secondary" className="gap-2 h-12">
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