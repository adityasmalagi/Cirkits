import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { LaptopCard } from '@/components/laptops/LaptopCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Laptop } from '@/types/database';
import { LaptopCardSkeleton } from '@/components/ui/skeletons';

export default function Laptops() {
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [useCase, setUseCase] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 300000]);

  const { data: laptops, isLoading } = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      const { data, error } = await supabase.from('laptops').select('*').order('price');
      if (error) throw error;
      return data as Laptop[];
    },
  });

  const brands = [...new Set(laptops?.map(l => l.brand) || [])];
  const useCases = [...new Set(laptops?.flatMap(l => l.use_cases || []) || [])];

  const filtered = laptops?.filter(laptop => {
    if (search && !laptop.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (brand !== 'all' && laptop.brand !== brand) return false;
    if (useCase !== 'all' && !laptop.use_cases?.includes(useCase)) return false;
    if (laptop.price && (laptop.price < priceRange[0] || laptop.price > priceRange[1])) return false;
    return true;
  });

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Laptop Finder</h1>
        <p className="text-muted-foreground mb-8">Find the perfect laptop for your needs</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Use Case</Label>
              <Select value={useCase} onValueChange={setUseCase}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Use Cases</SelectItem>
                  {useCases.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price: ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}</Label>
              <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={300000} step={5000} />
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => <LaptopCardSkeleton key={i} />) : 
              filtered?.map(laptop => <LaptopCard key={laptop.id} laptop={laptop} />)}
          </div>
        </div>
      </div>
    </Layout>
  );
}
