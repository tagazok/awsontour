import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockTrips } from '../mocks/tripData';
import { createHomePageDOM, createTripCardHTML, initializeHomePageScripts } from '../utils/domHelpers';

describe('Home Page Components', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Trip Listing Functionality', () => {
    it('should display all trips in the grid', () => {
      const tripsHTML = mockTrips.map(trip => 
        createTripCardHTML({
          slug: trip.slug,
          title: trip.data.title,
          description: trip.data.description,
          status: trip.data.status,
          startDate: trip.data.startDate,
          endDate: trip.data.endDate,
          headerImage: trip.data.headerImage,
          stats: trip.data.stats
        })
      ).join('');

      createHomePageDOM(tripsHTML);

      const tripCards = document.querySelectorAll('.trip-card');
      expect(tripCards).toHaveLength(3);

      // Verify each trip is displayed with correct data
      const titles = Array.from(document.querySelectorAll('.trip-card__title')).map(el => el.textContent);
      expect(titles).toContain('Current Adventure');
      expect(titles).toContain('Completed Adventure');
      expect(titles).toContain('Future Adventure');
    });

    it('should display trip statistics correctly', () => {
      const trip = mockTrips[0]; // Current Adventure
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

      createHomePageDOM(tripHTML);

      const statValues = Array.from(document.querySelectorAll('.trip-card__stat-value')).map(el => el.textContent);
      expect(statValues).toContain('1200'); // kilometers
      expect(statValues).toContain('31'); // days (calculated duration)
      expect(statValues).toContain('5'); // cities
      expect(statValues).toContain('8'); // activities
    });

    it('should display formatted dates correctly', () => {
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

      createHomePageDOM(tripHTML);

      const timeElements = document.querySelectorAll('time');
      expect(timeElements).toHaveLength(2);
      
      // Check that dates are formatted properly
      const startDateText = timeElements[0].textContent;
      const endDateText = timeElements[1].textContent;
      
      expect(startDateText).toMatch(/Jan 15, 2024/);
      expect(endDateText).toMatch(/Feb 15, 2024/);
    });

    it('should handle empty trip list gracefully', () => {
      createHomePageDOM('');

      const tripCards = document.querySelectorAll('.trip-card');
      expect(tripCards).toHaveLength(0);

      const tripGrid = document.getElementById('trip-grid');
      expect(tripGrid).toBeTruthy();
      expect(tripGrid?.children).toHaveLength(0);
    });
  });

  describe('Current Trip Highlighting', () => {
    it('should highlight current trip with special styling', () => {
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

      createHomePageDOM(tripHTML, tripHTML);

      const currentTripCard = document.querySelector('.trip-card.current-trip');
      expect(currentTripCard).toBeTruthy();

      const currentBadge = document.querySelector('.trip-card__current-badge');
      expect(currentBadge).toBeTruthy();
      expect(currentBadge?.textContent).toBe('Current Trip');
    });

    it('should display current trip in special section', () => {
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

      createHomePageDOM('', tripHTML);

      const currentTripSection = document.querySelector('.current-trip-section');
      expect(currentTripSection).toBeTruthy();

      const sectionTitle = currentTripSection?.querySelector('.section-title');
      expect(sectionTitle?.textContent).toBe('Currently Traveling');
    });

    it('should not display current trip section when no current trip exists', () => {
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

      createHomePageDOM(tripHTML);

      const currentTripSection = document.querySelector('.current-trip-section');
      expect(currentTripSection).toBeFalsy();
    });
  });

  describe('Filtering and Sorting Functionality', () => {
    beforeEach(() => {
      const tripsHTML = mockTrips.map(trip => 
        createTripCardHTML({
          slug: trip.slug,
          title: trip.data.title,
          description: trip.data.description,
          status: trip.data.status,
          startDate: trip.data.startDate,
          endDate: trip.data.endDate,
          headerImage: trip.data.headerImage,
          stats: trip.data.stats
        })
      ).join('');

      createHomePageDOM(tripsHTML);
      initializeHomePageScripts();
    });

    it('should filter trips by status', () => {
      const completedButton = document.querySelector('[data-filter="completed"]') as HTMLButtonElement;
      completedButton.click();

      const visibleTrips = document.querySelectorAll('.trip-grid-item:not(.hidden)');
      const hiddenTrips = document.querySelectorAll('.trip-grid-item.hidden');

      expect(visibleTrips).toHaveLength(1);
      expect(hiddenTrips).toHaveLength(2);

      // Check that the visible trip is the completed one
      const visibleTitle = visibleTrips[0].querySelector('.trip-card__title')?.textContent;
      expect(visibleTitle).toBe('Completed Adventure');
    });

    it('should show all trips when "All Trips" filter is selected', () => {
      // First filter to completed
      const completedButton = document.querySelector('[data-filter="completed"]') as HTMLButtonElement;
      completedButton.click();

      // Then switch back to all
      const allButton = document.querySelector('[data-filter="all"]') as HTMLButtonElement;
      allButton.click();

      const visibleTrips = document.querySelectorAll('.trip-grid-item:not(.hidden)');
      const hiddenTrips = document.querySelectorAll('.trip-grid-item.hidden');

      expect(visibleTrips).toHaveLength(3);
      expect(hiddenTrips).toHaveLength(0);
    });

    it('should update active filter button state', () => {
      const plannedButton = document.querySelector('[data-filter="planned"]') as HTMLButtonElement;
      plannedButton.click();

      const activeButton = document.querySelector('.filter-btn.active');
      expect(activeButton).toBe(plannedButton);
      expect(activeButton?.textContent).toBe('Planned');

      // Check that other buttons are not active
      const allButton = document.querySelector('[data-filter="all"]');
      const completedButton = document.querySelector('[data-filter="completed"]');
      expect(allButton?.classList.contains('active')).toBe(false);
      expect(completedButton?.classList.contains('active')).toBe(false);
    });

    it('should sort trips by date (newest first)', () => {
      const sortSelect = document.getElementById('trip-sort') as HTMLSelectElement;
      sortSelect.value = 'date-desc';
      sortSelect.dispatchEvent(new Event('change'));

      const tripTitles = Array.from(document.querySelectorAll('.trip-card__title')).map(el => el.textContent);
      
      // Expected order: Future Adventure (2024-06-01), Current Adventure (2024-01-15), Completed Adventure (2023-06-01)
      expect(tripTitles[0]).toBe('Future Adventure');
      expect(tripTitles[1]).toBe('Current Adventure');
      expect(tripTitles[2]).toBe('Completed Adventure');
    });

    it('should sort trips by date (oldest first)', () => {
      const sortSelect = document.getElementById('trip-sort') as HTMLSelectElement;
      sortSelect.value = 'date-asc';
      sortSelect.dispatchEvent(new Event('change'));

      const tripTitles = Array.from(document.querySelectorAll('.trip-card__title')).map(el => el.textContent);
      
      // Expected order: Completed Adventure (2023-06-01), Current Adventure (2024-01-15), Future Adventure (2024-06-01)
      expect(tripTitles[0]).toBe('Completed Adventure');
      expect(tripTitles[1]).toBe('Current Adventure');
      expect(tripTitles[2]).toBe('Future Adventure');
    });

    it('should sort trips alphabetically', () => {
      const sortSelect = document.getElementById('trip-sort') as HTMLSelectElement;
      sortSelect.value = 'title';
      sortSelect.dispatchEvent(new Event('change'));

      const tripTitles = Array.from(document.querySelectorAll('.trip-card__title')).map(el => el.textContent);
      
      // Expected order: Completed Adventure, Current Adventure, Future Adventure
      expect(tripTitles[0]).toBe('Completed Adventure');
      expect(tripTitles[1]).toBe('Current Adventure');
      expect(tripTitles[2]).toBe('Future Adventure');
    });
  });

  describe('Responsive Card Layouts', () => {
    it('should render trip cards with proper structure', () => {
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

      createHomePageDOM(tripHTML);

      // Check card structure
      const tripCard = document.querySelector('.trip-card');
      expect(tripCard).toBeTruthy();

      const imageContainer = tripCard?.querySelector('.trip-card__image-container');
      expect(imageContainer).toBeTruthy();

      const content = tripCard?.querySelector('.trip-card__content');
      expect(content).toBeTruthy();

      const title = content?.querySelector('.trip-card__title');
      expect(title).toBeTruthy();

      const description = content?.querySelector('.trip-card__description');
      expect(description).toBeTruthy();

      const dates = content?.querySelector('.trip-card__dates');
      expect(dates).toBeTruthy();

      const stats = content?.querySelector('.trip-card__stats');
      expect(stats).toBeTruthy();
    });

    it('should have proper link structure for navigation', () => {
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

      createHomePageDOM(tripHTML);

      const tripLink = document.querySelector('.trip-card__link') as HTMLAnchorElement;
      expect(tripLink).toBeTruthy();
      expect(tripLink.href).toContain(`/trips/${trip.slug}`);
    });

    it('should display stats in a grid layout', () => {
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

      createHomePageDOM(tripHTML);

      const statsContainer = document.querySelector('.trip-card__stats');
      const statItems = statsContainer?.querySelectorAll('.trip-card__stat');
      
      expect(statItems).toHaveLength(4);

      // Check that each stat has value and label
      statItems?.forEach(stat => {
        const value = stat.querySelector('.trip-card__stat-value');
        const label = stat.querySelector('.trip-card__stat-label');
        
        expect(value).toBeTruthy();
        expect(label).toBeTruthy();
        expect(value?.textContent).toBeTruthy();
        expect(label?.textContent).toBeTruthy();
      });
    });

    it('should handle image attributes correctly', () => {
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

      createHomePageDOM(tripHTML);

      const image = document.querySelector('.trip-card__image') as HTMLImageElement;
      expect(image).toBeTruthy();
      expect(image.src).toContain(trip.data.headerImage);
      expect(image.alt).toBe(`${trip.data.title} header image`);
    });
  });
});