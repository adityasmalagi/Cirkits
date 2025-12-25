import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  quantity?: number;
  notes?: string;
}

export function ProductCard({ product, quantity = 1, notes }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium line-clamp-1">{product.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
            </div>
            {quantity > 1 && (
              <span className="text-sm text-muted-foreground flex-shrink-0">×{quantity}</span>
            )}
          </div>
          
          {notes && (
            <p className="text-xs text-muted-foreground italic">{notes}</p>
          )}

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                <span key={key} className="text-xs bg-muted px-2 py-1 rounded">
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">
              ₹{product.price?.toLocaleString('en-IN')}
              {quantity > 1 && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  (₹{((product.price || 0) * quantity).toLocaleString('en-IN')} total)
                </span>
              )}
            </span>
            {product.affiliate_url && (
              <Button size="sm" variant="outline" className="gap-1" asChild>
                <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="h-3 w-3" />
                  Buy
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
