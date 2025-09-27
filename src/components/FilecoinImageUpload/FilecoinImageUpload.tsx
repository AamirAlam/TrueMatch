'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface UploadResponse {
  success: boolean;
  data?: {
    cid: string;
    fileName: string;
    size: string;
    gatewayUrl: string;
    ipfsUrl: string;
    uploadedAt: string;
  };
  error?: string;
}

interface DealStatus {
  success: boolean;
  data?: {
    cid: string;
    status: string;
    totalDeals: number;
    deals: any[];
    checkedAt: string;
  };
  error?: string;
}

export default function FilecoinImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [dealStatus, setDealStatus] = useState<DealStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setDealStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();
      setUploadResult(result);
      console.log('upload response ', result)
      if (result.success) {
        // Automatically check deal status after upload
        setTimeout(() => checkDealStatus(result.data!.cid), 2000);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: 'Failed to upload file'
      });
    } finally {
      setUploading(false);
    }
  };

  const checkDealStatus = async (cid: string) => {
    setCheckingStatus(true);
    try {
      const response = await fetch(`/api/images/status?cid=${cid}`);
      const result: DealStatus = await response.json();
      setDealStatus(result);
    } catch (error) {
      setDealStatus({
        success: false,
        error: 'Failed to check deal status'
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setDealStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Filecoin Image Storage
        </h2>
        <p className="text-gray-600">
          Upload images to decentralized storage powered by Filecoin and IPFS
        </p>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!selectedFile ? (
            <div>
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button clicked, triggering file input');
                  fileInputRef.current?.click();
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Select Image
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Supports JPEG, PNG, GIF, WebP, SVG (max 10MB)
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-green-500 mr-2" />
                <span className="text-lg font-medium">{selectedFile.name}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Size: {formatFileSize(selectedFile.size.toString())}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload to Filecoin
                    </>
                  )}
                </button>
                <button
                  onClick={resetUpload}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mb-6">
          {uploadResult.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-green-800">Upload Successful!</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>CID:</strong> 
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                    {uploadResult.data!.cid}
                  </code>
                </div>
                <div>
                  <strong>File:</strong> {uploadResult.data!.fileName} ({formatFileSize(uploadResult.data!.size)})
                </div>
                <div className="flex items-center">
                  <strong>Gateway URL:</strong>
                  <a
                    href={uploadResult.data!.gatewayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View Image <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              {/* Image Preview */}
              <div className="mt-4">
                <img
                  src={uploadResult.data!.gatewayUrl}
                  alt={uploadResult.data!.fileName}
                  className="max-w-full h-auto max-h-64 rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-red-800">Upload Failed</h3>
              </div>
              <p className="text-red-700">{uploadResult.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Deal Status */}
      {uploadResult?.success && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Filecoin Deal Status</h3>
            <button
              onClick={() => checkDealStatus(uploadResult.data!.cid)}
              disabled={checkingStatus}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="animate-spin h-3 w-3 mr-1" />
                  Checking...
                </>
              ) : (
                'Refresh Status'
              )}
            </button>
          </div>

          {dealStatus ? (
            dealStatus.success ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      dealStatus.data!.status === 'active' ? 'bg-green-100 text-green-800' :
                      dealStatus.data!.status === 'sealing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dealStatus.data!.status.toUpperCase()}
                    </span>
                  </div>
                  <div><strong>Total Deals:</strong> {dealStatus.data!.totalDeals}</div>
                  {dealStatus.data!.totalDeals === 0 && (
                    <p className="text-blue-700 text-xs mt-2">
                      File is being processed for Filecoin storage deals. This can take several hours.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{dealStatus.error}</p>
              </div>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-600">Click "Refresh Status" to check Filecoin deal status</p>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">How it works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. Upload your image to IPFS via Lighthouse storage</li>
          <li>2. Get instant access via IPFS gateways</li>
          <li>3. File is automatically queued for Filecoin storage deals</li>
          <li>4. Filecoin deals provide long-term decentralized storage</li>
        </ul>
      </div>
    </div>
  );
}
