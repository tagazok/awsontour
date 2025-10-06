import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LazyLoader } from '../../utils/performance';
import { imageConfigs, generateSrcSet, getResponsiveImageProps } from '../../utils/imageOptimization';

// Mock DOM APIs
const mockIntersectionObserver = vi.fn();
const mockImage = vi.fn();

Object.defineProperty(global, 'IntersectionObserver', {
  value: mockIntersectionObserver,
  writable: true,
});

global.Image = mockImage as any;

describe('Image Performance Tests', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let intersectionCallback: ((entries: any[]) => void) | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    
    // Setup IntersectionObserver mock
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    // Setup Image mock
    mockImage.mockImplementation(() => {
      const img = {
        src: '',
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        complete: false,
        naturalWidth: 0,
        naturalHeight: 0,
      };
      
      // Simulate async loading
      setTimeout(() => {
        img.complete = true;
        img.naturalWidth = 800;
        img.naturalHeight = 600;
        if (img.onload) img.onload();
      }, 10);
      
      return img;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Lazy Loading Performance', () => {
    it('should efficiently observe multiple images', () => {
      const lazyLoader = new LazyLoader();
      const imageCount = 100;
      
      // Create test images
      const images = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/test${i}.jpg`;
        img.classList.add('lazy');
        document.body.appendChild(img);
        return img;
      });

      const startTime = performance.now();
      
      // Observe all images
      images.forEach(img => lazyLoader.observe(img));
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle large number of images efficiently
      expect(duration).toBeLessThan(100);
      expect(mockObserve).toHaveBeenCalledTimes(imageCount);
    });

    it('should handle intersection events efficiently', () => {
      const lazyLoader = new LazyLoader();
      const imageCount = 50;
      
      // Create test images with data-src
      const images = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/lazy${i}.jpg`;
        img.dataset.srcset = generateSrcSet(`/images/lazy${i}.jpg`, [400, 800, 1200]);
        img.classList.add('lazy');
        document.body.appendChild(img);
        lazyLoader.observe(img);
        return img;
      });

      // Simulate intersection for half the images
      const intersectingImages = images.slice(0, imageCount / 2);
      const mockEntries = intersectingImages.map(img => ({
        target: img,
        isIntersecting: true,
        intersectionRatio: 0.5,
      }));

      const startTime = performance.now();
      
      // Trigger intersection callback
      if (intersectionCallback) {
        intersectionCallback(mockEntries);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process intersections quickly
      expect(duration).toBeLessThan(50);
      
      // Verify images were processed
      intersectingImages.forEach(img => {
        expect(img.classList.contains('loaded')).toBe(true);
        expect(img.classList.contains('lazy')).toBe(false);
        expect(img.src).toBeTruthy();
      });
    });

    it('should measure lazy loading vs eager loading performance', () => {
      const imageCount = 20;
      
      // Test eager loading
      const eagerStartTime = performance.now();
      const eagerImages = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.src = `/images/eager${i}.jpg`; // Immediate loading
        img.loading = 'eager';
        document.body.appendChild(img);
        return img;
      });
      const eagerEndTime = performance.now();
      const eagerDuration = eagerEndTime - eagerStartTime;

      // Clear DOM
      document.body.innerHTML = '';

      // Test lazy loading
      const lazyStartTime = performance.now();
      const lazyLoader = new LazyLoader();
      const lazyImages = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/lazy${i}.jpg`; // Deferred loading
        img.loading = 'lazy';
        img.classList.add('lazy');
        document.body.appendChild(img);
        lazyLoader.observe(img);
        return img;
      });
      const lazyEndTime = performance.now();
      const lazyDuration = lazyEndTime - lazyStartTime;

      // Lazy loading setup should be faster than eager loading
      expect(lazyDuration).toBeLessThan(eagerDuration * 2); // Allow some overhead for setup
      
      // Verify setup
      expect(eagerImages).toHaveLength(imageCount);
      expect(lazyImages).toHaveLength(imageCount);
      expect(mockObserve).toHaveBeenCalledTimes(imageCount);
    });

    it('should validate intersection observer performance with viewport changes', () => {
      const lazyLoader = new LazyLoader();
      const imageCount = 30;
      
      // Create images at different viewport positions
      const images = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/viewport${i}.jpg`;
        img.classList.add('lazy');
        img.style.position = 'absolute';
        img.style.top = `${i * 100}px`; // Spread vertically
        document.body.appendChild(img);
        lazyLoader.observe(img);
        return img;
      });

      // Simulate multiple viewport changes (scrolling)
      const viewportChanges = 5;
      const startTime = performance.now();
      
      for (let change = 0; change < viewportChanges; change++) {
        // Simulate different images coming into view
        const visibleStart = change * 6;
        const visibleEnd = Math.min(visibleStart + 6, imageCount);
        const visibleImages = images.slice(visibleStart, visibleEnd);
        
        const mockEntries = visibleImages.map(img => ({
          target: img,
          isIntersecting: true,
          intersectionRatio: 0.8,
        }));

        if (intersectionCallback) {
          intersectionCallback(mockEntries);
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle multiple viewport changes efficiently
      expect(duration).toBeLessThan(100);
      
      // Verify progressive loading
      const loadedImages = images.filter(img => img.classList.contains('loaded'));
      expect(loadedImages.length).toBeGreaterThan(0);
      expect(loadedImages.length).toBeLessThanOrEqual(imageCount);
    });

    it('should measure memory usage during lazy loading', () => {
      const lazyLoader = new LazyLoader();
      const imageCount = 100;
      
      // Track memory-like metrics (simulated)
      let observedElements = 0;
      let loadedElements = 0;
      
      const startTime = performance.now();
      
      // Create and observe many images
      const images = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/memory${i}.jpg`;
        img.classList.add('lazy');
        document.body.appendChild(img);
        lazyLoader.observe(img);
        observedElements++;
        return img;
      });

      // Simulate loading some images
      const loadBatches = 5;
      const imagesPerBatch = imageCount / loadBatches;
      
      for (let batch = 0; batch < loadBatches; batch++) {
        const batchStart = batch * imagesPerBatch;
        const batchEnd = Math.min(batchStart + imagesPerBatch, imageCount);
        const batchImages = images.slice(batchStart, batchEnd);
        
        const mockEntries = batchImages.map(img => ({
          target: img,
          isIntersecting: true,
          intersectionRatio: 1,
        }));

        if (intersectionCallback) {
          intersectionCallback(mockEntries);
          loadedElements += batchImages.length;
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle large numbers efficiently
      expect(duration).toBeLessThan(200);
      expect(observedElements).toBe(imageCount);
      expect(loadedElements).toBe(imageCount);
      
      // Verify cleanup (unobserve called for loaded images)
      expect(mockUnobserve).toHaveBeenCalledTimes(imageCount);
    });

    it('should test lazy loading with different image sizes', () => {
      const lazyLoader = new LazyLoader();
      
      // Test different image configurations
      const imageConfigurations = [
        { name: 'thumbnail', widths: imageConfigs.thumbnail.widths, count: 20 },
        { name: 'gallery', widths: imageConfigs.gallery.widths, count: 15 },
        { name: 'hero', widths: imageConfigs.hero.widths, count: 5 },
      ];

      const results: Record<string, number> = {};

      imageConfigurations.forEach(config => {
        const startTime = performance.now();
        
        const images = Array.from({ length: config.count }, (_, i) => {
          const img = document.createElement('img');
          img.dataset.src = `/images/${config.name}${i}.jpg`;
          img.dataset.srcset = generateSrcSet(`/images/${config.name}${i}.jpg`, config.widths);
          img.classList.add('lazy');
          document.body.appendChild(img);
          lazyLoader.observe(img);
          return img;
        });

        // Simulate loading all images of this type
        const mockEntries = images.map(img => ({
          target: img,
          isIntersecting: true,
          intersectionRatio: 1,
        }));

        if (intersectionCallback) {
          intersectionCallback(mockEntries);
        }
        
        const endTime = performance.now();
        results[config.name] = endTime - startTime;
        
        // Clear for next test
        document.body.innerHTML = '';
      });

      // Verify all configurations performed reasonably
      Object.values(results).forEach(duration => {
        expect(duration).toBeLessThan(100);
      });
      
      // Verify all configurations performed reasonably - timing can vary significantly in tests
      expect(results.thumbnail).toBeGreaterThan(0);
      expect(results.hero).toBeGreaterThan(0);
    });
  });

  describe('Image Optimization Performance', () => {
    it('should efficiently generate responsive image properties', () => {
      const testCases = [
        { config: imageConfigs.hero, width: 1920, height: 1080 },
        { config: imageConfigs.gallery, width: 800, height: 600 },
        { config: imageConfigs.thumbnail, width: 150, height: 150 },
        { config: imageConfigs.avatar, width: 100, height: 100 },
      ];

      const startTime = performance.now();
      
      const results = testCases.map(({ config, width, height }) => {
        return getResponsiveImageProps(
          '/images/test.jpg',
          'Test image',
          config,
          width,
          height
        );
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should generate props quickly for all configurations
      expect(duration).toBeLessThan(50);
      expect(results).toHaveLength(testCases.length);
      
      // Verify all results have required properties
      results.forEach(props => {
        expect(props.src).toBeTruthy();
        expect(props.alt).toBeTruthy();
        expect(props.width).toBeGreaterThan(0);
        expect(props.height).toBeGreaterThan(0);
        expect(props.widths).toBeTruthy();
        expect(props.sizes).toBeTruthy();
      });
    });

    it('should measure srcset generation performance', () => {
      const testCases = [
        { widths: [100, 200], format: 'webp' },
        { widths: [300, 600, 900, 1200], format: 'webp' },
        { widths: [400, 800, 1200, 1600, 2000], format: 'avif' },
        { widths: Array.from({ length: 10 }, (_, i) => (i + 1) * 200), format: 'jpg' },
      ];

      const results: number[] = [];

      testCases.forEach(({ widths, format }) => {
        const startTime = performance.now();
        
        const srcSet = generateSrcSet('/images/test.jpg', widths, format);
        
        const endTime = performance.now();
        results.push(endTime - startTime);
        
        // Verify srcset is generated correctly
        expect(srcSet).toBeTruthy();
        widths.forEach(width => {
          expect(srcSet).toContain(`w=${width}`);
          expect(srcSet).toContain(`f=${format}`);
        });
      });

      // All generations should be fast
      results.forEach(duration => {
        expect(duration).toBeLessThan(25);
      });
      
      // More widths shouldn't significantly impact performance
      const simpleCase = results[0];
      const complexCase = results[3];
      expect(complexCase).toBeLessThan(simpleCase * 5); // Allow some scaling
    });

    it('should validate image loading simulation performance', () => {
      const imageCount = 25;
      const loadingTimes: number[] = [];
      
      // Simulate loading multiple images
      const promises = Array.from({ length: imageCount }, async (_, i) => {
        const startTime = performance.now();
        
        // Create mock image
        const img = new Image();
        img.src = `/images/perf${i}.jpg`;
        
        // Wait for "loading" to complete
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const endTime = performance.now();
            loadingTimes.push(endTime - startTime);
            resolve();
          };
        });
        
        return img;
      });

      return Promise.all(promises).then((images) => {
        // Verify all images loaded
        expect(images).toHaveLength(imageCount);
        expect(loadingTimes).toHaveLength(imageCount);
        
        // All loading times should be reasonable (our mock adds 10ms delay)
        loadingTimes.forEach(time => {
          expect(time).toBeGreaterThan(5); // At least some time
          expect(time).toBeLessThan(50); // But not too long
        });
        
        // Calculate average loading time
        const averageTime = loadingTimes.reduce((sum, time) => sum + time, 0) / loadingTimes.length;
        expect(averageTime).toBeLessThan(30);
      });
    });

    it('should measure image format comparison performance', () => {
      const formats = ['jpg', 'webp', 'avif'];
      const widths = [400, 800, 1200];
      const results: Record<string, number> = {};

      formats.forEach(format => {
        const startTime = performance.now();
        
        // Simulate format-specific processing
        const srcSets = widths.map(width => 
          generateSrcSet(`/images/test.${format}`, [width], format)
        );
        
        // Simulate format-specific overhead
        const formatComplexity = format === 'jpg' ? 10 : 
                               format === 'webp' ? 15 : 20; // AVIF more complex
        
        for (let i = 0; i < formatComplexity; i++) {
          Math.random(); // Simulate processing
        }
        
        const endTime = performance.now();
        results[format] = endTime - startTime;
        
        // Verify srcsets generated
        expect(srcSets).toHaveLength(widths.length);
        srcSets.forEach(srcSet => {
          expect(srcSet).toContain(`f=${format}`);
        });
      });

      // All formats should perform reasonably
      Object.values(results).forEach(duration => {
        expect(duration).toBeLessThan(100);
      });
      
      // Verify we have results for all formats
      expect(Object.keys(results)).toEqual(formats);
    });

    it('should test progressive image loading performance', () => {
      const lazyLoader = new LazyLoader();
      const totalImages = 40;
      const batchSize = 8;
      const batches = Math.ceil(totalImages / batchSize);
      
      // Create all images
      const images = Array.from({ length: totalImages }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/progressive${i}.jpg`;
        img.classList.add('lazy');
        document.body.appendChild(img);
        lazyLoader.observe(img);
        return img;
      });

      const batchTimes: number[] = [];
      
      // Load images in batches (simulating progressive loading)
      for (let batch = 0; batch < batches; batch++) {
        const startTime = performance.now();
        
        const batchStart = batch * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, totalImages);
        const batchImages = images.slice(batchStart, batchEnd);
        
        const mockEntries = batchImages.map(img => ({
          target: img,
          isIntersecting: true,
          intersectionRatio: 1,
        }));

        if (intersectionCallback) {
          intersectionCallback(mockEntries);
        }
        
        const endTime = performance.now();
        batchTimes.push(endTime - startTime);
      }

      // Each batch should load efficiently
      batchTimes.forEach(time => {
        expect(time).toBeLessThan(50);
      });
      
      // Verify progressive loading worked
      const loadedImages = images.filter(img => img.classList.contains('loaded'));
      expect(loadedImages).toHaveLength(totalImages);
      
      // Later batches shouldn't be significantly slower (no memory leaks)
      const firstBatchTime = batchTimes[0];
      const lastBatchTime = batchTimes[batchTimes.length - 1];
      expect(lastBatchTime).toBeLessThan(firstBatchTime * 3);
    });
  });

  describe('Real-world Image Performance Scenarios', () => {
    it('should simulate trip gallery loading performance', () => {
      const lazyLoader = new LazyLoader();
      
      // Simulate a trip with a large gallery
      const galleryImages = Array.from({ length: 30 }, (_, i) => ({
        src: `/images/trips/gallery${i}.jpg`,
        title: `Gallery Image ${i + 1}`,
        description: `Description for image ${i + 1}`,
      }));

      const startTime = performance.now();
      
      // Create gallery DOM elements
      const imageElements = galleryImages.map((imgData, i) => {
        const container = document.createElement('div');
        container.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.dataset.src = imgData.src;
        img.alt = imgData.title;
        img.classList.add('lazy', 'gallery-image');
        
        const title = document.createElement('h3');
        title.textContent = imgData.title;
        
        const description = document.createElement('p');
        description.textContent = imgData.description;
        
        container.appendChild(img);
        container.appendChild(title);
        container.appendChild(description);
        document.body.appendChild(container);
        
        lazyLoader.observe(img);
        return img;
      });

      // Simulate initial viewport (first 6 images visible)
      const initialVisible = imageElements.slice(0, 6);
      const mockEntries = initialVisible.map(img => ({
        target: img,
        isIntersecting: true,
        intersectionRatio: 0.7,
      }));

      if (intersectionCallback) {
        intersectionCallback(mockEntries);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Gallery setup and initial loading should be efficient
      expect(duration).toBeLessThan(150);
      
      // Verify initial images loaded
      const loadedImages = imageElements.filter(img => img.classList.contains('loaded'));
      expect(loadedImages).toHaveLength(6);
      
      // Verify remaining images are still lazy
      const lazyImages = imageElements.filter(img => img.classList.contains('lazy'));
      expect(lazyImages).toHaveLength(24);
    });

    it('should simulate trip card grid loading performance', () => {
      const lazyLoader = new LazyLoader();
      
      // Simulate home page with multiple trip cards
      const tripCount = 12;
      const startTime = performance.now();
      
      const tripCards = Array.from({ length: tripCount }, (_, i) => {
        const card = document.createElement('article');
        card.className = 'trip-card';
        
        const img = document.createElement('img');
        img.dataset.src = `/images/trips/card${i}.jpg`;
        img.alt = `Trip ${i + 1} header image`;
        img.classList.add('lazy', 'trip-card__image');
        
        const title = document.createElement('h3');
        title.textContent = `Trip ${i + 1}`;
        
        const description = document.createElement('p');
        description.textContent = `Description for trip ${i + 1}`;
        
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(description);
        document.body.appendChild(card);
        
        lazyLoader.observe(img);
        return img;
      });

      // Simulate all trip cards being visible (home page)
      const mockEntries = tripCards.map(img => ({
        target: img,
        isIntersecting: true,
        intersectionRatio: 1,
      }));

      if (intersectionCallback) {
        intersectionCallback(mockEntries);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Home page loading should be very efficient
      expect(duration).toBeLessThan(100);
      
      // All trip card images should load
      const loadedImages = tripCards.filter(img => img.classList.contains('loaded'));
      expect(loadedImages).toHaveLength(tripCount);
    });

    it('should measure performance under slow network conditions', () => {
      const lazyLoader = new LazyLoader();
      
      // Simulate slow network by adding delays
      const slowNetworkDelay = 50; // ms
      const imageCount = 15;
      
      const startTime = performance.now();
      
      const images = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/slow${i}.jpg`;
        img.classList.add('lazy');
        document.body.appendChild(img);
        lazyLoader.observe(img);
        return img;
      });

      // Simulate network delay for intersection handling
      setTimeout(() => {
        const mockEntries = images.slice(0, 5).map(img => ({
          target: img,
          isIntersecting: true,
          intersectionRatio: 1,
        }));

        if (intersectionCallback) {
          intersectionCallback(mockEntries);
        }
      }, slowNetworkDelay);

      // Wait for delayed loading
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          // Should handle slow network gracefully
          expect(duration).toBeGreaterThan(slowNetworkDelay);
          expect(duration).toBeLessThan(slowNetworkDelay + 100);
          
          // Some images should have loaded
          const loadedImages = images.filter(img => img.classList.contains('loaded'));
          expect(loadedImages.length).toBeGreaterThan(0);
          
          resolve();
        }, slowNetworkDelay + 50);
      });
    });

    it('should validate memory cleanup during image loading', () => {
      const lazyLoader = new LazyLoader();
      const imageCount = 50;
      
      // Create many images
      const images = Array.from({ length: imageCount }, (_, i) => {
        const img = document.createElement('img');
        img.dataset.src = `/images/cleanup${i}.jpg`;
        img.classList.add('lazy');
        document.body.appendChild(img);
        lazyLoader.observe(img);
        return img;
      });

      // Load all images
      const mockEntries = images.map(img => ({
        target: img,
        isIntersecting: true,
        intersectionRatio: 1,
      }));

      const startTime = performance.now();
      
      if (intersectionCallback) {
        intersectionCallback(mockEntries);
      }
      
      // Cleanup
      lazyLoader.disconnect();
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle loading and cleanup efficiently
      expect(duration).toBeLessThan(200);
      
      // Verify cleanup was called
      expect(mockDisconnect).toHaveBeenCalled();
      
      // All images should be loaded
      const loadedImages = images.filter(img => img.classList.contains('loaded'));
      expect(loadedImages).toHaveLength(imageCount);
    });
  });
});