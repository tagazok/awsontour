/**
 * Performance optimization utilities for lazy loading and caching
 */

/**
 * Intersection Observer for lazy loading images and components
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private elements: Set<Element> = new Set();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
        rootMargin: '50px 0px',
        threshold: 0.1,
        ...options,
      });
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        this.loadElement(element);
        this.observer?.unobserve(element);
        this.elements.delete(element);
      }
    });
  }

  private loadElement(element: Element) {
    // Handle lazy loading for images
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      const dataSrc = img.dataset.src;
      const dataSrcset = img.dataset.srcset;
      
      if (dataSrc) {
        img.src = dataSrc;
        img.removeAttribute('data-src');
      }
      
      if (dataSrcset) {
        img.srcset = dataSrcset;
        img.removeAttribute('data-srcset');
      }
      
      img.classList.remove('lazy');
      img.classList.add('loaded');
    }

    // Handle lazy loading for other elements
    if (element.hasAttribute('data-lazy-component')) {
      element.classList.remove('lazy');
      element.classList.add('loaded');
      
      // Trigger custom event for component initialization
      element.dispatchEvent(new CustomEvent('lazy-loaded'));
    }
  }

  observe(element: Element) {
    if (this.observer) {
      this.elements.add(element);
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadElement(element);
    }
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const criticalFonts = [
    // Add your critical font URLs here
  ];

  criticalFonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = fontUrl;
    document.head.appendChild(link);
  });
}

/**
 * Optimize JavaScript bundle loading
 */
export function optimizeScriptLoading() {
  if (typeof window === 'undefined') return;

  // Defer non-critical scripts
  const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
  nonCriticalScripts.forEach(script => {
    const newScript = document.createElement('script');
    newScript.src = script.getAttribute('src') || '';
    newScript.defer = true;
    
    // Load after page load
    window.addEventListener('load', () => {
      document.head.appendChild(newScript);
    });
  });
}

/**
 * Image loading optimization with progressive enhancement
 */
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;

  const lazyLoader = new LazyLoader();

  // Initialize lazy loading for images
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach(img => {
    // Add intersection observer for better control
    lazyLoader.observe(img);
    
    // Add loading state classes
    img.classList.add('lazy-image');
    
    // Handle load events
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
    
    img.addEventListener('error', () => {
      img.classList.add('error');
      // You could add fallback image logic here
    });
  });

  return lazyLoader;
}

/**
 * Optimize CSS delivery
 */
export function optimizeCSSDelivery() {
  if (typeof window === 'undefined') return;

  // Load non-critical CSS asynchronously
  const nonCriticalCSS = document.querySelectorAll('link[data-non-critical]');
  nonCriticalCSS.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      // Load after page load
      window.addEventListener('load', () => {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = href;
        document.head.appendChild(newLink);
      });
    }
  });
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTiming(label: string) {
    this.metrics.set(`${label}_start`, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.set(label, duration);
      return duration;
    }
    return 0;
  }

  getMetric(label: string): number | undefined {
    return this.metrics.get(label);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  logMetrics() {
    if (typeof console !== 'undefined') {
      console.table(this.getAllMetrics());
    }
  }

  // Web Vitals monitoring
  measureWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.metrics.set('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.set('CLS', clsValue);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

/**
 * Resource hints for better loading performance
 */
export function addResourceHints(resources: Array<{ url: string; type: 'preload' | 'prefetch' | 'preconnect' }>) {
  if (typeof document === 'undefined') return;

  resources.forEach(({ url, type }) => {
    const link = document.createElement('link');
    link.rel = type;
    
    if (type === 'preload') {
      // Determine resource type from URL
      if (url.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        link.as = 'image';
      } else if (url.match(/\.(woff|woff2|ttf|otf)$/i)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (url.match(/\.(css)$/i)) {
        link.as = 'style';
      } else if (url.match(/\.(js)$/i)) {
        link.as = 'script';
      }
    }
    
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Initialize all performance optimizations
 */
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  const monitor = new PerformanceMonitor();
  
  // Start overall page load timing
  monitor.startTiming('pageLoad');
  
  // Initialize optimizations
  preloadCriticalResources();
  optimizeScriptLoading();
  const lazyLoader = optimizeImageLoading();
  optimizeCSSDelivery();
  
  // Measure web vitals
  monitor.measureWebVitals();
  
  // Complete page load timing
  window.addEventListener('load', () => {
    monitor.endTiming('pageLoad');
    
    // Log performance metrics in development
    if (import.meta.env.DEV) {
      setTimeout(() => monitor.logMetrics(), 1000);
    }
  });
  
  return { monitor, lazyLoader };
}