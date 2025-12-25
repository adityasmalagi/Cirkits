import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Clock, IndianRupee } from 'lucide-react';
import { Project, Category } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project & { category?: Category };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const difficultyColors = {
  beginner: 'bg-tech-green/10 text-tech-green border-tech-green/20',
  intermediate: 'bg-tech-orange/10 text-tech-orange border-tech-orange/20',
  advanced: 'bg-tech-pink/10 text-tech-pink border-tech-pink/20',
};

export function ProjectCard({ project, isFavorite, onToggleFavorite }: ProjectCardProps) {
  return (
    <Card className="group overflow-hidden card-hover">
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
      <CardContent className="p-4 space-y-3">
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

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {project.estimated_cost && (
            <div className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              <span>₹{project.estimated_cost?.toLocaleString('en-IN')}</span>
            </div>
          )}
          {project.estimated_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{project.estimated_time}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
