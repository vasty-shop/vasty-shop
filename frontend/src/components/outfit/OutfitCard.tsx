import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Outfit } from '@/types';
import { cn } from '@/lib/utils';

interface OutfitCardProps {
  outfit: Outfit;
  className?: string;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, className }) => {
  return (
    <Link
      to={`/outfit/${outfit.id}`}
      className={cn('group block rounded-card overflow-hidden bg-white shadow-card hover:shadow-lg transition-shadow', className)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={outfit.image}
          alt={outfit.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption text-text-secondary font-semibold">{outfit.category}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-weather-sun text-weather-sun" />
            <span className="text-caption font-medium">{outfit.rating}</span>
          </div>
        </div>
        <h3 className="text-body font-semibold text-text-primary line-clamp-1">{outfit.name}</h3>
      </div>
    </Link>
  );
};
