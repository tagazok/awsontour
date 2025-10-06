export interface TripStats {
  kilometers: number;
  activities: number;
  peopleMet: number;
  cities: number;
  days: number;
}

export interface TripRoute {
  coordinates: [number, number][];
  waypoints: {
    name: string;
    coordinates: [number, number];
  }[];
}

export interface TripGalleryItem {
  image: string;
  title?: string;
  description?: string;
}

export interface TripActivity {
  name: string;
  description: string;
  date?: Date;
  registrationUrl?: string;
  isPublic: boolean;
}

export interface TripParticipant {
  name: string;
  photo?: string;
  role?: string;
}

export type TripStatus = 'completed' | 'current' | 'planned';

export interface Trip {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TripStatus;
  headerImage: string;
  stats: TripStats;
  route: TripRoute;
  gallery: TripGalleryItem[];
  activities: TripActivity[];
  participants: TripParticipant[];
}