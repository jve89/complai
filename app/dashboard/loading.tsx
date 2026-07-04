export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-busy="true" aria-label="Laden…">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border bg-card" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl border bg-card" />
        ))}
      </div>
    </div>
  );
}
