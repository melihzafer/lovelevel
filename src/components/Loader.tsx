export function Loader() {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label="Loading">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-text-secondary">Loading...</p>
    </div>
  );
}
