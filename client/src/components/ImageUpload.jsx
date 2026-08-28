import React, { useState, useRef } from 'react';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import API from '../services/api';

export default function ImageUpload({ 
  value, 
  onChange, 
  label = "Image", 
  placeholder = "Enter image URL or upload file",
  required = false 
}) {
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await API.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedPath = response.data.filePath;
      setPreview(uploadedPath);
      onChange(uploadedPath); // Call parent onChange with the uploaded file path
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle URL input
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
    setError('');
  };

  // Clear image
  const handleClear = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Mode Toggle */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            uploadMode === 'url'
              ? 'bg-orange-100 text-orange-600'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>URL</span>
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            uploadMode === 'file'
              ? 'bg-orange-100 text-orange-600'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === 'url' && (
        <input
          type="text"
          value={preview}
          onChange={handleUrlChange}
          placeholder={placeholder}
          required={required && !preview}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition text-sm"
        />
      )}

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-${label.replace(/\s/g, '-')}`}
          />
          <label
            htmlFor={`file-${label.replace(/\s/g, '-')}`}
            className="flex items-center justify-center space-x-2 w-full px-3.5 py-2.5 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">
              {uploading ? 'Uploading...' : 'Click to upload image'}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WEBP up to 5MB</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Image Preview */}
      {preview && !error && (
        <div className="relative mt-3 group">
          <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            <img
              src={preview.startsWith('http') ? preview : `${API.defaults.baseURL}${preview}`.replace('/api', '')}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/m1.webp';
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-lg transition opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-1 text-xs text-gray-500 truncate">{preview}</div>
        </div>
      )}
    </div>
  );
}
