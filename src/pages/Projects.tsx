import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, IndianRupee } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Project, DifficultyLevel } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type BudgetRange = 'all' | 'under1000' | '1000to5000' | 'above5000';

const budgetRanges = [
  { id: 'all' as BudgetRange, label: 'All Budgets', range: '₹0 - ∞' },
  { id: 'under1000' as BudgetRange, label: 'Under ₹1,000', range: '≤₹1K' },
  { id: '1000to5000' as BudgetRange, label: '₹1,000 - ₹5,000', range: '₹1K-5K' },
  { id: 'above5000' as BudgetRange, label: 'Above ₹5,000', range: '₹5K+' },
];

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState<BudgetRange>('all');
  const { user } = useAuth();
  const { toast } = useToast();
  
  const categoryFilter = searchParams.get('category');
  const difficultyFilter = searchParams.get('difficulty') as DifficultyLevel | null;

  const { data: categories } = useQuery({
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

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', categoryFilter, difficultyFilter, search],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*, category:categories(*), project_parts(*, product:products(*))');

      if (categoryFilter) {
        const category = categories?.find(c => c.slug === categoryFilter);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      if (difficultyFilter) {
        query = query.eq('difficulty', difficultyFilter);
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query.order('featured', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Project & { category: Category; project_parts: any[] })[];
    },
    enabled: !!categories,
  });

  // Filter projects by budget on the client side
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      const cost = project.estimated_cost || 0;
      switch (budgetFilter) {
        case 'under1000':
          return cost < 1000;
        case '1000to5000':
          return cost >= 1000 && cost <= 5000;
        case 'above5000':
          return cost > 5000;
        default:
          return true;
      }
    });
  }, [projects, budgetFilter]);

  const { data: favorites, refetch: refetchFavorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_favorites')
        .select('project_id')
        .eq('user_id', user.id)
        .not('project_id', 'is', null);
      if (error) throw error;
      return data.map(f => f.project_id);
    },
    enabled: !!user,
  });

  const toggleFavorite = async (projectId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save favorites.',
        variant: 'destructive',
      });
      return;
    }

    const isFavorite = favorites?.includes(projectId);

    if (isFavorite) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('project_id', projectId);
    } else {
      await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, project_id: projectId });
    }

    refetchFavorites();
    toast({
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    });
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
    setBudgetFilter('all');
  };

  const hasFilters = categoryFilter || difficultyFilter || search || budgetFilter !== 'all';

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Browse our curated collection of hardware projects
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2 flex items-center gap-1">
            💡 Prices shown are estimates and may vary. Click product links for current Amazon prices.
          </p>
        </div>

        {/* Budget Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            Budget:
          </span>
          {budgetRanges.map((range) => (
            <Button
              key={range.id}
              variant={budgetFilter === range.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBudgetFilter(range.id)}
              className={cn(
                budgetFilter === range.id && 'gradient-primary text-primary-foreground'
              )}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={categoryFilter || 'all'}
            onValueChange={(value) => {
              const newParams = new URLSearchParams(searchParams);
              if (value === 'all') {
                newParams.delete('category');
              } else {
                newParams.set('category', value);
              }
              setSearchParams(newParams);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter || 'all'}
            onValueChange={(value) => {
              const newParams = new URLSearchParams(searchParams);
              if (value === 'all') {
                newParams.delete('difficulty');
              } else {
                newParams.set('difficulty', value);
              }
              setSearchParams(newParams);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categoryFilter && (
              <Badge variant="secondary" className="gap-1">
                {categories?.find(c => c.slug === categoryFilter)?.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('category');
                    setSearchParams(newParams);
                  }}
                />
              </Badge>
            )}
            {difficultyFilter && (
              <Badge variant="secondary" className="gap-1">
                {difficultyFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('difficulty');
                    setSearchParams(newParams);
                  }}
                />
              </Badge>
            )}
            {budgetFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {budgetRanges.find(b => b.id === budgetFilter)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setBudgetFilter('all')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))
          ) : filteredProjects?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            filteredProjects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isFavorite={favorites?.includes(project.id)}
                onToggleFavorite={() => toggleFavorite(project.id)}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
