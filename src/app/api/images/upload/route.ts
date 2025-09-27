import { NextRequest, NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';

const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY;

if (!LIGHTHOUSE_API_KEY) {
  throw new Error('LIGHTHOUSE_API_KEY is not configured in environment variables');
}

// Supported image types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Unsupported file type. Supported types: JPEG, PNG, GIF, WebP, SVG',
          supportedTypes: SUPPORTED_IMAGE_TYPES
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `File size too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          maxSize: MAX_FILE_SIZE
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Lighthouse SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a temporary file-like object for Lighthouse
    const fileData = {
      name: file.name,
      buffer: buffer,
      size: file.size,
      type: file.type
    };

    // Upload to Lighthouse/Filecoin
    const uploadResponse = await lighthouse.uploadBuffer(
      buffer,
      LIGHTHOUSE_API_KEY,
      file.name
    );

    if (!uploadResponse?.data?.Hash) {
      throw new Error('Upload failed - no hash returned');
    }

    const cid = uploadResponse.data.Hash;
    const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        cid: cid,
        fileName: uploadResponse.data.Name,
        size: uploadResponse.data.Size,
        gatewayUrl: gatewayUrl,
        ipfsUrl: `ipfs://${cid}`,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload image to Filecoin',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image upload endpoint',
    methods: ['POST'],
    supportedTypes: SUPPORTED_IMAGE_TYPES,
    maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`
  });
}
