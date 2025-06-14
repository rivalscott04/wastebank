import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  type?: 'dashboard' | 'card' | 'table' | 'form' | 'profile' | 'tukar-poin' | 'riwayat' | 'request-jemput';
  count?: number;
}

const SkeletonLoader = ({ type = 'dashboard', count = 1 }: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>

            {/* Content area skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 border rounded-lg space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start space-x-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 border rounded-lg space-y-4">
                  <Skeleton className="h-6 w-28" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="p-6 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="border rounded-lg">
              <div className="grid grid-cols-4 gap-4 p-4 border-b">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-20" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-16" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(count)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-24" />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Profile content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Profile form */}
              <div className="lg:col-span-2">
                <div className="p-6 border rounded-lg space-y-6">
                  {/* Profile header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>

                  {/* Profile picture and basic info */}
                  <div className="flex items-center space-x-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column - Stats and actions */}
              <div className="space-y-6">
                {/* Stats card */}
                <div className="p-6 border rounded-lg space-y-4">
                  <Skeleton className="h-6 w-28" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="p-6 border rounded-lg space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tukar-poin':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 border rounded-lg space-y-4">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'riwayat':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Filter skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Table skeleton */}
            <div className="border rounded-lg">
              <div className="grid grid-cols-5 gap-4 p-4 border-b">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-20" />
                ))}
              </div>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-16" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'request-jemput':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic info card */}
                <div className="p-6 border rounded-lg space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-20 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>

                {/* Waste items card */}
                <div className="p-6 border rounded-lg space-y-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-24" />
                  </div>

                  {/* Waste item skeleton */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="flex items-end">
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary column */}
              <div>
                <div className="p-6 border rounded-lg space-y-4">
                  <Skeleton className="h-6 w-32" />

                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  return <div className="animate-pulse">{renderSkeleton()}</div>;
};

export default SkeletonLoader;