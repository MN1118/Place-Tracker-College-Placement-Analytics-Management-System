import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="border-t border-ink-100 bg-ink-900 text-ink-300">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 font-display text-xs font-bold text-white">PL</span>
              <span className="font-display text-sm font-semibold text-white">Place Tracker</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              The placement cell's system of record — from eligibility to offer letter.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/companies" className="hover:text-white">Recruiting companies</Link></li>
              <li><Link to="/statistics" className="hover:text-white">Placement statistics</Link></li>
              <li><Link to="/about" className="hover:text-white">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Account</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-white">Create an account</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact placement cell</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Demo access</h4>
            <p className="mt-3 text-sm text-ink-400">admin@campusplacements.edu</p>
            <p className="text-sm text-ink-400">student1@campusplacements.edu</p>
            <p className="text-sm text-ink-400">Password@123</p>
          </div>
        </div>
        <div className="mt-10 border-t border-ink-800 pt-6 text-xs text-ink-500">
          © {new Date().getFullYear()} CampusPlacements. Built as a BCA final-year project.
        </div>
      </div>
    </footer>
  );
}
