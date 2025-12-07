/**
 * Skeleton loader for menu items
 * Shows animated placeholder cards while menu data is loading
 */
export function MenuSkeleton({ itemClassName = "bg-gray-200" }: { itemClassName?: string }) {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Render 3 sections with skeleton items */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          {/* Section title skeleton */}
          <div className={`h-8 rounded-lg w-48 mb-6 ${itemClassName}`}></div>

          {/* Menu items grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-3">
                {/* Image skeleton */}
                <div className={`h-48 rounded-lg ${itemClassName}`}></div>

                {/* Title skeleton */}
                <div className={`h-6 rounded w-3/4 ${itemClassName}`}></div>

                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className={`h-4 rounded w-full ${itemClassName}`}></div>
                  <div className={`h-4 rounded w-5/6 ${itemClassName}`}></div>
                </div>

                {/* Price skeleton */}
                <div className={`h-6 rounded w-24 ${itemClassName}`}></div>
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
export function MenuSkeletonList({ itemClassName = "bg-gray-200" }: { itemClassName?: string }) {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          {/* Section title skeleton */}
          <div className={`h-7 rounded-lg w-40 mb-4 ${itemClassName}`}></div>

          {/* Menu items list skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex gap-4">
                {/* Image skeleton (optional) */}
                <div className={`h-20 w-20 rounded-lg flex-shrink-0 ${itemClassName}`}></div>

                <div className="flex-1 space-y-2">
                  {/* Title skeleton */}
                  <div className={`h-5 rounded w-2/3 ${itemClassName}`}></div>

                  {/* Description skeleton */}
                  <div className={`h-4 rounded w-full ${itemClassName}`}></div>

                  {/* Price skeleton */}
                  <div className={`h-5 rounded w-20 ${itemClassName}`}></div>
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
export function CategoryTabsSkeleton({ itemClassName = "bg-gray-200" }: { itemClassName?: string }) {
  return (
    <div className="flex gap-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((tab) => (
        <div
          key={tab}
          className={`h-12 rounded-lg ${itemClassName}`}
          style={{ width: `${80 + Math.random() * 40}px` }}
        ></div>
      ))}
    </div>
  );
}

/**
 * Full page skeleton including Hero and Navbar mockups
 */
export function FullPageMenuSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Skeleton */}
      <div className="h-16 border-b border-gray-100 flex items-center px-4 justify-between">
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse"></div>
      </div>

      {/* Hero Skeleton (mimics Template 1/2/3/4 generic height) */}
      <div className="h-[276px] bg-gray-100 animate-pulse w-full relative mb-6">
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Tabs */}
        <div className="mb-8 overflow-hidden">
          <CategoryTabsSkeleton itemClassName="bg-gray-200" />
        </div>

        {/* Menu Items */}
        <MenuSkeleton itemClassName="bg-gray-200" />
      </div>
    </div>
  );
}
