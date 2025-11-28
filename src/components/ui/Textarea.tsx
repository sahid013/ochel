import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 rounded-2xl border resize-y',
            'bg-white text-black placeholder-[#0A0A0A]/50',
            'outline-none transition-all duration-200',
            'autofill:!bg-white autofill:!text-black',
            'disabled:bg-gray-100 disabled:text-gray-400',
            error
              ? '!border-[#e54d2e] focus:!border-[#e54d2e] focus:!ring-1 focus:!ring-[#e54d2e]'
              : 'border-[rgba(239,230,210,0.2)] focus:!border-[#F34A23] focus:!ring-1 focus:!ring-[#F34A23]',
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };