import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../../services/media.service';
import OptimizedImage from '../../components/common/OptimizedImage';
import ErrorState from '../../components/common/ErrorState';
import { Image, Search, Trash2, Edit2, AlertCircle, CheckCircle2, FileText, Info } from 'lucide-react';

export default function AdminMediaLibraryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const queryClient = useQueryClient();

  const { data: mediaData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-media-library', page, search],
    queryFn: () => mediaService.getMediaList({ page, limit: 12, search }),
  });

  const mediaList = mediaData?.data || [];
  const pagination = mediaData?.pagination;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mediaService.updateMediaMetadata(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });
      setActionSuccess('Metadata updated successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mediaService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });
      setSelectedMedia(null);
      setActionSuccess('Media deleted successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || err.message || 'Deletion failed');
    },
  });

  const handleOpenPreview = (media) => {
    setSelectedMedia(media);
    setAltText(media.altText || '');
    setCaption(media.caption || '');
    setCredit(media.credit || '');
    setActionError('');
  };

  const handleSaveMetadata = (e) => {
    e.preventDefault();
    if (!selectedMedia) return;
    updateMutation.mutate({
      id: selectedMedia._id,
      data: { altText, caption, credit },
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-editorial-border dark:border-darkEditorial-border">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2">
            <Image className="w-6 h-6 text-purple-600" /> Media & Image Library
          </h1>
          <p className="text-xs text-editorial-muted">Manage uploaded news media, metadata, and optimization assets</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-editorial-muted" />
          <input
            type="text"
            placeholder="Search filenames or captions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {actionSuccess}
        </div>
      )}

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-square bg-black/5 dark:bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-16 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl space-y-2">
          <Image className="w-10 h-10 text-editorial-muted mx-auto" />
          <h3 className="text-base font-bold font-serif">No media items found</h3>
          <p className="text-xs text-editorial-muted">Upload media via the Journalist Desk or Article Editor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaList.map((m) => (
            <div
              key={m._id}
              onClick={() => handleOpenPreview(m)}
              className="group bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-purple-600 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden bg-editorial-bg dark:bg-darkEditorial-bg relative">
                <OptimizedImage src={m.url} responsiveUrls={m.responsiveUrls} alt={m.altText} />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white font-mono text-[9px] font-bold rounded">
                  {formatSize(m.fileSize)}
                </span>
              </div>

              <div className="p-3 space-y-1">
                <span className="font-bold text-xs font-serif block truncate text-editorial-text">{m.originalFilename}</span>
                <div className="flex items-center justify-between text-[10px] text-editorial-muted font-mono">
                  <span>{m.width}x{m.height}px</span>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-editorial-border text-xs">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Media Detail & Metadata Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" /> Media Details & Metadata
              </h3>
              <button onClick={() => setSelectedMedia(null)} className="text-xs font-bold text-editorial-muted hover:underline">
                Close
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" /> {actionError}
              </div>
            )}

            {/* Media Image Preview */}
            <div className="rounded-xl overflow-hidden max-h-[300px] bg-black flex items-center justify-center">
              <img src={selectedMedia.url} alt={selectedMedia.altText} className="max-h-[300px] object-contain" />
            </div>

            {/* File Info Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-editorial-bg dark:bg-darkEditorial-bg rounded-xl text-xs font-mono">
              <div>
                <span className="text-editorial-muted block text-[10px]">Dimensions</span>
                <span className="font-bold">{selectedMedia.width}x{selectedMedia.height}px</span>
              </div>
              <div>
                <span className="text-editorial-muted block text-[10px]">File Size</span>
                <span className="font-bold">{formatSize(selectedMedia.fileSize)}</span>
              </div>
              <div>
                <span className="text-editorial-muted block text-[10px]">Format</span>
                <span className="font-bold">{selectedMedia.mimeType}</span>
              </div>
              <div>
                <span className="text-editorial-muted block text-[10px]">Provider</span>
                <span className="font-bold">{selectedMedia.provider}</span>
              </div>
            </div>

            {/* Metadata Edit Form */}
            <form onSubmit={handleSaveMetadata} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Alt Text (SEO & Accessibility)</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(selectedMedia._id)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Media
                </button>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Save Metadata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
