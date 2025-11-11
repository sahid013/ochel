import { cn } from '@/lib/utils';
import type { ReservationStatus } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 !border-[#F6F1F0]',
    secondary: 'bg-blue-100 text-blue-700 !border-blue-200',
    destructive: 'bg-red-100 text-red-700 !border-red-200',
    success: 'bg-[#E8FFEB] text-[#05C81E] !border-[#E8FFEB]',
    warning: 'bg-orange-100 text-orange-700 !border-orange-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-2xl border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: ReservationStatus | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusText = status || 'confirmed';

  const getVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant(statusText)} className={className}>
      {translateStatus(statusText)}
    </Badge>
  );
}