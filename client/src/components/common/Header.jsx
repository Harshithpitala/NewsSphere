import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { categoryService } from '../../services/category.service';
import { articleService } from '../../services/article.service';
import {
  Newspaper,
  Moon,
  Sun,
  LogOut,
  Shield,
  FileEdit,
  Menu,
  X,
  Compass,
  ChevronDown,
  Flame,
  Search,
  Bookmark,
  History,
  Heart,
  MessageSquare,
  User,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdown, setCategoriesDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Categories for Navigation
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesData?.data || [];

  // Fetch Autocomplete Suggestions
  const { data: suggestionsData } = useQuery({
    queryKey: ['header-suggestions', searchQuery],
    queryFn: () => articleService.getSearchSuggestions(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  });
  const suggestions = suggestionsData?.data?.suggestions;

  // Close mobile drawer and dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesDropdown(false);
    setUserDropdown(false);
    setSearchFocused(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b border-editorial-border dark:border-darkEditorial-border bg-editorial-card dark:bg-darkEditorial-card sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-editorial-accent text-white rounded-lg group-hover:bg-red-700 transition shadow-sm">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-serif leading-none">NewsSphere</h1>
              <p className="text-[10px] text-editorial-muted dark:text-darkEditorial-muted uppercase tracking-widest font-sans font-semibold mt-0.5">
                Advanced AI Digital News
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-5 text-xs font-semibold">
            <Link
              to="/"
              className={`transition ${location.pathname === '/' ? 'text-editorial-accent font-bold' : 'hover:text-editorial-accent'}`}
            >
              Home
            </Link>

            <Link
              to="/trending"
              className={`flex items-center gap-1 transition ${location.pathname === '/trending' ? 'text-amber-500 font-bold' : 'hover:text-amber-500'}`}
            >
              <Flame className="w-3.5 h-3.5 fill-current text-amber-500" /> Trending
            </Link>

            <Link
              to="/for-you"
              className={`flex items-center gap-1 transition ${location.pathname === '/for-you' ? 'text-purple-600 font-bold' : 'hover:text-purple-600'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> For You
            </Link>

            <Link
              to="/latest"
              className={`flex items-center gap-1 transition ${location.pathname === '/latest' ? 'text-editorial-accent font-bold' : 'hover:text-editorial-accent'}`}
            >
              <Compass className="w-3.5 h-3.5 text-editorial-accent" /> Latest Feed
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdown(!categoriesDropdown)}
                className="flex items-center gap-1 hover:text-editorial-accent transition focus:outline-none"
              >
                <span>Categories</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {categoriesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-lg p-2 z-50 grid grid-cols-1 gap-1"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setCategoriesDropdown(false)}
                        className="px-3 py-1.5 rounded-lg text-xs hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        {/* Header Search Box with Autocomplete */}
        <div className="relative hidden md:block max-w-xs w-full">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-editorial-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search news..."
                className="w-full pl-9 pr-3 py-1.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-editorial-accent"
              />
            </div>
          </form>

          {/* Search Dropdown Preview */}
          <AnimatePresence>
            {searchFocused && suggestions && (suggestions.articles?.length > 0 || suggestions.categories?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 right-0 mt-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xl z-50 p-3 space-y-2 text-left"
              >
                {suggestions.articles?.length > 0 && (
                  <div>
                    <span className="text-[9px] uppercase font-bold text-editorial-muted tracking-wider block mb-1">
                      Articles
                    </span>
                    {suggestions.articles.map((a) => (
                      <Link
                        key={a.slug}
                        to={`/article/${a.slug}`}
                        onClick={() => setSearchFocused(false)}
                        className="block py-1 text-xs font-serif font-bold hover:text-editorial-accent truncate"
                      >
                        {a.title}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-3">
          <Link
            to="/search"
            className="md:hidden p-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              {['JOURNALIST', 'EDITOR', 'ADMIN'].includes(user?.role) && (
                <Link
                  to="/journalist"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-editorial-accent/30 bg-editorial-accent/10 text-editorial-accent text-xs font-bold hover:bg-editorial-accent/20 transition"
                >
                  <FileEdit className="w-3.5 h-3.5" /> Journalist Desk
                </Link>
              )}

              {['EDITOR', 'ADMIN'].includes(user?.role) && (
                <Link
                  to="/editor"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition"
                >
                  <Shield className="w-3.5 h-3.5" /> Editor Console
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Console
                </Link>
              )}

              {/* User Account & Engagement Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:bg-black/5 dark:hover:bg-white/5 transition text-xs font-semibold"
                >
                  <div className="w-6 h-6 rounded-full bg-editorial-accent text-white flex items-center justify-center font-bold uppercase text-[11px]">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="w-3 h-3 text-editorial-muted" />
                </button>

                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full right-0 mt-2 w-52 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xl p-2 z-50 space-y-1 text-xs"
                    >
                      <div className="px-3 py-2 border-b border-editorial-border dark:border-darkEditorial-border">
                        <p className="font-bold truncate">{user?.name}</p>
                        <p className="text-[10px] text-editorial-muted truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <User className="w-3.5 h-3.5" /> Profile Settings
                      </Link>

                      <Link
                        to="/bookmarks"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-editorial-accent" /> Saved Bookmarks
                      </Link>

                      <Link
                        to="/reading-history"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <History className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Reading History
                      </Link>

                      <Link
                        to="/liked-articles"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> Liked Articles
                      </Link>

                      <Link
                        to="/my-comments"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> My Comments
                      </Link>

                      <div className="pt-1 border-t border-editorial-border dark:border-darkEditorial-border">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-500/10 transition font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-editorial-accent text-white hover:bg-red-700 transition"
              >
                Register
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-editorial-border dark:border-darkEditorial-border bg-editorial-card dark:bg-darkEditorial-card px-4 py-6 space-y-6"
          >
            <div className="space-y-3 font-semibold text-sm">
              <Link to="/" className="block py-2 hover:text-editorial-accent transition">
                Home
              </Link>
              <Link to="/trending" className="block py-2 hover:text-amber-500 transition">
                🔥 Trending Stories
              </Link>
              <Link to="/latest" className="block py-2 hover:text-editorial-accent transition">
                Latest Feed
              </Link>
              <Link to="/search" className="block py-2 hover:text-editorial-accent transition">
                Search Stories
              </Link>

              {isAuthenticated && (
                <>
                  <Link to="/bookmarks" className="block py-2 hover:text-editorial-accent transition">
                    Saved Bookmarks
                  </Link>
                  <Link to="/reading-history" className="block py-2 hover:text-editorial-accent transition">
                    Reading History
                  </Link>
                </>
              )}
            </div>

            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-editorial-muted dark:text-darkEditorial-muted mb-3">
                News Categories
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/category/${cat.slug}`}
                    className="p-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border text-xs font-medium hover:border-editorial-accent transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
