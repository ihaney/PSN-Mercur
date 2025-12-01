'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  generateSrcSet,
  generateBlurDataUrl,
  getOptimizedImageUrl,
  getImageLoadPriority
} from '@/lib/imageOptimization';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  className?: string;
  blurPlaceholder?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  index?: number;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  blurPlaceholder = true,
  width,
  height,
  aspectRatio = '1/1',
  sizes,
  priority = false,
  index = 0,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const blurDataUrl = blurPlaceholder ? generateBlurDataUrl() : undefined;

  // Handle empty or invalid src immediately
  if (!src || src.trim() === '') {
    setHasError(true);
  }

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const loadPriority = getImageLoadPriority(index, 100, priority ? 1 : 6);
  const optimizedSrc = getOptimizedImageUrl(src);
  const srcSet = sizes ? generateSrcSet(src) : undefined;

  if (hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center dark:bg-gray-700/30 bg-gray-100`}
        style={{ width, height, aspectRatio }}
      >
        <div className="text-center p-2">
          <svg className="w-12 h-12 dark:text-gray-500 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={isInView ? optimizedSrc : blurDataUrl}
      srcSet={isInView && srcSet ? srcSet : undefined}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${!isLoaded && blurPlaceholder ? 'blur-sm scale-105' : ''} transition-all duration-300`}
      style={{ aspectRatio }}
      loading={loadPriority.loading}
      fetchpriority={loadPriority.fetchpriority}
      decoding={loadPriority.decoding}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}
