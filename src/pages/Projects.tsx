import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Project, DifficultyLevel } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
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
        .select('*, category:categories(*)');

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
      return data as (Project & { category: Category })[];
    },
    enabled: !!categories,
  });

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
  };

  const hasFilters = categoryFilter || difficultyFilter || search;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Browse our curated collection of hardware projects
          </p>
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
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))
          ) : projects?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            projects?.map((project) => (
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
