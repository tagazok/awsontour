import { describe, it, expect, beforeEach } from 'vitest';
import { mockTrips } from '../mocks/tripData';
import { createTripCardHTML } from '../utils/domHelpers';

describe('TripCard Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Basic Rendering', () => {
    it('should render trip card with all required elements', () => {
      const trip = mockTrips[0];
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      // Check main elements exist
      expect(document.querySelector('.trip-card')).toBeTruthy();
      expect(document.querySelector('.trip-card__link')).toBeTruthy();
      expect(document.querySelector('.trip-card__image-container')).toBeTruthy();
      expect(document.querySelector('.trip-card__image')).toBeTruthy();
      expect(document.querySelector('.trip-card__content')).toBeTruthy();
      expect(document.querySelector('.trip-card__title')).toBeTruthy();
      expect(document.querySelector('.trip-card__description')).toBeTruthy();
      expect(document.querySelector('.trip-card__dates')).toBeTruthy();
      expect(document.querySelector('.trip-card__stats')).toBeTruthy();
    });

    it('should display correct trip information', () => {
      const trip = mockTrips[1]; // Completed Adventure
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const title = document.querySelector('.trip-card__title');
      const description = document.querySelector('.trip-card__description');
      const link = document.querySelector('.trip-card__link') as HTMLAnchorElement;

      expect(title?.textContent).toBe('Completed Adventure');
      expect(description?.textContent).toBe('A wonderful completed journey');
      expect(link.href).toContain('/trips/completed-trip');
    });

    it('should calculate and display correct trip duration', () => {
      const trip = mockTrips[0]; // 31 days duration
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const statValues = Array.from(document.querySelectorAll('.trip-card__stat-value'));
      const daysValue = statValues.find(el => 
        el.nextElementSibling?.textContent?.toLowerCase().includes('days')
      );

      expect(daysValue?.textContent).toBe('31');
    });
  });

  describe('Current Trip Highlighting', () => {
    it('should add current-trip class for current trips', () => {
      const currentTrip = mockTrips.find(trip => trip.data.status === 'current')!;
      const tripHTML = createTripCardHTML({
        slug: currentTrip.slug,
        title: currentTrip.data.title,
        description: currentTrip.data.description,
        status: currentTrip.data.status,
        startDate: currentTrip.data.startDate,
        endDate: currentTrip.data.endDate,
        headerImage: currentTrip.data.headerImage,
        stats: currentTrip.data.stats
      }, true);

      document.body.innerHTML = tripHTML;

      const tripCard = document.querySelector('.trip-card');
      expect(tripCard?.classList.contains('current-trip')).toBe(true);
    });

    it('should display current trip badge for current trips', () => {
      const currentTrip = mockTrips.find(trip => trip.data.status === 'current')!;
      const tripHTML = createTripCardHTML({
        slug: currentTrip.slug,
        title: currentTrip.data.title,
        description: currentTrip.data.description,
        status: currentTrip.data.status,
        startDate: currentTrip.data.startDate,
        endDate: currentTrip.data.endDate,
        headerImage: currentTrip.data.headerImage,
        stats: currentTrip.data.stats
      }, true);

      document.body.innerHTML = tripHTML;

      const badge = document.querySelector('.trip-card__current-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('Current Trip');
    });

    it('should not display current trip badge for non-current trips', () => {
      const completedTrip = mockTrips.find(trip => trip.data.status === 'completed')!;
      const tripHTML = createTripCardHTML({
        slug: completedTrip.slug,
        title: completedTrip.data.title,
        description: completedTrip.data.description,
        status: completedTrip.data.status,
        startDate: completedTrip.data.startDate,
        endDate: completedTrip.data.endDate,
        headerImage: completedTrip.data.headerImage,
        stats: completedTrip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const badge = document.querySelector('.trip-card__current-badge');
      const tripCard = document.querySelector('.trip-card');
      
      expect(badge).toBeFalsy();
      expect(tripCard?.classList.contains('current-trip')).toBe(false);
    });
  });

  describe('Statistics Display', () => {
    it('should display all four statistics correctly', () => {
      const trip = mockTrips[0];
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const stats = document.querySelectorAll('.trip-card__stat');
      expect(stats).toHaveLength(4);

      const statValues = Array.from(document.querySelectorAll('.trip-card__stat-value')).map(el => el.textContent);
      const statLabels = Array.from(document.querySelectorAll('.trip-card__stat-label')).map(el => el.textContent);

      // Check values
      expect(statValues).toContain('1200'); // kilometers
      expect(statValues).toContain('31'); // days (calculated)
      expect(statValues).toContain('5'); // cities
      expect(statValues).toContain('8'); // activities

      // Check labels
      expect(statLabels).toContain('km');
      expect(statLabels).toContain('days');
      expect(statLabels).toContain('cities');
      expect(statLabels).toContain('activities');
    });

    it('should handle different trip durations correctly', () => {
      const plannedTrip = mockTrips.find(trip => trip.data.status === 'planned')!;
      const tripHTML = createTripCardHTML({
        slug: plannedTrip.slug,
        title: plannedTrip.data.title,
        description: plannedTrip.data.description,
        status: plannedTrip.data.status,
        startDate: plannedTrip.data.startDate,
        endDate: plannedTrip.data.endDate,
        headerImage: plannedTrip.data.headerImage,
        stats: plannedTrip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const statValues = Array.from(document.querySelectorAll('.trip-card__stat-value'));
      const daysValue = statValues.find(el => 
        el.nextElementSibling?.textContent?.toLowerCase().includes('days')
      );

      // Planned trip is 14 days (June 1-15, 2024)
      expect(daysValue?.textContent).toBe('14');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in correct locale format', () => {
      const trip = mockTrips[0];
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const timeElements = document.querySelectorAll('time');
      expect(timeElements).toHaveLength(2);

      const startDate = timeElements[0];
      const endDate = timeElements[1];

      // Check datetime attributes
      expect(startDate.getAttribute('datetime')).toBe(trip.data.startDate.toISOString());
      expect(endDate.getAttribute('datetime')).toBe(trip.data.endDate.toISOString());

      // Check formatted text (should be in "Jan 15, 2024" format)
      expect(startDate.textContent).toMatch(/Jan 15, 2024/);
      expect(endDate.textContent).toMatch(/Feb 15, 2024/);
    });

    it('should include date separator', () => {
      const trip = mockTrips[0];
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const separator = document.querySelector('.trip-card__date-separator');
      expect(separator).toBeTruthy();
      expect(separator?.textContent).toBe('—');
    });
  });

  describe('Image Handling', () => {
    it('should set correct image attributes', () => {
      const trip = mockTrips[0];
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const image = document.querySelector('.trip-card__image') as HTMLImageElement;
      expect(image).toBeTruthy();
      expect(image.src).toContain(trip.data.headerImage);
      expect(image.alt).toBe(`${trip.data.title} header image`);
      expect(image.classList.contains('trip-card__image')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const trip = mockTrips[0];
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      // Check semantic HTML elements
      const article = document.querySelector('article');
      const heading = document.querySelector('h3');
      const timeElements = document.querySelectorAll('time');
      const link = document.querySelector('a');

      expect(article).toBeTruthy();
      expect(heading).toBeTruthy();
      expect(timeElements).toHaveLength(2);
      expect(link).toBeTruthy();

      // Check that time elements have datetime attributes
      timeElements.forEach(time => {
        expect(time.getAttribute('datetime')).toBeTruthy();
      });
    });

    it('should have descriptive alt text for images', () => {
      const trip = mockTrips[0];
      const tripHTML = createTripCardHTML({
        slug: trip.slug,
        title: trip.data.title,
        description: trip.data.description,
        status: trip.data.status,
        startDate: trip.data.startDate,
        endDate: trip.data.endDate,
        headerImage: trip.data.headerImage,
        stats: trip.data.stats
      });

      document.body.innerHTML = tripHTML;

      const image = document.querySelector('img');
      expect(image?.alt).toBe(`${trip.data.title} header image`);
      expect(image?.alt).toBeTruthy();
      expect(image?.alt.length).toBeGreaterThan(0);
    });
  });
});