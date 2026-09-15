export const ProductSkeleton = () => {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/5] bg-stone-200/70 border border-velora-border" />
      
      {/* Category / Volume Skeleton */}
      <div className="h-3 w-1/3 bg-stone-200/70 rounded-xs" />
      
      {/* Title Skeleton */}
      <div className="h-5 w-4/5 bg-stone-200/80 rounded-xs" />
      
      {/* Price Skeleton */}
      <div className="h-4 w-1/4 bg-stone-200/60 rounded-xs" />
    </div>
  );
};