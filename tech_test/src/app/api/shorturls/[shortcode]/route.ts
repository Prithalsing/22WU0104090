import { NextRequest, NextResponse } from 'next/server';
import { urlStorage } from '@/lib/url-storage';
import { logger } from '@/lib/logging-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  try {
    const { shortcode } = params;
    logger.info('backend', 'route', `GET /api/shorturls/${shortcode} endpoint called`);

    const urlData = urlStorage.getUrl(shortcode);

    if (!urlData) {
      logger.warn('backend', 'controller', `URL not found or expired for shortcode: ${shortcode}`);
      return NextResponse.json(
        { error: 'Short URL not found or has expired' },
        { status: 404 }
      );
    }

    const response = {
      shortcode: urlData.shortcode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiresAt: urlData.expiresAt,
      clickCount: urlData.clicks.length,
      clicks: urlData.clicks.map(click => ({
        timestamp: click.timestamp,
        referrer: click.referrer,
        location: click.location,
      })),
    };

    logger.info('backend', 'service', `Statistics retrieved for shortcode: ${shortcode}`);
    return NextResponse.json(response);
  } catch (error) {
    logger.error('backend', 'route', 'Unexpected error in GET /api/shorturls/[shortcode]');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}