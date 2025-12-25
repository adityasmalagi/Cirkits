import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  ShoppingCart,
  Wrench,
  Lightbulb,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { ProjectPart, Product, Project } from '@/types/database';
import { cn } from '@/lib/utils';

interface ProjectBuildWizardProps {
  project: Project;
  parts: (ProjectPart & { product: Product })[];
  onAddToCart: () => void;
}

const buildSteps = [
  {
    id: 'gather',
    title: 'Gather Components',
    icon: ShoppingCart,
    description: 'Collect all the required components for your project',
  },
  {
    id: 'prepare',
    title: 'Prepare Workspace',
    icon: Wrench,
    description: 'Set up your workspace with proper tools and ventilation',
  },
  {
    id: 'build',
    title: 'Assembly',
    icon: Lightbulb,
    description: 'Follow the wiring diagram and assemble components',
  },
  {
    id: 'test',
    title: 'Testing',
    icon: CheckCircle2,
    description: 'Power up and test your project',
  },
];

export function ProjectBuildWizard({ project, parts, onAddToCart }: ProjectBuildWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedParts, setCheckedParts] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const progress = ((currentStep + 1) / buildSteps.length) * 100;

  const togglePart = (partId: string) => {
    setCheckedParts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(partId)) {
        newSet.delete(partId);
      } else {
        newSet.add(partId);
      }
      return newSet;
    });
  };

  const toggleStep = (stepId: string) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const allPartsChecked = parts.length > 0 && checkedParts.size === parts.length;

  const renderStepContent = () => {
    switch (buildSteps[currentStep].id) {
      case 'gather':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Check off components as you gather them:
              </p>
              <Badge variant={allPartsChecked ? 'default' : 'secondary'}>
                {checkedParts.size}/{parts.length} collected
              </Badge>
            </div>
            <div className="space-y-3">
              {parts.map((part) => (
                <div
                  key={part.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    checkedParts.has(part.id) && 'bg-primary/5 border-primary/30'
                  )}
                >
                  <Checkbox
                    checked={checkedParts.has(part.id)}
                    onCheckedChange={() => togglePart(part.id)}
                  />
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={part.product?.image_url || '/placeholder.svg'}
                      alt={part.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-sm',
                      checkedParts.has(part.id) && 'line-through text-muted-foreground'
                    )}>
                      {part.product?.name}
                    </p>
                    {part.notes && (
                      <p className="text-xs text-muted-foreground">{part.notes}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium">×{part.quantity || 1}</span>
                  {part.product?.affiliate_url && (
                    <Button size="sm" variant="outline" className="gap-1" asChild>
                      <a href={part.product.affiliate_url} target="_blank" rel="noopener noreferrer">
                        Buy
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={onAddToCart} className="w-full gap-2" variant="outline">
              <ShoppingCart className="h-4 w-4" />
              Add All to Cart
            </Button>
          </div>
        );

      case 'prepare':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Before you start building, make sure you have:
            </p>
            {[
              { id: 'workspace', text: 'Clean, well-lit workspace' },
              { id: 'tools', text: 'Basic tools (screwdriver, pliers, wire stripper)' },
              { id: 'soldering', text: 'Soldering iron & solder (if needed)' },
              { id: 'multimeter', text: 'Multimeter for testing' },
              { id: 'safety', text: 'Safety glasses for soldering' },
            ].map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  checkedSteps.has(item.id) && 'bg-primary/5 border-primary/30'
                )}
                onClick={() => toggleStep(item.id)}
              >
                <Checkbox checked={checkedSteps.has(item.id)} />
                <span className={cn(
                  checkedSteps.has(item.id) && 'line-through text-muted-foreground'
                )}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        );

      case 'build':
        return (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500">Safety First!</p>
                <p className="text-sm text-muted-foreground">
                  Always disconnect power before making connections. Double-check polarity.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Assembly Steps:</h4>
              {[
                { id: 'step1', text: '1. Connect power supply to microcontroller' },
                { id: 'step2', text: '2. Wire sensors according to pin diagram' },
                { id: 'step3', text: '3. Connect output devices (LEDs, motors, relays)' },
                { id: 'step4', text: '4. Upload code to microcontroller' },
                { id: 'step5', text: '5. Secure all connections' },
              ].map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    checkedSteps.has(step.id) && 'bg-primary/5 border-primary/30'
                  )}
                  onClick={() => toggleStep(step.id)}
                >
                  <Checkbox checked={checkedSteps.has(step.id)} />
                  <span className={cn(
                    checkedSteps.has(step.id) && 'line-through text-muted-foreground'
                  )}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'test':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Final testing checklist:
            </p>
            {[
              { id: 'visual', text: 'Visual inspection of all connections' },
              { id: 'power', text: 'Check power supply voltage' },
              { id: 'initial', text: 'Initial power-on test' },
              { id: 'function', text: 'Test all functions' },
              { id: 'stress', text: 'Run extended test' },
            ].map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  checkedSteps.has(item.id) && 'bg-primary/5 border-primary/30'
                )}
                onClick={() => toggleStep(item.id)}
              >
                <Checkbox checked={checkedSteps.has(item.id)} />
                <span className={cn(
                  checkedSteps.has(item.id) && 'line-through text-muted-foreground'
                )}>
                  {item.text}
                </span>
              </div>
            ))}

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-500">Congratulations!</p>
                <p className="text-sm text-muted-foreground">
                  If everything works, your {project.title} is complete!
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Build Guide
        </CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {buildSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center gap-1 cursor-pointer transition-colors',
                  isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                )}
                onClick={() => setCurrentStep(index)}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                  isActive ? 'border-primary bg-primary/10' : isCompleted ? 'border-green-500 bg-green-500/10' : 'border-muted'
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Current step content */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{buildSteps[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {buildSteps[currentStep].description}
          </p>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={currentStep === buildSteps.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
