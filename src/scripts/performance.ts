/**
 * Client-side performance initialization script
 * This script runs on the client to initialize performance optimizations
 */

import { initializePerformanceOptimizations, addResourceHints } from '../utils/performance';

// Initialize performance optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all performance optimizations
  const { monitor, lazyLoader } = initializePerformanceOptimizations();

  // Add resource hints for critical resources
  const criticalResources = [
    // Preconnect to external domains if any
    // { url: 'https://fonts.googleapis.com', type: 'preconnect' as const },
    // { url: 'https://api.mapbox.com', type: 'preconnect' as const },
  ];

  if (criticalResources.length > 0) {
    addResourceHints(criticalResources);
  }

  // Enhanced lazy loading for gallery images
  const galleryImages = document.querySelectorAll('.gallery-image');
  galleryImages.forEach(img => {
    img.addEventListener('load', () => {
      img.classList.add('fade-in');
    });
  });

  // Optimize map loading (if present)
  const mapContainer = document.querySelector('#trip-map');
  if (mapContainer) {
    // Lazy load map when it comes into view
    lazyLoader?.observe(mapContainer);
    
    mapContainer.addEventListener('lazy-loaded', () => {
      // Initialize map here if needed
      console.log('Map container loaded');
    });
  }

  // Preload next/previous trip images on hover
  const tripLinks = document.querySelectorAll('.trip-card__link');
  tripLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const img = link.querySelector('img');
      if (img && img.dataset.preload) {
        const preloadImg = new Image();
        preloadImg.src = img.dataset.preload;
      }
    }, { once: true });
  });

  // Service Worker registration for caching (if available)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.log('Service Worker registration failed:', error);
    });
  }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause non-essential operations when page is hidden
    console.log('Page hidden - pausing non-essential operations');
  } else {
    // Resume operations when page becomes visible
    console.log('Page visible - resuming operations');
  }
});

// Handle connection changes for adaptive loading
if ('connection' in navigator) {
  const connection = (navigator as any).connection;
  
  const handleConnectionChange = () => {
    const { effectiveType, downlink } = connection;
    
    // Adjust image quality based on connection
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
      document.documentElement.classList.add('slow-connection');
    } else {
      document.documentElement.classList.remove('slow-connection');
    }
  };
  
  connection.addEventListener('change', handleConnectionChange);
  handleConnectionChange(); // Initial check
}

// Memory management for large galleries
const observeMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    // If memory usage is high, reduce image quality
    if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
      document.documentElement.classList.add('high-memory-usage');
    }
  }
};

// Check memory usage periodically
setInterval(observeMemoryUsage, 30000); // Every 30 seconds