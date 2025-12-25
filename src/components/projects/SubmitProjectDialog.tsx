import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Send, Package } from 'lucide-react';
import { Category, DifficultyLevel } from '@/types/database';

interface ProjectPart {
  name: string;
  description: string;
  price: string;
  quantity: string;
  affiliate_url: string;
}

export function SubmitProjectDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parts, setParts] = useState<ProjectPart[]>([
    { name: '', description: '', price: '', quantity: '1', affiliate_url: '' }
  ]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
  });

  const addPart = () => {
    setParts([...parts, { name: '', description: '', price: '', quantity: '1', affiliate_url: '' }]);
  };

  const removePart = (index: number) => {
    if (parts.length > 1) {
      setParts(parts.filter((_, i) => i !== index));
    }
  };

  const updatePart = (index: number, field: keyof ProjectPart, value: string) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setDifficulty('beginner');
    setEstimatedCost('');
    setEstimatedTime('');
    setImageUrl('');
    setParts([{ name: '', description: '', price: '', quantity: '1', affiliate_url: '' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to submit a project.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a project title.',
        variant: 'destructive',
      });
      return;
    }

    const validParts = parts.filter(p => p.name.trim());
    if (validParts.length === 0) {
      toast({
        title: 'Components required',
        description: 'Please add at least one component.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the project
      const { data: project, error: projectError } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category_id: categoryId || null,
          difficulty,
          estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
          estimated_time: estimatedTime.trim() || null,
          image_url: imageUrl.trim() || null,
          status: 'pending',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert the parts
      const partsToInsert = validParts.map(part => ({
        user_project_id: project.id,
        name: part.name.trim(),
        description: part.description.trim() || null,
        price: part.price ? parseFloat(part.price) : null,
        quantity: parseInt(part.quantity) || 1,
        affiliate_url: part.affiliate_url.trim() || null,
      }));

      const { error: partsError } = await supabase
        .from('user_project_parts')
        .insert(partsToInsert);

      if (partsError) throw partsError;

      toast({
        title: 'Project submitted!',
        description: 'Your project has been submitted for review. Thank you!',
      });

      resetForm();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
    } catch (error: any) {
      console.error('Error submitting project:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to submit project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <Plus className="h-4 w-4" />
        Sign in to Submit Project
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
          Submit Your Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Submit a New Project
          </DialogTitle>
          <DialogDescription>
            Share your hardware project with the community. Include all required components with prices and links.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Project Details
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Smart Home Automation System"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, what it does, and how to build it..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Est. Cost (₹)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="e.g., 2500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_time">Est. Time</Label>
                <Input
                  id="estimated_time"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="e.g., 2-3 hours"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Project Image URL (optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Components/Parts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Required Components *
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addPart} className="gap-1">
                <Plus className="h-3 w-3" />
                Add Component
              </Button>
            </div>

            <div className="space-y-4">
              {parts.map((part, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Component {index + 1}</span>
                    {parts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePart(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Name *</Label>
                      <Input
                        value={part.name}
                        onChange={(e) => updatePart(index, 'name', e.target.value)}
                        placeholder="e.g., Arduino Uno R3"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={part.description}
                        onChange={(e) => updatePart(index, 'description', e.target.value)}
                        placeholder="e.g., Microcontroller board"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="number"
                        value={part.price}
                        onChange={(e) => updatePart(index, 'price', e.target.value)}
                        placeholder="e.g., 599"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => updatePart(index, 'quantity', e.target.value)}
                        placeholder="1"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Amazon/Store Link</Label>
                      <Input
                        type="url"
                        value={part.affiliate_url}
                        onChange={(e) => updatePart(index, 'affiliate_url', e.target.value)}
                        placeholder="https://amazon.in/..."
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2 gradient-primary text-primary-foreground"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
