import React, { useState, useEffect, useRef } from 'react';

/**
 * OptimizedImage - Responsive image component with lazy loading
 * Replaces next/image functionality for Create React App
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageSrc, setImageSrc] = useState(priority ? src : null);
  const imgRef = useRef();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
    setIsLoaded(true); // Still show the component even if image fails
  };

  // Generate responsive srcSet for common breakpoints
  const generateSrcSet = (originalSrc) => {
    if (!originalSrc) return '';
    
    const baseSrc = originalSrc.split('.').slice(0, -1).join('.');
    const extension = originalSrc.split('.').pop();
    
    return [
      `${baseSrc}-320w.${extension} 320w`,
      `${baseSrc}-640w.${extension} 640w`,
      `${baseSrc}-1024w.${extension} 1024w`,
      `${originalSrc} ${width || 1200}w`
    ].join(', ');
  };

  const generateSizes = () => {
    if (width) {
      return `(max-width: 640px) 320px, (max-width: 1024px) 640px, ${width}px`;
    }
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
    >
      {/* Placeholder/Blur effect */}
      {!isLoaded && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      {/* Skeleton loader */}
      {!isLoaded && placeholder === 'skeleton' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Actual image */}
      {(isInView || priority) && imageSrc && (
        <img
          src={imageSrc}
          srcSet={generateSrcSet(imageSrc)}
          sizes={generateSizes()}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } object-cover w-full h-full`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
