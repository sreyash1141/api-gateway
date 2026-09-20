function SkeletonCard({ height = 'h-40' }) {
  return (
    <div className={`glass rounded-2xl p-6 ${height}`}>
      <div className="skeleton h-4 w-32 mb-4"></div>
      <div className="skeleton h-6 w-48 mb-3"></div>
      <div className="skeleton h-4 w-full mb-2"></div>
      <div className="skeleton h-4 w-3/4"></div>
    </div>
  )
}

function SkeletonStatCard() {
  return (
    <div className="glass rounded-xl p-4">
      <div className="skeleton h-3 w-16 mb-2"></div>
      <div className="skeleton h-6 w-24"></div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SkeletonCard height="h-36" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard height="h-52" />
        <SkeletonCard height="h-52" />
      </div>
    </div>
  )
}

export default DashboardSkeleton