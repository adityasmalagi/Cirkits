import { cn } from "@/lib/utils";

// Base shimmer skeleton
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-shimmer before:bg-gradient-to-r",
        "before:from-transparent before:via-white/10 before:to-transparent",
        className
      )} 
      {...props} 
    />
  );
}

// Category Card Skeleton
function CategoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 md:p-6 space-y-3">
      <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg mx-auto" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <Skeleton className="h-3 w-1/2 mx-auto" />
    </div>
  );
}

// Project Card Skeleton
function ProjectCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Project List Item Skeleton
function ProjectListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

// Laptop Card Skeleton
function LaptopCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Stats Skeleton
function StatsSkeleton() {
  return (
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
      <Skeleton className="h-7 w-16 mx-auto" />
      <Skeleton className="h-4 w-20 mx-auto" />
    </div>
  );
}

// Service Card Skeleton
function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
      <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

// Profile Section Skeleton
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Notification Item Skeleton
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

// Full Page Loading Skeleton
function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  CategoryCardSkeleton,
  ProjectCardSkeleton,
  ProjectListItemSkeleton,
  LaptopCardSkeleton,
  StatsSkeleton,
  ServiceCardSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,
  PageLoadingSkeleton,
};
