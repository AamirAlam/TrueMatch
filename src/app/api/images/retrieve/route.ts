import { NextRequest, NextResponse } from 'next/server';
import lighthouse from '@lighthouse-web3/sdk';

const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY;

if (!LIGHTHOUSE_API_KEY) {
  throw new Error('LIGHTHOUSE_API_KEY is not configured in environment variables');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    if (!cid) {
      return NextResponse.json(
        { error: 'CID parameter is required' },
        { status: 400 }
      );
    }

    // Validate CID format (basic validation)
    if (!/^[a-zA-Z0-9]+$/.test(cid) || cid.length < 10) {
      return NextResponse.json(
        { error: 'Invalid CID format' },
        { status: 400 }
      );
    }

    // Get deal status and file info from Lighthouse
    const dealStatus = await lighthouse.dealStatus(cid);
    
    // Generate gateway URLs
    const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    const ipfsUrl = `ipfs://${cid}`;
    
    // Alternative IPFS gateways for redundancy
    const alternativeGateways = [
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`
    ];

    return NextResponse.json({
      success: true,
      data: {
        cid: cid,
        gatewayUrl: gatewayUrl,
        ipfsUrl: ipfsUrl,
        alternativeGateways: alternativeGateways,
        dealStatus: dealStatus?.data || null,
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve image information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cid } = body;

    if (!cid) {
      return NextResponse.json(
        { error: 'CID is required in request body' },
        { status: 400 }
      );
    }

    // Validate CID format
    if (!/^[a-zA-Z0-9]+$/.test(cid) || cid.length < 10) {
      return NextResponse.json(
        { error: 'Invalid CID format' },
        { status: 400 }
      );
    }

    // Get detailed deal status
    const dealStatus = await lighthouse.dealStatus(cid);
    
    const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    const ipfsUrl = `ipfs://${cid}`;

    return NextResponse.json({
      success: true,
      data: {
        cid: cid,
        gatewayUrl: gatewayUrl,
        ipfsUrl: ipfsUrl,
        dealStatus: dealStatus?.data || null,
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image retrieval error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve image information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
