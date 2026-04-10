import React from 'react';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface AdminStatusBadgeProps {
  status: string;
  type?: StatusType;
  size?: 'sm' | 'md';
}

const statusTypeMap: Record<string, StatusType> = {
  // Shop statuses
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',

  // User statuses
  active: 'success',
  inactive: 'default',

  // Order statuses
  completed: 'success',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
  refunded: 'warning',

  // Generic
  enabled: 'success',
  disabled: 'default',
  verified: 'success',
  unverified: 'warning',
};

const typeStyles: Record<StatusType, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  status,
  type,
  size = 'md',
}) => {
  const resolvedType = type || statusTypeMap[status.toLowerCase()] || 'default';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium capitalize ${typeStyles[resolvedType]} ${sizeClasses}`}
    >
      {status}
    </span>
  );
};

export default AdminStatusBadge;
