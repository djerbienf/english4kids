import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  children?: ReactNode;
  className?: string;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-bold text-[14px] leading-relaxed transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white py-[10px] px-[32px] rounded-xl min-w-[160px] hover:bg-primary-dark',
    ghost: 'bg-transparent border-[0.5px] border-primary-border text-primary py-[7px] px-[20px] rounded-[10px] min-w-[120px] hover:bg-primary-light font-medium',
    outline: 'bg-transparent border-2 border-primary text-primary py-[10px] px-[32px] rounded-xl hover:bg-primary hover:text-white'
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
