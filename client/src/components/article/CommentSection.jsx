import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { commentService } from '../../services/comment.service';
import { reportService } from '../../services/report.service';
import { MessageSquare, ThumbsUp, Reply, Trash2, Edit2, Flag, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function CommentSection({ articleId }) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [reportModalComment, setReportModalComment] = useState(null);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch Article Comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['article-comments', articleId],
    queryFn: () => commentService.getArticleComments(articleId),
  });

  const comments = commentsData?.data || [];

  // Create Comment Mutation
  const createMutation = useMutation({
    mutationFn: (data) => commentService.createComment(articleId, data),
    onSuccess: () => {
      setCommentText('');
      setReplyingToId(null);
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['article-comments', articleId] });
      queryClient.invalidateQueries({ queryKey: ['article-detail'] });
    },
  });

  // Edit Comment Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content }) => commentService.updateComment(id, content),
    onSuccess: () => {
      setEditingId(null);
      setEditText('');
      queryClient.invalidateQueries({ queryKey: ['article-comments', articleId] });
    },
  });

  // Delete Comment Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => commentService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', articleId] });
      queryClient.invalidateQueries({ queryKey: ['article-detail'] });
    },
  });

  // Like Comment Mutation
  const likeMutation = useMutation({
    mutationFn: (id) => commentService.toggleCommentLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', articleId] });
    },
  });

  // Submit Report Mutation
  const reportMutation = useMutation({
    mutationFn: (data) => reportService.createReport(data),
    onSuccess: () => {
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalComment(null);
      }, 2000);
    },
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createMutation.mutate({ content: commentText.trim() });
  };

  const handlePostReply = (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    createMutation.mutate({ content: replyText.trim(), parentComment: parentId });
  };

  const handleSaveEdit = (e, id) => {
    e.preventDefault();
    if (!editText.trim()) return;
    updateMutation.mutate({ id, content: editText.trim() });
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportModalComment) return;
    reportMutation.mutate({
      targetType: 'COMMENT',
      targetId: reportModalComment._id,
      reason: reportReason,
      details: reportDetails,
    });
  };

  return (
    <section className="mt-12 pt-8 border-t border-editorial-border dark:border-darkEditorial-border space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-serif flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-editorial-accent" />
          Community Discussion ({comments.length})
        </h3>
      </div>

      {/* Main Comment Composer */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Share your thoughts on this story..."
            maxLength={1000}
            className="w-full p-3.5 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-editorial-accent resize-none"
          />
          <div className="flex items-center justify-between text-xs text-editorial-muted">
            <span>{1000 - commentText.length} characters left</span>
            <button
              type="submit"
              disabled={createMutation.isPending || !commentText.trim()}
              className="px-4 py-2 bg-editorial-accent text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-40 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl text-center text-xs">
          Please <a href="/login" className="text-editorial-accent font-bold hover:underline">Sign In</a> to join the conversation and share your comment.
        </div>
      )}

      {/* Comments List */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-16 bg-black/5 dark:bg-white/5 rounded-xl" />
          <div className="h-16 bg-black/5 dark:bg-white/5 rounded-xl" />
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-xs text-editorial-muted italic text-center py-6">
          Be the first to share your insight on this story!
        </p>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="p-4 bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-xl space-y-3">
              {/* Comment Header */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-editorial-accent text-white font-bold flex items-center justify-center uppercase text-xs">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-bold">{comment.user?.name}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border font-mono">
                      {comment.user?.role}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-editorial-muted">
                  {new Date(comment.createdAt).toLocaleDateString()}
                  {comment.isEdited && <span className="ml-1 italic">(edited)</span>}
                </span>
              </div>

              {/* Edit Mode inline or Display text */}
              {editingId === comment._id ? (
                <form onSubmit={(e) => handleSaveEdit(e, comment._id)} className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border text-xs rounded-lg focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setEditingId(null)} className="px-2.5 py-1 text-editorial-muted">Cancel</button>
                    <button type="submit" className="px-3 py-1 bg-editorial-accent text-white rounded font-bold">Save</button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-editorial-text dark:text-darkEditorial-text leading-relaxed">
                  {comment.content}
                </p>
              )}

              {/* Action Buttons (Like, Reply, Edit, Delete, Report) */}
              <div className="flex items-center space-x-4 pt-2 border-t border-editorial-border dark:border-darkEditorial-border text-[11px] text-editorial-muted">
                <button
                  disabled={!isAuthenticated || likeMutation.isPending}
                  onClick={() => likeMutation.mutate(comment._id)}
                  className={`flex items-center gap-1 transition ${
                    comment.isLikedByCurrentUser
                      ? 'text-editorial-accent font-bold'
                      : 'hover:text-editorial-accent'
                  }`}
                  title={comment.isLikedByCurrentUser ? 'Unlike comment' : 'Like comment'}
                >
                  <ThumbsUp className={`w-3 h-3 ${comment.isLikedByCurrentUser ? 'fill-current' : ''}`} /> {comment.likesCount || 0}
                </button>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setReplyingToId(replyingToId === comment._id ? null : comment._id);
                      setReplyText('');
                    }}
                    className="flex items-center gap-1 hover:text-editorial-accent transition font-semibold"
                  >
                    <Reply className="w-3 h-3" /> Reply
                  </button>
                )}

                {user && user._id === comment.user?._id && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(comment._id);
                        setEditText(comment.content);
                      }}
                      className="flex items-center gap-1 hover:text-editorial-accent transition"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(comment._id)}
                      className="flex items-center gap-1 text-red-500 hover:underline transition"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </>
                )}

                {isAuthenticated && user?._id !== comment.user?._id && (
                  <button
                    onClick={() => setReportModalComment(comment)}
                    className="flex items-center gap-1 hover:text-red-500 transition ml-auto"
                  >
                    <Flag className="w-3 h-3" /> Report
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyingToId === comment._id && (
                <form onSubmit={(e) => handlePostReply(e, comment._id)} className="mt-3 pl-4 border-l-2 border-editorial-accent space-y-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user?.name}...`}
                    className="w-full p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border dark:border-darkEditorial-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-editorial-accent"
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setReplyingToId(null)} className="px-2 py-1 text-editorial-muted">Cancel</button>
                    <button type="submit" disabled={!replyText.trim()} className="px-3 py-1 bg-editorial-accent text-white rounded font-bold">Reply</button>
                  </div>
                </form>
              )}

              {/* Render Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-4 space-y-3 border-l-2 border-editorial-border dark:border-darkEditorial-border">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="p-3 bg-editorial-bg dark:bg-darkEditorial-bg rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold">{reply.user?.name}</span>
                        <span className="text-[10px] text-editorial-muted">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {reportModalComment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-card dark:bg-darkEditorial-card border border-editorial-border dark:border-darkEditorial-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h4 className="text-base font-bold font-serif flex items-center gap-2 text-red-600">
              <Flag className="w-4 h-4" /> Report Comment
            </h4>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Thank you. Your report has been submitted to moderators.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none"
                  >
                    <option value="SPAM">Spam or Unsolicited Promotion</option>
                    <option value="HARASSMENT">Harassment or Offensive Language</option>
                    <option value="MISINFORMATION">Misinformation or Fake News</option>
                    <option value="OTHER">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Additional Details (Optional)</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={2}
                    placeholder="Provide additional details for editorial moderators..."
                    className="w-full p-2 bg-editorial-bg dark:bg-darkEditorial-bg border border-editorial-border rounded-lg text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs">
                  <button type="button" onClick={() => setReportModalComment(null)} className="px-3 py-1.5 text-editorial-muted">Cancel</button>
                  <button type="submit" disabled={reportMutation.isPending} className="px-4 py-1.5 bg-red-600 text-white rounded-lg font-semibold">Submit Report</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
