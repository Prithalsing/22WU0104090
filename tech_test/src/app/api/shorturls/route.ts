import { NextRequest, NextResponse } from 'next/server';
import { urlStorage, UrlData } from '@/lib/url-storage';
import { logger } from '@/lib/logging-middleware';

export async function POST(request: NextRequest) {
  try {
    logger.info('backend', 'route', 'POST /api/shorturls endpoint called');
    
    const body = await request.json();
    const { url, validity = 30, shortcode } = body;

    // Validate required fields
    if (!url) {
      logger.warn('backend', 'controller', 'Missing required field: url');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      logger.warn('backend', 'controller', 'Invalid URL format provided');
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate validity (must be positive number)
    if (validity <= 0) {
      logger.warn('backend', 'controller', 'Invalid validity period provided');
      return NextResponse.json(
        { error: 'Validity must be greater than 0' },
        { status: 400 }
      );
    }

    try {
      const urlData: UrlData = urlStorage.createUrl(url, validity, shortcode);
      
      logger.info('backend', 'service', `URL shortened successfully: ${urlData.shortcode}`);
      
      return NextResponse.json({
        shortcode: urlData.shortcode,
        shortUrl: `http://localhost:3000/${urlData.shortcode}`,
        originalUrl: urlData.originalUrl,
        expiresAt: urlData.expiresAt,
        createdAt: urlData.createdAt,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Shortcode already exists') {
        logger.warn('backend', 'service', 'Shortcode collision detected');
        return NextResponse.json(
          { error: 'Custom shortcode already exists' },
          { status: 409 }
        );
      }
      
      logger.error('backend', 'service', 'Failed to create short URL');
      throw error;
    }
  } catch (error) {
    logger.error('backend', 'route', 'Unexpected error in POST /api/shorturls');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}