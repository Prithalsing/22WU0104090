import { logger } from './logging-middleware';

export interface UrlData {
  id: string;
  originalUrl: string;
  shortcode: string;
  createdAt: string;
  expiresAt: string;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: string;
  referrer: string;
  location: string;
}

class UrlStorage {
  private static instance: UrlStorage;
  private urls: Map<string, UrlData> = new Map();

  private constructor() {}

  public static getInstance(): UrlStorage {
    if (!UrlStorage.instance) {
      UrlStorage.instance = new UrlStorage();
    }
    return UrlStorage.instance;
  }

  public generateShortcode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public isShortcodeUnique(shortcode: string): boolean {
    return !this.urls.has(shortcode);
  }

  public createUrl(originalUrl: string, validity: number = 30, customShortcode?: string): UrlData {
    let shortcode = customShortcode;
    
    if (!shortcode) {
      do {
        shortcode = this.generateShortcode();
      } while (!this.isShortcodeUnique(shortcode));
    } else if (!this.isShortcodeUnique(shortcode)) {
      throw new Error('Shortcode already exists');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + validity * 60 * 1000);

    const urlData: UrlData = {
      id: shortcode,
      originalUrl,
      shortcode,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: [],
    };

    this.urls.set(shortcode, urlData);
    logger.info('backend', 'db', `URL created with shortcode: ${shortcode}`);
    
    return urlData;
  }

  public getUrl(shortcode: string): UrlData | null {
    const urlData = this.urls.get(shortcode);
    
    if (!urlData) {
      logger.warn('backend', 'db', `URL not found for shortcode: ${shortcode}`);
      return null;
    }

    if (new Date() > new Date(urlData.expiresAt)) {
      logger.warn('backend', 'db', `URL expired for shortcode: ${shortcode}`);
      return null;
    }

    return urlData;
  }

  public recordClick(shortcode: string, referrer: string): boolean {
    const urlData = this.urls.get(shortcode);
    
    if (!urlData) {
      return false;
    }

    const clickData: ClickData = {
      timestamp: new Date().toISOString(),
      referrer: referrer || 'Direct',
      location: 'Unknown', // Coarse-grained location would need geolocation service
    };

    urlData.clicks.push(clickData);
    this.urls.set(shortcode, urlData);
    
    logger.info('backend', 'db', `Click recorded for shortcode: ${shortcode}`);
    return true;
  }

  public getAllUrls(): UrlData[] {
    return Array.from(this.urls.values());
  }
}

export const urlStorage = UrlStorage.getInstance();