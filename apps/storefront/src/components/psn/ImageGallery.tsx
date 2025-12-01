'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LazyImage from './LazyImage';
import ProductImagePlaceholder from './ProductImagePlaceholder';
import { HERO_IMAGE_SIZES, THUMBNAIL_SIZES } from '@/lib/helpers/imageOptimization';

export interface GalleryImage {
  id: string;
  url: string;
  displayOrder: number;
  isPrimary: boolean;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageError, setImageError] = useState<Set<number>>(new Set());
  const pathname = usePathname();

  // Close zoom modal when route changes
  useEffect(() => {
    setIsZoomed(false);
  }, [pathname]);

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.displayOrder - b.displayOrder;
  });

  const currentImage = sortedImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    setImageError(new Set());
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    setImageError(new Set());
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setImageError(new Set());
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => new Set(prev).add(index));
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setIsZoomed(false);
  };

  if (sortedImages.length === 0) {
    return (
      <div className="w-full aspect-square rounded-lg overflow-hidden">
        <ProductImagePlaceholder className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Image Display */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden dark:bg-gray-800/50 light:bg-gray-100 group">
        {!imageError.has(selectedIndex) ? (
          <>
            <LazyImage
              src={currentImage.url || '/placeholder.png'}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              width={800}
              height={800}
              aspectRatio="1/1"
              sizes={HERO_IMAGE_SIZES}
              priority={selectedIndex === 0}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={toggleZoom}
              onError={() => handleImageError(selectedIndex)}
            />

            {currentImage.isPrimary && (
              <div className="absolute top-4 left-4 bg-[#F4A024] text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                PRIMARY
              </div>
            )}

            <button
              onClick={toggleZoom}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              title="Zoom image"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                  {selectedIndex + 1} / {sortedImages.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="dark:text-gray-400 light:text-gray-600 text-sm">Image failed to load</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-[#F4A024] shadow-lg shadow-[#F4A024]/20'
                  : 'dark:border-gray-700 light:border-gray-300 hover:border-[#F4A024]/50'
              }`}
            >
              {!imageError.has(index) ? (
                <LazyImage
                  src={image.url || '/placeholder.png'}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  aspectRatio="1/1"
                  sizes={THUMBNAIL_SIZES}
                  priority={index < 4}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="w-full h-full dark:bg-gray-800 light:bg-gray-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {image.isPrimary && (
                <div className="absolute inset-0 bg-[#F4A024]/20 flex items-center justify-center">
                  <div className="bg-[#F4A024] text-gray-900 text-xs font-bold px-2 py-0.5 rounded">
                    PRIMARY
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && !imageError.has(selectedIndex) && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={toggleZoom}
        >
          <button
            onClick={toggleZoom}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
            title="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>

          {sortedImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                title="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                title="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white">
                {selectedIndex + 1} / {sortedImages.length}
              </div>
            </>
          )}

          <img
            src={currentImage.url}
            alt={`${productName} - Zoomed ${selectedIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
