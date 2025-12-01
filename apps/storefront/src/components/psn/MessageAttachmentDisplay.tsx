'use client'

import React, { useState } from 'react';
import { Download, File, FileText, Image as ImageIcon, Archive, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  preview_url?: string;
  created_at: string;
}

interface MessageAttachmentDisplayProps {
  attachments: Attachment[];
  canDelete?: boolean;
  onDelete?: (attachmentId: string) => void;
}

export default function MessageAttachmentDisplay({
  attachments,
  canDelete = false,
  onDelete
}: MessageAttachmentDisplayProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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

  const getDownloadUrl = async (filePath: string): Promise<string> => {
    const { data } = await supabase.storage
      .from('message-attachments')
      .createSignedUrl(filePath, 3600);

    if (!data?.signedUrl) {
      throw new Error('Failed to generate download URL');
    }

    return data.signedUrl;
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const url = await getDownloadUrl(attachment.file_path);

      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!onDelete) return;

    setDeletingId(attachmentId);
    try {
      const attachment = attachments.find(a => a.id === attachmentId);
      if (!attachment) return;

      const { error: storageError } = await supabase.storage
        .from('message-attachments')
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('message_attachments')
        .update({ is_deleted: true })
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      onDelete(attachmentId);
      toast.success('Attachment deleted');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageClick = async (attachment: Attachment) => {
    try {
      const url = await getDownloadUrl(attachment.file_path);
      setExpandedImage(url);
    } catch (error) {
      console.error('Error loading image:', error);
      toast.error('Failed to load image');
    }
  };

  if (attachments.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.file_type);
          const isImage = attachment.file_type.startsWith('image/');

          return (
            <div
              key={attachment.id}
              className="relative group max-w-xs"
            >
              {isImage && attachment.preview_url ? (
                <button
                  onClick={() => handleImageClick(attachment)}
                  className="relative block rounded-lg overflow-hidden border dark:border-gray-600 light:border-gray-300 hover:border-[#F4A024] transition-colors"
                >
                  <img
                    src={attachment.preview_url}
                    alt={attachment.file_name}
                    className="w-48 h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-xs text-white truncate">{attachment.file_name}</p>
                    <p className="text-xs text-gray-300">{formatFileSize(attachment.file_size)}</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 dark:bg-gray-700 light:bg-gray-100 rounded-lg border dark:border-gray-600 light:border-gray-300 hover:border-[#F4A024] transition-colors">
                  <Icon className="w-6 h-6 dark:text-gray-400 light:text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm dark:text-gray-200 light:text-gray-900 truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs dark:text-gray-400 light:text-gray-600">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-1.5 dark:text-gray-400 light:text-gray-500 dark:hover:text-[#F4A024] light:hover:text-[#F4A024] transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}

              {canDelete && (
                <button
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deletingId === attachment.id}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  title="Delete attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={expandedImage}
            alt="Expanded view"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
