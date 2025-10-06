import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockTrips } from '../mocks/tripData';
import {
  createTripHeaderHTML,
  createTripStatsHTML,
  createTripGalleryHTML,
  createActivityCardHTML,
  createPersonCardHTML,
  initializeLightboxScripts
} from '../utils/tripDetailHelpers';
import type { TripStats, TripGalleryItem, TripActivity, TripParticipant } from '../../types/trip';

describe('Trip Detail Components', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Clear any existing event listeners
    (window as any).lightboxFunctions = undefined;
  });

  describe('TripHeader Component', () => {
    describe('Basic Rendering', () => {
      it('should render header with all required elements', () => {
        const trip = mockTrips[0];
        const headerHTML = createTripHeaderHTML({
          title: trip.data.title,
          description: trip.data.description,
          headerImage: trip.data.headerImage
        });

        document.body.innerHTML = headerHTML;

        // Check main elements exist
        expect(document.querySelector('.trip-header')).toBeTruthy();
        expect(document.querySelector('.header-image-container')).toBeTruthy();
        expect(document.querySelector('.header-image')).toBeTruthy();
        expect(document.querySelector('.header-overlay')).toBeTruthy();
        expect(document.querySelector('.header-content')).toBeTruthy();
        expect(document.querySelector('.trip-title')).toBeTruthy();
        expect(document.querySelector('.trip-description')).toBeTruthy();
      });

      it('should display correct trip information', () => {
        const trip = mockTrips[0];
        const headerHTML = createTripHeaderHTML({
          title: trip.data.title,
          description: trip.data.description,
          headerImage: trip.data.headerImage
        });

        document.body.innerHTML = headerHTML;

        const title = document.querySelector('.trip-title');
        const description = document.querySelector('.trip-description');

        expect(title?.textContent).toBe(trip.data.title);
        expect(description?.textContent).toBe(trip.data.description);
      });

      it('should set correct image attributes', () => {
        const trip = mockTrips[0];
        const headerHTML = createTripHeaderHTML({
          title: trip.data.title,
          description: trip.data.description,
          headerImage: trip.data.headerImage
        });

        document.body.innerHTML = headerHTML;

        const image = document.querySelector('.header-image') as HTMLImageElement;
        expect(image).toBeTruthy();
        expect(image.src).toContain(trip.data.headerImage);
        expect(image.alt).toBe(`Header image for ${trip.data.title}`);
        expect(image.width).toBe(1200);
        expect(image.height).toBe(600);
      });
    });

    describe('Accessibility', () => {
      it('should have proper semantic structure', () => {
        const trip = mockTrips[0];
        const headerHTML = createTripHeaderHTML({
          title: trip.data.title,
          description: trip.data.description,
          headerImage: trip.data.headerImage
        });

        document.body.innerHTML = headerHTML;

        const section = document.querySelector('section');
        const heading = document.querySelector('h1');
        const paragraph = document.querySelector('p');

        expect(section).toBeTruthy();
        expect(heading).toBeTruthy();
        expect(paragraph).toBeTruthy();
      });

      it('should have descriptive alt text for header image', () => {
        const trip = mockTrips[0];
        const headerHTML = createTripHeaderHTML({
          title: trip.data.title,
          description: trip.data.description,
          headerImage: trip.data.headerImage
        });

        document.body.innerHTML = headerHTML;

        const image = document.querySelector('img');
        expect(image?.alt).toBe(`Header image for ${trip.data.title}`);
        expect(image?.alt.length).toBeGreaterThan(0);
      });
    });
  });

  describe('TripStats Component', () => {
    describe('Basic Rendering', () => {
      it('should render all statistics correctly', () => {
        const stats: TripStats = {
          kilometers: 1200,
          activities: 8,
          peopleMet: 15,
          cities: 5,
          days: 31
        };

        const statsHTML = createTripStatsHTML(stats);
        document.body.innerHTML = statsHTML;

        // Check main elements exist
        expect(document.querySelector('.trip-stats')).toBeTruthy();
        expect(document.querySelector('.stats-title')).toBeTruthy();
        expect(document.querySelector('.stats-grid')).toBeTruthy();

        // Check all stat items exist
        const statItems = document.querySelectorAll('.stat-item');
        expect(statItems).toHaveLength(5);

        // Check stat values
        const statValues = Array.from(document.querySelectorAll('.stat-value')).map(el => el.textContent);
        
        expect(statValues).toContain('1.2k km'); // kilometers formatted (over 1000 becomes k format)
        expect(statValues).toContain('8'); // activities
        expect(statValues).toContain('15'); // people met
        expect(statValues).toContain('5'); // cities
        expect(statValues).toContain('31 days'); // days formatted
      });

      it('should format large numbers correctly', () => {
        const stats: TripStats = {
          kilometers: 2500,
          activities: 1000,
          peopleMet: 1234,
          cities: 50,
          days: 365
        };

        const statsHTML = createTripStatsHTML(stats);
        document.body.innerHTML = statsHTML;

        const statValues = Array.from(document.querySelectorAll('.stat-value')).map(el => el.textContent);
        expect(statValues).toContain('2.5k km'); // kilometers over 1000
        expect(statValues).toContain('1,000'); // activities with comma
        expect(statValues).toContain('1,234'); // people met with comma
        expect(statValues).toContain('365 days'); // days plural
      });

      it('should handle single day correctly', () => {
        const stats: TripStats = {
          kilometers: 100,
          activities: 1,
          peopleMet: 2,
          cities: 1,
          days: 1
        };

        const statsHTML = createTripStatsHTML(stats);
        document.body.innerHTML = statsHTML;

        const statValues = Array.from(document.querySelectorAll('.stat-value')).map(el => el.textContent);
        expect(statValues).toContain('1 day'); // singular day
      });
    });

    describe('Visual Elements', () => {
      it('should include icons for each statistic', () => {
        const stats = mockTrips[0].data.stats;
        const statsHTML = createTripStatsHTML(stats);
        document.body.innerHTML = statsHTML;

        const icons = document.querySelectorAll('.stat-icon svg');
        expect(icons).toHaveLength(5);

        // Check that each icon has proper SVG structure
        icons.forEach(icon => {
          expect(icon.getAttribute('width')).toBe('24');
          expect(icon.getAttribute('height')).toBe('24');
          expect(icon.getAttribute('viewBox')).toBe('0 0 24 24');
        });
      });

      it('should have proper labels for each statistic', () => {
        const stats = mockTrips[0].data.stats;
        const statsHTML = createTripStatsHTML(stats);
        document.body.innerHTML = statsHTML;

        const labels = Array.from(document.querySelectorAll('.stat-label')).map(el => el.textContent);
        expect(labels).toContain('Distance Traveled');
        expect(labels).toContain('Activities');
        expect(labels).toContain('People Met');
        expect(labels).toContain('Cities Visited');
        expect(labels).toContain('Duration');
      });
    });
  });

  describe('TripGallery Component', () => {
    const mockGallery: TripGalleryItem[] = [
      { image: '/images/gallery1.jpg', title: 'Mountain View', description: 'Beautiful mountain scenery' },
      { image: '/images/gallery2.jpg', title: 'City Lights', description: 'Urban nightscape' },
      { image: '/images/gallery3.jpg' } // No title or description
    ];

    describe('Basic Rendering', () => {
      it('should render gallery with all images', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        // Check main elements exist
        expect(document.querySelector('.trip-gallery')).toBeTruthy();
        expect(document.querySelector('.gallery-title')).toBeTruthy();
        expect(document.querySelector('.gallery-grid')).toBeTruthy();

        // Check all gallery items exist
        const galleryItems = document.querySelectorAll('.gallery-item');
        expect(galleryItems).toHaveLength(3);

        // Check images
        const images = document.querySelectorAll('.gallery-image');
        expect(images).toHaveLength(3);
      });

      it('should display image information when available', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        // First image has title and description
        const firstItem = document.querySelector('.gallery-item[data-index="0"]');
        expect(firstItem?.querySelector('.image-title')?.textContent).toBe('Mountain View');
        expect(firstItem?.querySelector('.image-description')?.textContent).toBe('Beautiful mountain scenery');

        // Third image has no title or description
        const thirdItem = document.querySelector('.gallery-item[data-index="2"]');
        expect(thirdItem?.querySelector('.image-info')).toBeFalsy();
      });

      it('should generate proper alt text for images', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        const images = document.querySelectorAll('.gallery-image') as NodeListOf<HTMLImageElement>;
        
        // Image with title
        expect(images[0].alt).toBe('Mountain View');
        
        // Image without title should use fallback
        expect(images[2].alt).toBe('Test Trip photo 3');
      });
    });

    describe('Lightbox Functionality', () => {
      it('should render lightbox modal', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        // Check lightbox elements exist
        expect(document.querySelector('#lightbox')).toBeTruthy();
        expect(document.querySelector('.lightbox-close')).toBeTruthy();
        expect(document.querySelector('#lightbox-image')).toBeTruthy();
        expect(document.querySelector('#lightbox-title')).toBeTruthy();
        expect(document.querySelector('#lightbox-description')).toBeTruthy();
        expect(document.querySelector('.lightbox-prev')).toBeTruthy();
        expect(document.querySelector('.lightbox-next')).toBeTruthy();
      });

      it('should have lightbox triggers for each image', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        const triggers = document.querySelectorAll('.lightbox-trigger');
        expect(triggers).toHaveLength(3);

        // Check data-index attributes
        triggers.forEach((trigger, index) => {
          expect(trigger.getAttribute('data-index')).toBe(index.toString());
        });
      });

      it('should initialize lightbox functionality', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;
        
        initializeLightboxScripts(mockGallery);

        // Check that lightbox functions are available
        expect((window as any).lightboxFunctions).toBeDefined();
        expect(typeof (window as any).lightboxFunctions.openLightbox).toBe('function');
        expect(typeof (window as any).lightboxFunctions.closeLightbox).toBe('function');
      });

      it('should open lightbox when trigger is clicked', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;
        
        initializeLightboxScripts(mockGallery);

        const firstTrigger = document.querySelector('.lightbox-trigger[data-index="0"]') as HTMLButtonElement;
        const lightbox = document.getElementById('lightbox');

        // Initially hidden
        expect(lightbox?.classList.contains('active')).toBe(false);

        // Click trigger
        firstTrigger.click();

        // Should be active
        expect(lightbox?.classList.contains('active')).toBe(true);
        expect(lightbox?.getAttribute('aria-hidden')).toBe('false');
      });
    });

    describe('Image Loading and Fallback', () => {
      it('should set lazy loading for gallery images', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        const images = document.querySelectorAll('.gallery-image') as NodeListOf<HTMLImageElement>;
        images.forEach(image => {
          expect(image.loading).toBe('lazy');
        });
      });

      it('should handle missing image gracefully', () => {
        const galleryWithMissingImage: TripGalleryItem[] = [
          { image: '', title: 'Missing Image' }
        ];

        const galleryHTML = createTripGalleryHTML(galleryWithMissingImage, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        const image = document.querySelector('.gallery-image') as HTMLImageElement;
        expect(image.getAttribute('src')).toBe(''); // Should handle empty src
      });
    });

    describe('Accessibility', () => {
      it('should have proper ARIA labels', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        const triggers = document.querySelectorAll('.lightbox-trigger');
        triggers.forEach(trigger => {
          expect(trigger.getAttribute('aria-label')).toBe('View full size image');
        });

        const lightbox = document.getElementById('lightbox');
        expect(lightbox?.getAttribute('aria-hidden')).toBe('true');
      });

      it('should have navigation button labels', () => {
        const galleryHTML = createTripGalleryHTML(mockGallery, 'Test Trip');
        document.body.innerHTML = galleryHTML;

        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');

        expect(closeBtn?.getAttribute('aria-label')).toBe('Close lightbox');
        expect(prevBtn?.getAttribute('aria-label')).toBe('Previous image');
        expect(nextBtn?.getAttribute('aria-label')).toBe('Next image');
      });
    });
  });

  describe('ActivityCard Component', () => {
    const mockActivities: TripActivity[] = [
      {
        name: 'Mountain Hiking',
        description: 'Challenging hike through mountain trails',
        date: new Date('2024-01-20'),
        registrationUrl: 'https://example.com/register',
        isPublic: true
      },
      {
        name: 'Private Dinner',
        description: 'Exclusive dinner with local family',
        isPublic: false
      },
      {
        name: 'Public Workshop',
        description: 'Open workshop for everyone',
        isPublic: true
        // No registration URL
      }
    ];

    describe('Basic Rendering', () => {
      it('should render all activities', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        // Check main elements exist
        expect(document.querySelector('.trip-activities')).toBeTruthy();
        expect(document.querySelector('.activities-title')).toBeTruthy();
        expect(document.querySelector('.activities-grid')).toBeTruthy();

        // Check all activity cards exist
        const activityCards = document.querySelectorAll('.activity-card');
        expect(activityCards).toHaveLength(3);
      });

      it('should display activity information correctly', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const activityNames = Array.from(document.querySelectorAll('.activity-name')).map(el => el.textContent);
        const activityDescriptions = Array.from(document.querySelectorAll('.activity-description')).map(el => el.textContent);

        expect(activityNames).toContain('Mountain Hiking');
        expect(activityNames).toContain('Private Dinner');
        expect(activityNames).toContain('Public Workshop');

        expect(activityDescriptions).toContain('Challenging hike through mountain trails');
        expect(activityDescriptions).toContain('Exclusive dinner with local family');
        expect(activityDescriptions).toContain('Open workshop for everyone');
      });
    });

    describe('Conditional Display Logic', () => {
      it('should show public badge for public activities', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const publicBadges = document.querySelectorAll('.public-badge');
        const privateBadges = document.querySelectorAll('.private-badge');

        expect(publicBadges).toHaveLength(2); // Two public activities
        expect(privateBadges).toHaveLength(1); // One private activity

        expect(publicBadges[0].textContent).toBe('Public Event');
        expect(privateBadges[0].textContent).toBe('Private');
      });

      it('should apply correct CSS classes based on activity type', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const activityCards = document.querySelectorAll('.activity-card');
        
        // First activity is public
        expect(activityCards[0].classList.contains('public')).toBe(true);
        expect(activityCards[0].classList.contains('private')).toBe(false);

        // Second activity is private
        expect(activityCards[1].classList.contains('private')).toBe(true);
        expect(activityCards[1].classList.contains('public')).toBe(false);
      });

      it('should show registration button for public activities with registration URL', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const registrationButtons = document.querySelectorAll('.registration-button');
        expect(registrationButtons).toHaveLength(1); // Only first activity has registration URL

        const button = registrationButtons[0] as HTMLAnchorElement;
        expect(button.href).toBe('https://example.com/register');
        expect(button.textContent?.trim()).toBe('Register Now');
        expect(button.target).toBe('_blank');
        expect(button.rel).toBe('noopener noreferrer');
      });

      it('should show "no registration required" for public activities without URL', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const noRegistration = document.querySelectorAll('.no-registration');
        expect(noRegistration).toHaveLength(1);
        expect(noRegistration[0].textContent).toBe('No registration required');
      });

      it('should not show registration section for private activities', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const activityCards = document.querySelectorAll('.activity-card');
        const privateCard = Array.from(activityCards).find(card => card.classList.contains('private'));
        
        expect(privateCard?.querySelector('.activity-actions')).toBeFalsy();
        expect(privateCard?.querySelector('.registration-button')).toBeFalsy();
        expect(privateCard?.querySelector('.no-registration')).toBeFalsy();
      });

      it('should display date when available', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const activityDates = document.querySelectorAll('.activity-date');
        expect(activityDates).toHaveLength(1); // Only first activity has date

        const dateText = activityDates[0].textContent?.trim();
        expect(dateText).toBe('Jan 20, 2024');
      });
    });

    describe('Accessibility', () => {
      it('should have proper semantic structure', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const section = document.querySelector('section');
        const headings = document.querySelectorAll('h2, h3');
        
        expect(section).toBeTruthy();
        expect(headings.length).toBeGreaterThan(0);
      });

      it('should have descriptive aria-labels for registration buttons', () => {
        const activitiesHTML = createActivityCardHTML(mockActivities);
        document.body.innerHTML = activitiesHTML;

        const registrationButton = document.querySelector('.registration-button');
        expect(registrationButton?.getAttribute('aria-label')).toBe('Register for Mountain Hiking');
      });
    });
  });

  describe('PersonCard Component', () => {
    const mockParticipants: TripParticipant[] = [
      {
        name: 'John Doe',
        photo: '/images/john.jpg',
        role: 'Tour Guide'
      },
      {
        name: 'Jane Smith',
        role: 'Photographer'
        // No photo
      },
      {
        name: 'Bob Wilson'
        // No photo, no role
      }
    ];

    describe('Basic Rendering', () => {
      it('should render all participants', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        // Check main elements exist
        expect(document.querySelector('.trip-participants')).toBeTruthy();
        expect(document.querySelector('.participants-title')).toBeTruthy();
        expect(document.querySelector('.participants-grid')).toBeTruthy();

        // Check all person cards exist
        const personCards = document.querySelectorAll('.person-card');
        expect(personCards).toHaveLength(3);
      });

      it('should display participant information correctly', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        const names = Array.from(document.querySelectorAll('.person-name')).map(el => el.textContent);
        const roles = Array.from(document.querySelectorAll('.person-role')).map(el => el.textContent);

        expect(names).toContain('John Doe');
        expect(names).toContain('Jane Smith');
        expect(names).toContain('Bob Wilson');

        expect(roles).toContain('Tour Guide');
        expect(roles).toContain('Photographer');
        expect(roles).toHaveLength(2); // Bob Wilson has no role
      });
    });

    describe('Image Loading and Fallback Behavior', () => {
      it('should display avatar image when photo is available', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        const avatarImages = document.querySelectorAll('.avatar-image');
        expect(avatarImages).toHaveLength(1); // Only John Doe has photo

        const johnImage = avatarImages[0] as HTMLImageElement;
        expect(johnImage.src).toContain('/images/john.jpg');
        expect(johnImage.alt).toBe('Photo of John Doe');
        expect(johnImage.width).toBe(80);
        expect(johnImage.height).toBe(80);
      });

      it('should display fallback avatar when photo is not available', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        const fallbackAvatars = document.querySelectorAll('.avatar-fallback');
        expect(fallbackAvatars).toHaveLength(2); // Jane Smith and Bob Wilson

        // Check initials
        const initials = Array.from(fallbackAvatars).map(el => el.textContent?.trim());
        expect(initials).toContain('JS'); // Jane Smith
        expect(initials).toContain('BW'); // Bob Wilson
      });

      it('should generate consistent colors for fallback avatars', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        const fallbackAvatars = document.querySelectorAll('.avatar-fallback') as NodeListOf<HTMLElement>;
        
        // Each avatar should have a background color
        fallbackAvatars.forEach(avatar => {
          const style = avatar.getAttribute('style');
          expect(style).toContain('background-color: #');
        });

        // Same name should generate same color (test with duplicate)
        const duplicateHTML = createPersonCardHTML([
          { name: 'Jane Smith' },
          { name: 'Jane Smith' }
        ]);
        document.body.innerHTML = duplicateHTML;

        const duplicateAvatars = document.querySelectorAll('.avatar-fallback') as NodeListOf<HTMLElement>;
        const color1 = duplicateAvatars[0].getAttribute('style');
        const color2 = duplicateAvatars[1].getAttribute('style');
        expect(color1).toBe(color2);
      });

      it('should generate proper initials from names', () => {
        const testParticipants: TripParticipant[] = [
          { name: 'John' }, // Single name
          { name: 'Mary Jane Watson' }, // Three names - should take first two
          { name: 'jean-claude van damme' }, // Lowercase with hyphens
        ];

        const participantsHTML = createPersonCardHTML(testParticipants);
        document.body.innerHTML = participantsHTML;

        const fallbackAvatars = document.querySelectorAll('.avatar-fallback');
        const initials = Array.from(fallbackAvatars).map(el => el.textContent?.trim());

        expect(initials).toContain('J'); // Single name
        expect(initials).toContain('MJ'); // First two words
        expect(initials).toContain('JV'); // Handles hyphens and case
      });
    });

    describe('Conditional Display', () => {
      it('should only show role when available', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        const personCards = document.querySelectorAll('.person-card');
        
        // John Doe has role
        const johnCard = personCards[0];
        expect(johnCard.querySelector('.person-role')).toBeTruthy();

        // Jane Smith has role
        const janeCard = personCards[1];
        expect(janeCard.querySelector('.person-role')).toBeTruthy();

        // Bob Wilson has no role
        const bobCard = personCards[2];
        expect(bobCard.querySelector('.person-role')).toBeFalsy();
      });

      it('should handle empty participants array', () => {
        const participantsHTML = createPersonCardHTML([]);
        document.body.innerHTML = participantsHTML;

        const personCards = document.querySelectorAll('.person-card');
        expect(personCards).toHaveLength(0);

        // Should still render the section structure
        expect(document.querySelector('.trip-participants')).toBeTruthy();
        expect(document.querySelector('.participants-title')).toBeTruthy();
      });
    });

    describe('Accessibility', () => {
      it('should have proper semantic structure', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        const section = document.querySelector('section');
        const headings = document.querySelectorAll('h2, h3');
        
        expect(section).toBeTruthy();
        expect(headings.length).toBeGreaterThan(0);
      });

      it('should have descriptive alt text for participant photos', () => {
        const participantsHTML = createPersonCardHTML(mockParticipants);
        document.body.innerHTML = participantsHTML;

        const avatarImage = document.querySelector('.avatar-image') as HTMLImageElement;
        expect(avatarImage.alt).toBe('Photo of John Doe');
        expect(avatarImage.alt.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle components with various data scenarios', () => {
      // Test with minimal data
      const minimalTrip = {
        title: 'Minimal Trip',
        description: 'Basic description',
        headerImage: '/images/minimal.jpg'
      };

      const minimalStats: TripStats = {
        kilometers: 0,
        activities: 0,
        peopleMet: 0,
        cities: 0,
        days: 1
      };

      const headerHTML = createTripHeaderHTML(minimalTrip);
      const statsHTML = createTripStatsHTML(minimalStats);
      const galleryHTML = createTripGalleryHTML([], 'Minimal Trip');
      const activitiesHTML = createActivityCardHTML([]);
      const participantsHTML = createPersonCardHTML([]);

      document.body.innerHTML = headerHTML + statsHTML + galleryHTML + activitiesHTML + participantsHTML;

      // Should render without errors
      expect(document.querySelector('.trip-header')).toBeTruthy();
      expect(document.querySelector('.trip-stats')).toBeTruthy();
      expect(document.querySelector('.trip-gallery')).toBeTruthy();
      expect(document.querySelector('.trip-activities')).toBeTruthy();
      expect(document.querySelector('.trip-participants')).toBeTruthy();

      // Empty arrays should not break rendering
      expect(document.querySelectorAll('.gallery-item')).toHaveLength(0);
      expect(document.querySelectorAll('.activity-card')).toHaveLength(0);
      expect(document.querySelectorAll('.person-card')).toHaveLength(0);
    });

    it('should handle components with maximum data scenarios', () => {
      const maxTrip = mockTrips[0].data;
      
      const headerHTML = createTripHeaderHTML({
        title: maxTrip.title,
        description: maxTrip.description,
        headerImage: maxTrip.headerImage
      });
      const statsHTML = createTripStatsHTML(maxTrip.stats);
      const galleryHTML = createTripGalleryHTML(maxTrip.gallery, maxTrip.title);
      const activitiesHTML = createActivityCardHTML(maxTrip.activities);
      const participantsHTML = createPersonCardHTML(maxTrip.participants);

      document.body.innerHTML = headerHTML + statsHTML + galleryHTML + activitiesHTML + participantsHTML;

      // All components should render with full data
      expect(document.querySelector('.trip-title')?.textContent).toBe(maxTrip.title);
      expect(document.querySelectorAll('.stat-item')).toHaveLength(5);
      expect(document.querySelectorAll('.gallery-item')).toHaveLength(maxTrip.gallery.length);
      expect(document.querySelectorAll('.activity-card')).toHaveLength(maxTrip.activities.length);
      expect(document.querySelectorAll('.person-card')).toHaveLength(maxTrip.participants.length);
    });
  });
});