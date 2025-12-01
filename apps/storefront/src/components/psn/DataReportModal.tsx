'use client'

import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitDataReport, checkDataReportRateLimit } from '@/lib/data/data-reports';

interface DataReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageType: 'product' | 'supplier' | 'search' | 'directory' | 'category' | 'country' | 'source';
  pageId?: string;
  contextData?: {
    productName?: string;
    supplierName?: string;
    categoryName?: string;
    countryName?: string;
    sourceName?: string;
    url?: string;
  };
}

const REPORT_TYPES = [
  { value: 'incorrect_product_info', label: 'Incorrect Product Information', description: 'Wrong price, description, or details' },
  { value: 'broken_link', label: 'Broken Link or URL', description: 'Link doesn\'t work or goes to wrong page' },
  { value: 'outdated_supplier', label: 'Outdated Supplier Details', description: 'Company info is old or incorrect' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Offensive or inappropriate material' },
  { value: 'duplicate_entry', label: 'Duplicate Entry', description: 'Same product or supplier listed multiple times' },
  { value: 'glitch', label: 'Technical Glitch or Bug', description: 'Something not working properly' },
  { value: 'other', label: 'Other Issue', description: 'Something else needs attention' }
];

const MAX_SCREENSHOTS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export default function DataReportModal({ isOpen, onClose, pageType, pageId, contextData }: DataReportModalProps) {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitChecked, setRateLimitChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkRateLimit();
    }
  }, [isOpen]);

  const checkRateLimit = async () => {
    const result = await checkDataReportRateLimit();
    setRateLimitChecked(true);
    if (!result.allowed) {
      toast.error('You have reached the rate limit for reports. Please try again later.');
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (screenshots.length + validFiles.length > MAX_SCREENSHOTS) {
      toast.error(`Maximum ${MAX_SCREENSHOTS} screenshots allowed`);
      return;
    }

    setScreenshots([...screenshots, ...validFiles]);
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!rateLimitChecked) {
      await checkRateLimit();
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitDataReport(
        {
          pageType,
          pageId,
          reportType,
          description: description.trim(),
          url: typeof window !== 'undefined' ? window.location.href : contextData?.url || '',
          contextData,
        },
        screenshots
      );

      if (result.success) {
        toast.success('Report submitted successfully! Thank you for your feedback.');
        onClose();
        setReportType('');
        setDescription('');
        setScreenshots([]);
      } else {
        toast.error(result.error || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#F4A024]" />
            <h2 className="text-xl font-semibold text-white">Report Issue</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Type <span className="text-red-400">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-[#F4A024]"
              required
            >
              <option value="">Select issue type</option>
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={5}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-[#F4A024] resize-none"
              required
            />
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Screenshots (Optional, max {MAX_SCREENSHOTS})
            </label>
            <div className="space-y-2">
              {screenshots.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-300 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {screenshots.length < MAX_SCREENSHOTS && (
                <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-[#F4A024] transition-colors">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Upload screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Supported formats: JPG, PNG, GIF, WebP (max 5MB each)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rateLimitChecked}
              className="flex-1 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg font-semibold hover:bg-[#F4A024]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
