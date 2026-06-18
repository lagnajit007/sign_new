'use client';

import Link from 'next/link';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, type LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  href?: string;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#7D54FF] text-white rounded-full ' +
    'shadow-[0_6px_0_#6840E0] ' +
    'hover:scale-[1.03] active:translate-y-1 active:shadow-none ' +
    'hover:bg-[#6840E0]',
  secondary:
    'bg-white text-[#7D54FF] border-2 border-[#7D54FF] rounded-full ' +
    'hover:bg-[#FAF7FF] active:scale-[0.97]',
  outline:
    'border border-[#ECE8FF] text-[#7E7A93] rounded-lg ' +
    'hover:border-[#7D54FF] hover:text-[#7D54FF] hover:bg-[#FAF7FF] ' +
    'active:scale-[0.97]',
  ghost:
    'text-[#7E7A93] hover:text-[#7D54FF] hover:bg-[#FAF7FF] rounded-lg ' +
    'active:scale-[0.97]',
  danger:
    'text-[#FF7A59] border border-[#FFE2E2] rounded-lg ' +
    'hover:bg-red-50 active:scale-[0.97]',
  icon:
    'text-[#7E7A93] hover:text-[#7D54FF] hover:bg-[#FAF7FF] rounded-lg ' +
    'active:scale-[0.95] flex items-center justify-center',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-8 py-3 text-base gap-2.5',
};

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon: Icon,
      iconPosition = 'left',
      href,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = variant === 'icon' || (!children && Icon);
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D54FF] focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:hover:scale-100',
      variantStyles[variant],
      isIconOnly ? iconOnlySizes[size] : sizeStyles[size],
      loading && 'cursor-wait',
      className,
    );

    const content = (
      <>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : Icon && iconPosition === 'left' ? (
          <Icon className={cn('w-4 h-4', children ? '' : '')} />
        ) : null}
        {children}
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className="w-4 h-4" />
        )}
      </>
    );

    if (href && !disabled) {
      return (
        <Link href={href} className={baseStyles}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={baseStyles}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
