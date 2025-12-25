import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Cpu, 
  HardDrive, 
  MonitorSmartphone, 
  Zap, 
  Box, 
  Fan, 
  ExternalLink,
  ShoppingCart,
  IndianRupee,
  Check,
  AlertTriangle,
  Gamepad2,
  Briefcase,
  Wallet,
  Sparkles,
  Share2,
  Copy,
  Link
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
  socket?: string;
  ramType?: string;
  chipset?: string;
}

type BudgetTier = 'all' | 'budget' | 'midrange' | 'highend';

interface PresetBuild {
  id: string;
  name: string;
  description: string;
  icon: typeof Gamepad2;
  components: Record<string, string>;
  totalPrice: number;
}

const pcComponents: PCComponent[] = [
  // === PROCESSORS ===
  // Budget
  {
    id: 'cpu-budget-1',
    category: 'processor',
    name: 'Intel Core i3-12100F',
    brand: 'Intel',
    price: 7999,
    specs: ['4 Cores / 8 Threads', '3.3 GHz Base / 4.3 GHz Boost', '58W TDP', 'LGA 1700'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Core+i3-12100F',
    socket: 'LGA1700',
  },
  {
    id: 'cpu-budget-2',
    category: 'processor',
    name: 'AMD Ryzen 3 4100',
    brand: 'AMD',
    price: 6499,
    specs: ['4 Cores / 8 Threads', '3.8 GHz Base / 4.0 GHz Boost', '65W TDP', 'AM4'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+3+4100',
    socket: 'AM4',
  },
  {
    id: 'cpu-budget-3',
    category: 'processor',
    name: 'Intel Pentium Gold G7400',
    brand: 'Intel',
    price: 5999,
    specs: ['2 Cores / 4 Threads', '3.7 GHz', '46W TDP', 'Integrated Graphics'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Pentium+Gold+G7400',
    socket: 'LGA1700',
  },
  // Mid-Range
  {
    id: 'cpu-mid-1',
    category: 'processor',
    name: 'AMD Ryzen 5 5600X',
    brand: 'AMD',
    price: 14999,
    specs: ['6 Cores / 12 Threads', '3.7 GHz Base / 4.6 GHz Boost', '65W TDP', 'PCIe 4.0'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+5+5600X',
    recommended: true,
    socket: 'AM4',
  },
  {
    id: 'cpu-mid-2',
    category: 'processor',
    name: 'Intel Core i5-12400F',
    brand: 'Intel',
    price: 13499,
    specs: ['6 Cores / 12 Threads', '2.5 GHz Base / 4.4 GHz Boost', '65W TDP', 'LGA 1700'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Core+i5-12400F',
    socket: 'LGA1700',
  },
  {
    id: 'cpu-mid-3',
    category: 'processor',
    name: 'AMD Ryzen 5 7600',
    brand: 'AMD',
    price: 22999,
    specs: ['6 Cores / 12 Threads', '3.8 GHz Base / 5.1 GHz Boost', '65W TDP', 'AM5 DDR5'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+5+7600',
    socket: 'AM5',
  },
  {
    id: 'cpu-mid-4',
    category: 'processor',
    name: 'Intel Core i5-13400F',
    brand: 'Intel',
    price: 18999,
    specs: ['10 Cores / 16 Threads', '2.5 GHz Base / 4.6 GHz Boost', '65W TDP', 'LGA 1700'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Core+i5-13400F',
    socket: 'LGA1700',
  },
  {
    id: 'cpu-mid-5',
    category: 'processor',
    name: 'AMD Ryzen 7 5800X',
    brand: 'AMD',
    price: 22999,
    specs: ['8 Cores / 16 Threads', '3.8 GHz Base / 4.7 GHz Boost', '105W TDP', 'PCIe 4.0'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+7+5800X',
    socket: 'AM4',
  },
  // High-End
  {
    id: 'cpu-high-1',
    category: 'processor',
    name: 'Intel Core i7-13700K',
    brand: 'Intel',
    price: 38999,
    specs: ['16 Cores / 24 Threads', '3.4 GHz Base / 5.4 GHz Boost', '125W TDP', 'LGA 1700'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Core+i7-13700K',
    socket: 'LGA1700',
  },
  {
    id: 'cpu-high-2',
    category: 'processor',
    name: 'AMD Ryzen 9 7900X',
    brand: 'AMD',
    price: 42999,
    specs: ['12 Cores / 24 Threads', '4.7 GHz Base / 5.6 GHz Boost', '170W TDP', 'AM5 Socket'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+9+7900X',
    socket: 'AM5',
  },
  {
    id: 'cpu-high-3',
    category: 'processor',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    price: 58999,
    specs: ['24 Cores / 32 Threads', '3.2 GHz Base / 6.0 GHz Boost', '125W TDP', 'LGA 1700'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Core+i9-14900K',
    socket: 'LGA1700',
  },
  {
    id: 'cpu-high-4',
    category: 'processor',
    name: 'AMD Ryzen 9 7950X',
    brand: 'AMD',
    price: 62999,
    specs: ['16 Cores / 32 Threads', '4.5 GHz Base / 5.7 GHz Boost', '170W TDP', 'AM5'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+Ryzen+9+7950X',
    socket: 'AM5',
  },
  {
    id: 'cpu-high-5',
    category: 'processor',
    name: 'Intel Core i9-13900KS',
    brand: 'Intel',
    price: 72999,
    specs: ['24 Cores / 32 Threads', '3.2 GHz Base / 6.0 GHz Boost', '150W TDP', 'Special Edition'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Core+i9-13900KS',
    socket: 'LGA1700',
  },

  // === GRAPHICS CARDS ===
  // Budget
  {
    id: 'gpu-budget-1',
    category: 'graphics',
    name: 'NVIDIA GTX 1650',
    brand: 'NVIDIA',
    price: 12999,
    specs: ['4GB GDDR6', '1080p Gaming', '75W TDP', 'No External Power'],
    amazonUrl: 'https://www.amazon.in/s?k=GTX+1650',
  },
  {
    id: 'gpu-budget-2',
    category: 'graphics',
    name: 'AMD RX 6500 XT',
    brand: 'AMD',
    price: 13999,
    specs: ['4GB GDDR6', '1080p Gaming', '107W TDP', 'PCIe 4.0'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+RX+6500+XT',
  },
  {
    id: 'gpu-budget-3',
    category: 'graphics',
    name: 'Intel Arc A380',
    brand: 'Intel',
    price: 11999,
    specs: ['6GB GDDR6', 'AV1 Encoding', '75W TDP', 'Ray Tracing'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Arc+A380',
  },
  // Mid-Range
  {
    id: 'gpu-mid-1',
    category: 'graphics',
    name: 'NVIDIA RTX 4060',
    brand: 'NVIDIA',
    price: 29999,
    specs: ['8GB GDDR6', 'DLSS 3', 'Ray Tracing', '115W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4060',
    recommended: true,
  },
  {
    id: 'gpu-mid-2',
    category: 'graphics',
    name: 'AMD RX 7600',
    brand: 'AMD',
    price: 26999,
    specs: ['8GB GDDR6', 'FSR 3', 'Ray Tracing', '165W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+RX+7600',
  },
  {
    id: 'gpu-mid-3',
    category: 'graphics',
    name: 'NVIDIA RTX 4060 Ti',
    brand: 'NVIDIA',
    price: 39999,
    specs: ['8GB GDDR6', 'DLSS 3', 'Ray Tracing', '160W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4060+Ti',
  },
  {
    id: 'gpu-mid-4',
    category: 'graphics',
    name: 'AMD RX 7700 XT',
    brand: 'AMD',
    price: 38999,
    specs: ['12GB GDDR6', 'FSR 3', 'Ray Tracing', '245W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+RX+7700+XT',
  },
  {
    id: 'gpu-mid-5',
    category: 'graphics',
    name: 'NVIDIA RTX 4070',
    brand: 'NVIDIA',
    price: 49999,
    specs: ['12GB GDDR6X', 'DLSS 3', 'Ray Tracing', '200W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4070',
  },
  // High-End
  {
    id: 'gpu-high-1',
    category: 'graphics',
    name: 'AMD RX 7800 XT',
    brand: 'AMD',
    price: 54999,
    specs: ['16GB GDDR6', 'FSR 3', 'Ray Tracing', '263W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+RX+7800+XT',
  },
  {
    id: 'gpu-high-2',
    category: 'graphics',
    name: 'NVIDIA RTX 4070 Ti Super',
    brand: 'NVIDIA',
    price: 74999,
    specs: ['16GB GDDR6X', 'DLSS 3', 'Ray Tracing', '285W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4070+Ti+Super',
  },
  {
    id: 'gpu-high-3',
    category: 'graphics',
    name: 'AMD RX 7900 XT',
    brand: 'AMD',
    price: 79999,
    specs: ['20GB GDDR6', 'FSR 3', 'Ray Tracing', '300W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+RX+7900+XT',
  },
  {
    id: 'gpu-high-4',
    category: 'graphics',
    name: 'NVIDIA RTX 4080 Super',
    brand: 'NVIDIA',
    price: 109999,
    specs: ['16GB GDDR6X', 'DLSS 3', 'Ray Tracing', '320W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4080+Super',
  },
  {
    id: 'gpu-high-5',
    category: 'graphics',
    name: 'AMD RX 7900 XTX',
    brand: 'AMD',
    price: 94999,
    specs: ['24GB GDDR6', 'FSR 3', 'Ray Tracing', '355W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=AMD+RX+7900+XTX',
  },
  {
    id: 'gpu-high-6',
    category: 'graphics',
    name: 'NVIDIA RTX 4090',
    brand: 'NVIDIA',
    price: 179999,
    specs: ['24GB GDDR6X', 'DLSS 3', 'Ray Tracing', '450W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=RTX+4090',
  },

  // === RAM ===
  // Budget
  {
    id: 'ram-budget-1',
    category: 'memory',
    name: 'Kingston Value 8GB',
    brand: 'Kingston',
    price: 1499,
    specs: ['8GB (1x8GB)', 'DDR4 2666MHz', 'CL19', 'Basic Performance'],
    amazonUrl: 'https://www.amazon.in/s?k=Kingston+Value+8GB+DDR4',
    ramType: 'DDR4',
  },
  {
    id: 'ram-budget-2',
    category: 'memory',
    name: 'Crucial Basics 16GB',
    brand: 'Crucial',
    price: 2499,
    specs: ['16GB (2x8GB)', 'DDR4 2400MHz', 'CL17', 'Value Kit'],
    amazonUrl: 'https://www.amazon.in/s?k=Crucial+16GB+DDR4',
    ramType: 'DDR4',
  },
  {
    id: 'ram-budget-3',
    category: 'memory',
    name: 'Corsair Vengeance LPX 16GB',
    brand: 'Corsair',
    price: 3499,
    specs: ['16GB (2x8GB)', 'DDR4 3200MHz', 'CL16', 'XMP 2.0'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+Vengeance+LPX+16GB+DDR4',
    recommended: true,
    ramType: 'DDR4',
  },
  // Mid-Range
  {
    id: 'ram-mid-1',
    category: 'memory',
    name: 'Crucial Ballistix 16GB',
    brand: 'Crucial',
    price: 4999,
    specs: ['16GB (2x8GB)', 'DDR4 3600MHz', 'CL16', 'RGB Lighting'],
    amazonUrl: 'https://www.amazon.in/s?k=Crucial+Ballistix+16GB+DDR4+3600',
    ramType: 'DDR4',
  },
  {
    id: 'ram-mid-2',
    category: 'memory',
    name: 'G.Skill Trident Z RGB 32GB',
    brand: 'G.Skill',
    price: 7999,
    specs: ['32GB (2x16GB)', 'DDR4 3600MHz', 'CL18', 'RGB Lighting'],
    amazonUrl: 'https://www.amazon.in/s?k=G.Skill+Trident+Z+RGB+32GB',
    ramType: 'DDR4',
  },
  {
    id: 'ram-mid-3',
    category: 'memory',
    name: 'Kingston Fury Beast DDR5 16GB',
    brand: 'Kingston',
    price: 5499,
    specs: ['16GB (2x8GB)', 'DDR5 5200MHz', 'CL40', 'Intel XMP 3.0'],
    amazonUrl: 'https://www.amazon.in/s?k=Kingston+Fury+Beast+DDR5+16GB',
    ramType: 'DDR5',
  },
  {
    id: 'ram-mid-4',
    category: 'memory',
    name: 'Kingston Fury Beast DDR5 32GB',
    brand: 'Kingston',
    price: 8999,
    specs: ['32GB (2x16GB)', 'DDR5 5600MHz', 'CL40', 'XMP 3.0'],
    amazonUrl: 'https://www.amazon.in/s?k=Kingston+Fury+Beast+DDR5+32GB',
    ramType: 'DDR5',
  },
  // High-End
  {
    id: 'ram-high-1',
    category: 'memory',
    name: 'G.Skill Trident Z5 RGB 32GB',
    brand: 'G.Skill',
    price: 12999,
    specs: ['32GB (2x16GB)', 'DDR5 6400MHz', 'CL32', 'RGB Crystal'],
    amazonUrl: 'https://www.amazon.in/s?k=G.Skill+Trident+Z5+RGB+32GB+DDR5',
    ramType: 'DDR5',
  },
  {
    id: 'ram-high-2',
    category: 'memory',
    name: 'Corsair Dominator Platinum 64GB',
    brand: 'Corsair',
    price: 24999,
    specs: ['64GB (2x32GB)', 'DDR5 6000MHz', 'CL36', 'RGB Lighting'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+Dominator+Platinum+64GB+DDR5',
    ramType: 'DDR5',
  },
  {
    id: 'ram-high-3',
    category: 'memory',
    name: 'G.Skill Trident Z5 Royal 64GB',
    brand: 'G.Skill',
    price: 29999,
    specs: ['64GB (2x32GB)', 'DDR5 6800MHz', 'CL34', 'Premium Design'],
    amazonUrl: 'https://www.amazon.in/s?k=G.Skill+Trident+Z5+Royal+64GB',
    ramType: 'DDR5',
  },

  // === STORAGE ===
  // Budget
  {
    id: 'storage-budget-1',
    category: 'storage',
    name: 'WD Green 240GB SSD',
    brand: 'Western Digital',
    price: 1499,
    specs: ['240GB SATA SSD', '545MB/s Read', '2.5" Form Factor', 'Entry Level'],
    amazonUrl: 'https://www.amazon.in/s?k=WD+Green+240GB+SSD',
  },
  {
    id: 'storage-budget-2',
    category: 'storage',
    name: 'Kingston A400 480GB',
    brand: 'Kingston',
    price: 2199,
    specs: ['480GB SATA SSD', '500MB/s Read', '2.5" Form Factor', 'Reliable'],
    amazonUrl: 'https://www.amazon.in/s?k=Kingston+A400+480GB',
  },
  {
    id: 'storage-budget-3',
    category: 'storage',
    name: 'Crucial BX500 500GB',
    brand: 'Crucial',
    price: 2499,
    specs: ['500GB SATA SSD', '540MB/s Read', '2.5" Form Factor', '3D NAND'],
    amazonUrl: 'https://www.amazon.in/s?k=Crucial+BX500+500GB',
  },
  // Mid-Range
  {
    id: 'storage-mid-1',
    category: 'storage',
    name: 'WD Blue SN570 500GB',
    brand: 'Western Digital',
    price: 3299,
    specs: ['500GB NVMe SSD', '3500MB/s Read', 'M.2 2280', 'PCIe 3.0'],
    amazonUrl: 'https://www.amazon.in/s?k=WD+Blue+SN570+500GB',
  },
  {
    id: 'storage-mid-2',
    category: 'storage',
    name: 'Samsung 970 EVO Plus 1TB',
    brand: 'Samsung',
    price: 6499,
    specs: ['1TB NVMe SSD', '3500MB/s Read', '3300MB/s Write', 'M.2 2280'],
    amazonUrl: 'https://www.amazon.in/s?k=Samsung+970+EVO+Plus+1TB',
    recommended: true,
  },
  {
    id: 'storage-mid-3',
    category: 'storage',
    name: 'Crucial P5 Plus 1TB',
    brand: 'Crucial',
    price: 5999,
    specs: ['1TB NVMe SSD', '6600MB/s Read', '5000MB/s Write', 'PCIe 4.0'],
    amazonUrl: 'https://www.amazon.in/s?k=Crucial+P5+Plus+1TB',
  },
  {
    id: 'storage-mid-4',
    category: 'storage',
    name: 'Seagate Barracuda 2TB HDD',
    brand: 'Seagate',
    price: 4299,
    specs: ['2TB HDD', '7200 RPM', '256MB Cache', 'SATA 6Gb/s'],
    amazonUrl: 'https://www.amazon.in/s?k=Seagate+Barracuda+2TB',
  },
  // High-End
  {
    id: 'storage-high-1',
    category: 'storage',
    name: 'WD Black SN850X 1TB',
    brand: 'Western Digital',
    price: 8999,
    specs: ['1TB NVMe SSD', '7300MB/s Read', '6300MB/s Write', 'Gaming Optimized'],
    amazonUrl: 'https://www.amazon.in/s?k=WD+Black+SN850X+1TB',
  },
  {
    id: 'storage-high-2',
    category: 'storage',
    name: 'Samsung 990 Pro 2TB',
    brand: 'Samsung',
    price: 16999,
    specs: ['2TB NVMe SSD', '7450MB/s Read', '6900MB/s Write', 'PCIe 4.0'],
    amazonUrl: 'https://www.amazon.in/s?k=Samsung+990+Pro+2TB',
  },
  {
    id: 'storage-high-3',
    category: 'storage',
    name: 'Seagate FireCuda 530 2TB',
    brand: 'Seagate',
    price: 18999,
    specs: ['2TB NVMe SSD', '7300MB/s Read', '6900MB/s Write', 'PS5 Compatible'],
    amazonUrl: 'https://www.amazon.in/s?k=Seagate+FireCuda+530+2TB',
  },
  {
    id: 'storage-high-4',
    category: 'storage',
    name: 'Samsung 990 Pro 4TB',
    brand: 'Samsung',
    price: 32999,
    specs: ['4TB NVMe SSD', '7450MB/s Read', '6900MB/s Write', 'Massive Storage'],
    amazonUrl: 'https://www.amazon.in/s?k=Samsung+990+Pro+4TB',
  },

  // === MOTHERBOARDS ===
  // Budget
  {
    id: 'mobo-budget-1',
    category: 'motherboard',
    name: 'Gigabyte H610M S2H',
    brand: 'Gigabyte',
    price: 5999,
    specs: ['Intel H610', 'Micro-ATX', 'PCIe 4.0', 'DDR4 Support'],
    amazonUrl: 'https://www.amazon.in/s?k=Gigabyte+H610M+S2H',
    socket: 'LGA1700',
    ramType: 'DDR4',
    chipset: 'H610',
  },
  {
    id: 'mobo-budget-2',
    category: 'motherboard',
    name: 'ASRock B450M Steel Legend',
    brand: 'ASRock',
    price: 7499,
    specs: ['AMD B450', 'Micro-ATX', 'PCIe 3.0', 'DDR4 3533MHz'],
    amazonUrl: 'https://www.amazon.in/s?k=ASRock+B450M+Steel+Legend',
    socket: 'AM4',
    ramType: 'DDR4',
    chipset: 'B450',
  },
  {
    id: 'mobo-budget-3',
    category: 'motherboard',
    name: 'MSI PRO H610M-B',
    brand: 'MSI',
    price: 6499,
    specs: ['Intel H610', 'Micro-ATX', 'PCIe 4.0', 'DDR4 Support'],
    amazonUrl: 'https://www.amazon.in/s?k=MSI+PRO+H610M-B',
    socket: 'LGA1700',
    ramType: 'DDR4',
    chipset: 'H610',
  },
  // Mid-Range
  {
    id: 'mobo-mid-1',
    category: 'motherboard',
    name: 'MSI B550-A PRO',
    brand: 'MSI',
    price: 10999,
    specs: ['AMD B550', 'ATX', 'PCIe 4.0', 'DDR4 4400MHz'],
    amazonUrl: 'https://www.amazon.in/s?k=MSI+B550-A+PRO',
    recommended: true,
    socket: 'AM4',
    ramType: 'DDR4',
    chipset: 'B550',
  },
  {
    id: 'mobo-mid-2',
    category: 'motherboard',
    name: 'ASUS TUF Gaming B660-Plus',
    brand: 'ASUS',
    price: 14999,
    specs: ['Intel B660', 'ATX', 'PCIe 5.0', 'DDR5 Support'],
    amazonUrl: 'https://www.amazon.in/s?k=ASUS+TUF+Gaming+B660-Plus',
    socket: 'LGA1700',
    ramType: 'DDR5',
    chipset: 'B660',
  },
  {
    id: 'mobo-mid-3',
    category: 'motherboard',
    name: 'MSI MAG B760 Tomahawk',
    brand: 'MSI',
    price: 17999,
    specs: ['Intel B760', 'ATX', 'PCIe 5.0', 'DDR5 Support', '2.5G LAN'],
    amazonUrl: 'https://www.amazon.in/s?k=MSI+MAG+B760+Tomahawk',
    socket: 'LGA1700',
    ramType: 'DDR5',
    chipset: 'B760',
  },
  {
    id: 'mobo-mid-4',
    category: 'motherboard',
    name: 'Gigabyte B650 AORUS Elite AX',
    brand: 'Gigabyte',
    price: 21999,
    specs: ['AMD B650', 'ATX', 'PCIe 5.0', 'DDR5 Support', 'WiFi 6E'],
    amazonUrl: 'https://www.amazon.in/s?k=Gigabyte+B650+AORUS+Elite+AX',
    socket: 'AM5',
    ramType: 'DDR5',
    chipset: 'B650',
  },
  // High-End
  {
    id: 'mobo-high-1',
    category: 'motherboard',
    name: 'ASUS ROG Strix Z790-E Gaming',
    brand: 'ASUS',
    price: 44999,
    specs: ['Intel Z790', 'ATX', 'PCIe 5.0', 'DDR5 7800MHz', 'WiFi 6E'],
    amazonUrl: 'https://www.amazon.in/s?k=ASUS+ROG+Strix+Z790-E+Gaming',
    socket: 'LGA1700',
    ramType: 'DDR5',
    chipset: 'Z790',
  },
  {
    id: 'mobo-high-2',
    category: 'motherboard',
    name: 'ASUS ROG Maximus Z790 Hero',
    brand: 'ASUS',
    price: 62999,
    specs: ['Intel Z790', 'ATX', 'PCIe 5.0', 'DDR5 7800MHz+', 'Thunderbolt 4'],
    amazonUrl: 'https://www.amazon.in/s?k=ASUS+ROG+Maximus+Z790+Hero',
    socket: 'LGA1700',
    ramType: 'DDR5',
    chipset: 'Z790',
  },
  {
    id: 'mobo-high-3',
    category: 'motherboard',
    name: 'MSI MEG X670E ACE',
    brand: 'MSI',
    price: 59999,
    specs: ['AMD X670E', 'E-ATX', 'PCIe 5.0', 'DDR5 Support', 'WiFi 6E'],
    amazonUrl: 'https://www.amazon.in/s?k=MSI+MEG+X670E+ACE',
    socket: 'AM5',
    ramType: 'DDR5',
    chipset: 'X670E',
  },

  // === POWER SUPPLY ===
  // Budget
  {
    id: 'psu-budget-1',
    category: 'psu',
    name: 'Corsair CV450',
    brand: 'Corsair',
    price: 2999,
    specs: ['450W', '80+ Bronze', 'Non-Modular', '3 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+CV450',
  },
  {
    id: 'psu-budget-2',
    category: 'psu',
    name: 'Antec NeoECO 550M',
    brand: 'Antec',
    price: 3999,
    specs: ['550W', '80+ Bronze', 'Semi-Modular', 'Budget Friendly'],
    amazonUrl: 'https://www.amazon.in/s?k=Antec+NeoECO+550M',
  },
  {
    id: 'psu-budget-3',
    category: 'psu',
    name: 'Cooler Master MWE 550 V3',
    brand: 'Cooler Master',
    price: 3499,
    specs: ['550W', '80+ Bronze', 'Non-Modular', '5 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Cooler+Master+MWE+550',
  },
  // Mid-Range
  {
    id: 'psu-mid-1',
    category: 'psu',
    name: 'Corsair RM650',
    brand: 'Corsair',
    price: 7499,
    specs: ['650W', '80+ Gold', 'Fully Modular', 'Zero RPM Mode'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+RM650',
    recommended: true,
  },
  {
    id: 'psu-mid-2',
    category: 'psu',
    name: 'Cooler Master MWE 750 V2',
    brand: 'Cooler Master',
    price: 5999,
    specs: ['750W', '80+ Bronze', 'Semi-Modular', '5 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Cooler+Master+MWE+750',
  },
  {
    id: 'psu-mid-3',
    category: 'psu',
    name: 'ASUS ROG Strix 750G',
    brand: 'ASUS',
    price: 9999,
    specs: ['750W', '80+ Gold', 'Fully Modular', 'RGB Lighting'],
    amazonUrl: 'https://www.amazon.in/s?k=ASUS+ROG+Strix+750G',
  },
  {
    id: 'psu-mid-4',
    category: 'psu',
    name: 'Seasonic Focus GX-850',
    brand: 'Seasonic',
    price: 10999,
    specs: ['850W', '80+ Gold', 'Fully Modular', '10 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Seasonic+Focus+GX-850',
  },
  // High-End
  {
    id: 'psu-high-1',
    category: 'psu',
    name: 'Corsair RM1000x',
    brand: 'Corsair',
    price: 15999,
    specs: ['1000W', '80+ Gold', 'Fully Modular', '10 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+RM1000x',
  },
  {
    id: 'psu-high-2',
    category: 'psu',
    name: 'Corsair HX1200',
    brand: 'Corsair',
    price: 22999,
    specs: ['1200W', '80+ Platinum', 'Fully Modular', '10 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+HX1200',
  },
  {
    id: 'psu-high-3',
    category: 'psu',
    name: 'Seasonic Prime TX-1600',
    brand: 'Seasonic',
    price: 39999,
    specs: ['1600W', '80+ Titanium', 'Fully Modular', '12 Year Warranty'],
    amazonUrl: 'https://www.amazon.in/s?k=Seasonic+Prime+TX-1600',
  },

  // === CASES ===
  // Budget
  {
    id: 'case-budget-1',
    category: 'case',
    name: 'Ant Esports ICE-100TG',
    brand: 'Ant Esports',
    price: 2499,
    specs: ['Mid-Tower ATX', 'Tempered Glass', '2x 120mm Fans', 'Budget Option'],
    amazonUrl: 'https://www.amazon.in/s?k=Ant+Esports+ICE-100TG',
  },
  {
    id: 'case-budget-2',
    category: 'case',
    name: 'Deepcool Matrexx 40',
    brand: 'Deepcool',
    price: 3299,
    specs: ['Micro-ATX', 'Tempered Glass', 'Mesh Front', 'Compact'],
    amazonUrl: 'https://www.amazon.in/s?k=Deepcool+Matrexx+40',
  },
  {
    id: 'case-budget-3',
    category: 'case',
    name: 'Cooler Master MasterBox Q300L',
    brand: 'Cooler Master',
    price: 3799,
    specs: ['Micro-ATX', 'Magnetic Dust Filter', 'Compact', 'Modular I/O'],
    amazonUrl: 'https://www.amazon.in/s?k=Cooler+Master+MasterBox+Q300L',
  },
  // Mid-Range
  {
    id: 'case-mid-1',
    category: 'case',
    name: 'NZXT H510',
    brand: 'NZXT',
    price: 6999,
    specs: ['Mid-Tower ATX', 'Tempered Glass', 'Cable Management', 'USB 3.1'],
    amazonUrl: 'https://www.amazon.in/s?k=NZXT+H510',
    recommended: true,
  },
  {
    id: 'case-mid-2',
    category: 'case',
    name: 'Corsair 4000D Airflow',
    brand: 'Corsair',
    price: 8499,
    specs: ['Mid-Tower ATX', 'High Airflow', 'Tempered Glass', 'Tool-Free'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+4000D+Airflow',
  },
  {
    id: 'case-mid-3',
    category: 'case',
    name: 'Fractal Design Meshify C',
    brand: 'Fractal Design',
    price: 9999,
    specs: ['Mid-Tower ATX', 'Mesh Front', 'Tempered Glass', 'Compact'],
    amazonUrl: 'https://www.amazon.in/s?k=Fractal+Design+Meshify+C',
  },
  {
    id: 'case-mid-4',
    category: 'case',
    name: 'Phanteks Eclipse P400A',
    brand: 'Phanteks',
    price: 8999,
    specs: ['Mid-Tower ATX', 'High Airflow', 'RGB', 'E-ATX Support'],
    amazonUrl: 'https://www.amazon.in/s?k=Phanteks+Eclipse+P400A',
  },
  // High-End
  {
    id: 'case-high-1',
    category: 'case',
    name: 'Lian Li O11 Dynamic EVO',
    brand: 'Lian Li',
    price: 14999,
    specs: ['Mid-Tower ATX', 'Dual Chamber', 'Tempered Glass', 'Premium Build'],
    amazonUrl: 'https://www.amazon.in/s?k=Lian+Li+O11+Dynamic+EVO',
  },
  {
    id: 'case-high-2',
    category: 'case',
    name: 'NZXT H9 Elite',
    brand: 'NZXT',
    price: 19999,
    specs: ['Mid-Tower ATX', 'Dual Chamber', '4x RGB Fans', 'Premium Glass'],
    amazonUrl: 'https://www.amazon.in/s?k=NZXT+H9+Elite',
  },
  {
    id: 'case-high-3',
    category: 'case',
    name: 'Corsair 5000T RGB',
    brand: 'Corsair',
    price: 34999,
    specs: ['Full Tower', '208 RGB LEDs', 'Triple Glass', 'iCUE Ecosystem'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+5000T+RGB',
  },

  // === COOLING ===
  // Budget
  {
    id: 'cooler-budget-1',
    category: 'cooling',
    name: 'Stock Intel Cooler',
    brand: 'Intel',
    price: 499,
    specs: ['65W TDP', 'Included with CPU', 'Basic Cooling', 'Entry Level'],
    amazonUrl: 'https://www.amazon.in/s?k=Intel+Stock+Cooler+LGA1700',
  },
  {
    id: 'cooler-budget-2',
    category: 'cooling',
    name: 'Deepcool GAMMAXX 400',
    brand: 'Deepcool',
    price: 1499,
    specs: ['120mm Tower', '4 Heat Pipes', 'PWM Fan', 'Budget King'],
    amazonUrl: 'https://www.amazon.in/s?k=Deepcool+GAMMAXX+400',
  },
  {
    id: 'cooler-budget-3',
    category: 'cooling',
    name: 'Cooler Master Hyper 212 LED',
    brand: 'Cooler Master',
    price: 2499,
    specs: ['120mm Tower', '4 Heat Pipes', 'LED Fan', 'Great Value'],
    amazonUrl: 'https://www.amazon.in/s?k=Cooler+Master+Hyper+212+LED',
  },
  // Mid-Range
  {
    id: 'cooler-mid-1',
    category: 'cooling',
    name: 'Cooler Master Hyper 212 RGB',
    brand: 'Cooler Master',
    price: 3499,
    specs: ['120mm Tower', '4 Heat Pipes', 'AMD/Intel Compatible', 'RGB'],
    amazonUrl: 'https://www.amazon.in/s?k=Cooler+Master+Hyper+212+RGB',
    recommended: true,
  },
  {
    id: 'cooler-mid-2',
    category: 'cooling',
    name: 'Deepcool AK620',
    brand: 'Deepcool',
    price: 4999,
    specs: ['Dual Tower', '6 Heat Pipes', 'Low Noise', 'Budget King'],
    amazonUrl: 'https://www.amazon.in/s?k=Deepcool+AK620',
  },
  {
    id: 'cooler-mid-3',
    category: 'cooling',
    name: 'be quiet! Dark Rock Pro 4',
    brand: 'be quiet!',
    price: 7999,
    specs: ['Dual Tower', '7 Heat Pipes', 'Silent Wings Fans', '250W TDP'],
    amazonUrl: 'https://www.amazon.in/s?k=be+quiet+Dark+Rock+Pro+4',
  },
  {
    id: 'cooler-mid-4',
    category: 'cooling',
    name: 'Noctua NH-D15',
    brand: 'Noctua',
    price: 9999,
    specs: ['Dual Tower', '6 Heat Pipes', 'Silent Operation', 'Premium Quality'],
    amazonUrl: 'https://www.amazon.in/s?k=Noctua+NH-D15',
  },
  // High-End (AIO Liquid Coolers)
  {
    id: 'cooler-high-1',
    category: 'cooling',
    name: 'NZXT Kraken X53',
    brand: 'NZXT',
    price: 11999,
    specs: ['240mm AIO', 'Infinity Mirror', 'CAM Software', 'RGB'],
    amazonUrl: 'https://www.amazon.in/s?k=NZXT+Kraken+X53',
  },
  {
    id: 'cooler-high-2',
    category: 'cooling',
    name: 'Corsair iCUE H150i Elite',
    brand: 'Corsair',
    price: 16999,
    specs: ['360mm AIO', 'RGB Pump Head', 'iCUE Software', 'ML120 Fans'],
    amazonUrl: 'https://www.amazon.in/s?k=Corsair+iCUE+H150i+Elite',
  },
  {
    id: 'cooler-high-3',
    category: 'cooling',
    name: 'ASUS ROG Ryuo III 360',
    brand: 'ASUS',
    price: 24999,
    specs: ['360mm AIO', 'Anime Matrix LCD', 'Armoury Crate', 'Premium'],
    amazonUrl: 'https://www.amazon.in/s?k=ASUS+ROG+Ryuo+III+360',
  },
  {
    id: 'cooler-high-4',
    category: 'cooling',
    name: 'NZXT Kraken Z73 RGB',
    brand: 'NZXT',
    price: 29999,
    specs: ['360mm AIO', 'LCD Display', 'GIF Support', 'Premium RGB'],
    amazonUrl: 'https://www.amazon.in/s?k=NZXT+Kraken+Z73+RGB',
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

const budgetTiers = [
  { id: 'all' as BudgetTier, name: 'All', range: '₹0 - ∞' },
  { id: 'budget' as BudgetTier, name: 'Budget', range: '≤₹10K' },
  { id: 'midrange' as BudgetTier, name: 'Mid-Range', range: '₹10K-50K' },
  { id: 'highend' as BudgetTier, name: 'High-End', range: '₹50K+' },
];

const presetBuilds: PresetBuild[] = [
  {
    id: 'budget',
    name: 'Budget Build',
    description: 'Entry-level gaming & productivity',
    icon: Wallet,
    components: {
      processor: 'cpu-budget-1',
      graphics: 'gpu-budget-1',
      memory: 'ram-budget-3',
      storage: 'storage-mid-1',
      motherboard: 'mobo-budget-1',
      psu: 'psu-budget-2',
      case: 'case-budget-2',
      cooling: 'cooler-budget-2',
    },
    totalPrice: 42491,
  },
  {
    id: 'gaming',
    name: 'Gaming PC',
    description: 'High FPS 1440p gaming experience',
    icon: Gamepad2,
    components: {
      processor: 'cpu-mid-1',
      graphics: 'gpu-mid-5',
      memory: 'ram-mid-2',
      storage: 'storage-mid-2',
      motherboard: 'mobo-mid-1',
      psu: 'psu-mid-1',
      case: 'case-mid-2',
      cooling: 'cooler-mid-2',
    },
    totalPrice: 114890,
  },
  {
    id: 'workstation',
    name: 'Workstation',
    description: 'Content creation & heavy workloads',
    icon: Briefcase,
    components: {
      processor: 'cpu-high-1',
      graphics: 'gpu-high-2',
      memory: 'ram-high-1',
      storage: 'storage-high-2',
      motherboard: 'mobo-mid-3',
      psu: 'psu-mid-4',
      case: 'case-high-1',
      cooling: 'cooler-high-2',
    },
    totalPrice: 238891,
  },
];

function encodeBuild(components: Record<string, PCComponent>): string {
  const ids = Object.values(components).map(c => c.id).join(',');
  return btoa(ids);
}

function decodeBuild(encoded: string): Record<string, PCComponent> {
  try {
    const ids = atob(encoded).split(',');
    const result: Record<string, PCComponent> = {};
    ids.forEach(id => {
      const component = pcComponents.find(c => c.id === id);
      if (component) {
        result[component.category] = component;
      }
    });
    return result;
  } catch {
    return {};
  }
}

export default function PCBuild() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedComponents, setSelectedComponents] = useState<Record<string, PCComponent>>({});
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('all');
  const { toast } = useToast();

  // Load build from URL on mount
  useEffect(() => {
    const buildParam = searchParams.get('build');
    if (buildParam) {
      const decoded = decodeBuild(buildParam);
      if (Object.keys(decoded).length > 0) {
        setSelectedComponents(decoded);
        toast({
          title: 'Build Loaded',
          description: 'Shared build configuration has been loaded.',
        });
      }
    }
  }, []);

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

  const applyPreset = (preset: PresetBuild) => {
    const newSelection: Record<string, PCComponent> = {};
    Object.entries(preset.components).forEach(([category, componentId]) => {
      const component = pcComponents.find(c => c.id === componentId);
      if (component) {
        newSelection[category] = component;
      }
    });
    setSelectedComponents(newSelection);
  };

  const shareBuild = async () => {
    if (Object.keys(selectedComponents).length === 0) {
      toast({
        title: 'No components selected',
        description: 'Please select at least one component to share.',
        variant: 'destructive',
      });
      return;
    }

    const encoded = encodeBuild(selectedComponents);
    const shareUrl = `${window.location.origin}/pc-build?build=${encoded}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'Share this link with friends to show them your build.',
      });
    } catch {
      toast({
        title: 'Share URL',
        description: shareUrl,
      });
    }
  };

  const filteredComponents = useMemo(() => {
    return pcComponents.filter(component => {
      if (budgetTier === 'all') return true;
      if (budgetTier === 'budget') return component.price <= 10000;
      if (budgetTier === 'midrange') return component.price > 10000 && component.price <= 50000;
      if (budgetTier === 'highend') return component.price > 50000;
      return true;
    });
  }, [budgetTier]);

  const compatibilityWarnings = useMemo(() => {
    const warnings: string[] = [];
    const cpu = selectedComponents.processor;
    const mobo = selectedComponents.motherboard;
    const ram = selectedComponents.memory;

    if (cpu && mobo) {
      if (cpu.socket !== mobo.socket) {
        warnings.push(`CPU socket (${cpu.socket}) doesn't match motherboard socket (${mobo.socket}).`);
      }
    }

    if (ram && mobo) {
      if (ram.ramType !== mobo.ramType) {
        warnings.push(`RAM type (${ram.ramType}) is incompatible with motherboard (supports ${mobo.ramType}).`);
      }
    }

    if (cpu && ram) {
      if (cpu.socket === 'AM5' && ram.ramType === 'DDR4') {
        warnings.push(`AMD AM5 platform requires DDR5 RAM. Selected RAM is DDR4.`);
      }
    }

    return warnings;
  }, [selectedComponents]);

  const totalPrice = Object.values(selectedComponents).reduce((sum, c) => sum + c.price, 0);
  const selectedCount = Object.keys(selectedComponents).length;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header & Preset Builds */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">PC Build Configurator</h1>
              <p className="text-muted-foreground">
                Select components to build your dream PC. All prices in INR with Amazon links.
              </p>
            </div>
            <Button 
              onClick={shareBuild}
              variant="outline"
              className="gap-2 shrink-0"
              disabled={selectedCount === 0}
            >
              <Share2 className="h-4 w-4" />
              Share Build
            </Button>
          </div>

          {/* Preset Builds */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Start Presets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presetBuilds.map((preset) => (
                <Card 
                  key={preset.id} 
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                  onClick={() => applyPreset(preset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                        <preset.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{preset.name}</h3>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">
                        ₹{preset.totalPrice.toLocaleString('en-IN')}
                      </span>
                      <Button size="sm" variant="outline">Apply</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium text-muted-foreground">Budget:</span>
            {budgetTiers.map((tier) => (
              <Button
                key={tier.id}
                variant={budgetTier === tier.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBudgetTier(tier.id)}
                className={cn(
                  budgetTier === tier.id && 'gradient-primary text-primary-foreground'
                )}
              >
                {tier.name}
                <span className="ml-1 text-xs opacity-75">({tier.range})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Compatibility Warnings */}
        {compatibilityWarnings.length > 0 && (
          <div className="mb-6 space-y-2">
            {compatibilityWarnings.map((warning, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Compatibility Warning</AlertTitle>
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="processor" className="space-y-6">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                {categories.map((cat) => {
                  const isSelected = !!selectedComponents[cat.id];
                  const categoryComponents = filteredComponents.filter(c => c.category === cat.id);
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
                      <span className="hidden sm:inline">{cat.name}</span>
                      {isSelected && <Check className="h-3 w-3 text-green-500" />}
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {categoryComponents.length}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredComponents
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
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1 mb-1">
                                    <Badge variant="secondary" className="text-xs">{component.brand}</Badge>
                                    {component.recommended && (
                                      <Badge className="gradient-primary border-0 text-xs">Recommended</Badge>
                                    )}
                                    {component.socket && (
                                      <Badge variant="outline" className="text-xs">{component.socket}</Badge>
                                    )}
                                    {component.ramType && (
                                      <Badge variant="outline" className="text-xs">{component.ramType}</Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-sm">{component.name}</h3>
                                </div>
                                <div className={cn(
                                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ml-2',
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
                    {filteredComponents.filter(c => c.category === cat.id).length === 0 && (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No components available in this budget range. Try a different filter.
                      </div>
                    )}
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
                    Select components or choose a preset to start building
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

                    {compatibilityWarnings.length > 0 && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{compatibilityWarnings.length} issue(s)</span>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full gradient-primary text-primary-foreground gap-2"
                        onClick={() => {
                          Object.values(selectedComponents).forEach(component => {
                            window.open(component.amazonUrl, '_blank');
                          });
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Buy All on Amazon
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 gap-1"
                          onClick={shareBuild}
                        >
                          <Link className="h-4 w-4" />
                          Share
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setSelectedComponents({})}
                        >
                          Clear
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Opens each component in a new tab
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>* Prices are approximate and may vary</p>
                  <p>* Check compatibility warnings above</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
