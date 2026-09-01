import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../../services/media.service';
import { Image, Upload, Search, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react';

export default function MediaSelectorModal({ isOpen, onClose, onSelectMedia }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'upload'
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const queryClient = useQueryClient();

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media-library-modal', searchQuery],
    queryFn: () => mediaService.getMediaList({ search: searchQuery, limit: 16 }),
    enabled: isOpen && activeTab === 'library',
  });

  const mediaList = mediaData?.data || [];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select an image file to upload');
      return;
    }

    setUploadError('');
    const formData = new FormData();
    formData.append('files', uploadFile);
    if (altText) formData.append('altText', altText);
    if (caption) formData.append('caption', caption);
    if (credit) formData.append('credit', credit);

    try {
      const response = await mediaService.uploadMedia(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      queryClient.invalidateQueries({ queryKey: ['media-library-modal'] });
      queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });

      const newMedia = Array.isArray(response.data) ? response.data[0] : response.data;
      onSelectMedia(newMedia);
      onClose();
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-600" /> Media Library & Selector
            </h3>
            <span className="text-xs text-editorial-muted">Choose an existing image or upload new media</span>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition">
            <X className="w-5 h-5 text-editorial-muted" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-editorial-border px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'library'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-editorial-muted hover:text-editorial-text'
            }`}
          >
            Browse Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-editorial-muted hover:text-editorial-text'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload New Image
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-editorial-muted" />
                <input
                  type="text"
                  placeholder="Search media by filename or caption..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* Media Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="aspect-square bg-black/5 dark:bg-white/5 rounded-xl" />
                  ))}
                </div>
              ) : mediaList.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Image className="w-8 h-8 text-editorial-muted mx-auto" />
                  <p className="text-xs text-editorial-muted">No media items found. Upload an image to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mediaList.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => {
                        onSelectMedia(m);
                        onClose();
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-editorial-border hover:border-purple-600 transition text-left focus:outline-none"
                    >
                      <img src={m.url} alt={m.altText} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center text-white">
                        <span className="text-[10px] font-bold truncate">{m.originalFilename}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4 max-w-lg mx-auto">
              {uploadError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4" /> {uploadError}
                </div>
              )}

              {/* Drag & Drop File Picker */}
              <div className="border-2 border-dashed border-editorial-border rounded-2xl p-6 text-center space-y-2 bg-editorial-bg dark:bg-darkEditorial-bg">
                <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                <span className="text-xs font-bold block">Drag & drop or browse image file</span>
                <span className="text-[10px] text-editorial-muted block">Supported: JPEG, PNG, WebP, AVIF, GIF (Max 10 MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="media-file-input"
                />
                <label
                  htmlFor="media-file-input"
                  className="inline-block px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-purple-700 transition"
                >
                  {uploadFile ? uploadFile.name : 'Select File'}
                </label>
              </div>

              {/* Upload Progress Bar */}
              {uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span>Uploading & Optimizing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-editorial-border h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Alt Text & Caption Metadata */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold block mb-1">Alt Text (Accessibility)</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Descriptive text for screen readers..."
                    className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Caption (Optional)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Caption displayed under cover photo..."
                    className="w-full p-2.5 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                >
                  Upload & Attach Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
