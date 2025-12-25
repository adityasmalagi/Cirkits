import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Clock, IndianRupee, ExternalLink, ShoppingCart } from 'lucide-react';
import { Project, Category, ProjectPart } from '@/types/database';
import { cn } from '@/lib/utils';
import { useShoppingCart } from '@/hooks/useShoppingCart';

interface ProjectCardProps {
  project: Project & { category?: Category; project_parts?: ProjectPart[] };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const difficultyColors = {
  beginner: 'bg-tech-green/10 text-tech-green border-tech-green/20',
  intermediate: 'bg-tech-orange/10 text-tech-orange border-tech-orange/20',
  advanced: 'bg-tech-pink/10 text-tech-pink border-tech-pink/20',
};

export function ProjectCard({ project, isFavorite, onToggleFavorite }: ProjectCardProps) {
  const { addProjectItems, setIsOpen } = useShoppingCart();
  const parts = project.project_parts || [];
  
  // Calculate actual total from parts
  const actualTotal = parts.reduce((sum, part) => {
    const price = part.product?.price || 0;
    const qty = part.quantity || 1;
    return sum + (price * qty);
  }, 0);

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
    <Card className="group overflow-hidden card-hover flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image_url || '/placeholder.svg'}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-destructive text-destructive')} />
          </Button>
        )}
        {project.featured && (
          <Badge className="absolute top-2 left-2 gradient-primary border-0">Featured</Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap">
          {project.category && (
            <Badge variant="secondary">{project.category.name}</Badge>
          )}
          <Badge variant="outline" className={difficultyColors[project.difficulty]}>
            {project.difficulty}
          </Badge>
        </div>
        
        <Link to={`/projects/${project.slug}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {/* Components List */}
        {parts.length > 0 && (
          <div className="space-y-2 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Required Components ({parts.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {parts.slice(0, 4).map((part) => (
                <div key={part.id} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 text-muted-foreground">
                    {part.quantity && part.quantity > 1 ? `${part.quantity}× ` : ''}
                    {part.product?.name || 'Unknown'}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="font-medium">
                      ₹{((part.product?.price || 0) * (part.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                    {part.product?.affiliate_url && (
                      <a
                        href={part.product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {parts.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  +{parts.length - 4} more components
                </p>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 border-t space-y-3 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {project.estimated_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{project.estimated_time}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 font-bold text-primary">
              <IndianRupee className="h-4 w-4" />
              <span>
                {actualTotal > 0 
                  ? actualTotal.toLocaleString('en-IN')
                  : project.estimated_cost?.toLocaleString('en-IN') || '0'
                }
              </span>
            </div>
          </div>

          {parts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 hover:gradient-primary hover:text-primary-foreground hover:border-transparent"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Add All to Cart
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
