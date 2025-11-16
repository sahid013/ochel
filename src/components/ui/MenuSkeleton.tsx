/**
 * Skeleton loader for menu items
 * Shows animated placeholder cards while menu data is loading
 */
export function MenuSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Render 3 sections with skeleton items */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          {/* Section title skeleton */}
          <div className="h-8 bg-white/10 rounded-lg w-48 mb-6"></div>

          {/* Menu items grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-3">
                {/* Image skeleton */}
                <div className="h-48 bg-white/10 rounded-lg"></div>

                {/* Title skeleton */}
                <div className="h-6 bg-white/10 rounded w-3/4"></div>

                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                </div>

                {/* Price skeleton */}
                <div className="h-6 bg-white/10 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact skeleton loader for list-style menus
 */
export function MenuSkeletonList() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          {/* Section title skeleton */}
          <div className="h-7 bg-white/10 rounded-lg w-40 mb-4"></div>

          {/* Menu items list skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex gap-4">
                {/* Image skeleton (optional) */}
                <div className="h-20 w-20 bg-white/10 rounded-lg flex-shrink-0"></div>

                <div className="flex-1 space-y-2">
                  {/* Title skeleton */}
                  <div className="h-5 bg-white/10 rounded w-2/3"></div>

                  {/* Description skeleton */}
                  <div className="h-4 bg-white/10 rounded w-full"></div>

                  {/* Price skeleton */}
                  <div className="h-5 bg-white/10 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Minimal skeleton for category tabs
 */
export function CategoryTabsSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((tab) => (
        <div
          key={tab}
          className="h-12 bg-white/10 rounded-lg"
          style={{ width: `${80 + Math.random() * 40}px` }}
        ></div>
      ))}
    </div>
  );
}
