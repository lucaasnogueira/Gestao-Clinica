import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'success' | 'warning';
}

export function Badge({ children, className, variant = 'outline' }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    outline: 'border-border text-muted-foreground',
    destructive: 'bg-red-500/10 text-red-600 border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
