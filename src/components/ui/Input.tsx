import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  isValid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, type, isValid, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    // Force 24-hour format for time inputs
    const timeInputProps = type === 'time' ? {
      step: 60, // 1 minute steps
      lang: 'en-GB', // British English uses 24-hour format
    } : {};

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={cn(
              'w-full px-4 py-3 rounded-2xl border',
              'bg-white text-black placeholder-[#0A0A0A]/50',
              'outline-none transition-all duration-200',
              '[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-0',
              'disabled:bg-gray-100 disabled:text-gray-400',
            error
              ? '!border-[#e54d2e] focus:!border-[#e54d2e] focus:border-[1px]'
              : 'focus:border-[1px]',
              icon && 'pr-10',
              className
            )}
            style={{
              ...(!error && {
                borderColor: isValid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 230, 210, 0.2)',
              }),
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = isValid ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 230, 210, 0.4)';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = isValid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 230, 210, 0.2)';
              }
            }}
            ref={ref}
            {...timeInputProps}
            {...props}
          />
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {icon}
            </div>
          )}
        </div>
        {helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };