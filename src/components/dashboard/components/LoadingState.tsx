
export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
        <span className="text-olimpics-green-primary font-medium">Carregando...</span>
      </div>
    </div>
  );
}
