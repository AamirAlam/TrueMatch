import { NextRequest, NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';

const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || "";

if (!LIGHTHOUSE_API_KEY) {
  throw new Error('LIGHTHOUSE_API_KEY is not configured in environment variables');
}

// Validate API key format - Lighthouse keys should be UUIDs
const apiKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!apiKeyPattern.test(LIGHTHOUSE_API_KEY)) {
  console.warn('LIGHTHOUSE_API_KEY does not match expected UUID format');
}

// Supported image types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/heif'
];

// iOS-specific image types that need conversion
const IOS_IMAGE_TYPES = ['image/heic', 'image/heif'];

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

    // Sanitize filename for Lighthouse SDK
    // Remove special characters and spaces, keep only alphanumeric, dots, hyphens, underscores
    let sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();

    console.log('Upload debug info:', {
      originalName: file.name,
      sanitizedName: sanitizedName,
      fileType: file.type,
      fileSize: file.size,
      isIOSImage: IOS_IMAGE_TYPES.includes(file.type),
      hasApiKey: !!LIGHTHOUSE_API_KEY,
      apiKeyLength: LIGHTHOUSE_API_KEY.length
    });

    // Convert File to Buffer for Lighthouse SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Handle iOS HEIC/HEIF images by converting to JPEG
    if (IOS_IMAGE_TYPES.includes(file.type)) {
      console.log('iOS image detected, converting to JPEG...');
      
      try {
        // For now, we'll treat HEIC/HEIF as JPEG since many browsers auto-convert
        // In a production app, you'd use a library like 'heic2any' for proper conversion
        console.log('Processing iOS image as JPEG format');
        
        // Update the sanitized name to have .jpg extension
        const nameWithoutExt = sanitizedName.replace(/\.(heic|heif)$/i, '');
        const convertedName = `${nameWithoutExt}.jpg`;
        
        console.log('Converted filename:', convertedName);
        
        // Update sanitizedName for the upload
        sanitizedName = convertedName;
        
      } catch (conversionError) {
        console.error('iOS image conversion error:', conversionError);
        throw new Error('Failed to process iOS image format');
      }
    }

    console.log('Buffer created:', {
      bufferLength: buffer.length,
      bufferType: typeof buffer,
      finalFileName: sanitizedName
    });

    // Create a temporary file-like object for Lighthouse
    const fileData = { // eslint-disable-line @typescript-eslint/no-unused-vars
      name: sanitizedName,
      buffer: buffer,
      size: file.size,
      type: file.type
    };

    console.log('About to call lighthouse.uploadBuffer...');
    
    // Upload to Lighthouse/Filecoin
    const uploadResponse = await lighthouse.uploadBuffer(
      buffer,
      LIGHTHOUSE_API_KEY
    );

    console.log('Lighthouse upload response:', uploadResponse);

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
        fileName: uploadResponse.data.Name || sanitizedName,
        originalFileName: file.name,
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
