import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, className = '' }) => {
  const normalizedRating = Math.min(Math.max(rating, 0), 5);
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating - fullStars >= 0.5;

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`${normalizedRating.toFixed(1)} 顆星`}>
      {Array.from({ length: 5 }).map((_, index) => {
        if (index < fullStars) {
          return <Star key={index} size={size} className="text-gold" fill="currentColor" />;
        }
        if (index === fullStars && hasHalfStar) {
          return <StarHalf key={index} size={size} className="text-gold" fill="currentColor" />;
        }
        return <Star key={index} size={size} className="text-gold/30" />;
      })}
    </div>
  );
};
