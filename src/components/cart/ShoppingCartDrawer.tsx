import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, ExternalLink, IndianRupee, X } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';

export function ShoppingCartDrawer() {
  const { items, removeItem, clearCart, getTotalPrice, getTotalItems, isOpen, setIsOpen } = useShoppingCart();

  const buyAllOnAmazon = () => {
    items.forEach(item => {
      if (item.product.affiliate_url) {
        window.open(item.product.affiliate_url, '_blank');
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({getTotalItems()} items)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-2">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add components from projects to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                      {item.projectTitle && (
                        <p className="text-xs text-muted-foreground">For: {item.projectTitle}</p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm">
                          ₹{item.product.price?.toLocaleString('en-IN')} × {item.quantity}
                        </span>
                        <span className="font-medium text-primary text-sm">
                          ₹{((item.product.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-primary flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {getTotalPrice().toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full gradient-primary text-primary-foreground gap-2"
                  onClick={buyAllOnAmazon}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy All on Amazon
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Each item opens in a new Amazon tab
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
