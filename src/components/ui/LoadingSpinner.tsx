import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'dots' | 'pulse' | 'spinner';
}

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  variant = 'dots'
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
    xl: 'h-32 w-32'
  };

  const dotSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-6 w-6'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-[#F34A23] animate-bounce-dot',
                dotSizes[size]
              )}
              style={{
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className="relative">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'absolute inset-0 rounded-full bg-[#F34A23] animate-pulse-ring',
                sizes[size]
              )}
              style={{
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
          <div className={cn('rounded-full bg-[#F34A23]', sizes[size])} />
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <svg
        className={cn(
          'animate-spin text-[#F34A23]',
          sizes[size]
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

export function PageLoadingSpinner({ variant = 'pulse' }: { variant?: 'dots' | 'pulse' | 'spinner' }) {
  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center">
      <LoadingSpinner size="xl" variant={variant} />
    </div>
  );
}
