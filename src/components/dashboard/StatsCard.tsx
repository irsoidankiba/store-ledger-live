import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  return (
    <div className={cn('stat-card animate-fade-in', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="stat-label">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className={cn(
        'stat-value',
        trend === 'up' && 'text-success',
        trend === 'down' && 'text-destructive',
      )}>
        {formatValue(value)}
      </p>
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={cn(
              'flex items-center text-xs font-medium',
              trend === 'up' && 'text-success',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground',
            )}>
              {trend === 'up' && <TrendingUp className="h-3 w-3 mr-0.5" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 mr-0.5" />}
              {trend === 'neutral' && <Minus className="h-3 w-3 mr-0.5" />}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
