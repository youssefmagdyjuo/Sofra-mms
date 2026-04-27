import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto sm:overflow-x-visible rounded-[1.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 bg-white custom-scrollbar">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('bg-slate-50/80 backdrop-blur-sm border-b border-slate-100', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, isAnimated = true, index = 0, ...props }) {
  const Component = isAnimated ? motion.tr : 'tr';
  const animationProps = isAnimated ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05, duration: 0.3 }
  } : {};

  return (
    <Component
      {...animationProps}
      className={cn(
        'border-b border-slate-50 transition-all duration-300 hover:bg-blue-50/40 group/row relative',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-14 px-6 text-start rtl:text-right align-middle font-bold text-slate-500 uppercase tracking-wider text-[11px] [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn(
        'p-6 align-middle transition-all duration-300 group-hover/row:translate-x-1 rtl:group-hover/row:-translate-x-1 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}
