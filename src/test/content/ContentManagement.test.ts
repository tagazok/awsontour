import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { mockTrips } from '../mocks/tripData';
import { 
  validateTripData, 
  validateContentFormat, 
  generateValidationReport,
  tripSchema,
  validateAllTripsFromData,
  type TripValidationResult 
} from '../utils/contentValidationTest';

// Mock Astro's getCollection function for integration tests
const mockGetCollection = vi.fn();
vi.mock('astro:content', () => ({
  getCollection: mockGetCollection
}));

describe('Content Management Tests', () => {
  describe('Content Collection Schema Validation', () => {
    it('should validate a complete valid trip data structure', () => {
      const validTripData = {
        title: 'Test Adventure',
        description: 'A wonderful test journey through beautiful landscapes',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'completed',
        headerImage: '/images/test-header.jpg',
        stats: {
          kilometers: 500,
          activities: 5,
          peopleMet: 10,
          cities: 3,
          days: 15
        },
        route: {
          coordinates: [[40.7128, -74.0060], [41.8781, -87.6298]],
          waypoints: [
            { name: 'Start Point', coordinates: [40.7128, -74.0060] },
            { name: 'End Point', coordinates: [41.8781, -87.6298] }
          ]
        },
        gallery: [
          { image: '/images/gallery1.jpg', title: 'Mountain View', description: 'Beautiful scenery' },
          { image: '/images/gallery2.jpg' }
        ],
        activities: [
          { 
            name: 'Hiking', 
            description: 'Mountain hiking adventure', 
            date: new Date('2024-01-05'),
            registrationUrl: 'https://example.com/register',
            isPublic: true 
          },
          { 
            name: 'Photography', 
            description: 'Landscape photography session',
            isPublic: false 
          }
        ],
        participants: [
          { name: 'John Doe', photo: '/images/john.jpg', role: 'Guide' },
          { name: 'Jane Smith', role: 'Photographer' }
        ]
      };

      const result = validateTripData(validTripData, 'test-trip');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.tripId).toBe('test-trip');
    });

    it('should reject trip data with missing required fields', () => {
      const invalidTripData = {
        title: '', // Invalid: empty title
        // Missing description
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'invalid-status', // Invalid status
        headerImage: '',
        stats: {
          kilometers: -100, // Invalid: negative number
          activities: 5,
          peopleMet: 10,
          cities: 3,
          days: 0 // Invalid: must be at least 1
        },
        route: {
          coordinates: [[40.7128]], // Invalid: incomplete coordinate
          waypoints: [] // Invalid: must have at least 1 waypoint
        },
        gallery: [], // Invalid: must have at least 1 image
        activities: [
          { 
            name: '', // Invalid: empty name
            description: '', // Invalid: empty description
            registrationUrl: 'invalid-url' // Invalid URL format
          }
        ],
        participants: [
          { name: '' } // Invalid: empty name
        ]
      };

      const result = validateTripData(invalidTripData, 'invalid-trip');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.tripId).toBe('invalid-trip');
      
      // Check for specific validation errors
      expect(result.errors.some(error => error.includes('title'))).toBe(true);
      expect(result.errors.some(error => error.includes('description'))).toBe(true);
      expect(result.errors.some(error => error.includes('status'))).toBe(true);
      expect(result.errors.some(error => error.includes('kilometers'))).toBe(true);
      expect(result.errors.some(error => error.includes('days'))).toBe(true);
    });

    it('should validate coordinate ranges for route data', () => {
      const tripWithInvalidCoordinates = {
        title: 'Test Trip',
        description: 'A test trip with invalid coordinates',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'completed',
        headerImage: '/images/test.jpg',
        stats: {
          kilometers: 500,
          activities: 5,
          peopleMet: 10,
          cities: 3,
          days: 15
        },
        route: {
          coordinates: [
            [200, 100], // Invalid: longitude out of range
            [40.7128, -200] // Invalid: latitude out of range
          ],
          waypoints: [
            { name: 'Invalid Point', coordinates: [300, -100] } // Invalid coordinates
          ]
        },
        gallery: [{ image: '/images/test.jpg' }],
        activities: [],
        participants: []
      };

      const result = validateTripData(tripWithInvalidCoordinates, 'invalid-coords');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('longitude') && error.includes('out of range'))).toBe(true);
      expect(result.errors.some(error => error.includes('latitude') && error.includes('out of range'))).toBe(true);
    });

    it('should validate date logic and generate warnings for inconsistencies', () => {
      const tripWithDateIssues = {
        title: 'Date Issues Trip',
        description: 'A trip with date-related problems',
        startDate: new Date('2024-01-15'), // Start after end
        endDate: new Date('2024-01-01'),
        status: 'current',
        headerImage: '/images/test.jpg',
        stats: {
          kilometers: 500,
          activities: 5,
          peopleMet: 10,
          cities: 3,
          days: 50 // Doesn't match calculated days
        },
        route: {
          coordinates: [[40.7128, -74.0060], [41.8781, -87.6298]],
          waypoints: [{ name: 'Test', coordinates: [40.7128, -74.0060] }]
        },
        gallery: [{ image: '/images/test.jpg' }],
        activities: [],
        participants: []
      };

      const result = validateTripData(tripWithDateIssues, 'date-issues');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('startDate must be before endDate'))).toBe(true);
    });

    it('should generate warnings for status-date mismatches', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const tripWithStatusIssues = {
        title: 'Status Issues Trip',
        description: 'A trip with status-date mismatches',
        startDate: futureDate, // Future date but marked as current
        endDate: futureDate,
        status: 'current',
        headerImage: '/images/test.jpg',
        stats: {
          kilometers: 500,
          activities: 5,
          peopleMet: 10,
          cities: 3,
          days: 1
        },
        route: {
          coordinates: [[40.7128, -74.0060], [41.8781, -87.6298]],
          waypoints: [{ name: 'Test', coordinates: [40.7128, -74.0060] }]
        },
        gallery: [{ image: '/images/test.jpg' }],
        activities: [],
        participants: []
      };

      const result = validateTripData(tripWithStatusIssues, 'status-issues');
      
      expect(result.warnings.some(warning => 
        warning.includes('current') && warning.includes('future')
      )).toBe(true);
    });

    it('should validate image path formats and generate warnings', () => {
      const tripWithImageIssues = {
        title: 'Image Issues Trip',
        description: 'A trip with image path problems',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'completed',
        headerImage: 'images/test.jpg', // Missing leading slash
        stats: {
          kilometers: 500,
          activities: 5,
          peopleMet: 10,
          cities: 3,
          days: 15
        },
        route: {
          coordinates: [[40.7128, -74.0060], [41.8781, -87.6298]],
          waypoints: [{ name: 'Test', coordinates: [40.7128, -74.0060] }]
        },
        gallery: [
          { image: 'images/gallery1.jpg' }, // Missing leading slash
          { image: '/images/gallery2.jpg' } // Correct format
        ],
        activities: [],
        participants: []
      };

      const result = validateTripData(tripWithImageIssues, 'image-issues');
      
      expect(result.warnings.some(warning => 
        warning.includes('headerImage') && warning.includes('should start with "/"')
      )).toBe(true);
      expect(result.warnings.some(warning => 
        warning.includes('gallery[0].image') && warning.includes('should start with "/"')
      )).toBe(true);
    });
  });

  describe('Sample Content Loading and Display', () => {

    it('should successfully validate all mock trip data', () => {
      mockTrips.forEach(trip => {
        const result = validateTripData(trip.data, trip.id);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.tripId).toBe(trip.id);
      });
    });

    it('should handle different trip statuses correctly', () => {
      const statusTypes = ['completed', 'current', 'planned'];
      
      statusTypes.forEach(status => {
        const tripWithStatus = mockTrips.find(trip => trip.data.status === status);
        expect(tripWithStatus).toBeDefined();
        
        if (tripWithStatus) {
          const result = validateTripData(tripWithStatus.data, tripWithStatus.id);
          expect(result.isValid).toBe(true);
          expect(tripWithStatus.data.status).toBe(status);
        }
      });
    });

    it('should validate trip data structure matches expected schema', () => {
      mockTrips.forEach(trip => {
        // Verify all required fields are present
        expect(trip.data.title).toBeDefined();
        expect(trip.data.description).toBeDefined();
        expect(trip.data.startDate).toBeInstanceOf(Date);
        expect(trip.data.endDate).toBeInstanceOf(Date);
        expect(['completed', 'current', 'planned']).toContain(trip.data.status);
        expect(trip.data.headerImage).toBeDefined();
        expect(trip.data.stats).toBeDefined();
        expect(trip.data.route).toBeDefined();
        expect(Array.isArray(trip.data.gallery)).toBe(true);
        expect(Array.isArray(trip.data.activities)).toBe(true);
        expect(Array.isArray(trip.data.participants)).toBe(true);

        // Verify stats structure
        expect(typeof trip.data.stats.kilometers).toBe('number');
        expect(typeof trip.data.stats.activities).toBe('number');
        expect(typeof trip.data.stats.peopleMet).toBe('number');
        expect(typeof trip.data.stats.cities).toBe('number');
        expect(typeof trip.data.stats.days).toBe('number');

        // Verify route structure
        expect(Array.isArray(trip.data.route.coordinates)).toBe(true);
        expect(Array.isArray(trip.data.route.waypoints)).toBe(true);
        
        if (trip.data.route.coordinates.length > 0) {
          trip.data.route.coordinates.forEach(coord => {
            expect(Array.isArray(coord)).toBe(true);
            expect(coord).toHaveLength(2);
            expect(typeof coord[0]).toBe('number');
            expect(typeof coord[1]).toBe('number');
          });
        }
      });
    });

    it('should validate collection loading with provided data', () => {
      const results = validateAllTripsFromData(mockTrips);
      
      expect(results).toHaveLength(mockTrips.length);
      results.forEach(result => {
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should handle collection processing errors gracefully', () => {
      const invalidTripsData = [
        { id: 'invalid', data: null },
        { id: 'another-invalid', data: undefined }
      ];

      const results = validateAllTripsFromData(invalidTripsData);
      
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Content Validation Utilities and Error Handling', () => {
    it('should validate content format with proper frontmatter', () => {
      const validContent = `---
title: Test Trip
description: A wonderful test journey
startDate: 2024-01-01
endDate: 2024-01-15
status: completed
headerImage: /images/test.jpg
stats:
  kilometers: 500
  activities: 5
  peopleMet: 10
  cities: 3
  days: 15
route:
  coordinates: [[40.7128, -74.0060], [41.8781, -87.6298]]
  waypoints:
    - name: Start Point
      coordinates: [40.7128, -74.0060]
gallery:
  - image: /images/gallery1.jpg
    title: Mountain View
activities: []
participants: []
---

# Test Trip

This is a test trip with proper markdown content that provides detailed information about the journey.

## Highlights

- Beautiful mountain views
- Great weather
- Friendly locals

The trip was an amazing experience with lots of memorable moments.
`;

      const result = validateContentFormat(validContent, 'test-trip');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing frontmatter', () => {
      const invalidContent = `# Test Trip

This content is missing frontmatter.
`;

      const result = validateContentFormat(invalidContent, 'no-frontmatter');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('must start with frontmatter'))).toBe(true);
    });

    it('should detect unclosed frontmatter', () => {
      const invalidContent = `---
title: Test Trip
description: Missing closing frontmatter

# Test Trip

Content here.
`;

      const result = validateContentFormat(invalidContent, 'unclosed-frontmatter');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('properly closed with ---'))).toBe(true);
    });

    it('should generate warnings for missing markdown content', () => {
      const contentWithoutMarkdown = `---
title: Test Trip
description: A test trip
startDate: 2024-01-01
endDate: 2024-01-15
status: completed
headerImage: /images/test.jpg
stats:
  kilometers: 500
  activities: 5
  peopleMet: 10
  cities: 3
  days: 15
route:
  coordinates: [[40.7128, -74.0060]]
  waypoints:
    - name: Test
      coordinates: [40.7128, -74.0060]
gallery:
  - image: /images/test.jpg
activities: []
participants: []
---

`;

      const result = validateContentFormat(contentWithoutMarkdown, 'no-markdown');
      
      expect(result.warnings.some(warning => 
        warning.includes('No markdown content found')
      )).toBe(true);
    });

    it('should generate warnings for short content', () => {
      const shortContent = `---
title: Test Trip
description: A test trip
startDate: 2024-01-01
endDate: 2024-01-15
status: completed
headerImage: /images/test.jpg
stats:
  kilometers: 500
  activities: 5
  peopleMet: 10
  cities: 3
  days: 15
route:
  coordinates: [[40.7128, -74.0060]]
  waypoints:
    - name: Test
      coordinates: [40.7128, -74.0060]
gallery:
  - image: /images/test.jpg
activities: []
participants: []
---

# Short

Brief.
`;

      const result = validateContentFormat(shortContent, 'short-content');
      
      expect(result.warnings.some(warning => 
        warning.includes('very short')
      )).toBe(true);
    });

    it('should suggest adding main heading when missing', () => {
      const contentWithoutHeading = `---
title: Test Trip
description: A test trip
startDate: 2024-01-01
endDate: 2024-01-15
status: completed
headerImage: /images/test.jpg
stats:
  kilometers: 500
  activities: 5
  peopleMet: 10
  cities: 3
  days: 15
route:
  coordinates: [[40.7128, -74.0060]]
  waypoints:
    - name: Test
      coordinates: [40.7128, -74.0060]
gallery:
  - image: /images/test.jpg
activities: []
participants: []
---

This content doesn't have a main heading. It has plenty of text content to avoid the short content warning, but it's missing the main heading structure that would make it more readable and properly formatted.
`;

      const result = validateContentFormat(contentWithoutHeading, 'no-heading');
      
      expect(result.warnings.some(warning => 
        warning.includes('main heading')
      )).toBe(true);
    });

    it('should generate comprehensive validation reports', () => {
      const testResults: TripValidationResult[] = [
        {
          tripId: 'valid-trip',
          isValid: true,
          errors: [],
          warnings: []
        },
        {
          tripId: 'invalid-trip',
          isValid: false,
          errors: ['Missing required field: title', 'Invalid status value'],
          warnings: ['Image path should start with "/"']
        },
        {
          tripId: 'warning-trip',
          isValid: true,
          errors: [],
          warnings: ['Days calculation mismatch', 'Status-date inconsistency']
        }
      ];

      const report = generateValidationReport(testResults);
      
      expect(report).toContain('# Trip Content Validation Report');
      expect(report).toContain('Total trips: 3');
      expect(report).toContain('Valid trips: 2');
      expect(report).toContain('Invalid trips: 1');
      expect(report).toContain('Trips with warnings: 2');
      expect(report).toContain('## ❌ Invalid Trips');
      expect(report).toContain('## ⚠️ Trips with Warnings');
      expect(report).toContain('invalid-trip');
      expect(report).toContain('warning-trip');
      expect(report).toContain('Missing required field: title');
      expect(report).toContain('Days calculation mismatch');
    });

    it('should generate success report when all trips are valid', () => {
      const allValidResults: TripValidationResult[] = [
        {
          tripId: 'trip1',
          isValid: true,
          errors: [],
          warnings: []
        },
        {
          tripId: 'trip2',
          isValid: true,
          errors: [],
          warnings: []
        }
      ];

      const report = generateValidationReport(allValidResults);
      
      expect(report).toContain('## ✅ All trips are valid!');
      expect(report).toContain('All 2 trips passed validation');
    });

    it('should handle edge cases in validation utilities', () => {
      // Test with null/undefined data
      const result1 = validateTripData(null, 'null-data');
      expect(result1.isValid).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);

      const result2 = validateTripData(undefined, 'undefined-data');
      expect(result2.isValid).toBe(false);
      expect(result2.errors.length).toBeGreaterThan(0);

      // Test with empty object
      const result3 = validateTripData({}, 'empty-data');
      expect(result3.isValid).toBe(false);
      expect(result3.errors.length).toBeGreaterThan(0);
    });

    it('should validate Zod schema directly', () => {
      const validData = {
        title: 'Direct Schema Test',
        description: 'Testing the Zod schema directly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        status: 'completed',
        headerImage: '/images/test.jpg',
        stats: {
          kilometers: 500,
          activities: 5,
          peopleMet: 10,
          cities: 3,
          days: 15
        },
        route: {
          coordinates: [[40.7128, -74.0060], [41.8781, -87.6298]],
          waypoints: [{ name: 'Test', coordinates: [40.7128, -74.0060] }]
        },
        gallery: [{ image: '/images/test.jpg' }],
        activities: [],
        participants: []
      };

      expect(() => tripSchema.parse(validData)).not.toThrow();

      const invalidData = { ...validData, status: 'invalid' };
      expect(() => tripSchema.parse(invalidData)).toThrow(z.ZodError);
    });
  });
});