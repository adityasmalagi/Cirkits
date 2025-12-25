import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Cpu, 
  HardDrive, 
  MonitorSmartphone, 
  Zap, 
  Box, 
  Fan, 
  Keyboard, 
  Mouse, 
  ExternalLink,
  ShoppingCart,
  IndianRupee,
  Check,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PCComponent {
  id: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  specs: string[];
  amazonUrl: string;
  imageUrl?: string;
  recommended?: boolean;
}

const pcComponents: PCComponent[] = [
  // Processors
  {
    id: 'cpu-1',
    category: 'processor',
    name: 'AMD Ryzen 5 5600X',
    brand: 'AMD',
    price: 14999,
    specs: ['6 Cores / 12 Threads', '3.7 GHz Base / 4.6 GHz Boost', '65W TDP', 'PCIe 4.0'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+5+5600X',
    recommended: true,
  },
  {
    id: 'cpu-2',
    category: 'processor',
    name: 'Intel Core i5-12400F',
    brand: 'Intel',
    price: 13499,
    specs: ['6 Cores / 12 Threads', '2.5 GHz Base / 4.4 GHz Boost', '65W TDP', 'LGA 1700'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Core+i5-12400F',
  },
  {
    id: 'cpu-3',
    category: 'processor',
    name: 'AMD Ryzen 7 5800X',
    brand: 'AMD',
    price: 22999,
    specs: ['8 Cores / 16 Threads', '3.8 GHz Base / 4.7 GHz Boost', '105W TDP', 'PCIe 4.0'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+7+5800X',
  },
  // Graphics Cards
  {
    id: 'gpu-1',
    category: 'graphics',
    name: 'NVIDIA RTX 4060',
    brand: 'NVIDIA',
    price: 29999,
    specs: ['8GB GDDR6', 'DLSS 3', 'Ray Tracing', '115W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4060',
    recommended: true,
  },
  {
    id: 'gpu-2',
    category: 'graphics',
    name: 'AMD RX 7600',
    brand: 'AMD',
    price: 26999,
    specs: ['8GB GDDR6', 'FSR 3', 'Ray Tracing', '165W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+RX+7600',
  },
  {
    id: 'gpu-3',
    category: 'graphics',
    name: 'NVIDIA RTX 4070',
    brand: 'NVIDIA',
    price: 49999,
    specs: ['12GB GDDR6X', 'DLSS 3', 'Ray Tracing', '200W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4070',
  },
  // RAM
  {
    id: 'ram-1',
    category: 'memory',
    name: 'Corsair Vengeance LPX 16GB',
    brand: 'Corsair',
    price: 3499,
    specs: ['16GB (2x8GB)', 'DDR4 3200MHz', 'CL16', 'XMP 2.0'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+Vengeance+LPX+16GB+DDR4',
    recommended: true,
  },
  {
    id: 'ram-2',
    category: 'memory',
    name: 'G.Skill Trident Z RGB 32GB',
    brand: 'G.Skill',
    price: 7999,
    specs: ['32GB (2x16GB)', 'DDR4 3600MHz', 'CL18', 'RGB Lighting'],
    amazonUrl: 'https://www.amazon.in/s?k=G.Skill+Trident+Z+RGB+32GB',
  },
  // Storage
  {
    id: 'storage-1',
    category: 'storage',
    name: 'Samsung 970 EVO Plus 1TB',
    brand: 'Samsung',
    price: 6499,
    specs: ['1TB NVMe SSD', '3500MB/s Read', '3300MB/s Write', 'M.2 2280'],
    amazonUrl: 'https://www.amazon.in/s?k=Samsung+970+EVO+Plus+1TB',
    recommended: true,
  },
  {
    id: 'storage-2',
    category: 'storage',
    name: 'WD Blue SN570 500GB',
    brand: 'Western Digital',
    price: 3299,
    specs: ['500GB NVMe SSD', '3500MB/s Read', '2300MB/s Write', 'M.2 2280'],
    amazonUrl: 'https://www.amazon.in/s?k=WD+Blue+SN570+500GB',
  },
  {
    id: 'storage-3',
    category: 'storage',
    name: 'Seagate Barracuda 2TB HDD',
    brand: 'Seagate',
    price: 4299,
    specs: ['2TB HDD', '7200 RPM', '256MB Cache', 'SATA 6Gb/s'],
    amazonUrl: 'https://www.amazon.in/s?k=Seagate+Barracuda+2TB',
  },
  // Motherboards
  {
    id: 'mobo-1',
    category: 'motherboard',
    name: 'MSI B550-A PRO',
    brand: 'MSI',
    price: 10999,
    specs: ['AMD B550', 'ATX', 'PCIe 4.0', 'DDR4 4400MHz'],
    amazonUrl: 'https://www.amazon.in/s?k=MSI+B550-A+PRO',
    recommended: true,
  },
  {
    id: 'mobo-2',
    category: 'motherboard',
    name: 'ASUS ROG Strix B660-A',
    brand: 'ASUS',
    price: 15999,
    specs: ['Intel B660', 'ATX', 'PCIe 5.0', 'DDR5 Support'],
    amazonUrl: 'https://www.amazon.in/s?k=ASUS+ROG+Strix+B660-A',
  },
  // Power Supply
  {
    id: 'psu-1',
    category: 'psu',
    name: 'Corsair RM650',
    brand: 'Corsair',
    price: 7499,
    specs: ['650W', '80+ Gold', 'Fully Modular', 'Zero RPM Mode'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+RM650',
    recommended: true,
  },
  {
    id: 'psu-2',
    category: 'psu',
    name: 'Cooler Master MWE 750 V2',
    brand: 'Cooler Master',
    price: 5999,
    specs: ['750W', '80+ Bronze', 'Semi-Modular', '5 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Cooler+Master+MWE+750',
  },
  // Cases
  {
    id: 'case-1',
    category: 'case',
    name: 'NZXT H510',
    brand: 'NZXT',
    price: 6999,
    specs: ['Mid-Tower ATX', 'Tempered Glass', 'Cable Management', 'USB 3.1'],
    amazonUrl: 'https://www.amazon.in/s?k=NZXT+H510',
    recommended: true,
  },
  {
    id: 'case-2',
    category: 'case',
    name: 'Corsair 4000D Airflow',
    brand: 'Corsair',
    price: 8499,
    specs: ['Mid-Tower ATX', 'High Airflow', 'Tempered Glass', 'Tool-Free'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+4000D+Airflow',
  },
  // Cooling
  {
    id: 'cooler-1',
    category: 'cooling',
    name: 'Cooler Master Hyper 212',
    brand: 'Cooler Master',
    price: 2999,
    specs: ['120mm Tower', '4 Heat Pipes', 'AMD/Intel Compatible', 'RGB'],
    amazonUrl: 'https://www.amazon.in/s?k=Cooler+Master+Hyper+212',
    recommended: true,
  },
  {
    id: 'cooler-2',
    category: 'cooling',
    name: 'NZXT Kraken X53',
    brand: 'NZXT',
    price: 11999,
    specs: ['240mm AIO', 'Infinity Mirror', 'CAM Software', 'RGB'],
    amazonUrl: 'https://www.amazon.in/s?k=NZXT+Kraken+X53',
  },
];

const categories = [
  { id: 'processor', name: 'Processor', icon: Cpu },
  { id: 'graphics', name: 'Graphics Card', icon: MonitorSmartphone },
  { id: 'memory', name: 'RAM', icon: HardDrive },
  { id: 'storage', name: 'Storage', icon: HardDrive },
  { id: 'motherboard', name: 'Motherboard', icon: Box },
  { id: 'psu', name: 'Power Supply', icon: Zap },
  { id: 'case', name: 'Case', icon: Box },
  { id: 'cooling', name: 'Cooling', icon: Fan },
];

export default function PCBuild() {
  const [selectedComponents, setSelectedComponents] = useState<Record<string, PCComponent>>({});

  const toggleComponent = (component: PCComponent) => {
    setSelectedComponents(prev => {
      if (prev[component.category]?.id === component.id) {
        const updated = { ...prev };
        delete updated[component.category];
        return updated;
      }
      return { ...prev, [component.category]: component };
    });
  };

  const totalPrice = Object.values(selectedComponents).reduce((sum, c) => sum + c.price, 0);
  const selectedCount = Object.keys(selectedComponents).length;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">PC Build Configurator</h1>
              <p className="text-muted-foreground">
                Select components to build your dream PC. All prices in Indian Rupees with direct Amazon links.
              </p>
            </div>

            <Tabs defaultValue="processor" className="space-y-6">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                {categories.map((cat) => {
                  const isSelected = !!selectedComponents[cat.id];
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className={cn(
                        'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2',
                        isSelected && 'ring-2 ring-green-500 ring-offset-2'
                      )}
                    >
                      <cat.icon className="h-4 w-4" />
                      {cat.name}
                      {isSelected && <Check className="h-3 w-3 text-green-500" />}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pcComponents
                      .filter((c) => c.category === cat.id)
                      .map((component) => {
                        const isSelected = selectedComponents[cat.id]?.id === component.id;
                        return (
                          <Card
                            key={component.id}
                            className={cn(
                              'cursor-pointer transition-all hover:shadow-lg',
                              isSelected && 'ring-2 ring-primary bg-primary/5'
                            )}
                            onClick={() => toggleComponent(component)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary">{component.brand}</Badge>
                                    {component.recommended && (
                                      <Badge className="gradient-primary border-0 text-xs">Recommended</Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold">{component.name}</h3>
                                </div>
                                <div className={cn(
                                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                                  isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                                )}>
                                  {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {component.specs.map((spec, i) => (
                                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                                    {spec}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">
                                  ₹{component.price.toLocaleString('en-IN')}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(component.amazonUrl, '_blank');
                                  }}
                                >
                                  <ShoppingCart className="h-3 w-3" />
                                  Amazon
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar - Build Summary */}
          <div className="lg:w-80">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Build
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCount === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select components to start building your PC
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {categories.map((cat) => {
                        const component = selectedComponents[cat.id];
                        return (
                          <div key={cat.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{cat.name}</span>
                            </div>
                            {component ? (
                              <div className="text-right">
                                <div className="font-medium truncate max-w-[120px]" title={component.name}>
                                  {component.name.split(' ').slice(0, 2).join(' ')}
                                </div>
                                <div className="text-xs text-primary">
                                  ₹{component.price.toLocaleString('en-IN')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">Not selected</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full gradient-primary text-primary-foreground gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Buy All on Amazon
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Opens each component in a new tab
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>* Prices are approximate and may vary</p>
                  <p>* Check compatibility before purchasing</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
