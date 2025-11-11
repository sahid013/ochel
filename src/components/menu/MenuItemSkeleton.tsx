export default function MenuItemSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Skeleton for menu item card */}
      <div className="flex gap-4 p-4 bg-[#101010] border border-white/10 rounded-lg">
        {/* Image skeleton */}
        <div className="relative w-[100px] h-[100px] flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] rounded-lg animate-shimmer bg-[length:200%_100%]" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 flex flex-col justify-between py-1">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] rounded animate-shimmer bg-[length:200%_100%] w-3/4" />
            {/* Subtitle skeleton */}
            <div className="h-4 bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] rounded animate-shimmer bg-[length:200%_100%] w-full" />
            <div className="h-4 bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] rounded animate-shimmer bg-[length:200%_100%] w-2/3" />
          </div>

          {/* Price skeleton */}
          <div className="h-6 bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] rounded animate-shimmer bg-[length:200%_100%] w-20 mt-2" />
        </div>
      </div>
    </div>
  );
}
