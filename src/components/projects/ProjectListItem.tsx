import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Clock, IndianRupee, ShoppingCart } from 'lucide-react';
import { Project, Category, ProjectPart } from '@/types/database';
import { cn } from '@/lib/utils';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useAuth } from '@/hooks/useAuth';

interface ProjectListItemProps {
  project: Project & { category?: Category; project_parts?: ProjectPart[] };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const difficultyColors = {
  beginner: 'bg-tech-green/10 text-tech-green border-tech-green/20',
  intermediate: 'bg-tech-orange/10 text-tech-orange border-tech-orange/20',
  advanced: 'bg-tech-pink/10 text-tech-pink border-tech-pink/20',
};

export function ProjectListItem({ project, isFavorite, onToggleFavorite }: ProjectListItemProps) {
  const { addProjectItems } = useShoppingCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const parts = project.project_parts || [];
  
  const actualTotal = parts.reduce((sum, part) => {
    const price = part.product?.price || 0;
    const qty = part.quantity || 1;
    return sum + (price * qty);
  }, 0);

  const handleProjectClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/auth');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (parts.length === 0) return;
    
    const cartItems = parts
      .filter(part => part.product)
      .map(part => ({
        product: part.product!,
        quantity: part.quantity || 1,
      }));
    
    addProjectItems(cartItems, project.title);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:shadow-md transition-all">
      {/* Thumbnail */}
      <Link 
        to={`/projects/${project.slug}`} 
        onClick={handleProjectClick}
        className="flex-shrink-0"
      >
        <img
          src={project.image_url || '/placeholder.svg'}
          alt={project.title}
          className="w-16 h-16 object-cover rounded-md"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={cn(difficultyColors[project.difficulty], 'text-[10px] px-1.5 py-0')}>
            {project.difficulty}
          </Badge>
          {project.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {project.category.name}
            </Badge>
          )}
          {project.featured && (
            <Badge className="gradient-primary border-0 text-[10px] px-1.5 py-0">Featured</Badge>
          )}
        </div>
        
        <Link to={`/projects/${project.slug}`} onClick={handleProjectClick}>
          <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {project.estimated_time && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {project.estimated_time}
            </span>
          )}
          <span className="flex items-center gap-0.5 font-semibold text-primary">
            <IndianRupee className="h-3 w-3" />
            {actualTotal > 0 
              ? actualTotal.toLocaleString('en-IN')
              : project.estimated_cost?.toLocaleString('en-IN') || '0'
            }
          </span>
          {parts.length > 0 && (
            <span>{parts.length} parts</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {parts.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        )}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-destructive text-destructive')} />
          </Button>
        )}
      </div>
    </div>
  );
}