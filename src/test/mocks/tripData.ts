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
      stats: {
        kilometers: 1200,
        activities: 8,
        peopleMet: 15,
        cities: 5,
        days: 31
      },
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
      stats: {
        kilometers: 800,
        activities: 5,
        peopleMet: 10,
        cities: 3,
        days: 29
      },
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
      stats: {
        kilometers: 500,
        activities: 3,
        peopleMet: 0,
        cities: 2,
        days: 14
      },
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