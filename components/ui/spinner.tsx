"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SpinnerProps {
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  onComplete,
  size = 'medium',
  className
}) => {
  React.useEffect(() => {
    // Maintain the onComplete functionality from the original spinner
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  // Size classes
  const sizeClass = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClass)} />
    </div>
  );
};

export default Spinner;