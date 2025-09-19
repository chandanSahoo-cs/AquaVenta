// components/skeletons/ReportsGridSkeleton.tsx
export function ReportsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-muted rounded w-full mb-2"></div>
          <div className="h-3 bg-muted rounded w-5/6 mb-4"></div>
          <div className="h-8 bg-muted rounded w-full mb-2"></div>
          <div className="flex justify-between mt-4">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )
}