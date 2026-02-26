export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <a
        href="/"
        className="text-primary underline hover:no-underline"
      >
        Go home
      </a>
    </div>
  );
}
