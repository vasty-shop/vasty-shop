import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  totalRatings?: number;
  userRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalRatings = 0,
  userRating,
  onRate,
  readonly = false,
  size = 'md',
  showCount = true,
  className,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeMap = { sm: 14, md: 18, lg: 24 };
  const starSize = sizeMap[size];

  const handleClick = (value: number) => {
    if (!readonly && onRate) {
      onRate(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || userRating || rating;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn('flex items-center gap-0.5', !readonly && 'cursor-pointer')}
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = value <= Math.floor(displayRating);
          const partial = value === Math.ceil(displayRating) && displayRating % 1 !== 0;
          const fillPercent = partial ? (displayRating % 1) * 100 : 0;

          return (
            <button
              key={value}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              className={cn(
                'relative transition-transform',
                !readonly && 'hover:scale-110',
                readonly && 'cursor-default'
              )}
            >
              <Star size={starSize} className="text-gray-300" strokeWidth={1.5} />
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${fillPercent}%` }}
                >
                  <Star size={starSize} className="text-amber-400 fill-amber-400" strokeWidth={1.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showCount && (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-semibold text-text-primary">{rating.toFixed(1)}</span>
          {totalRatings > 0 && (
            <span className="text-text-secondary">
              ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
      )}

      {userRating && userRating > 0 && (
        <span className="text-xs text-primary-lime font-medium ml-2">
          Your rating: {userRating}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
