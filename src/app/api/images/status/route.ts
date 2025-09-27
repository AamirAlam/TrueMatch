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

    // Validate CID format
    if (!/^[a-zA-Z0-9]+$/.test(cid) || cid.length < 10) {
      return NextResponse.json(
        { error: 'Invalid CID format' },
        { status: 400 }
      );
    }

    // Get deal status from Lighthouse
    const dealStatusResponse = await lighthouse.dealStatus(cid);
    
    if (!dealStatusResponse?.data || dealStatusResponse.data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          cid: cid,
          status: 'pending',
          message: 'File is being processed for Filecoin storage deals. This can take several hours.',
          deals: [],
          checkedAt: new Date().toISOString()
        }
      });
    }

    // Process deal information
    const deals = dealStatusResponse.data.map((deal: any) => ({
      dealId: deal.dealId || deal.chainDealID,
      dealUUID: deal.dealUUID,
      storageProvider: deal.storageProvider || deal.miner,
      dealStatus: deal.dealStatus,
      startEpoch: deal.startEpoch,
      endEpoch: deal.endEpoch,
      pieceCID: deal.pieceCID,
      pieceSize: deal.pieceSize,
      providerCollateral: deal.providerCollateral,
      lastUpdate: deal.lastUpdate ? new Date(deal.lastUpdate).toISOString() : null
    }));

    // Determine overall status
    let overallStatus = 'pending';
    if (deals.some((deal: any) => deal.dealStatus?.includes('Active'))) {
      overallStatus = 'active';
    } else if (deals.some((deal: any) => deal.dealStatus?.includes('Sealing'))) {
      overallStatus = 'sealing';
    } else if (deals.some((deal: any) => deal.dealStatus?.includes('Published'))) {
      overallStatus = 'published';
    }

    return NextResponse.json({
      success: true,
      data: {
        cid: cid,
        status: overallStatus,
        totalDeals: deals.length,
        deals: deals,
        checkedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Deal status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check deal status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cids } = body;

    if (!cids || !Array.isArray(cids) || cids.length === 0) {
      return NextResponse.json(
        { error: 'Array of CIDs is required in request body' },
        { status: 400 }
      );
    }

    if (cids.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 CIDs allowed per request' },
        { status: 400 }
      );
    }

    // Check status for multiple CIDs
    const results = await Promise.allSettled(
      cids.map(async (cid: string) => {
        if (!/^[a-zA-Z0-9]+$/.test(cid) || cid.length < 10) {
          throw new Error(`Invalid CID format: ${cid}`);
        }

        const dealStatusResponse = await lighthouse.dealStatus(cid);
        
        return {
          cid: cid,
          status: dealStatusResponse?.data?.length > 0 ? 'active' : 'pending',
          deals: dealStatusResponse?.data || []
        };
      })
    );

    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          cid: cids[index],
          status: 'error',
          error: result.reason.message,
          deals: []
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        results: processedResults,
        checkedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Batch deal status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check deal status for multiple CIDs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
