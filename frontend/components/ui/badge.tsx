import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export function Badge({ children, className, variant = 'outline' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full',
        variant === 'outline' && 'border',
        className,
      )}
    >
      {children}
    </span>
  );
}
