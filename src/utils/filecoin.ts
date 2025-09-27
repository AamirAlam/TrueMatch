// Utility functions for Filecoin image storage operations

export interface UploadResponse {
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
  details?: string;
}

export interface RetrieveResponse {
  success: boolean;
  data?: {
    cid: string;
    gatewayUrl: string;
    ipfsUrl: string;
    alternativeGateways: string[];
    dealStatus: any;
    retrievedAt: string;
  };
  error?: string;
  details?: string;
}

export interface DealStatusResponse {
  success: boolean;
  data?: {
    cid: string;
    status: string;
    message?: string;
    totalDeals: number;
    deals: any[];
    checkedAt: string;
  };
  error?: string;
  details?: string;
}

/**
 * Upload an image file to Filecoin via Lighthouse storage
 */
export async function uploadImageToFilecoin(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Retrieve image information by CID
 */
export async function retrieveImageByCID(cid: string): Promise<RetrieveResponse> {
  try {
    const response = await fetch(`/api/images/retrieve?cid=${encodeURIComponent(cid)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Failed to retrieve image information',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check Filecoin deal status for a CID
 */
export async function checkDealStatus(cid: string): Promise<DealStatusResponse> {
  try {
    const response = await fetch(`/api/images/status?cid=${encodeURIComponent(cid)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Failed to check deal status',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check deal status for multiple CIDs
 */
export async function checkMultipleDealStatus(cids: string[]): Promise<DealStatusResponse> {
  try {
    const response = await fetch('/api/images/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cids }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Failed to check deal status for multiple CIDs',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate if a string is a valid CID format
 */
export function isValidCID(cid: string): boolean {
  if (!cid || typeof cid !== 'string') return false;
  
  // Basic CID validation - should be alphanumeric and reasonable length
  return /^[a-zA-Z0-9]+$/.test(cid) && cid.length >= 10 && cid.length <= 100;
}

/**
 * Generate IPFS gateway URLs for a CID
 */
export function generateGatewayUrls(cid: string) {
  if (!isValidCID(cid)) {
    throw new Error('Invalid CID provided');
  }

  return {
    lighthouse: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    ipfsIo: `https://ipfs.io/ipfs/${cid}`,
    cloudflare: `https://cloudflare-ipfs.com/ipfs/${cid}`,
    dweb: `https://dweb.link/ipfs/${cid}`,
    ipfsUrl: `ipfs://${cid}`
  };
}

/**
 * Format file size from bytes to human readable format
 */
export function formatFileSize(bytes: number | string): string {
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Get deal status color for UI display
 */
export function getDealStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'sealing':
    case 'published':
      return 'text-yellow-600 bg-yellow-100';
    case 'pending':
      return 'text-blue-600 bg-blue-100';
    case 'error':
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!supportedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Unsupported file type. Supported types: ${supportedTypes.join(', ')}` 
    };
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size too large. Maximum size: ${formatFileSize(maxSize)}` 
    };
  }

  return { valid: true };
}


// upload response from filecoing 
// {
//     "cid": "bafkreidwwtyc7p2hh4xu356ur6ws2pdvegphrr7xnmir3qozs7xlt7duq4",
//     "fileName": "blob",
//     "size": "30566",
//     "gatewayUrl": "https://gateway.lighthouse.storage/ipfs/bafkreidwwtyc7p2hh4xu356ur6ws2pdvegphrr7xnmir3qozs7xlt7duq4",
//     "ipfsUrl": "ipfs://bafkreidwwtyc7p2hh4xu356ur6ws2pdvegphrr7xnmir3qozs7xlt7duq4",
//     "uploadedAt": "2025-09-27T11:08:26.459Z"
// }


