import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Mail, Send, Shield, Globe } from 'lucide-react';

export default function Footer({ categories = [] }) {
  return (
    <footer className="border-t border-editorial-border dark:border-darkEditorial-border bg-editorial-card dark:bg-darkEditorial-card pt-12 pb-8 px-4 sm:px-6 mt-auto text-xs text-editorial-muted dark:text-darkEditorial-muted transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Brand & About */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-editorial-accent text-white rounded-lg">
              <Newspaper className="w-5 h-5" />
            </div>
            <span className="font-bold font-serif text-xl text-editorial-text dark:text-darkEditorial-text">
              NewsSphere
            </span>
          </div>

          <p className="leading-relaxed">
            NewsSphere is an advanced digital news platform delivering real-time breaking updates, original editorial content, personalized feeds, and AI-assisted article comprehension tools.
          </p>

          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <Globe className="w-3.5 h-3.5 text-editorial-accent" />
            <span>Independent Editorial Standards</span>
          </div>
        </div>

        {/* Categories Section */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-editorial-text dark:text-darkEditorial-text">
            Sections
          </h4>
          <ul className="space-y-2">
            <li><Link to="/latest" className="hover:text-editorial-accent transition">Latest Feed</Link></li>
            {categories.slice(0, 6).map((cat) => (
              <li key={cat._id || cat.slug}>
                <Link to={`/category/${cat.slug}`} className="hover:text-editorial-accent transition">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Account */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-editorial-text dark:text-darkEditorial-text">
            Platform
          </h4>
          <ul className="space-y-2">
            <li><Link to="/profile" className="hover:text-editorial-accent transition">My Account</Link></li>
            <li><Link to="/login" className="hover:text-editorial-accent transition">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-editorial-accent transition">Register</Link></li>
            <li><span className="opacity-70 cursor-not-allowed">Privacy Policy</span></li>
            <li><span className="opacity-70 cursor-not-allowed">Terms of Service</span></li>
          </ul>
        </div>

        {/* Newsletter Placeholder */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-editorial-text dark:text-darkEditorial-text flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-editorial-accent" /> Newsletter Digest
          </h4>
          <p className="leading-relaxed">
            Subscribe to receive top editorial stories directly in your inbox.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Newsletter subscription functionality will be activated in Phase 8.'); }} className="flex space-x-2">
            <input
              type="email"
              placeholder="name@example.com"
              required
              className="w-full px-3 py-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-editorial-accent"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-editorial-accent hover:bg-red-700 text-white rounded-lg transition shrink-0"
              title="Subscribe"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-editorial-border dark:border-darkEditorial-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p>© 2026 NewsSphere — Production MERN Digital News Platform.</p>
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> Security Verified
          </span>
        </div>
      </div>
    </footer>
  );
}
