'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Toast = React.forwardRef(({ className, variant = 'default', children, onClose, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center justify-between w-full max-w-md gap-3 p-4 rounded-lg shadow-lg transition-all',
        variant === 'default' ? 'bg-white text-gray-900' : '',
        variant === 'destructive' ? 'bg-red-600 text-white' : '',
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
Toast.displayName = 'Toast';

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
ToastDescription.displayName = 'ToastDescription';
