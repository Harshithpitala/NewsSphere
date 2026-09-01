import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-4 shadow-lg">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-serif">Something went wrong rendering this article</h3>
            <p className="text-xs text-editorial-muted leading-relaxed">
              An unexpected error occurred while loading story content. Please refresh or return home.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-editorial-accent text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-red-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Page
              </button>

              <a
                href="/"
                className="px-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-xs font-bold flex items-center gap-1.5 hover:border-editorial-accent transition"
              >
                <Home className="w-3.5 h-3.5" /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
