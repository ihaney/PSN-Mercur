'use client'

import React, { useState, useRef } from 'react';
import { Upload, X, File, FileText, Image as ImageIcon, Archive, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface MessageAttachmentUploaderProps {
  conversationId: string;
  onAttachmentAdded: (attachment: AttachmentInfo) => void;
  maxFileSize?: number;
  maxFiles?: number;
}

interface AttachmentInfo {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  preview_url?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-zip-compressed'
];

export default function MessageAttachmentUploader({
  conversationId,
  onAttachmentAdded,
  maxFileSize = MAX_FILE_SIZE,
  maxFiles = 5
}: MessageAttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType === 'application/pdf') return FileText;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not allowed`;
    }
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }
    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files at once`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'), { duration: 5000 });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateStoragePath = async (fileName: string): Promise<string> => {
    const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${session.user.id}/${conversationId}/${timestamp}_${sanitizedName}`;
  };

  const createPreviewUrl = async (file: File): Promise<string | undefined> => {
    if (!file.type.startsWith('image/')) return undefined;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) {
        toast.error('You must be logged in to upload files');
        return;
      }

      const totalFiles = selectedFiles.length;
      let uploadedCount = 0;

      for (const file of selectedFiles) {
        const storagePath = await generateStoragePath(file.name);

        const { error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const previewUrl = await createPreviewUrl(file);

        const { data: attachment, error: dbError } = await supabase
          .from('message_attachments')
          .insert({
            message_id: null,
            file_name: file.name,
            file_path: storagePath,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: session.user.id,
            preview_url: previewUrl
          })
          .select()
          .single();

        if (dbError) throw dbError;

        onAttachmentAdded(attachment);

        uploadedCount++;
        setUploadProgress((uploadedCount / totalFiles) * 100);
      }

      toast.success(`Successfully uploaded ${uploadedCount} file(s)`);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFiles.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 dark:bg-gray-700 light:bg-gray-100 dark:text-gray-200 light:text-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">Attach Files</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="max-h-48 overflow-y-auto space-y-2">
            {selectedFiles.map((file, index) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 dark:bg-gray-700 light:bg-gray-100 rounded-lg"
                >
                  <Icon className="w-5 h-5 dark:text-gray-400 light:text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-gray-200 light:text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs dark:text-gray-400 light:text-gray-600">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 dark:text-gray-400 light:text-gray-500 dark:hover:text-red-400 light:hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="w-full dark:bg-gray-700 light:bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#F4A024] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs dark:text-gray-400 light:text-gray-600 text-center">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={uploadFiles}
              disabled={uploading || selectedFiles.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {selectedFiles.length} file(s)
                </>
              )}
            </button>
            {!uploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedFiles.length >= maxFiles}
                className="px-3 py-2 dark:bg-gray-700 light:bg-gray-100 dark:text-gray-200 light:text-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-start gap-2 p-2 dark:bg-blue-900/20 light:bg-blue-50 rounded-lg">
            <AlertCircle className="w-4 h-4 dark:text-blue-400 light:text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs dark:text-blue-300 light:text-blue-800">
              Max {maxFiles} files, {formatFileSize(maxFileSize)} per file. Supported: images, PDFs, documents, archives.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
