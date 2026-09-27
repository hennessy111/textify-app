// UI компонент Skeleton

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="Загрузка">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${i < lines - 1 ? 'mb-3' : ''} ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
      <span className="sr-only">Загрузка...</span>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <Skeleton lines={4} />
      <div className="flex gap-2 mt-4">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
