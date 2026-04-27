import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
  
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-[2px] transition-all active:scale-[0.96]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:-translate-y-[1px] transition-all active:scale-[0.98]',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-[1px] transition-all active:scale-[0.98]',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900 hover:-translate-y-[1px] hover:border-gray-400 transition-all active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900 transition-all active:scale-[0.98]',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
