import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, Cpu, HardDrive, MonitorSmartphone } from 'lucide-react';
import { Laptop } from '@/types/database';
import { cn } from '@/lib/utils';

interface LaptopCardProps {
  laptop: Laptop;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function LaptopCard({ laptop, isFavorite, onToggleFavorite }: LaptopCardProps) {
  return (
    <Card className="group overflow-hidden card-hover">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={laptop.image_url || '/placeholder.svg'}
          alt={laptop.name}
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
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{laptop.brand}</Badge>
          {laptop.screen_size && (
            <span className="text-sm text-muted-foreground">{laptop.screen_size}"</span>
          )}
        </div>
        
        <h3 className="font-semibold text-lg line-clamp-1">{laptop.name}</h3>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {laptop.cpu && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Cpu className="h-3 w-3" />
              <span className="truncate">{laptop.cpu}</span>
            </div>
          )}
          {laptop.ram && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              <span>{laptop.ram}GB RAM</span>
            </div>
          )}
          {laptop.gpu && (
            <div className="flex items-center gap-1 text-muted-foreground col-span-2">
              <MonitorSmartphone className="h-3 w-3" />
              <span className="truncate">{laptop.gpu}</span>
            </div>
          )}
        </div>

        {laptop.use_cases && laptop.use_cases.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {laptop.use_cases.slice(0, 3).map((useCase) => (
              <Badge key={useCase} variant="outline" className="text-xs">
                {useCase}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-lg">
            ₹{laptop.price?.toLocaleString('en-IN')}
          </span>
          {laptop.affiliate_url && (
            <Button size="sm" className="gradient-primary text-primary-foreground gap-1">
              <ExternalLink className="h-3 w-3" />
              Buy Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
