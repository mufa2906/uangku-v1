// src/components/ui/floating-button.tsx
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface FloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FloatingButton.displayName = 'FloatingButton';

export { FloatingButton };