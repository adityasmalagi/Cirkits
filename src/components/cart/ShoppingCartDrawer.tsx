import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, ExternalLink, IndianRupee, X, MapPin, Minus, Plus, Loader2 } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

// Shipping rates based on pincode zones
const getShippingCost = (pincode: string, totalItems: number): { cost: number; zone: string; days: string } | null => {
  if (!pincode || pincode.length !== 6) return null;
  
  const firstDigit = parseInt(pincode[0]);
  const baseCost = totalItems * 15; // ₹15 per item base
  
  // Zone-based shipping (simplified Indian pincode zones)
  const zones: Record<number, { zone: string; multiplier: number; days: string }> = {
    1: { zone: 'Delhi NCR', multiplier: 1, days: '2-3 days' },
    2: { zone: 'North India', multiplier: 1.2, days: '3-4 days' },
    3: { zone: 'Rajasthan', multiplier: 1.3, days: '3-5 days' },
    4: { zone: 'West India', multiplier: 1.2, days: '3-4 days' },
    5: { zone: 'South India', multiplier: 1.4, days: '4-5 days' },
    6: { zone: 'South India', multiplier: 1.4, days: '4-5 days' },
    7: { zone: 'East India', multiplier: 1.5, days: '4-6 days' },
    8: { zone: 'Northeast', multiplier: 1.8, days: '5-7 days' },
    9: { zone: 'Remote Areas', multiplier: 2, days: '6-8 days' },
  };
  
  const zoneInfo = zones[firstDigit] || zones[9];
  const shippingCost = Math.round(baseCost * zoneInfo.multiplier);
  
  // Free shipping over ₹2000
  if (shippingCost > 0) {
    return {
      cost: shippingCost < 49 ? 49 : shippingCost,
      zone: zoneInfo.zone,
      days: zoneInfo.days,
    };
  }
  
  return { cost: shippingCost, zone: zoneInfo.zone, days: zoneInfo.days };
};

export function ShoppingCartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems, isOpen, setIsOpen, isLoading } = useShoppingCart();
  const { user } = useAuth();
  const [pincode, setPincode] = useState('');
  const [shippingInfo, setShippingInfo] = useState<{ cost: number; zone: string; days: string } | null>(null);

  const calculateShipping = () => {
    const info = getShippingCost(pincode, getTotalItems());
    setShippingInfo(info);
  };

  const buyAllOnAmazon = () => {
    // Check if any items have ASINs for direct cart add
    const itemsWithAsin = items.filter(item => (item.product as any).amazon_asin);
    const itemsWithoutAsin = items.filter(item => !(item.product as any).amazon_asin);
    
    if (itemsWithAsin.length > 0) {
      // Build Amazon cart URL with all ASIN items
      const params = new URLSearchParams();
      itemsWithAsin.forEach((item, index) => {
        params.append(`ASIN.${index + 1}`, (item.product as any).amazon_asin);
        params.append(`Quantity.${index + 1}`, item.quantity.toString());
      });
      
      const amazonCartUrl = `https://www.amazon.in/gp/aws/cart/add.html?${params.toString()}`;
      window.open(amazonCartUrl, '_blank');
    }
    
    // For items without ASIN, open individual affiliate links with stagger
    itemsWithoutAsin.forEach((item, index) => {
      if (item.product.affiliate_url) {
        setTimeout(() => {
          window.open(item.product.affiliate_url, '_blank');
        }, (itemsWithAsin.length > 0 ? 500 : 0) + index * 300);
      }
    });
  };

  const subtotal = getTotalPrice();
  const isFreeShipping = subtotal >= 2000;
  const shippingCost = isFreeShipping ? 0 : (shippingInfo?.cost || 0);
  const grandTotal = subtotal + shippingCost;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({getTotalItems()} items)
          </SheetTitle>
        </SheetHeader>

        {!user && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <Link to="/auth" className="text-primary hover:underline font-medium">Sign in</Link>
            {' '}to save your cart between sessions
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          ₹{item.product.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
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
              {/* Shipping Calculator */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Estimate Shipping
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(val);
                      if (val.length < 6) setShippingInfo(null);
                    }}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={calculateShipping}
                    disabled={pincode.length !== 6}
                  >
                    Check
                  </Button>
                </div>
                {shippingInfo && (
                  <div className="text-sm bg-muted/50 rounded-lg p-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zone:</span>
                      <span>{shippingInfo.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery:</span>
                      <span>{shippingInfo.days}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Shipping:</span>
                      <span className={isFreeShipping ? 'text-tech-green' : ''}>
                        {isFreeShipping ? 'FREE' : `₹${shippingInfo.cost}`}
                      </span>
                    </div>
                  </div>
                )}
                {subtotal > 0 && subtotal < 2000 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(2000 - subtotal).toLocaleString('en-IN')} more for free shipping!
                  </p>
                )}
                {isFreeShipping && (
                  <p className="text-xs text-tech-green font-medium">
                    ✓ You qualify for free shipping!
                  </p>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {shippingInfo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={isFreeShipping ? 'text-tech-green' : ''}>
                      {isFreeShipping ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
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
                Items with ASIN are added to one cart, others open in new tabs
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
