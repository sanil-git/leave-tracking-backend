import React, { useState, useEffect, useMemo } from 'react';

// Enhanced loading skeleton with advanced animations and shimmer effects
const EnhancedLoadingSkeleton = React.memo(({ 
  className = '', 
  width, 
  height, 
  variant = 'shimmer', // 'shimmer', 'pulse', 'glow', 'progressive'
  delay = 0,
  duration = 1.5,
  borderRadius = '0.375rem',
  lines = 1,
  linesHeight = '1rem',
  linesSpacing = '0.5rem',
  animate = true,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(!animate);

  // Show skeleton after delay for staggered loading
  useEffect(() => {
    if (animate && delay > 0) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animate, delay]);

  // Memoized skeleton styles
  const baseClasses = useMemo(() => {
    const variants = {
      shimmer: 'skeleton-shimmer',
      pulse: 'skeleton-pulse', 
      glow: 'skeleton-glow',
      progressive: 'skeleton-progressive'
    };
    
    return `${variants[variant]} gpu-accelerated non-blocking-animation ${className}`;
  }, [variant, className]);

  const skeletonStyle = useMemo(() => ({
    width,
    height,
    borderRadius,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}ms`,
    ...props.style
  }), [width, height, borderRadius, duration, delay, props.style]);

  // Multi-line skeleton
  if (lines > 1) {
    return (
      <div className="space-y-2" style={{ gap: linesSpacing }}>
        {[...Array(lines)].map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} animate-fadeInUp`}
            style={{
              ...skeletonStyle,
              height: linesHeight,
              width: index === lines - 1 ? '75%' : '100%', // Last line shorter
              animationDelay: `${delay + index * 100}ms`
            }}
          />
        ))}
      </div>
    );
  }

  // Single skeleton
  return isVisible ? (
    <div 
      className={`${baseClasses} animate-fadeInUp`}
      style={skeletonStyle}
      {...props}
    />
  ) : (
    <div style={{ width, height, ...props.style }} />
  );
});

EnhancedLoadingSkeleton.displayName = 'EnhancedLoadingSkeleton';

// Specialized skeleton components for common patterns

// Card skeleton with header, content, and footer
export const CardSkeleton = React.memo(({ 
  hasHeader = true, 
  hasFooter = true, 
  contentLines = 3,
  delay = 0,
  className = ''
}) => (
  <div className={`bg-white rounded-lg border p-6 space-y-4 ${className}`}>
    {hasHeader && (
      <div className="flex items-center space-x-4">
        <EnhancedLoadingSkeleton 
          width="3rem" 
          height="3rem" 
          borderRadius="50%" 
          delay={delay}
          variant="glow"
        />
        <div className="flex-1 space-y-2">
          <EnhancedLoadingSkeleton 
            height="1rem" 
            width="60%" 
            delay={delay + 100}
            variant="shimmer"
          />
          <EnhancedLoadingSkeleton 
            height="0.75rem" 
            width="40%" 
            delay={delay + 200}
            variant="shimmer"
          />
        </div>
      </div>
    )}
    
    <div className="space-y-3">
      {[...Array(contentLines)].map((_, index) => (
        <EnhancedLoadingSkeleton
          key={index}
          height="0.75rem"
          width={`${100 - (index * 10)}%`}
          delay={delay + 300 + (index * 100)}
          variant="progressive"
        />
      ))}
    </div>
    
    {hasFooter && (
      <div className="flex items-center justify-between pt-4">
        <EnhancedLoadingSkeleton 
          width="5rem" 
          height="2rem" 
          delay={delay + 600}
          variant="pulse"
        />
        <EnhancedLoadingSkeleton 
          width="3rem" 
          height="2rem" 
          delay={delay + 700}
          variant="pulse"
        />
      </div>
    )}
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';

// List item skeleton
export const ListItemSkeleton = React.memo(({ 
  hasAvatar = true, 
  hasActions = true,
  delay = 0,
  className = ''
}) => (
  <div className={`flex items-center space-x-4 p-4 ${className}`}>
    {hasAvatar && (
      <EnhancedLoadingSkeleton 
        width="2.5rem" 
        height="2.5rem" 
        borderRadius="50%" 
        delay={delay}
        variant="glow"
      />
    )}
    
    <div className="flex-1 space-y-2">
      <EnhancedLoadingSkeleton 
        height="1rem" 
        width="40%" 
        delay={delay + 50}
        variant="shimmer"
      />
      <EnhancedLoadingSkeleton 
        height="0.75rem" 
        width="60%" 
        delay={delay + 100}
        variant="shimmer"
      />
    </div>
    
    {hasActions && (
      <div className="flex space-x-2">
        <EnhancedLoadingSkeleton 
          width="2rem" 
          height="2rem" 
          delay={delay + 150}
          variant="pulse"
        />
        <EnhancedLoadingSkeleton 
          width="2rem" 
          height="2rem" 
          delay={delay + 200}
          variant="pulse"
        />
      </div>
    )}
  </div>
));

ListItemSkeleton.displayName = 'ListItemSkeleton';

// Metric card skeleton
export const MetricCardSkeleton = React.memo(({ 
  delay = 0,
  className = ''
}) => (
  <div className={`bg-white rounded-lg p-6 border ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <EnhancedLoadingSkeleton 
        width="2rem" 
        height="2rem" 
        borderRadius="0.5rem"
        delay={delay}
        variant="glow"
      />
      <EnhancedLoadingSkeleton 
        width="3rem" 
        height="1rem" 
        delay={delay + 100}
        variant="pulse"
      />
    </div>
    
    <EnhancedLoadingSkeleton 
      height="2rem" 
      width="4rem" 
      delay={delay + 200}
      variant="progressive"
    />
    
    <EnhancedLoadingSkeleton 
      height="0.75rem" 
      width="6rem" 
      delay={delay + 300}
      variant="shimmer"
      className="mt-2"
    />
  </div>
));

MetricCardSkeleton.displayName = 'MetricCardSkeleton';

// Chart skeleton
export const ChartSkeleton = React.memo(({ 
  height = '200px',
  delay = 0,
  className = ''
}) => (
  <div className={`bg-white rounded-lg p-6 border ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <EnhancedLoadingSkeleton 
        height="1.5rem" 
        width="8rem" 
        delay={delay}
        variant="shimmer"
      />
      <EnhancedLoadingSkeleton 
        height="2rem" 
        width="6rem" 
        delay={delay + 100}
        variant="pulse"
      />
    </div>
    
    <div className="relative" style={{ height }}>
      {/* Chart bars simulation */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-2">
        {[...Array(8)].map((_, index) => (
          <EnhancedLoadingSkeleton
            key={index}
            width="100%"
            height={`${Math.random() * 80 + 20}%`}
            delay={delay + 200 + (index * 50)}
            variant="progressive"
            className="flex-1"
          />
        ))}
      </div>
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

// Table skeleton
export const TableSkeleton = React.memo(({ 
  rows = 5,
  columns = 4,
  hasHeader = true,
  delay = 0,
  className = ''
}) => (
  <div className={`bg-white rounded-lg border overflow-hidden ${className}`}>
    {hasHeader && (
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, index) => (
            <EnhancedLoadingSkeleton
              key={index}
              height="1rem"
              width="80%"
              delay={delay + (index * 50)}
              variant="pulse"
            />
          ))}
        </div>
      </div>
    )}
    
    <div className="divide-y">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIndex) => (
              <EnhancedLoadingSkeleton
                key={colIndex}
                height="0.75rem"
                width={`${Math.random() * 40 + 60}%`}
                delay={delay + 100 + (rowIndex * 100) + (colIndex * 25)}
                variant="shimmer"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

TableSkeleton.displayName = 'TableSkeleton';

// Progressive loading wrapper
export const ProgressiveLoader = React.memo(({ 
  isLoading, 
  skeleton, 
  children, 
  fadeTransition = true,
  className = ''
}) => {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowContent(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className={`${fadeTransition ? 'animate-fadeInUp' : ''} ${className}`}>
        {skeleton}
      </div>
    );
  }

  return (
    <div className={`${showContent && fadeTransition ? 'animate-fadeInUp' : ''} ${className}`}>
      {children}
    </div>
  );
});

ProgressiveLoader.displayName = 'ProgressiveLoader';

export default EnhancedLoadingSkeleton;
