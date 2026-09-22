import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'secondary' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 
    'inline-flex items-center justify-center font-bold tracking-tight ' +
    'transition-all duration-200 ease-out select-none ' +
    'active:scale-[0.96] hover:scale-[1.01] ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:scale-100';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md hover:shadow-primary/20 border border-transparent',
    secondary: 'bg-neutral-bg text-primary-dark border border-primary-light hover:bg-primary-light/40 hover:text-primary',
    ghost: 'bg-transparent text-primary hover:bg-primary-light/50 border border-transparent font-semibold',
    outline: 'bg-transparent border border-primary-border/40 text-primary hover:bg-primary hover:text-white hover:border-transparent font-semibold',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md hover:shadow-red-500/10 border border-transparent',
    success: 'bg-success text-white hover:bg-success/90 shadow-sm hover:shadow-md hover:shadow-success/10 border border-transparent',
  };

  const sizes = {
    xs: 'py-1 px-2.5 text-[11px] rounded-lg gap-1',
    sm: 'py-1.5 px-3.5 text-[12px] rounded-xl gap-1.5',
    md: 'py-2 px-5 text-[13.5px] rounded-xl gap-2',
    lg: 'py-3 px-7 text-[15px] rounded-2xl gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

