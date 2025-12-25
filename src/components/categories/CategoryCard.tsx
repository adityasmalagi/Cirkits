import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Cpu, Server, Wifi, Brain, Box, LucideIcon } from 'lucide-react';
import { Category } from '@/types/database';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  projectCount?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Cpu,
  Server,
  Wifi,
  Brain,
  Box,
};

const categoryColors: Record<string, string> = {
  'pc-builds': 'from-tech-blue to-tech-purple',
  'arduino': 'from-tech-cyan to-tech-blue',
  'raspberry-pi': 'from-tech-pink to-tech-purple',
  'esp32': 'from-tech-green to-tech-cyan',
  'jetson-nano': 'from-tech-orange to-tech-pink',
  '3d-printing': 'from-tech-purple to-tech-pink',
};

export function CategoryCard({ category, projectCount }: CategoryCardProps) {
  const Icon = iconMap[category.icon || 'Box'] || Box;
  const gradientClass = categoryColors[category.slug] || 'from-primary to-tech-purple';

  return (
    <Link to={`/projects?category=${category.slug}`}>
      <Card className="group overflow-hidden card-hover cursor-pointer">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
          <div className={cn(
            'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center',
            'transition-transform duration-300 group-hover:scale-110',
            gradientClass
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-semibold">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
          )}
          {projectCount !== undefined && (
            <span className="text-xs text-muted-foreground">{projectCount} projects</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
