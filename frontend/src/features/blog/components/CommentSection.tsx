import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ChevronDown, ChevronUp, Reply, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useBlogComments, useCreateComment } from '../hooks/useBlog';
import { BlogComment, CreateCommentDto } from '../types';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: string;
}

// Comment component
interface CommentProps {
  comment: BlogComment;
  onReply?: (parentId: string) => void;
  depth?: number;
  maxDepth?: number;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  depth = 0,
  maxDepth = 3,
}) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(true);

  const canReply = depth < maxDepth;
  const marginLeft = Math.min(depth * 40, 120);

  const getUserName = () => {
    if (comment.authorName) return comment.authorName;
    if (user && comment.userId === user.id) {
      return user.name || user.email || 'You';
    }
    return 'Anonymous';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get user avatar - check comment data or current user
  const getUserAvatar = () => {
    // If comment has authorAvatar, use it
    if ((comment as any).authorAvatar) return (comment as any).authorAvatar;
    // If it's current user's comment, use their avatar
    if (user && comment.userId === user.id && user.avatar) return user.avatar;
    return null;
  };

  const avatarUrl = getUserAvatar();

  return (
    <div className="comment-thread">
      <div className="flex gap-3" style={{ marginLeft: `${marginLeft}px` }}>
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={getUserName()}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-primary-lime to-accent-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
              {getUserName().charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-text-primary text-sm">{getUserName()}</span>
            <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
          </div>
          <div className="text-text-secondary text-sm leading-relaxed mb-2">{comment.content}</div>
          {canReply && user && (
            <div className="flex items-center">
              <button
                onClick={() => onReply?.(comment.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-500 hover:text-primary-lime hover:bg-gray-100 rounded transition-colors"
              >
                <Reply size={14} />
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.length > 1 && (
            <div style={{ marginLeft: `${marginLeft + 16}px` }}>
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-2 text-sm font-medium text-primary-lime hover:text-primary-lime/80 transition-colors mb-3"
              >
                <div className={`w-3 h-3 border-l-2 border-b-2 border-current transition-transform ${showReplies ? 'rotate-45' : '-rotate-45'}`}></div>
                {showReplies ? 'Hide' : 'View'} {comment.replies.length} replies
              </button>
            </div>
          )}
          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Comment Form component
interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitText?: string;
  isReply?: boolean;
  loading?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'Add a comment...',
  submitText = 'Comment',
  isReply = false,
  loading = false,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 text-center bg-gray-50">
        <p className="text-text-secondary mb-4">Sign in to join the discussion</p>
        <Link to="/auth/login">
          <Button size="sm" className="bg-primary-lime hover:bg-primary-lime/90 text-white border-0">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-primary-lime to-accent-blue rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[80px] resize-none text-sm bg-white border border-gray-200 text-text-primary placeholder:text-gray-400 rounded-lg p-3 focus:border-primary-lime focus:ring-1 focus:ring-primary-lime/20 outline-none"
            disabled={isSubmitting || loading}
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">{content.length}/1000</div>
            <div className="flex items-center gap-2">
              {isReply && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting || loading}
                  className="text-gray-500 hover:text-text-primary hover:bg-gray-100"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || loading || !content.trim() || content.length > 1000}
                className="bg-primary-lime hover:bg-primary-lime/90 text-white border-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={14} className="mr-2" />
                    {submitText}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

// Main CommentSection component
const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState(true);

  const { data: commentsData, isLoading, error, refetch } = useBlogComments(postId, {
    page: currentPage,
    limit: 10,
  });
  const createCommentMutation = useCreateComment();

  const comments = commentsData?.data || [];
  const pagination = {
    total: commentsData?.total || 0,
    totalPages: commentsData?.totalPages || 1,
  };

  const handleCreateComment = async (content: string, parentId?: string) => {
    try {
      const commentData: CreateCommentDto = {
        content,
        parentCommentId: parentId,
      };

      await createCommentMutation.mutateAsync({ postId, data: commentData });
      setReplyingTo(null);

      // Refetch comments to show the new comment
      await refetch();

      if (parentId) {
        toast.success('Reply posted successfully!');
      } else {
        toast.success('Comment posted successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment');
    }
  };

  const handleReply = (parentId: string) => {
    if (!user) {
      toast.error('Please login to reply to comments.');
      return;
    }
    setReplyingTo(replyingTo === parentId ? null : parentId);
  };

  const loadMoreComments = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="text-center text-red-500">
          <MessageCircle size={24} className="mx-auto mb-2" />
          <p>Failed to load comments</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 border-gray-200 text-gray-700 hover:bg-gray-100">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle size={20} className="text-primary-lime" />
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Comments</h3>
            <p className="text-sm text-text-secondary">
              {pagination.total === 0 ? 'No comments yet' : pagination.total === 1 ? '1 comment' : `${pagination.total} comments`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedSection(!expandedSection)}
          className="flex items-center gap-2 text-gray-500 hover:text-text-primary hover:bg-gray-100"
        >
          {expandedSection ? (
            <>
              <ChevronUp size={16} />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Expand
            </>
          )}
        </Button>
      </div>

      {expandedSection && (
        <>
          {/* Comment Form */}
          <div className="mb-6">
            <CommentForm
              onSubmit={(content) => handleCreateComment(content)}
              placeholder="Add a comment..."
              loading={createCommentMutation.isPending}
            />
          </div>

          {/* Comments List */}
          {isLoading && comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-lime rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-text-primary mb-2">No comments yet</h4>
              <p className="text-text-secondary">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: BlogComment) => (
                <div key={comment.id}>
                  <Comment comment={comment} onReply={handleReply} />
                  {replyingTo === comment.id && (
                    <div className="mt-4 ml-12">
                      <CommentForm
                        onSubmit={(content) => handleCreateComment(content, comment.id)}
                        onCancel={() => setReplyingTo(null)}
                        placeholder="Reply to this comment..."
                        submitText="Reply"
                        isReply={true}
                        loading={createCommentMutation.isPending}
                      />
                    </div>
                  )}
                </div>
              ))}

              {pagination.totalPages > currentPage && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    onClick={loadMoreComments}
                    disabled={isLoading}
                    className="px-6 py-2 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-primary-lime"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-primary-lime rounded-full animate-spin mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-2" />
                        Show more comments ({pagination.total - comments.length})
                      </>
                    )}
                  </Button>
                </div>
              )}

              {comments.length > 0 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Showing {comments.length} of {pagination.total} comments
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;
