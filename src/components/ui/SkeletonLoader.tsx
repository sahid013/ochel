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
