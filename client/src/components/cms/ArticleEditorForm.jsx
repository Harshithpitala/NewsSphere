import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/category.service';
import { tagService } from '../../services/tag.service';
import AIEditorialAssistant from './AIEditorialAssistant';
import MediaSelectorModal from './MediaSelectorModal';
import { Save, Send, Image, Sparkles, Check, AlertCircle, Clock } from 'lucide-react';

export default function ArticleEditorForm({
  initialData = {},
  onSubmit,
  onAutosave,
  isPending = false,
  isEdit = false,
}) {
  const [title, setTitle] = useState(initialData.title || '');
  const [subtitle, setSubtitle] = useState(initialData.subtitle || '');
  const [content, setContent] = useState(initialData.content || '');
  const [category, setCategory] = useState(initialData.category?._id || initialData.category || '');
  const [selectedTags, setSelectedTags] = useState(
    Array.isArray(initialData.tags) ? initialData.tags.map((t) => t._id || t) : []
  );
  const [coverImage, setCoverImage] = useState(initialData.coverImage || '');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState(initialData.scheduledPublishAt || '');
  const [metaTitle, setMetaTitle] = useState(initialData.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData.seo?.metaDescription || '');

  const [autosaveState, setAutosaveState] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const isFirstRender = useRef(true);

  // Sync state when initialData arrives asynchronously
  useEffect(() => {
    if (initialData && initialData._id) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.subtitle !== undefined) setSubtitle(initialData.subtitle || '');
      if (initialData.content) setContent(initialData.content);
      if (initialData.category) setCategory(initialData.category._id || initialData.category);
      if (Array.isArray(initialData.tags)) setSelectedTags(initialData.tags.map((t) => t._id || t));
      if (initialData.coverImage !== undefined) setCoverImage(initialData.coverImage || '');
      if (initialData.seo) {
        setMetaTitle(initialData.seo.metaTitle || '');
        setMetaDescription(initialData.seo.metaDescription || '');
      }
      isFirstRender.current = true; // Reset first render guard after async initialData sync
      setAutosaveState('saved');
    }
  }, [initialData._id]);

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesData?.data || [];

  // Fetch Tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getTags(),
  });
  const tags = tagsData?.data || [];

  // Handle Autosave debouncing
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setAutosaveState('unsaved');
    const timer = setTimeout(() => {
      if (title.trim() && content.trim() && category && onAutosave) {
        setAutosaveState('saving');
        onAutosave({
          title,
          subtitle,
          content,
          category,
          tags: selectedTags,
          coverImage,
          seo: { metaTitle, metaDescription },
        })
          .then(() => setAutosaveState('saved'))
          .catch(() => setAutosaveState('unsaved'));
      }
    }, 4000); // Autosave after 4s idle

    return () => clearTimeout(timer);
  }, [title, subtitle, content, category, selectedTags, coverImage, metaTitle, metaDescription]);

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e, submitForReview = false) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Headline / Article Title is required.');
      return;
    }
    if (!content.trim()) {
      setValidationError('Article Body Content is required.');
      return;
    }
    if (!category) {
      setValidationError('Please select a Primary Category in Publishing Options (right panel).');
      return;
    }

    onSubmit({
      title,
      subtitle,
      content,
      category,
      tags: selectedTags,
      coverImage,
      seo: { metaTitle, metaDescription },
      submitForReview,
    });
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <form className="space-y-6">
      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Top Action Bar with Autosave Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl shadow-xs sticky top-16 z-30">
        <div className="flex items-center space-x-2 text-xs font-mono">
          {autosaveState === 'saving' && (
            <span className="flex items-center gap-1.5 text-amber-500 font-bold">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Saving draft...
            </span>
          )}
          {autosaveState === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <Check className="w-3.5 h-3.5" /> Draft saved just now
            </span>
          )}
          {autosaveState === 'unsaved' && (
            <span className="flex items-center gap-1.5 text-editorial-muted">
              <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => handleSubmit(e, false)}
            className="px-4 py-2 rounded-lg border border-editorial-border dark:border-darkEditorial-border hover:border-editorial-accent font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5 text-editorial-accent" /> Save Draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={(e) => handleSubmit(e, true)}
            className="px-4 py-2 rounded-lg bg-editorial-accent text-white font-bold hover:bg-red-700 transition flex items-center gap-1.5 disabled:opacity-40 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" /> Submit for Review
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Article Body) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-4 shadow-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Headline / Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter compelling news title..."
                maxLength={200}
                required
                className="w-full p-3 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-xl text-lg font-bold font-serif focus:outline-none focus:ring-2 focus:ring-editorial-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Subtitle / Deck (Optional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Brief summary sentence..."
                maxLength={300}
                className="w-full p-3 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-xl text-xs font-serif focus:outline-none focus:ring-1 focus:ring-editorial-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Article Body Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Write your news article body content here (HTML or plain text supported)..."
                required
                className="w-full p-4 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-editorial-accent resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right Column (Metadata, Image, SEO, AI Assistance) */}
        <div className="space-y-6">
          {/* AI Newsroom Assistant */}
          <AIEditorialAssistant
            articleId={initialData._id}
            onApplyHeadline={(h) => setTitle(h)}
            onApplyCategory={(catId) => setCategory(catId)}
            onApplyTag={(tagId) => handleTagToggle(tagId)}
          />

          {/* Metadata Card */}
          <div className="p-5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-4 shadow-xs">
            <h4 className="text-sm font-bold font-serif border-b border-editorial-border dark:border-darkEditorial-border pb-2">
              Publishing Options
            </h4>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Primary Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs font-semibold focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted">
                  Cover Image
                </label>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Image className="w-3.5 h-3.5" /> Media Library / Upload
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/images/..."
                  className="w-full p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none"
                />
              </div>
              {coverImage && (
                <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-editorial-border bg-editorial-bg">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <MediaSelectorModal
              isOpen={isMediaModalOpen}
              onClose={() => setIsMediaModalOpen(false)}
              onSelectMedia={(media) => setCoverImage(media.url)}
            />

            {/* Tags Multi-select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Tags & Topics
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg">
                {tags.map((t) => {
                  const isSelected = selectedTags.includes(t._id);
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => handleTagToggle(t._id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition ${
                        isSelected
                          ? 'bg-editorial-accent text-white font-bold'
                          : 'bg-black/5 dark:bg-white/5 text-editorial-muted hover:bg-black/10'
                      }`}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="p-5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-4 shadow-xs">
            <h4 className="text-sm font-bold font-serif border-b border-editorial-border dark:border-darkEditorial-border pb-2">
              SEO Optimization
            </h4>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Defaults to article title..."
                className="w-full p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-muted mb-1">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Defaults to subtitle..."
                className="w-full p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
