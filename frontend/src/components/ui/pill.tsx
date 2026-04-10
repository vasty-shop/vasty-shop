import React from 'react';
import { cn } from '@/lib/utils';

interface PillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export const Pill: React.FC<PillProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  removable = false,
  onRemove,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium transition-all',
        selected
          ? 'bg-accent-blue text-white'
          : 'bg-white text-text-primary border border-gray-200 hover:border-accent-blue'
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{label}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-500"
        >
          ×
        </button>
      )}
    </button>
  );
};
