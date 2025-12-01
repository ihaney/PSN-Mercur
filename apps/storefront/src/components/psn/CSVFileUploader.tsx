'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { parseCSV, ProductCSVRow } from '@/lib/helpers/csvTemplate';

interface CSVFileUploaderProps {
  onFileLoaded: (data: ProductCSVRow[], filename: string) => void;
  onError: (error: string) => void;
}

export function CSVFileUploader({ onFileLoaded, onError }: CSVFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      onError('Please upload a CSV file');
      return;
    }

    if (file.size > maxSize) {
      onError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        onError('CSV file contains no valid data rows');
        setSelectedFile(null);
        return;
      }

      onFileLoaded(data, file.name);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to parse CSV file');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileInput}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragging ? 'Drop your CSV file here' : 'Upload CSV File'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: CSV (max 10MB)
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                {isProcessing && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing file...</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">CSV File Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>First row must contain column headers</li>
              <li>Required columns: title, description, price, moq, category, country</li>
              <li>Use our template to ensure correct format</li>
              <li>Maximum 10,000 rows per upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
