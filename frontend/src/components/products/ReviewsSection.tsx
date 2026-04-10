import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verified: boolean;
  date: Date;
  helpfulCount: number;
  notHelpfulCount: number;
  userVoted?: 'helpful' | 'not-helpful' | null;
  sellerResponse?: {
    message: string;
    date: Date;
    sellerName: string;
  };
  size?: 'too-small' | 'perfect' | 'too-large';
}

export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewsSectionProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
  onSubmitReview?: (review: NewReview) => Promise<void>;
  onVoteHelpful?: (reviewId: string, helpful: boolean) => Promise<void>;
  onReportReview?: (reviewId: string, reason: string) => Promise<void>;
  className?: string;
}

export interface NewReview {
  rating: number;
  title: string;
  comment: string;
  images: File[];
  size?: 'too-small' | 'perfect' | 'too-large';
}

type FilterType = 'all' | 'with-photos' | 'verified';
type SortType = 'recent' | 'helpful' | 'highest' | 'lowest';

// Star Rating Display Component
const StarRating: React.FC<{
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}> = ({ rating, size = 'md', showValue = false, interactive = false, onChange }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            'transition-all duration-200',
            star <= displayRating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200',
            interactive && 'cursor-pointer hover:scale-110'
          )}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
      {showValue && (
        <span className="text-sm font-semibold ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

// Rating Breakdown Bar Component
const RatingBar: React.FC<{
  stars: number;
  count: number;
  total: number;
  onClick?: () => void;
}> = ({ stars, count, total, onClick }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <button
      className="flex items-center gap-3 w-full group hover:bg-gray-50 p-2 rounded-lg transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-1 min-w-[60px]">
        <span className="text-sm font-medium">{stars}</span>
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      </div>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-yellow-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm text-text-secondary min-w-[60px] text-right">
        {count} ({percentage.toFixed(0)}%)
      </span>
    </button>
  );
};

// Review Card Component
const ReviewCard: React.FC<{
  review: Review;
  onVoteHelpful?: (helpful: boolean) => void;
  onReport?: () => void;
}> = ({ review, onVoteHelpful, onReport }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const maxLength = 300;
  const needsExpansion = review.comment.length > maxLength;

  const displayComment = expanded || !needsExpansion
    ? review.comment
    : `${review.comment.substring(0, maxLength)}...`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    if (review.images && review.images.length > 0) {
      setLightboxIndex((prev) => (prev + 1) % review.images!.length);
    }
  };

  const prevImage = () => {
    if (review.images && review.images.length > 0) {
      setLightboxIndex((prev) => (prev - 1 + review.images!.length) % review.images!.length);
    }
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Reviewer Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-lime to-green-400 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
              {review.userAvatar ? (
                <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
              ) : (
                review.userName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Name and Date */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-text-primary">{review.userName}</h4>
                {review.verified && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-700 border-green-200 text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-0.5">{formatDate(review.date)}</p>
            </div>
          </div>

          {/* Report Button */}
          <button
            onClick={onReport}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Report review"
          >
            <Flag className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {/* Star Rating */}
        <div className="mb-3">
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Review Title */}
        {review.title && (
          <h5 className="font-semibold text-text-primary mb-2">{review.title}</h5>
        )}

        {/* Size Badge */}
        {review.size && (
          <Badge variant="outline" className="mb-3">
            Fit: {review.size === 'too-small' ? 'Too Small' : review.size === 'perfect' ? 'Perfect' : 'Too Large'}
          </Badge>
        )}

        {/* Review Text */}
        <p className="text-text-secondary leading-relaxed mb-4">
          {displayComment}
          {needsExpansion && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary-lime font-semibold ml-2 hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {review.images.map((image, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity relative group"
              >
                <img
                  src={image}
                  alt={`Review ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Seller Response */}
        {review.sellerResponse && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">Seller Response</Badge>
              <span className="text-xs text-text-secondary">
                {formatDate(review.sellerResponse.date)}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{review.sellerResponse.message}</p>
          </div>
        )}

        {/* Helpful Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-text-secondary">Was this helpful?</span>
          <div className="flex items-center gap-2">
            <Button
              variant={review.userVoted === 'helpful' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVoteHelpful?.(true)}
              className={cn(
                'gap-1',
                review.userVoted === 'helpful' && 'bg-green-100 text-green-700 hover:bg-green-200'
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              Yes ({review.helpfulCount})
            </Button>
            <Button
              variant={review.userVoted === 'not-helpful' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVoteHelpful?.(false)}
              className={cn(
                'gap-1',
                review.userVoted === 'not-helpful' && 'bg-red-100 text-red-700 hover:bg-red-200'
              )}
            >
              <ThumbsDown className="w-4 h-4" />
              No ({review.notHelpfulCount})
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          <div className="relative aspect-square">
            {review.images && (
              <>
                <img
                  src={review.images[lightboxIndex]}
                  alt={`Review ${lightboxIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                {review.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 rounded-full text-sm font-semibold">
                      {lightboxIndex + 1} / {review.images.length}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Write Review Modal Component
const WriteReviewModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: NewReview) => Promise<void>;
}> = ({ open, onOpenChange, onSubmit }) => {
  const { t } = useTranslation();
  const [rating, setRating] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [size, setSize] = React.useState<'too-small' | 'perfect' | 'too-large' | undefined>();
  const [images, setImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 4 - images.length);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImages([...images, ...newFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0 || comment.length < 50) return;

    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        title,
        comment,
        images,
        size,
      });

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setSize(undefined);
      setImages([]);
      setImagePreviews([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const isValid = rating > 0 && comment.length >= 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this product to help others make informed decisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div>
            <Label className="mb-3 block">Your Rating *</Label>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="review-title" className="mb-2 block">
              Review Title (Optional)
            </Label>
            <Input
              id="review-title"
              placeholder={t('products.reviews.reviewTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Size/Fit */}
          <div>
            <Label className="mb-3 block">How does it fit? (Optional)</Label>
            <div className="flex gap-2">
              {(['too-small', 'perfect', 'too-large'] as const).map((sizeOption) => (
                <Button
                  key={sizeOption}
                  type="button"
                  variant={size === sizeOption ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSize(sizeOption === size ? undefined : sizeOption)}
                >
                  {sizeOption === 'too-small' ? 'Too Small' : sizeOption === 'perfect' ? 'Perfect' : 'Too Large'}
                </Button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review-comment" className="mb-2 block">
              Your Review * (Minimum 50 characters)
            </Label>
            <textarea
              id="review-comment"
              className="flex min-h-[120px] w-full rounded-button border border-input bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder={t('products.reviews.yourReviewPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-text-secondary mt-1">
              {comment.length} / 2000 characters {comment.length < 50 && `(${50 - comment.length} more needed)`}
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="mb-3 block">Add Photos (Optional, up to 4)</Label>
            <div className="grid grid-cols-4 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-lime hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500">Upload</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Skeleton Loading Component
const ReviewSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
);

// Main ReviewsSection Component
export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  averageRating,
  totalReviews,
  ratingBreakdown,
  onSubmitReview,
  onVoteHelpful,
  onReportReview,
  className,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [sort, setSort] = React.useState<SortType>('recent');
  const [writeReviewOpen, setWriteReviewOpen] = React.useState(false);
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
  const [reportReviewId, setReportReviewId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading] = React.useState(false);
  const reviewsPerPage = 5;

  // Filter reviews
  const filteredReviews = React.useMemo(() => {
    let filtered = [...reviews];

    if (filter === 'with-photos') {
      filtered = filtered.filter((r) => r.images && r.images.length > 0);
    } else if (filter === 'verified') {
      filtered = filtered.filter((r) => r.verified);
    }

    // Sort reviews
    switch (sort) {
      case 'helpful':
        filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
    }

    return filtered;
  }, [reviews, filter, sort]);

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const handleSubmitReview = async (review: NewReview) => {
    if (onSubmitReview) {
      await onSubmitReview(review);
    }
  };

  const handleVoteHelpful = async (reviewId: string, helpful: boolean) => {
    if (onVoteHelpful) {
      await onVoteHelpful(reviewId, helpful);
    }
  };

  const handleReport = (reviewId: string) => {
    setReportReviewId(reviewId);
    setReportDialogOpen(true);
  };

  const submitReport = async (reason: string) => {
    if (reportReviewId && onReportReview) {
      await onReportReview(reportReviewId, reason);
      setReportDialogOpen(false);
      setReportReviewId(null);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-text-primary">Rating & Reviews</h2>
          <Button onClick={() => setWriteReviewOpen(true)} className="gap-2">
            <Star className="w-4 h-4" />
            Write a Review
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Rating Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 sticky top-4">
              {/* Average Rating */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-text-primary mb-2">
                  {averageRating.toFixed(1)}
                  <span className="text-3xl text-text-secondary"> / 5</span>
                </div>
                <StarRating rating={averageRating} size="md" />
                <p className="text-sm text-text-secondary mt-2">
                  ({totalReviews.toLocaleString()} {totalReviews === 1 ? 'Review' : 'Reviews'})
                </p>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <RatingBar
                    key={stars}
                    stars={stars}
                    count={ratingBreakdown[stars as keyof RatingBreakdown]}
                    total={totalReviews}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Individual Reviews */}
          <div className="lg:col-span-2">
            {/* Filters and Sort */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All Reviews
                  </Button>
                  <Button
                    variant={filter === 'with-photos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('with-photos')}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    With Photos
                  </Button>
                  <Button
                    variant={filter === 'verified' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('verified')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </Button>
                </div>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="px-4 py-2 border border-gray-300 rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-primary-lime"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {loading ? (
                <>
                  <ReviewSkeleton />
                  <ReviewSkeleton />
                  <ReviewSkeleton />
                </>
              ) : paginatedReviews.length > 0 ? (
                <AnimatePresence mode="wait">
                  {paginatedReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onVoteHelpful={(helpful) => handleVoteHelpful(review.id, helpful)}
                      onReport={() => handleReport(review.id)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    No reviews found
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Be the first to review this product!
                  </p>
                  <Button onClick={() => setWriteReviewOpen(true)}>Write a Review</Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        open={writeReviewOpen}
        onOpenChange={setWriteReviewOpen}
        onSubmit={handleSubmitReview}
      />

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>
              Please let us know why you're reporting this review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {[
              'Spam or misleading',
              'Offensive language',
              'Not about the product',
              'Fake review',
              'Other',
            ].map((reason) => (
              <button
                key={reason}
                onClick={() => submitReport(reason)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {reason}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsSection;
