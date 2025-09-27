# Filecoin Image Storage API

This project includes a complete implementation for uploading and retrieving images using Filecoin's decentralized storage network via Lighthouse.storage.

## Overview

The implementation provides:
- **Upload API**: Store images on IPFS/Filecoin with instant access
- **Retrieval API**: Get image information and gateway URLs by CID
- **Status API**: Monitor Filecoin deal status and storage progress
- **React Component**: Ready-to-use UI for image uploads
- **Utility Functions**: Client-side helpers for integration

## Setup

### 1. Install Dependencies

```bash
npm install @lighthouse-web3/sdk multer
npm install --save-dev @types/multer
```

### 2. Environment Configuration

Add to your `.env` file:

```bash
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```

Get your API key from [Lighthouse Files Dashboard](https://files.lighthouse.storage/):
1. Login to the dashboard
2. Go to API Key section
3. Generate a new API key
4. Copy and add to your `.env` file

### 3. API Endpoints

The following API routes are available:

#### Upload Image
- **Endpoint**: `POST /api/images/upload`
- **Body**: FormData with `file` field
- **Response**: Upload result with CID and gateway URL

#### Retrieve Image Info
- **Endpoint**: `GET /api/images/retrieve?cid={CID}`
- **Response**: Image information and gateway URLs

#### Check Deal Status
- **Endpoint**: `GET /api/images/status?cid={CID}`
- **Response**: Filecoin deal status and progress

## Usage Examples

### Basic Upload with Utility Functions

```typescript
import { uploadImageToFilecoin, checkDealStatus } from '@/utils/filecoin';

// Upload an image
const handleUpload = async (file: File) => {
  const result = await uploadImageToFilecoin(file);
  
  if (result.success) {
    console.log('Upload successful!');
    console.log('CID:', result.data.cid);
    console.log('Gateway URL:', result.data.gatewayUrl);
    
    // Check deal status
    const status = await checkDealStatus(result.data.cid);
    console.log('Deal status:', status.data?.status);
  } else {
    console.error('Upload failed:', result.error);
  }
};
```

### Using the React Component

```tsx
import FilecoinImageUpload from '@/components/FilecoinImageUpload';

export default function MyPage() {
  return (
    <div>
      <h1>Upload to Filecoin</h1>
      <FilecoinImageUpload />
    </div>
  );
}
```

### Direct API Usage

```typescript
// Upload image
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  });
  
  return await response.json();
};

// Retrieve image info
const getImageInfo = async (cid: string) => {
  const response = await fetch(`/api/images/retrieve?cid=${cid}`);
  return await response.json();
};

// Check deal status
const getDealStatus = async (cid: string) => {
  const response = await fetch(`/api/images/status?cid=${cid}`);
  return await response.json();
};
```

## API Reference

### Upload Response Format

```typescript
{
  success: boolean;
  data?: {
    cid: string;           // Content Identifier
    fileName: string;      // Original filename
    size: string;          // File size in bytes
    gatewayUrl: string;    // Lighthouse gateway URL
    ipfsUrl: string;       // IPFS protocol URL
    uploadedAt: string;    // ISO timestamp
  };
  error?: string;          // Error message if failed
}
```

### Deal Status Response Format

```typescript
{
  success: boolean;
  data?: {
    cid: string;           // Content Identifier
    status: string;        // pending | sealing | active
    totalDeals: number;    // Number of storage deals
    deals: Array<{         // Deal details
      dealId: string;
      storageProvider: string;
      dealStatus: string;
      startEpoch: number;
      endEpoch: number;
      // ... more deal info
    }>;
    checkedAt: string;     // ISO timestamp
  };
  error?: string;
}
```

## File Specifications

### Supported Image Types
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG

### File Size Limits
- Maximum: 10MB per file
- Recommended: Under 5MB for faster uploads

## How It Works

1. **Upload**: Images are uploaded to Lighthouse.storage
2. **IPFS Storage**: Files are immediately available on IPFS
3. **Deal Aggregation**: Small files are bundled for Filecoin deals
4. **Filecoin Storage**: Deals are made with storage providers
5. **Verification**: Deal status can be monitored and verified

## Gateway URLs

Images are accessible via multiple IPFS gateways:

- **Lighthouse**: `https://gateway.lighthouse.storage/ipfs/{CID}`
- **IPFS.io**: `https://ipfs.io/ipfs/{CID}`
- **Cloudflare**: `https://cloudflare-ipfs.com/ipfs/{CID}`
- **Dweb**: `https://dweb.link/ipfs/{CID}`

## Utility Functions

### File Validation
```typescript
import { validateImageFile } from '@/utils/filecoin';

const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
}
```

### CID Validation
```typescript
import { isValidCID } from '@/utils/filecoin';

if (isValidCID(cid)) {
  // Process valid CID
}
```

### Gateway URL Generation
```typescript
import { generateGatewayUrls } from '@/utils/filecoin';

const urls = generateGatewayUrls(cid);
console.log(urls.lighthouse); // Lighthouse gateway
console.log(urls.ipfsIo);     // IPFS.io gateway
```

## Error Handling

The API includes comprehensive error handling:

- **File validation**: Type and size checks
- **Upload errors**: Network and server issues
- **CID validation**: Format verification
- **Deal status**: Monitoring and reporting

## Security Considerations

- API key is server-side only (not exposed to client)
- File type validation prevents malicious uploads
- Size limits prevent abuse
- CID validation prevents injection attacks

## Performance Notes

- **Upload**: Usually completes in seconds
- **IPFS Access**: Immediate via gateways
- **Filecoin Deals**: Can take several hours to complete
- **Deal Verification**: Available via status API

## Troubleshooting

### Common Issues

1. **Upload fails**: Check API key configuration
2. **File too large**: Reduce file size or compress image
3. **Unsupported type**: Use supported image formats
4. **Gateway timeout**: Try alternative IPFS gateways

### Debug Mode

Enable detailed logging by checking browser console and server logs for error details.

## Integration Examples

### With Next.js App Router
```typescript
// app/upload/page.tsx
import FilecoinImageUpload from '@/components/FilecoinImageUpload';

export default function UploadPage() {
  return <FilecoinImageUpload />;
}
```

### With Custom Hook
```typescript
import { useState } from 'react';
import { uploadImageToFilecoin } from '@/utils/filecoin';

export function useFilecoinUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const upload = async (file: File) => {
    setUploading(true);
    const response = await uploadImageToFilecoin(file);
    setResult(response);
    setUploading(false);
    return response;
  };

  return { upload, uploading, result };
}
```

## Resources

- [Lighthouse Documentation](https://docs.lighthouse.storage/)
- [Filecoin Documentation](https://docs.filecoin.io/)
- [IPFS Documentation](https://docs.ipfs.tech/)

## Support

For issues related to:
- **API Implementation**: Check this documentation and error logs
- **Lighthouse Service**: Visit [Lighthouse Support](https://lighthouse.storage/)
- **Filecoin Network**: Visit [Filecoin Documentation](https://docs.filecoin.io/)
