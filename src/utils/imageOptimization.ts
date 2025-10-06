/**
 * Image optimization utilities for the travel showcase website
 */

export interface ResponsiveImageConfig {
  widths: number[];
  sizes: string;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  fallbackFormat?: 'jpg' | 'png';
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';
}

/**
 * Predefined image configurations for different use cases
 */
export const imageConfigs = {
  // Hero/header images - high priority, multiple sizes
  hero: {
    widths: [640, 768, 1024, 1200, 1600, 1920],
    sizes: '100vw',
    format: 'webp' as const,
    fallbackFormat: 'jpg' as const,
    loading: 'eager' as const,
    decoding: 'async' as const,
    fetchpriority: 'high' as const,
  },

  // Trip card images - responsive grid
  tripCard: {
    widths: [200, 300, 400, 600],
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    format: 'webp' as const,
    fallbackFormat: 'jpg' as const,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  },

  // Gallery images - responsive grid with lightbox
  gallery: {
    widths: [300, 400, 600, 800],
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    format: 'webp' as const,
    fallbackFormat: 'jpg' as const,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  },

  // Avatar images - small, circular
  avatar: {
    widths: [40, 50, 60, 80, 100],
    sizes: '(max-width: 480px) 50px, (max-width: 768px) 60px, 80px',
    format: 'webp' as const,
    fallbackFormat: 'jpg' as const,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  },

  // Thumbnail images - very small
  thumbnail: {
    widths: [50, 75, 100, 150],
    sizes: '(max-width: 768px) 75px, 100px',
    format: 'webp' as const,
    fallbackFormat: 'jpg' as const,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  },
} as const;

/**
 * Generate srcset string for responsive images
 */
export function generateSrcSet(basePath: string, widths: number[], format: string = 'webp'): string {
  return widths
    .map(width => `${basePath}?w=${width}&f=${format} ${width}w`)
    .join(', ');
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalFormat(userAgent?: string): 'avif' | 'webp' | 'jpg' {
  if (!userAgent) return 'webp'; // Default for SSG
  
  // Check for AVIF support (Chrome 85+, Firefox 93+)
  if (userAgent.includes('Chrome/') && parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0') >= 85) {
    return 'avif';
  }
  
  // Check for WebP support (most modern browsers)
  if (userAgent.includes('Chrome/') || userAgent.includes('Firefox/') || userAgent.includes('Safari/')) {
    return 'webp';
  }
  
  return 'jpg';
}

/**
 * Calculate aspect ratio from width and height
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Generate responsive image props for Astro Image component
 */
export function getResponsiveImageProps(
  src: string,
  alt: string,
  config: ResponsiveImageConfig,
  width: number,
  height: number
) {
  return {
    src,
    alt,
    width,
    height,
    widths: config.widths,
    sizes: config.sizes,
    format: config.format,
    fallbackFormat: config.fallbackFormat,
    loading: config.loading,
    decoding: config.decoding,
    fetchpriority: config.fetchpriority,
  };
}

/**
 * Preload critical images for better performance
 */
export function generatePreloadLinks(images: Array<{ src: string; type: 'hero' | 'important' }>): string {
  return images
    .map(({ src, type }) => {
      const config = type === 'hero' ? imageConfigs.hero : imageConfigs.tripCard;
      const format = config.format;
      const width = config.widths[Math.floor(config.widths.length / 2)]; // Use middle size
      
      return `<link rel="preload" as="image" href="${src}?w=${width}&f=${format}" type="image/${format}">`;
    })
    .join('\n');
}

/**
 * Image loading performance metrics
 */
export interface ImageMetrics {
  totalImages: number;
  lazyImages: number;
  eagerImages: number;
  formats: Record<string, number>;
}

export function analyzeImageUsage(images: Array<{ loading?: string; format?: string }>): ImageMetrics {
  return images.reduce(
    (metrics, img) => {
      metrics.totalImages++;
      
      if (img.loading === 'lazy') {
        metrics.lazyImages++;
      } else {
        metrics.eagerImages++;
      }
      
      if (img.format) {
        metrics.formats[img.format] = (metrics.formats[img.format] || 0) + 1;
      }
      
      return metrics;
    },
    {
      totalImages: 0,
      lazyImages: 0,
      eagerImages: 0,
      formats: {} as Record<string, number>,
    }
  );
}