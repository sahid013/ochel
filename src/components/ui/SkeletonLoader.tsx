export function SkeletonLoader({ className = "", count = 1 }: { className?: string, count?: number }) {
    return (
        <div className={`animate-pulse space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-24 w-full opacity-70"></div>
            ))}
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header placeholder */}
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 w-48 rounded"></div>
                    <div className="h-4 bg-gray-200 w-96 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 w-32 rounded"></div>
            </div>

            {/* List Items */}
            <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-6 flex justify-between items-center">
                        <div className="flex items-center space-x-4 flex-1">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-5 bg-gray-200 w-1/4 rounded"></div>
                                <div className="flex gap-4">
                                    <div className="h-3 bg-gray-200 w-24 rounded"></div>
                                    <div className="h-3 bg-gray-200 w-32 rounded"></div>
                                </div>
                            </div>
                        </div>
                        <div className="h-4 bg-gray-200 w-24 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AdminDashboardSkeleton() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
            {/* Navbar Skeleton */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            {/* Logo */}
                            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
                            {/* Badge */}
                            <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Language Switcher */}
                            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse"></div>
                            {/* Logout */}
                            <div className="h-5 w-16 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Skeleton */}
            <main className="max-w-[1460px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* Reuse TableSkeleton logic or similar structure */}
                    <TableSkeleton />
                </div>
            </main>
        </div>
    );
}
