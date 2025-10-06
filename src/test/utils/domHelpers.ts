/**
 * Helper functions for DOM testing
 */

/**
 * Create a mock HTML structure for the home page
 */
export function createHomePageDOM(tripsHTML: string, currentTripHTML?: string): void {
  document.body.innerHTML = `
    <main class="home-page">
      ${currentTripHTML ? `
        <section class="current-trip-section">
          <div class="container">
            <h2 class="section-title">Currently Traveling</h2>
            <div class="current-trip-highlight">
              ${currentTripHTML}
            </div>
          </div>
        </section>
      ` : ''}
      
      <section class="trips-section">
        <div class="container">
          <h2 class="section-title">All Adventures</h2>
          
          <div class="trip-controls">
            <div class="trip-filters">
              <button class="filter-btn active" data-filter="all">All Trips</button>
              <button class="filter-btn" data-filter="completed">Completed</button>
              <button class="filter-btn" data-filter="planned">Planned</button>
            </div>
            <div class="trip-sort">
              <select class="sort-select" id="trip-sort">
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          <div class="trip-grid" id="trip-grid">
            ${tripsHTML}
          </div>
        </div>
      </section>
    </main>
  `;
}

/**
 * Create a mock trip card HTML
 */
export function createTripCardHTML(trip: {
  slug: string;
  title: string;
  description: string;
  status: string;
  startDate: Date;
  endDate: Date;
  headerImage: string;
  stats: {
    kilometers: number;
    cities: number;
    activities: number;
  };
}, isCurrent = false): string {
  const duration = Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return `
    <div class="trip-grid-item" data-status="${trip.status}" data-date="${trip.startDate.toISOString()}" data-title="${trip.title}">
      <article class="trip-card ${isCurrent ? 'current-trip' : ''}">
        <a href="/trips/${trip.slug}" class="trip-card__link">
          <div class="trip-card__image-container">
            <img src="${trip.headerImage}" alt="${trip.title} header image" class="trip-card__image" />
            ${isCurrent ? '<div class="trip-card__current-badge">Ongoing</div>' : ''}
          </div>
          
          <div class="trip-card__content">
            <h3 class="trip-card__title">${trip.title}</h3>
            <p class="trip-card__description">${trip.description}</p>
            
            <div class="trip-card__dates">
              <time datetime="${trip.startDate.toISOString()}">
                ${trip.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
              <span class="trip-card__date-separator">—</span>
              <time datetime="${trip.endDate.toISOString()}">
                ${trip.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
            </div>
            
            <div class="trip-card__stats">
              <div class="trip-card__stat">
                <span class="trip-card__stat-value">${trip.stats.kilometers}</span>
                <span class="trip-card__stat-label">km</span>
              </div>
              <div class="trip-card__stat">
                <span class="trip-card__stat-value">${duration}</span>
                <span class="trip-card__stat-label">days</span>
              </div>
              <div class="trip-card__stat">
                <span class="trip-card__stat-value">${trip.stats.cities}</span>
                <span class="trip-card__stat-label">cities</span>
              </div>
              <div class="trip-card__stat">
                <span class="trip-card__stat-value">${trip.stats.activities}</span>
                <span class="trip-card__stat-label">activities</span>
              </div>
            </div>
          </div>
        </a>
      </article>
    </div>
  `;
}

/**
 * Simulate client-side filtering and sorting functionality
 */
export function initializeHomePageScripts(): void {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('trip-sort') as HTMLSelectElement;
  const tripGrid = document.getElementById('trip-grid');
  const tripItems = document.querySelectorAll('.trip-grid-item') as NodeListOf<HTMLElement>;

  // Filter functionality
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');
      
      tripItems.forEach(item => {
        const status = item.getAttribute('data-status');
        const shouldShow = filter === 'all' || status === filter;
        
        if (shouldShow) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Sort functionality
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const sortValue = sortSelect.value;
      const itemsArray = Array.from(tripItems);
      
      itemsArray.sort((a, b) => {
        switch (sortValue) {
          case 'date-asc':
            return new Date(a.getAttribute('data-date')!).getTime() - 
                   new Date(b.getAttribute('data-date')!).getTime();
          case 'date-desc':
            return new Date(b.getAttribute('data-date')!).getTime() - 
                   new Date(a.getAttribute('data-date')!).getTime();
          case 'title':
            return a.getAttribute('data-title')!.localeCompare(b.getAttribute('data-title')!);
          default:
            return 0;
        }
      });

      // Reorder DOM elements
      itemsArray.forEach(item => {
        tripGrid?.appendChild(item);
      });
    });
  }
}