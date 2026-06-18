'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

type KpiColor = 'purple' | 'green' | 'yellow' | 'orange' | 'blue' | 'red';

interface KpiCardProps {
  icon: LucideIcon | string;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: KpiColor;
  loading?: boolean;
  className?: string;
  trend?: { direction: 'up' | 'down'; value: string };
}

const colorMap: Record<KpiColor, { bg: string; icon: string; text: string }> = {
  purple: { bg: 'bg-[#EAE4FF]', icon: 'text-[#7D54FF]', text: 'text-[#7D54FF]' },
  green:  { bg: 'bg-[#D4F8DC]', icon: 'text-[#22C55E]', text: 'text-[#22C55E]' },
  yellow: { bg: 'bg-[#FFF8DA]', icon: 'text-[#FFC83D]', text: 'text-[#FFC83D]' },
  orange: { bg: 'bg-[#FFE9E2]', icon: 'text-[#FF7A59]', text: 'text-[#FF7A59]' },
  blue:   { bg: 'bg-[#E0F4FF]', icon: 'text-[#5EC8FF]', text: 'text-[#5EC8FF]' },
  red:    { bg: 'bg-[#FFE2E2]', icon: 'text-[#EF4444]', text: 'text-[#EF4444]' },
};

function IconRender({ icon, className }: { icon: LucideIcon | string; className: string }) {
  if (typeof icon === 'string') {
    return <span className={cn('text-xl', className)}>{icon}</span>;
  }
  const IconComponent = icon;
  return <IconComponent className={cn('w-6 h-6', className)} />;
}

export default function KpiCard({
  icon,
  label,
  value,
  subtitle,
  color = 'purple',
  loading = false,
  className,
  trend,
}: KpiCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white border border-[#ECE8FF] rounded-2xl p-6',
        'hover:-translate-y-1 transition-all duration-200',
        'shadow-[0_8px_24px_rgba(125,84,255,0.08)]',
        'flex flex-col',
        className,
      )}
    >
      {/* Icon at top */}
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', colors.bg)}>
        <IconRender icon={icon} className={colors.icon} />
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-[#7E7A93] truncate mb-1">{label}</div>

      {/* Primary metric */}
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      ) : (
        <div className="text-3xl font-bold text-[#2D1B69] truncate">{value}</div>
      )}

      {/* Optional subtitle + trend */}
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-1.5">
          {subtitle && <span className="text-xs text-[#7E7A93]">{subtitle}</span>}
          {trend && (
            <span className={cn(
              'text-xs font-medium flex items-center gap-0.5',
              trend.direction === 'up' ? 'text-[#22C55E]' : 'text-[#FF7A59]',
            )}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
