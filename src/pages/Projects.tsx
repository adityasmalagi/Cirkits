import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectListItem } from '@/components/projects/ProjectListItem';
import { SubmitProjectDialog } from '@/components/projects/SubmitProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, IndianRupee, Zap, Gauge, Rocket, ArrowUpDown, ArrowUp, ArrowDown, Clock, LayoutGrid, List, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, Project, DifficultyLevel } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const ITEMS_PER_PAGE = 12;

type BudgetRange = 'all' | 'under1000' | '1000to5000' | 'above5000';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'difficulty-asc' | 'difficulty-desc';

const budgetRanges = [
  { id: 'all' as BudgetRange, label: 'All Budgets', range: 'All' },
  { id: 'under1000' as BudgetRange, label: 'Under ₹1,000', range: '< ₹1K' },
  { id: '1000to5000' as BudgetRange, label: '₹1,000 - ₹5,000', range: '₹1K-5K' },
  { id: 'above5000' as BudgetRange, label: 'Above ₹5,000', range: '> ₹5K' },
];

const difficultyLevels = [
  { id: 'all', label: 'All Levels', icon: null, color: '' },
  { id: 'beginner', label: 'Beginner', icon: Zap, color: 'text-green-500 bg-green-500/10 border-green-500/30 hover:bg-green-500/20' },
  { id: 'intermediate', label: 'Intermediate', icon: Gauge, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20' },
  { id: 'advanced', label: 'Advanced', icon: Rocket, color: 'text-red-500 bg-red-500/10 border-red-500/30 hover:bg-red-500/20' },
];

const sortOptions = [
  { id: 'newest' as SortOption, label: 'Newest First', icon: Clock },
  { id: 'price-low' as SortOption, label: 'Price: Low to High', icon: ArrowUp },
  { id: 'price-high' as SortOption, label: 'Price: High to Low', icon: ArrowDown },
  { id: 'difficulty-asc' as SortOption, label: 'Difficulty: Easy First', icon: Zap },
  { id: 'difficulty-desc' as SortOption, label: 'Difficulty: Hard First', icon: Rocket },
];

const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState<BudgetRange>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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

  // Fetch ALL projects for counting (with parts for accurate cost calculation)
  const { data: allProjects } = useQuery({
    queryKey: ['all-projects-for-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, difficulty, estimated_cost, category_id, project_parts(quantity, product:products(price))');
      if (error) throw error;
      return data;
    },
  });

  // Helper to calculate actual cost from parts for counting
  const getProjectCost = (project: any) => {
    const parts = project.project_parts || [];
    if (parts.length === 0) return project.estimated_cost || 0;
    
    return parts.reduce((sum: number, part: any) => {
      const price = part.product?.price || 0;
      const qty = part.quantity || 1;
      return sum + (price * qty);
    }, 0);
  };

  // Calculate counts for filters
  const filterCounts = useMemo(() => {
    if (!allProjects) return { difficulty: {}, budget: {}, category: {} };

    const difficulty: Record<string, number> = { all: allProjects.length, beginner: 0, intermediate: 0, advanced: 0 };
    const budget: Record<string, number> = { all: allProjects.length, under1000: 0, '1000to5000': 0, above5000: 0 };
    const category: Record<string, number> = {};

    allProjects.forEach(p => {
      // Difficulty counts
      if (p.difficulty) {
        difficulty[p.difficulty] = (difficulty[p.difficulty] || 0) + 1;
      }
      
      // Budget counts using actual calculated cost
      const cost = getProjectCost(p);
      if (cost < 1000) budget.under1000++;
      else if (cost <= 5000) budget['1000to5000']++;
      else budget.above5000++;

      // Category counts
      if (p.category_id) {
        category[p.category_id] = (category[p.category_id] || 0) + 1;
      }
    });

    return { difficulty, budget, category };
  }, [allProjects]);

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

  // Helper to calculate actual cost from parts
  const getActualCost = (project: Project & { project_parts?: any[] }) => {
    const parts = project.project_parts || [];
    if (parts.length === 0) return project.estimated_cost || 0;
    
    return parts.reduce((sum, part) => {
      const price = part.product?.price || 0;
      const qty = part.quantity || 1;
      return sum + (price * qty);
    }, 0);
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    let result = projects.filter(project => {
      // Use actual calculated cost from parts for filtering
      const cost = getActualCost(project);
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

    // Sort projects using actual cost
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return getActualCost(a) - getActualCost(b);
        case 'price-high':
          return getActualCost(b) - getActualCost(a);
        case 'difficulty-asc':
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        case 'difficulty-desc':
          return (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [projects, budgetFilter, sortBy]);

  // Paginated projects for display
  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, displayCount);
  }, [filteredProjects, displayCount]);

  const hasMore = displayCount < filteredProjects.length;

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [categoryFilter, difficultyFilter, search, budgetFilter, sortBy]);

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

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
    setSortBy('newest');
  };

  const hasFilters = categoryFilter || difficultyFilter || search || budgetFilter !== 'all' || sortBy !== 'newest';

  return (
    <Layout>
      <div className="container py-4 md:py-8 px-3 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col gap-3 md:gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold">Project Catalog</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Browse our curated collection of hardware projects
              </p>
            </div>
            <div className="flex-shrink-0">
              <SubmitProjectDialog />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
            💡 Prices are estimates. Click links for current prices.
          </p>
        </div>

        {/* Difficulty Filter - Visual buttons with counts */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground flex-shrink-0">
              Difficulty:
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
            {difficultyLevels.map((level) => {
              const isActive = (level.id === 'all' && !difficultyFilter) || difficultyFilter === level.id;
              const Icon = level.icon;
              const count = filterCounts.difficulty[level.id] || 0;
              return (
                <Button
                  key={level.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    if (level.id === 'all') {
                      newParams.delete('difficulty');
                    } else {
                      newParams.set('difficulty', level.id);
                    }
                    setSearchParams(newParams);
                  }}
                  className={cn(
                    'flex-shrink-0 text-xs md:text-sm min-h-[36px] md:min-h-[32px] gap-1.5 border transition-all',
                    isActive && level.id !== 'all' && level.color,
                    isActive && level.id === 'all' && 'bg-primary text-primary-foreground border-primary',
                    !isActive && 'hover:bg-muted'
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {level.label}
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-1 h-5 min-w-5 px-1.5 text-[10px] font-medium",
                      isActive && level.id === 'all' && 'bg-primary-foreground/20 text-primary-foreground',
                      isActive && level.id !== 'all' && 'bg-current/10'
                    )}
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Budget Filter Buttons with counts */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1 flex-shrink-0">
              <IndianRupee className="h-3 w-3 md:h-4 md:w-4" />
              Budget:
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
            {budgetRanges.map((range) => {
              const count = filterCounts.budget[range.id] || 0;
              return (
                <Button
                  key={range.id}
                  variant={budgetFilter === range.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBudgetFilter(range.id)}
                  className={cn(
                    'flex-shrink-0 text-xs md:text-sm min-h-[36px] md:min-h-[32px] transition-all gap-1.5',
                    budgetFilter === range.id && 'gradient-primary text-primary-foreground'
                  )}
                >
                  <span className="hidden md:inline">{range.label}</span>
                  <span className="md:hidden">{range.range}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "h-5 min-w-5 px-1.5 text-[10px] font-medium",
                      budgetFilter === range.id && 'bg-primary-foreground/20 text-primary-foreground'
                    )}
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Search, Category Filter, and Sort */}
        <div className="space-y-3 md:space-y-0 md:flex md:flex-row md:gap-4 mb-6 md:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 md:h-9"
            />
          </div>

          <div className="flex gap-2 md:gap-4">
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
              <SelectTrigger className="flex-1 md:w-44 h-10 md:h-9 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({allProjects?.length || 0})</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name} ({filterCounts.category[cat.id] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="flex-1 md:w-48 h-10 md:h-9 text-sm">
                <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.id} value={option.id}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        {option.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* View Mode Toggle - Mobile Only */}
            {isMobile && (
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-10 w-10 rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-10 w-10 rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2 h-10 md:h-9 flex-shrink-0">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
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
              <Badge 
                variant="secondary" 
                className={cn(
                  "gap-1 capitalize",
                  difficultyFilter === 'beginner' && 'bg-green-500/10 text-green-600 border-green-500/30',
                  difficultyFilter === 'intermediate' && 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
                  difficultyFilter === 'advanced' && 'bg-red-500/10 text-red-600 border-red-500/30'
                )}
              >
                {difficultyFilter === 'beginner' && <Zap className="h-3 w-3" />}
                {difficultyFilter === 'intermediate' && <Gauge className="h-3 w-3" />}
                {difficultyFilter === 'advanced' && <Rocket className="h-3 w-3" />}
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
                <IndianRupee className="h-3 w-3" />
                {budgetRanges.find(b => b.id === budgetFilter)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setBudgetFilter('all')}
                />
              </Badge>
            )}
            {sortBy !== 'newest' && (
              <Badge variant="secondary" className="gap-1">
                <ArrowUpDown className="h-3 w-3" />
                {sortOptions.find(s => s.id === sortBy)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSortBy('newest')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Projects Grid/List */}
        {isMobile && viewMode === 'list' ? (
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))
            ) : filteredProjects?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found matching your criteria.</p>
                <Button variant="link" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {displayedProjects?.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    isFavorite={favorites?.includes(project.id)}
                    onToggleFavorite={() => toggleFavorite(project.id)}
                  />
                ))}
                {/* Swipe hint on first load */}
                {displayedProjects.length > 0 && displayCount === ITEMS_PER_PAGE && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    💡 Swipe right to add to cart, left to favorite
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 md:h-80" />
              ))
            ) : filteredProjects?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No projects found matching your criteria.</p>
                <Button variant="link" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              displayedProjects?.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isFavorite={favorites?.includes(project.id)}
                  onToggleFavorite={() => toggleFavorite(project.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Infinite scroll trigger */}
        {!isLoading && filteredProjects.length > 0 && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            ) : hasMore ? (
              <p className="text-sm text-muted-foreground">
                Showing {displayedProjects.length} of {filteredProjects.length} projects
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                All {filteredProjects.length} projects loaded
              </p>
            )}
          </div>
        )}
        </div>
    </Layout>
  );
}
