export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" role="status" aria-label="Loading">
       <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}
