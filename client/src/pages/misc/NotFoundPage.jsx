import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
      <p className="font-mono text-sm font-semibold text-brand-500">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
