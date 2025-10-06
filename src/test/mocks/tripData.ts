import type { CollectionEntry } from 'astro:content';

export const mockTrips: CollectionEntry<'trips'>[] = [
  {
    id: 'current-adventure',
    slug: 'current-adventure',
    body: '',
    collection: 'trips',
    data: {
      title: 'Current Adventure',
      description: 'An ongoing exciting journey through the mountains',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      status: 'current' as const,
      headerImage: '/images/current-trip.jpg',
      stats: [
        {
          id: 'distance',
          value: 1200,
          label: 'Distance Traveled',
          icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
          unit: 'km'
        },
        {
          id: 'activities',
          value: 8,
          label: 'Activities',
          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>'
        },
        {
          id: 'people',
          value: 15,
          label: 'People Met',
          icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
        },
        {
          id: 'cities',
          value: 5,
          label: 'Cities Visited',
          icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline>'
        },
        {
          id: 'duration',
          value: 31,
          label: 'Duration',
          icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline>',
          unit: 'days'
        }
      ],
      route: {
        coordinates: [[-74.0060, 40.7128], [-87.6298, 41.8781]] as [number, number][],
        waypoints: [
          { name: 'Start Point', coordinates: [-74.0060, 40.7128] as [number, number] },
          { name: 'End Point', coordinates: [-87.6298, 41.8781] as [number, number] }
        ]
      },
      gallery: [
        { image: '/images/gallery1.jpg', title: 'Mountain View', description: 'Beautiful mountain scenery' }
      ],
      activities: [
        { name: 'Hiking', description: 'Mountain hiking', isPublic: true, registrationUrl: 'https://example.com/register' }
      ],
      participants: [
        { name: 'John Doe', photo: '/images/john.jpg', role: 'Guide' }
      ]
    }
  },
  {
    id: 'completed-trip',
    slug: 'completed-trip',
    body: '',
    collection: 'trips',
    data: {
      title: 'Completed Adventure',
      description: 'A wonderful completed journey',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-06-30'),
      status: 'completed' as const,
      headerImage: '/images/completed-trip.jpg',
      stats: [
        {
          id: 'distance',
          value: 800,
          label: 'Distance Traveled',
          icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
          unit: 'km'
        },
        {
          id: 'activities',
          value: 5,
          label: 'Activities',
          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>'
        },
        {
          id: 'people',
          value: 10,
          label: 'People Met',
          icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
        },
        {
          id: 'cities',
          value: 3,
          label: 'Cities Visited',
          icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline>'
        },
        {
          id: 'duration',
          value: 29,
          label: 'Duration',
          icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline>',
          unit: 'days'
        }
      ],
      route: {
        coordinates: [[139.6503, 35.6762], [-118.2437, 34.0522]] as [number, number][],
        waypoints: [
          { name: 'Tokyo', coordinates: [139.6503, 35.6762] as [number, number] },
          { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] as [number, number] }
        ]
      },
      gallery: [
        { image: '/images/gallery2.jpg', title: 'City View', description: 'Urban landscape' }
      ],
      activities: [
        { name: 'Sightseeing', description: 'City tour', isPublic: false }
      ],
      participants: [
        { name: 'Jane Smith', photo: '/images/jane.jpg', role: 'Photographer' }
      ]
    }
  },
  {
    id: 'planned-trip',
    slug: 'planned-trip',
    body: '',
    collection: 'trips',
    data: {
      title: 'Future Adventure',
      description: 'An exciting trip planned for the future',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-15'),
      status: 'planned' as const,
      headerImage: '/images/planned-trip.jpg',
      stats: [
        {
          id: 'distance',
          value: 500,
          label: 'Distance Traveled',
          icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
          unit: 'km'
        },
        {
          id: 'activities',
          value: 3,
          label: 'Activities',
          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>'
        },
        {
          id: 'people',
          value: 0,
          label: 'People Met',
          icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
        },
        {
          id: 'cities',
          value: 2,
          label: 'Cities Visited',
          icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline>'
        },
        {
          id: 'duration',
          value: 14,
          label: 'Duration',
          icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12,6 12,12 16,14"></polyline>',
          unit: 'days'
        }
      ],
      route: {
        coordinates: [[-0.1278, 51.5074], [2.3522, 48.8566]] as [number, number][],
        waypoints: [
          { name: 'London', coordinates: [-0.1278, 51.5074] as [number, number] },
          { name: 'Paris', coordinates: [2.3522, 48.8566] as [number, number] }
        ]
      },
      gallery: [
        { image: '/images/planned-gallery.jpg', title: 'Future Destination', description: 'Where we plan to go' }
      ],
      activities: [
        { name: 'Museum Visit', description: 'Art museums', isPublic: true }
      ],
      participants: []
    }
  }
];