import { NextRequest, NextResponse } from 'next/server';
import { urlStorage } from '@/lib/url-storage';
import { logger } from '@/lib/logging-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortcode: string } }
) {
  try {
    const { shortcode } = await params;
    logger.info('backend', 'route', `GET /${shortcode} redirect endpoint called`);

    const urlData = urlStorage.getUrl(shortcode);

    if (!urlData) {
      logger.warn('backend', 'controller', `Redirect failed - URL not found or expired: ${shortcode}`);
      return NextResponse.json(
        { error: 'Short URL not found or has expired' },
        { status: 404 }
      );
    }

    // Record the click
    const referrer = request.headers.get('referer') || '';
    urlStorage.recordClick(shortcode, referrer);

    logger.info('backend', 'service', `Redirecting ${shortcode} to ${urlData.originalUrl}`);
    
    return NextResponse.redirect(urlData.originalUrl);
  } catch (error) {
    logger.error('backend', 'route', 'Unexpected error in GET /[shortcode]');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}