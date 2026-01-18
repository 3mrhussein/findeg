import React from 'react';
import { Icon } from './Icon';

interface RatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: string;
}

export const Rating: React.FC<RatingProps> = ({ rating, maxRating = 5, className = '', size = 'w-5 h-5' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0; // This logic can be expanded if half stars are needed
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Icon key={`full-${i}`} name="star" className={`${size} text-secondary`} />
      ))}
      {/* Half star logic can be added here if needed */}
      {[...Array(emptyStars)].map((_, i) => (
        <Icon key={`empty-${i}`} name="star" className={`${size} text-muted`} />
      ))}
    </div>
  );
};