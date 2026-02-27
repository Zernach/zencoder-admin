export function MetricCardSkeleton() {
  return (
    <div className="border-2 border-gray-300 p-4 bg-gray-50 animate-pulse">
      <div className="h-3 w-24 bg-gray-300 mb-3"></div>
      <div className="h-8 w-20 bg-gray-300 mb-2"></div>
      <div className="h-2 w-16 bg-gray-200"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border-2 border-gray-300 bg-white">
      <div className="border-b-2 border-gray-300 p-4">
        <div className="h-4 w-32 bg-gray-300 animate-pulse"></div>
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex gap-4 animate-pulse">
            <div className="h-4 w-20 bg-gray-200"></div>
            <div className="h-4 flex-1 bg-gray-200"></div>
            <div className="h-4 w-16 bg-gray-200"></div>
            <div className="h-4 w-16 bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="border-2 border-gray-300 p-4 bg-white">
      <div className="h-4 w-40 bg-gray-300 mb-4 animate-pulse"></div>
      <div 
        className="bg-gray-100 animate-pulse"
        style={{ height: `${height}px` }}
      ></div>
    </div>
  );
}
