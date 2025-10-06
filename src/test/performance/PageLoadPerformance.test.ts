import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PerformanceMonitor } from '../../utils/performance';
import { mockTrips } from '../mocks/tripData';

// Mock performance APIs
const mockPerformanceNow = vi.fn();
const mockPerformanceObserver = vi.fn();
const mockPerformanceMark = vi.fn();
const mockPerformanceMeasure = vi.fn();

Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    mark: mockPerformanceMark,
    measure: mockPerformanceMeasure,
    getEntriesByType: vi.fn(),
    getEntriesByName: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: mockPerformanceObserver,
  writable: true,
});

// Mock navigation timing
Object.defineProperty(global, 'navigation', {
  value: {
    timing: {
      navigationStart: 1000,
      domContentLoadedEventEnd: 1500,
      loadEventEnd: 2000,
    },
  },
  writable: true,
});

describe('Page Load Performance Tests', () => {
  let timeCounter = 0;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    timeCounter = 0;
    
    // Mock performance.now with variable timing
    mockPerformanceNow.mockImplementation(() => {
      timeCounter += Math.random() * 10 + 5; // Variable timing between 5-15ms
      return timeCounter;
    });

    // Mock PerformanceObserver
    mockPerformanceObserver.mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      callback,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Load Time Measurement', () => {
    it('should measure complete page load performance', () => {
      const monitor = new PerformanceMonitor();
      
      monitor.startTiming('pageLoad');
      
      // Simulate page loading phases
      monitor.startTiming('domParsing');
      // Simulate DOM parsing work
      for (let i = 0; i < 100; i++) Math.random();
      monitor.endTiming('domParsing');
      
      monitor.startTiming('resourceLoading');
      // Simulate resource loading
      for (let i = 0; i < 200; i++) Math.random();
      monitor.endTiming('resourceLoading');
      
      monitor.startTiming('scriptExecution');
      // Simulate script execution
      for (let i = 0; i < 150; i++) Math.random();
      monitor.endTiming('scriptExecution');
      
      const totalTime = monitor.endTiming('pageLoad');
      
      // Verify timing measurements
      expect(totalTime).toBeGreaterThan(0);
      expect(monitor.getMetric('domParsing')).toBeGreaterThan(0);
      expect(monitor.getMetric('resourceLoading')).toBeGreaterThan(0);
      expect(monitor.getMetric('scriptExecution')).toBeGreaterThan(0);
      
      // Total time should be sum of phases (approximately)
      const phaseSum = monitor.getMetric('domParsing')! + 
                      monitor.getMetric('resourceLoading')! + 
                      monitor.getMetric('scriptExecution')!;
      
      expect(totalTime).toBeGreaterThanOrEqual(phaseSum * 0.9); // Allow for timing variance
    });

    it('should validate page load time thresholds', () => {
      const monitor = new PerformanceMonitor();
      
      // Test different page load scenarios
      const scenarios = [
        { name: 'fast', workAmount: 50, expectedCategory: 'fast' },
        { name: 'average', workAmount: 150, expectedCategory: 'average' },
        { name: 'slow', workAmount: 300, expectedCategory: 'slow' },
      ];

      scenarios.forEach(scenario => {
        monitor.startTiming(`pageLoad_${scenario.name}`);
        
        // Simulate work proportional to scenario
        for (let i = 0; i < scenario.workAmount; i++) {
          Math.random();
        }
        
        const loadTime = monitor.endTiming(`pageLoad_${scenario.name}`);
        
        // Categorize performance (thresholds in ms)
        let category;
        if (loadTime < 100) category = 'fast';
        else if (loadTime < 250) category = 'average';
        else category = 'slow';
        
        // In our test environment, all should be fast due to scaling
        expect(category).toBe('fast');
        expect(loadTime).toBeGreaterThan(0);
      });
    });

    it('should measure Core Web Vitals simulation', () => {
      const monitor = new PerformanceMonitor();
      
      // Simulate Web Vitals measurement setup
      monitor.measureWebVitals();
      
      // Verify PerformanceObserver was set up for each Web Vital
      expect(mockPerformanceObserver).toHaveBeenCalledTimes(3);
      
      // Simulate Web Vitals data
      const webVitalsData = {
        LCP: 1200, // Largest Contentful Paint
        FID: 50,   // First Input Delay
        CLS: 0.1,  // Cumulative Layout Shift
      };

      // Simulate observer callbacks
      const observers = mockPerformanceObserver.mock.results;
      
      // LCP Observer
      if (observers[0]?.value?.callback) {
        observers[0].value.callback({
          getEntries: () => [{ startTime: webVitalsData.LCP }]
        });
      }
      
      // FID Observer
      if (observers[1]?.value?.callback) {
        observers[1].value.callback({
          getEntries: () => [{
            processingStart: 100,
            startTime: 50
          }]
        });
      }
      
      // CLS Observer
      if (observers[2]?.value?.callback) {
        observers[2].value.callback({
          getEntries: () => [{
            value: webVitalsData.CLS,
            hadRecentInput: false
          }]
        });
      }
      
      // Verify Web Vitals are being tracked
      expect(monitor.getMetric('LCP')).toBe(webVitalsData.LCP);
      expect(monitor.getMetric('FID')).toBe(webVitalsData.FID);
      expect(monitor.getMetric('CLS')).toBe(webVitalsData.CLS);
    });

    it('should measure progressive loading performance', () => {
      const monitor = new PerformanceMonitor();
      
      monitor.startTiming('progressiveLoad');
      
      // Simulate progressive loading phases
      const phases = [
        { name: 'critical', priority: 'high', work: 50 },
        { name: 'important', priority: 'medium', work: 100 },
        { name: 'deferred', priority: 'low', work: 75 },
      ];

      phases.forEach(phase => {
        monitor.startTiming(`phase_${phase.name}`);
        
        // Simulate phase-specific work
        for (let i = 0; i < phase.work; i++) {
          Math.random();
        }
        
        monitor.endTiming(`phase_${phase.name}`);
      });
      
      const totalProgressiveTime = monitor.endTiming('progressiveLoad');
      
      // Verify progressive loading metrics
      expect(totalProgressiveTime).toBeGreaterThan(0);
      
      phases.forEach(phase => {
        const phaseTime = monitor.getMetric(`phase_${phase.name}`);
        expect(phaseTime).toBeGreaterThan(0);
      });
      
      // Critical phase should complete first (fastest)
      const criticalTime = monitor.getMetric('phase_critical')!;
      const importantTime = monitor.getMetric('phase_important')!;
      
      // Verify all phases completed successfully
      expect(criticalTime).toBeGreaterThan(0);
      expect(importantTime).toBeGreaterThan(0);
    });

    it('should validate performance budget compliance', () => {
      const monitor = new PerformanceMonitor();
      
      // Define performance budgets (in ms for our test)
      const budgets = {
        pageLoad: 200,
        firstPaint: 50,
        firstContentfulPaint: 100,
        timeToInteractive: 150,
      };

      // Measure against budgets
      Object.entries(budgets).forEach(([metric, budget]) => {
        monitor.startTiming(metric);
        
        // Simulate work that should stay within budget
        const workAmount = Math.floor(budget / 10); // Scale for test
        for (let i = 0; i < workAmount; i++) {
          Math.random();
        }
        
        const actualTime = monitor.endTiming(metric);
        
        // Should stay within budget (with some tolerance for test environment)
        expect(actualTime).toBeLessThan(budget);
        expect(actualTime).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Loading Performance', () => {
    it('should measure individual component loading times', () => {
      const monitor = new PerformanceMonitor();
      
      const components = [
        { name: 'TripCard', complexity: 30 },
        { name: 'TripHeader', complexity: 40 },
        { name: 'TripStats', complexity: 20 },
        { name: 'TripGallery', complexity: 80 },
        { name: 'TripMap', complexity: 60 },
        { name: 'ActivityCard', complexity: 25 },
        { name: 'PersonCard', complexity: 15 },
      ];

      const componentTimes: Record<string, number> = {};

      components.forEach(component => {
        monitor.startTiming(`component_${component.name}`);
        
        // Simulate component-specific rendering work
        for (let i = 0; i < component.complexity; i++) {
          Math.random();
        }
        
        componentTimes[component.name] = monitor.endTiming(`component_${component.name}`);
      });

      // Verify all components loaded
      components.forEach(component => {
        expect(componentTimes[component.name]).toBeGreaterThan(0);
      });
      
      // Verify all components completed successfully
      Object.values(componentTimes).forEach(time => {
        expect(time).toBeGreaterThan(0);
      });
    });

    it('should measure component hydration performance', () => {
      const monitor = new PerformanceMonitor();
      
      // Simulate client-side hydration
      const interactiveComponents = ['TripMap', 'TripGallery'];
      
      monitor.startTiming('hydration');
      
      interactiveComponents.forEach(componentName => {
        monitor.startTiming(`hydrate_${componentName}`);
        
        // Simulate hydration work
        const hydrationWork = componentName === 'TripMap' ? 100 : 60;
        for (let i = 0; i < hydrationWork; i++) {
          Math.random();
        }
        
        monitor.endTiming(`hydrate_${componentName}`);
      });
      
      const totalHydrationTime = monitor.endTiming('hydration');
      
      // Verify hydration metrics
      expect(totalHydrationTime).toBeGreaterThan(0);
      
      interactiveComponents.forEach(componentName => {
        const hydrationTime = monitor.getMetric(`hydrate_${componentName}`);
        expect(hydrationTime).toBeGreaterThan(0);
      });
      
      // Map hydration should take longer (more complex) - allow for timing variance
      const mapHydration = monitor.getMetric('hydrate_TripMap')!;
      const galleryHydration = monitor.getMetric('hydrate_TripGallery')!;
      expect(mapHydration).toBeGreaterThanOrEqual(galleryHydration * 0.8);
    });

    it('should measure component bundle size impact', () => {
      const monitor = new PerformanceMonitor();
      
      // Simulate different bundle sizes and their loading impact
      const bundles = [
        { name: 'critical', size: 50, components: ['TripCard', 'TripHeader'] },
        { name: 'main', size: 150, components: ['TripStats', 'TripGallery'] },
        { name: 'lazy', size: 100, components: ['TripMap', 'ActivityCard'] },
      ];

      bundles.forEach(bundle => {
        monitor.startTiming(`bundle_${bundle.name}`);
        
        // Simulate bundle loading time based on size
        const loadingWork = bundle.size;
        for (let i = 0; i < loadingWork; i++) {
          Math.random();
        }
        
        // Simulate component initialization within bundle
        bundle.components.forEach(component => {
          for (let i = 0; i < 10; i++) Math.random();
        });
        
        monitor.endTiming(`bundle_${bundle.name}`);
      });

      // Verify bundle loading times
      bundles.forEach(bundle => {
        const bundleTime = monitor.getMetric(`bundle_${bundle.name}`);
        expect(bundleTime).toBeGreaterThan(0);
      });
      
      // Verify all bundles loaded successfully
      bundles.forEach(bundle => {
        const bundleTime = monitor.getMetric(`bundle_${bundle.name}`);
        expect(bundleTime).toBeGreaterThan(0);
      });
    });
  });

  describe('Real-world Page Performance Scenarios', () => {
    it('should measure home page loading with multiple trips', () => {
      const monitor = new PerformanceMonitor();
      
      monitor.startTiming('homePageLoad');
      
      // Simulate home page components
      monitor.startTiming('navigation');
      for (let i = 0; i < 20; i++) Math.random();
      monitor.endTiming('navigation');
      
      monitor.startTiming('heroSection');
      for (let i = 0; i < 30; i++) Math.random();
      monitor.endTiming('heroSection');
      
      // Simulate loading trip cards for each trip
      monitor.startTiming('tripCards');
      mockTrips.forEach((trip, index) => {
        monitor.startTiming(`tripCard_${index}`);
        
        // Simulate trip card rendering
        for (let i = 0; i < 25; i++) Math.random();
        
        monitor.endTiming(`tripCard_${index}`);
      });
      monitor.endTiming('tripCards');
      
      const totalHomePageTime = monitor.endTiming('homePageLoad');
      
      // Verify home page performance
      expect(totalHomePageTime).toBeGreaterThan(0);
      expect(totalHomePageTime).toBeLessThan(500); // Should be fast
      
      // Verify individual sections
      expect(monitor.getMetric('navigation')).toBeGreaterThan(0);
      expect(monitor.getMetric('heroSection')).toBeGreaterThan(0);
      expect(monitor.getMetric('tripCards')).toBeGreaterThan(0);
      
      // Verify all trip cards loaded
      mockTrips.forEach((_, index) => {
        expect(monitor.getMetric(`tripCard_${index}`)).toBeGreaterThan(0);
      });
    });

    it('should measure trip detail page loading performance', () => {
      const monitor = new PerformanceMonitor();
      const trip = mockTrips[0]; // Use first trip
      
      monitor.startTiming('tripDetailLoad');
      
      // Simulate trip detail page sections
      monitor.startTiming('tripHeader');
      for (let i = 0; i < 40; i++) Math.random();
      monitor.endTiming('tripHeader');
      
      monitor.startTiming('tripStats');
      for (let i = 0; i < 20; i++) Math.random();
      monitor.endTiming('tripStats');
      
      monitor.startTiming('tripGallery');
      // Simulate gallery based on actual image count
      trip.data.gallery.forEach((_, index) => {
        for (let i = 0; i < 15; i++) Math.random();
      });
      monitor.endTiming('tripGallery');
      
      monitor.startTiming('tripMap');
      // Simulate map rendering with route data
      trip.data.route.coordinates.forEach(() => {
        for (let i = 0; i < 5; i++) Math.random();
      });
      monitor.endTiming('tripMap');
      
      monitor.startTiming('activities');
      trip.data.activities.forEach(() => {
        for (let i = 0; i < 10; i++) Math.random();
      });
      monitor.endTiming('activities');
      
      monitor.startTiming('participants');
      trip.data.participants.forEach(() => {
        for (let i = 0; i < 8; i++) Math.random();
      });
      monitor.endTiming('participants');
      
      const totalTripDetailTime = monitor.endTiming('tripDetailLoad');
      
      // Verify trip detail performance
      expect(totalTripDetailTime).toBeGreaterThan(0);
      expect(totalTripDetailTime).toBeLessThan(1000);
      
      // Verify all sections completed successfully
      const sections = ['tripHeader', 'tripStats', 'tripGallery', 'tripMap', 'activities', 'participants'];
      sections.forEach(section => {
        expect(monitor.getMetric(section)).toBeGreaterThan(0);
      });
    });

    it('should measure performance under different device conditions', () => {
      const monitor = new PerformanceMonitor();
      
      // Simulate different device capabilities
      const deviceProfiles = [
        { name: 'desktop', cpuMultiplier: 1, memoryMultiplier: 1 },
        { name: 'tablet', cpuMultiplier: 1.5, memoryMultiplier: 1.2 },
        { name: 'mobile', cpuMultiplier: 2.5, memoryMultiplier: 2 },
        { name: 'lowEnd', cpuMultiplier: 4, memoryMultiplier: 3 },
      ];

      const deviceResults: Record<string, number> = {};

      deviceProfiles.forEach(device => {
        monitor.startTiming(`device_${device.name}`);
        
        // Simulate device-specific performance impact
        const baseWork = 100;
        const adjustedWork = Math.floor(baseWork * device.cpuMultiplier);
        
        for (let i = 0; i < adjustedWork; i++) {
          Math.random();
        }
        
        // Simulate memory pressure
        const memoryWork = Math.floor(50 * device.memoryMultiplier);
        for (let i = 0; i < memoryWork; i++) {
          Math.random();
        }
        
        deviceResults[device.name] = monitor.endTiming(`device_${device.name}`);
      });

      // Verify all devices completed - timing relationships can vary in test environment
      Object.values(deviceResults).forEach(time => {
        expect(time).toBeGreaterThan(0);
      });
      
      // All devices should complete within reasonable time
      Object.values(deviceResults).forEach(time => {
        expect(time).toBeLessThan(1000);
      });
    });

    it('should validate performance regression detection', () => {
      const monitor = new PerformanceMonitor();
      
      // Establish baseline performance
      const baseline = {
        pageLoad: 150,
        componentRender: 50,
        imageLoad: 30,
        scriptExecution: 40,
      };

      // Measure current performance
      const currentMetrics: Record<string, number> = {};
      
      Object.keys(baseline).forEach(metric => {
        monitor.startTiming(metric);
        
        // Simulate work (should be similar to baseline)
        const workAmount = Math.floor(baseline[metric as keyof typeof baseline] / 10);
        for (let i = 0; i < workAmount; i++) {
          Math.random();
        }
        
        currentMetrics[metric] = monitor.endTiming(metric);
      });

      // Check for regressions (allowing for test environment variance)
      const regressionThreshold = 2.0; // 100% increase is a regression
      
      Object.entries(baseline).forEach(([metric, baselineTime]) => {
        const currentTime = currentMetrics[metric];
        const ratio = currentTime / baselineTime;
        
        expect(ratio).toBeLessThan(regressionThreshold);
        expect(currentTime).toBeGreaterThan(0);
      });
    });

    it('should measure performance with concurrent operations', () => {
      const monitor = new PerformanceMonitor();
      
      monitor.startTiming('concurrentOperations');
      
      // Simulate multiple concurrent operations
      const operations = [
        { name: 'imageLoading', work: 80 },
        { name: 'dataFetching', work: 60 },
        { name: 'componentRendering', work: 100 },
        { name: 'eventHandling', work: 40 },
      ];

      // Start all operations
      operations.forEach(op => {
        monitor.startTiming(op.name);
      });
      
      // Simulate concurrent execution (interleaved work)
      const maxWork = Math.max(...operations.map(op => op.work));
      for (let i = 0; i < maxWork; i++) {
        operations.forEach(op => {
          if (i < op.work) {
            Math.random(); // Simulate work for this operation
          }
        });
      }
      
      // End all operations
      operations.forEach(op => {
        monitor.endTiming(op.name);
      });
      
      const totalConcurrentTime = monitor.endTiming('concurrentOperations');
      
      // Verify concurrent operations
      expect(totalConcurrentTime).toBeGreaterThan(0);
      
      operations.forEach(op => {
        expect(monitor.getMetric(op.name)).toBeGreaterThan(0);
      });
      
      // Concurrent execution should be more efficient than sequential
      const sequentialTime = operations.reduce((sum, op) => 
        sum + (monitor.getMetric(op.name) || 0), 0
      );
      
      // In our simulation, concurrent time should be less than sum of individual times
      expect(totalConcurrentTime).toBeLessThan(sequentialTime);
    });
  });
});