'use client'

import React, { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressProductImage, getCompressionMessage, validateImageFile } from '@/lib/imageCompression';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  displayOrder: number;
  isPrimary: boolean;
}

interface MultiImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  error?: string;
}

export default function MultiImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  error
}: MultiImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!acceptedFormats.includes(file.type)) {
      toast.error(`Invalid file type: ${file.type}. Please use JPEG, PNG, or WebP.`);
      return false;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
      return;
    }

    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length === 0) return;

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const newImages: ImageFile[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const validation = validateImageFile(file);

        if (!validation.valid) {
          toast.error(validation.error || 'Invalid image file');
          continue;
        }

        const result = await compressProductImage(file);

        if (result.compressionPercentage > 5) {
          toast.success(getCompressionMessage(result));
        }

        newImages.push({
          id: `${Date.now()}-${i}`,
          file: result.compressedFile,
          preview: URL.createObjectURL(result.compressedFile),
          displayOrder: images.length + i + 1,
          isPrimary: images.length === 0 && i === 0
        });

        setCompressionProgress(((i + 1) / validFiles.length) * 100);
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      toast.error('Failed to process images. Please try again.');
      console.error('Image compression error:', error);
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (!imageToRemove) return;

    URL.revokeObjectURL(imageToRemove.preview);

    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({
        ...img,
        displayOrder: index + 1,
        isPrimary: imageToRemove.isPrimary && index === 0 ? true : img.isPrimary
      }));

    onImagesChange(updatedImages);
  };

  const setPrimaryImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === id
    }));
    onImagesChange(updatedImages);
  };

  const handleImageDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedImageId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDrop = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();

    if (!draggedImageId || draggedImageId === targetId) {
      setDraggedImageId(null);
      return;
    }

    const draggedIndex = images.findIndex(img => img.id === draggedImageId);
    const targetIndex = images.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedImageId(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      displayOrder: index + 1
    }));

    onImagesChange(reorderedImages);
    setDraggedImageId(null);
  };

  return (
    <div className="space-y-4">
      {isCompressing && (
        <div className="bg-themed-secondary rounded-lg p-4 border-themed">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#F4A024] animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-themed mb-1">Compressing images...</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#F4A024] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${compressionProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-themed-muted">{Math.round(compressionProgress)}%</span>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-[#F4A024] bg-[#F4A024]/10'
              : error
              ? 'border-red-500 dark:border-red-500 light:border-red-500'
              : 'dark:border-gray-700 light:border-gray-300'
          }`}
        >
          <Upload className="w-12 h-12 text-themed-muted mx-auto mb-4" />
          <p className="text-themed mb-4">
            Drag and drop product images here, or click to select
          </p>
          <p className="text-sm text-themed-muted mb-4">
            Accepted formats: JPEG, PNG, WebP. Maximum size: {maxSizeMB}MB per image.
            <br />
            Upload up to {maxImages} images. Images will be automatically optimized.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            multiple
            disabled={isCompressing}
            className="hidden"
            id="multi-image-input"
          />
          <label
            htmlFor="multi-image-input"
            className={`bg-[#F4A024] text-gray-900 px-6 py-3 rounded-lg hover:bg-[#F4A024]/90 transition-colors inline-block font-medium ${
              isCompressing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isCompressing ? 'Processing...' : 'Select Images'}
          </label>
          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleImageDragStart(e, image.id)}
                onDragOver={handleImageDragOver}
                onDrop={(e) => handleImageDrop(e, image.id)}
                className={`relative group rounded-lg overflow-hidden cursor-move border-2 transition-all ${
                  image.isPrimary
                    ? 'border-[#F4A024] shadow-lg shadow-[#F4A024]/20'
                    : 'dark:border-gray-700 light:border-gray-300'
                } ${draggedImageId === image.id ? 'opacity-50' : ''}`}
              >
                <div className="aspect-square">
                  <img
                    src={image.preview}
                    alt={`Product ${image.displayOrder}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(image.id)}
                    className={`p-2 rounded-full transition-colors ${
                      image.isPrimary
                        ? 'bg-[#F4A024] text-gray-900'
                        : 'bg-gray-700 text-white hover:bg-[#F4A024] hover:text-gray-900'
                    }`}
                    title={image.isPrimary ? 'Primary image' : 'Set as primary'}
                  >
                    <Star className="w-4 h-4" fill={image.isPrimary ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-[#F4A024] text-gray-900 text-xs font-bold px-2 py-1 rounded">
                    PRIMARY
                  </div>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  #{image.displayOrder}
                </div>
              </div>
            ))}
          </div>

          {images.length < maxImages && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-[#F4A024] bg-[#F4A024]/10'
                  : 'dark:border-gray-700 light:border-gray-300'
              } ${isCompressing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ImageIcon className="w-8 h-8 text-themed-muted mx-auto mb-2" />
              <p className="text-sm text-themed mb-2">
                Add more images ({images.length}/{maxImages})
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                multiple
                disabled={isCompressing}
                className="hidden"
                id="multi-image-input-additional"
              />
              <label
                htmlFor="multi-image-input-additional"
                className={`text-[#F4A024] hover:text-[#F4A024]/80 text-sm font-medium ${
                  isCompressing ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isCompressing ? 'Processing images...' : 'Click or drag to add more'}
              </label>
            </div>
          )}

          <div className="bg-themed-secondary rounded-lg p-4">
            <h4 className="text-sm font-medium text-themed mb-2">Tips:</h4>
            <ul className="text-xs text-themed-secondary space-y-1">
              <li>• Images are automatically optimized for faster loading</li>
              <li>• Drag images to reorder them</li>
              <li>• Click the star icon to set an image as primary</li>
              <li>• The primary image will be the main product photo</li>
              <li>• You can upload up to {maxImages} images per product</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
