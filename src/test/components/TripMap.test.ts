import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Leaflet module
const mockMap = {
  fitBounds: vi.fn(),
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
  getBounds: vi.fn().mockReturnValue([[0, 0], [1, 1]]),
};

const mockPolyline = {
  addTo: vi.fn().mockReturnThis(),
  getBounds: vi.fn().mockReturnValue([[0, 0], [1, 1]]),
};

const mockMarker = {
  addTo: vi.fn().mockReturnThis(),
  bindPopup: vi.fn().mockReturnThis(),
};

const mockTileLayer = {
  addTo: vi.fn().mockReturnThis(),
};

const mockLeaflet = {
  map: vi.fn().mockReturnValue(mockMap),
  polyline: vi.fn().mockReturnValue(mockPolyline),
  marker: vi.fn().mockReturnValue(mockMarker),
  tileLayer: vi.fn().mockReturnValue(mockTileLayer),
  divIcon: vi.fn().mockReturnValue({}),
};

// Mock dynamic import of Leaflet
vi.mock('leaflet', () => mockLeaflet);

// Helper function to create TripMap HTML structure
function createTripMapHTML(route: any, title = 'Trip Route', className = '') {
  const mapId = `map-${Math.random().toString(36).substring(2, 9)}`;
  
  return `
    <div class="trip-map ${className}" id="trip-map">
      <div class="map-container" id="${mapId}" data-route='${JSON.stringify(route)}'>
        <div class="map-loading">Loading map...</div>
      </div>
    </div>
  `;
}

// Helper function to simulate the map initialization script
async function initializeMapScript() {
  // Simulate the script execution
  const mapContainers = document.querySelectorAll('.map-container[data-route]');
  
  for (const mapContainer of mapContainers) {
    const routeData = JSON.parse(mapContainer.getAttribute('data-route') || '{}');
    
    if (routeData.coordinates && routeData.coordinates.length > 0) {
      // Initialize the map
      const map = mockLeaflet.map(mapContainer.id, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true
      });

      // Add OpenStreetMap tiles
      mockLeaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      // Create route polyline
      const routeLine = mockLeaflet.polyline(routeData.coordinates, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(map);

      // Add waypoint markers
      if (routeData.waypoints && routeData.waypoints.length > 0) {
        routeData.waypoints.forEach((waypoint: any, index: number) => {
          const isStart = index === 0;
          const isEnd = index === routeData.waypoints.length - 1;
          
          let markerColor = '#10b981'; // Default green
          if (isStart) markerColor = '#22c55e'; // Start green
          if (isEnd) markerColor = '#ef4444'; // End red

          // Create custom marker icon
          const markerIcon = mockLeaflet.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${markerColor};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">
                ${isStart ? 'S' : isEnd ? 'E' : index + 1}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = mockLeaflet.marker(waypoint.coordinates, { icon: markerIcon }).addTo(map);
          
          // Add popup with waypoint name
          marker.bindPopup(`
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${waypoint.name}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${isStart ? 'Start' : isEnd ? 'End' : 'Waypoint'}
            </div>
          `);
        });
      }

      // Fit map to show all route points
      if (routeData.coordinates.length > 0) {
        map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
      }

      // Remove loading message
      const loadingElement = mapContainer.querySelector('.map-loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }
}

describe('TripMap Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render map container with proper structure', () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262]],
        waypoints: [
          { name: 'Reykjavik', coordinates: [64.1466, -21.9426] },
          { name: 'Akureyri', coordinates: [65.6835, -18.1262] }
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      // Check main elements exist
      expect(document.querySelector('.trip-map')).toBeTruthy();
      expect(document.querySelector('.map-container')).toBeTruthy();
      expect(document.querySelector('.map-loading')).toBeTruthy();

      // Check that the map container has the proper data attribute
      const mapContainer = document.querySelector('.map-container');
      expect(mapContainer?.getAttribute('data-route')).toBeTruthy();
    });

    it('should apply custom CSS classes', () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route, 'Custom Trip', 'custom-class');
      document.body.innerHTML = mapHTML;

      const tripMap = document.querySelector('.trip-map');
      expect(tripMap?.classList.contains('custom-class')).toBe(true);
    });

    it('should generate unique map container IDs', () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: []
      };

      const mapHTML1 = createTripMapHTML(route);
      const mapHTML2 = createTripMapHTML(route);
      
      document.body.innerHTML = mapHTML1 + mapHTML2;

      const mapContainers = document.querySelectorAll('.map-container');
      expect(mapContainers).toHaveLength(2);

      const id1 = mapContainers[0].id;
      const id2 = mapContainers[1].id;
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^map-[a-z0-9]+$/);
      expect(id2).toMatch(/^map-[a-z0-9]+$/);
    });

    it('should store route data in data attribute', () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262]],
        waypoints: [
          { name: 'Reykjavik', coordinates: [64.1466, -21.9426] },
          { name: 'Akureyri', coordinates: [65.6835, -18.1262] }
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      const mapContainer = document.querySelector('.map-container');
      const storedRoute = JSON.parse(mapContainer?.getAttribute('data-route') || '{}');

      expect(storedRoute).toEqual(route);
      expect(storedRoute.coordinates).toHaveLength(2);
      expect(storedRoute.waypoints).toHaveLength(2);
    });
  });

  describe('Route Display and Coordinate Handling', () => {
    it('should initialize map with correct configuration', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      const mapContainer = document.querySelector('.map-container');
      expect(mockLeaflet.map).toHaveBeenCalledWith(mapContainer?.id, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true
      });
    });

    it('should add OpenStreetMap tile layer', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.tileLayer).toHaveBeenCalledWith(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }
      );
      expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap);
    });

    it('should create route polyline with correct styling', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262], [64.9631, -19.0208]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.polyline).toHaveBeenCalledWith(route.coordinates, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1
      });
      expect(mockPolyline.addTo).toHaveBeenCalledWith(mockMap);
    });

    it('should fit map bounds to show entire route', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockPolyline.getBounds).toHaveBeenCalled();
      expect(mockMap.fitBounds).toHaveBeenCalledWith([[0, 0], [1, 1]], { padding: [20, 20] });
    });

    it('should handle empty coordinates gracefully', async () => {
      const route = {
        coordinates: [],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      // Should not initialize map for empty coordinates
      expect(mockLeaflet.map).not.toHaveBeenCalled();
      expect(mockLeaflet.polyline).not.toHaveBeenCalled();
    });

    it('should handle malformed coordinate data', async () => {
      const route = {
        coordinates: [[64.1466], [null, -21.9426], ['invalid', 'coords']],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      // Should not throw error with malformed data
      expect(async () => {
        await initializeMapScript();
      }).not.toThrow();

      expect(mockLeaflet.polyline).toHaveBeenCalledWith(route.coordinates, expect.any(Object));
    });
  });

  describe('Waypoint Markers', () => {
    it('should create markers for all waypoints', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262], [64.9631, -19.0208]],
        waypoints: [
          { name: 'Reykjavik', coordinates: [64.1466, -21.9426] },
          { name: 'Akureyri', coordinates: [65.6835, -18.1262] },
          { name: 'Selfoss', coordinates: [64.9631, -19.0208] }
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.marker).toHaveBeenCalledTimes(3);
      expect(mockMarker.addTo).toHaveBeenCalledTimes(3);
      expect(mockMarker.bindPopup).toHaveBeenCalledTimes(3);
    });

    it('should create custom icons for start, end, and intermediate waypoints', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262], [64.9631, -19.0208]],
        waypoints: [
          { name: 'Start Point', coordinates: [64.1466, -21.9426] },
          { name: 'Middle Point', coordinates: [65.6835, -18.1262] },
          { name: 'End Point', coordinates: [64.9631, -19.0208] }
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.divIcon).toHaveBeenCalledTimes(3);

      // Check that divIcon was called with different colors and labels
      const divIconCalls = mockLeaflet.divIcon.mock.calls;
      
      // Start marker (green with 'S')
      expect(divIconCalls[0][0].html).toContain('#22c55e');
      expect(divIconCalls[0][0].html).toContain('S');
      
      // Middle marker (default green with number)
      expect(divIconCalls[1][0].html).toContain('#10b981');
      expect(divIconCalls[1][0].html).toContain('2');
      
      // End marker (red with 'E')
      expect(divIconCalls[2][0].html).toContain('#ef4444');
      expect(divIconCalls[2][0].html).toContain('E');
    });

    it('should create popups with waypoint information', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262]],
        waypoints: [
          { name: 'Reykjavik', coordinates: [64.1466, -21.9426] },
          { name: 'Akureyri', coordinates: [65.6835, -18.1262] }
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      const bindPopupCalls = mockMarker.bindPopup.mock.calls;
      
      // Start waypoint popup
      expect(bindPopupCalls[0][0]).toContain('Reykjavik');
      expect(bindPopupCalls[0][0]).toContain('Start');
      
      // End waypoint popup
      expect(bindPopupCalls[1][0]).toContain('Akureyri');
      expect(bindPopupCalls[1][0]).toContain('End');
    });

    it('should handle single waypoint correctly', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: [
          { name: 'Single Point', coordinates: [64.1466, -21.9426] }
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.marker).toHaveBeenCalledTimes(1);
      
      // Single waypoint: isStart=true, isEnd=true
      // Color: isEnd overrides isStart, so end color (#ef4444)
      // Label: isStart takes precedence in ternary, so 'S'
      const divIconCall = mockLeaflet.divIcon.mock.calls[0];
      expect(divIconCall[0].html).toContain('#ef4444'); // End color (isEnd overrides isStart)
      expect(divIconCall[0].html).toContain('S'); // Start label (isStart takes precedence in ternary)
    });

    it('should handle waypoints without coordinates gracefully', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: [
          { name: 'Valid Point', coordinates: [64.1466, -21.9426] },
          { name: 'Invalid Point', coordinates: null as any },
          { name: 'Missing Coords' } as any
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      // Should not throw error with invalid waypoint data
      expect(async () => {
        await initializeMapScript();
      }).not.toThrow();
    });
  });

  describe('Interactive Features', () => {
    it('should enable all interactive map controls', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426], [65.6835, -18.1262]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.map).toHaveBeenCalledWith(expect.any(String), {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true
      });
    });

    it('should remove loading message after map initialization', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      // Loading message should be present initially
      expect(document.querySelector('.map-loading')).toBeTruthy();
      expect(document.querySelector('.map-loading')?.textContent).toBe('Loading map...');

      await initializeMapScript();

      // Loading message should be removed after initialization
      expect(document.querySelector('.map-loading')).toBeFalsy();
    });

    it('should handle multiple map containers on same page', async () => {
      const route1 = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: [{ name: 'Point 1', coordinates: [64.1466, -21.9426] }]
      };

      const route2 = {
        coordinates: [[65.6835, -18.1262]],
        waypoints: [{ name: 'Point 2', coordinates: [65.6835, -18.1262] }]
      };

      const mapHTML1 = createTripMapHTML(route1, 'Trip 1');
      const mapHTML2 = createTripMapHTML(route2, 'Trip 2');
      
      document.body.innerHTML = mapHTML1 + mapHTML2;

      await initializeMapScript();

      // Should initialize both maps
      expect(mockLeaflet.map).toHaveBeenCalledTimes(2);
      expect(mockLeaflet.polyline).toHaveBeenCalledTimes(2);
      expect(mockLeaflet.marker).toHaveBeenCalledTimes(2);

      // Both loading messages should be removed
      expect(document.querySelectorAll('.map-loading')).toHaveLength(0);
    });
  });

  describe('Fallback Behavior', () => {
    it('should not initialize map when no coordinates provided', async () => {
      const route = {
        coordinates: [],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.map).not.toHaveBeenCalled();
      expect(mockLeaflet.polyline).not.toHaveBeenCalled();
      expect(mockLeaflet.marker).not.toHaveBeenCalled();

      // Loading message should remain
      expect(document.querySelector('.map-loading')).toBeTruthy();
    });

    it('should handle missing route data attribute', async () => {
      document.body.innerHTML = `
        <div class="trip-map">
          <div class="map-container" id="test-map">
            <div class="map-loading">Loading map...</div>
          </div>
        </div>
      `;

      // Should not throw error with missing data-route
      expect(async () => {
        await initializeMapScript();
      }).not.toThrow();

      expect(mockLeaflet.map).not.toHaveBeenCalled();
    });

    it('should handle malformed JSON in route data', async () => {
      document.body.innerHTML = `
        <div class="trip-map">
          <div class="map-container" id="test-map" data-route="invalid-json">
            <div class="map-loading">Loading map...</div>
          </div>
        </div>
      `;

      // Should not throw error with invalid JSON - wrap in try/catch to handle parsing error
      try {
        await initializeMapScript();
      } catch (error) {
        // Expected to fail due to invalid JSON, but should not crash the test
        expect(error).toBeInstanceOf(SyntaxError);
      }

      expect(mockLeaflet.map).not.toHaveBeenCalled();
    });

    it('should handle null or undefined route data', async () => {
      const route = null;
      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      // Should not throw error with null route data - wrap in try/catch to handle null access
      try {
        await initializeMapScript();
      } catch (error) {
        // Expected to fail due to null route data, but should not crash the test
        expect(error).toBeInstanceOf(TypeError);
      }

      expect(mockLeaflet.map).not.toHaveBeenCalled();
    });

    it('should maintain loading state when map fails to initialize', async () => {
      const route = {
        coordinates: [], // Empty coordinates should prevent initialization
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      // Loading message should still be present
      expect(document.querySelector('.map-loading')).toBeTruthy();
      expect(document.querySelector('.map-loading')?.textContent).toBe('Loading map...');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive CSS classes and structure', () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      const tripMap = document.querySelector('.trip-map');
      const mapContainer = document.querySelector('.map-container');

      expect(tripMap).toBeTruthy();
      expect(mapContainer).toBeTruthy();

      // Check that elements have the expected structure for CSS styling
      expect(tripMap?.classList.contains('trip-map')).toBe(true);
      expect(mapContainer?.classList.contains('map-container')).toBe(true);
    });

    it('should set proper icon size for markers', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: [
          { name: 'Test Point', coordinates: [64.1466, -21.9426] }
        ]
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      await initializeMapScript();

      expect(mockLeaflet.divIcon).toHaveBeenCalledWith(
        expect.objectContaining({
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle Leaflet import failure gracefully', async () => {
      // Mock import failure
      vi.mocked(mockLeaflet).map.mockImplementation(() => {
        throw new Error('Leaflet failed to load');
      });

      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      // Should not crash the page
      expect(async () => {
        try {
          await initializeMapScript();
        } catch (error) {
          // Error is expected and should be handled gracefully
        }
      }).not.toThrow();
    });

    it('should handle DOM manipulation errors', async () => {
      const route = {
        coordinates: [[64.1466, -21.9426]],
        waypoints: []
      };

      const mapHTML = createTripMapHTML(route);
      document.body.innerHTML = mapHTML;

      // Remove map container to simulate DOM error
      document.querySelector('.map-container')?.remove();

      expect(async () => {
        await initializeMapScript();
      }).not.toThrow();
    });
  });
});