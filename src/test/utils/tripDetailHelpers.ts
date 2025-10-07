/**
 * Helper functions for testing trip detail components
 */

import type { TripStats, TripGalleryItem, TripActivity, TripParticipant } from '../../types/trip';

/**
 * Create mock HTML for TripHeader component
 */
export function createTripHeaderHTML(props: {
  title: string;
  description: string;
  headerImage: string;
}): string {
  return `
    <section class="trip-header">
      <div class="header-image-container">
        <img
          src="${props.headerImage}"
          alt="Header image for ${props.title}"
          class="header-image"
          width="1200"
          height="600"
        />
        <div class="header-overlay">
          <div class="header-content">
            <h1 class="trip-title">${props.title}</h1>
            <p class="trip-description">${props.description}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Create mock HTML for TripStats component
 */
export function createTripStatsHTML(stats: TripStats): string {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatKilometers = (km: number): string => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(1)}k km`;
    }
    return `${formatNumber(km)} km`;
  };

  const formatDays = (days: number): string => {
    if (days === 1) return '1 day';
    return `${formatNumber(days)} days`;
  };

  return `
    <section class="trip-stats">
      <h2 class="stats-title">Trip Statistics</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">${formatKilometers(stats.kilometers)}</span>
            <span class="stat-label">Distance Traveled</span>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">${formatNumber(stats.activities)}</span>
            <span class="stat-label">Activities</span>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">${formatNumber(stats.peopleMet)}</span>
            <span class="stat-label">People Met</span>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">${formatNumber(stats.cities)}</span>
            <span class="stat-label">Cities Visited</span>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">${formatDays(stats.days)}</span>
            <span class="stat-label">Duration</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Create mock HTML for TripGallery component
 */
export function createTripGalleryHTML(gallery: TripGalleryItem[], tripTitle: string): string {
  const galleryItemsHTML = gallery.map((item, index) => `
    <div class="gallery-item" data-index="${index}">
      <div class="image-container">
        <img
          src="${item.image}"
          alt="${item.title || `${tripTitle} photo ${index + 1}`}"
          class="gallery-image"
          width="400"
          height="300"
          loading="lazy"
        />
        <div class="image-overlay">
          <button class="lightbox-trigger" data-index="${index}" aria-label="View full size image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
      ${(item.title || item.description) ? `
        <div class="image-info">
          ${item.title ? `<h3 class="image-title">${item.title}</h3>` : ''}
          ${item.description ? `<p class="image-description">${item.description}</p>` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');

  return `
    <section class="trip-gallery">
      <h2 class="gallery-title">Photo Gallery</h2>
      <div class="gallery-grid">
        ${galleryItemsHTML}
      </div>

      <!-- Lightbox Modal -->
      <div id="lightbox" class="lightbox" aria-hidden="true">
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close lightbox">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="lightbox-image-container">
            <img id="lightbox-image" src="" alt="" />
          </div>
          <div class="lightbox-info">
            <h3 id="lightbox-title"></h3>
            <p id="lightbox-description"></p>
          </div>
          <div class="lightbox-navigation">
            <button class="lightbox-prev" aria-label="Previous image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            <button class="lightbox-next" aria-label="Next image">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Create mock HTML for ActivityCard component
 */
export function createActivityCardHTML(activities: TripActivity[]): string {
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const activitiesHTML = activities.map((activity) => `
    <div class="activity-card ${activity.isPublic ? 'public' : 'private'}">
      <div class="activity-header">
        <h3 class="activity-name">${activity.name}</h3>
        ${activity.isPublic ? 
          '<span class="activity-badge public-badge">Public Event</span>' :
          '<span class="activity-badge private-badge">Private</span>'
        }
      </div>
      
      ${activity.date ? `
        <div class="activity-date">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${formatDate(activity.date)}</span>
        </div>
      ` : ''}

      <p class="activity-description">${activity.description}</p>

      ${activity.isPublic && activity.registrationUrl ? `
        <div class="activity-actions">
          <a 
            href="${activity.registrationUrl}" 
            class="registration-button"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register for ${activity.name}"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Register Now
          </a>
        </div>
      ` : activity.isPublic && !activity.registrationUrl ? `
        <div class="activity-actions">
          <span class="no-registration">No registration required</span>
        </div>
      ` : ''}
    </div>
  `).join('');

  return `
    <section class="trip-activities">
      <h2 class="activities-title">Activities & Events</h2>
      <div class="activities-grid">
        ${activitiesHTML}
      </div>
    </section>
  `;
}

/**
 * Create mock HTML for PersonCard component
 */
export function createPersonCardHTML(participants: TripParticipant[]): string {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
      '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const participantsHTML = participants.map((participant) => `
    <div class="person-card">
      <div class="person-avatar">
        ${participant.photo ? `
          <img
            src="${participant.photo}"
            alt="Photo of ${participant.name}"
            class="avatar-image"
            width="80"
            height="80"
          />
        ` : `
          <div 
            class="avatar-fallback"
            style="background-color: ${getAvatarColor(participant.name)}"
          >
            ${getInitials(participant.name)}
          </div>
        `}
      </div>
      
      <div class="person-info">
        <h3 class="person-name">${participant.name}</h3>
        ${participant.role ? `<p class="person-role">${participant.role}</p>` : ''}
      </div>
    </div>
  `).join('');

  return `
    <section class="trip-participants">
      <h2 class="participants-title">Meet the team</h2>
      <div class="participants-grid">
        ${participantsHTML}
      </div>
    </section>
  `;
}

/**
 * Initialize lightbox functionality for gallery testing
 */
export function initializeLightboxScripts(gallery: TripGalleryItem[]): void {
  let currentImageIndex = 0;

  function openLightbox(index: number) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image') as HTMLImageElement;
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    if (lightbox && lightboxImage && lightboxTitle && lightboxDescription) {
      const item = gallery[index];
      lightboxImage.src = item.image;
      lightboxImage.alt = item.title || `Gallery image ${index + 1}`;
      lightboxTitle.textContent = item.title || '';
      lightboxDescription.textContent = item.description || '';
      
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
    }
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  }

  function showPreviousImage() {
    currentImageIndex = currentImageIndex > 0 ? currentImageIndex - 1 : gallery.length - 1;
    openLightbox(currentImageIndex);
  }

  function showNextImage() {
    currentImageIndex = currentImageIndex < gallery.length - 1 ? currentImageIndex + 1 : 0;
    openLightbox(currentImageIndex);
  }

  // Gallery item clicks
  document.querySelectorAll('.lightbox-trigger').forEach((trigger, index) => {
    trigger.addEventListener('click', () => openLightbox(index));
  });

  // Lightbox controls
  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-prev')?.addEventListener('click', showPreviousImage);
  document.querySelector('.lightbox-next')?.addEventListener('click', showNextImage);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox')?.classList.contains('active')) {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          showPreviousImage();
          break;
        case 'ArrowRight':
          showNextImage();
          break;
      }
    }
  });

  // Click outside to close
  document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'lightbox') {
      closeLightbox();
    }
  });

  // Expose functions for testing
  (window as any).lightboxFunctions = {
    openLightbox,
    closeLightbox,
    showPreviousImage,
    showNextImage,
    getCurrentIndex: () => currentImageIndex
  };
}