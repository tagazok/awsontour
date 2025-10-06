import { getCollection, type CollectionEntry } from 'astro:content';
import type { Trip } from '../types/trip';

export type TripEntry = CollectionEntry<'trips'>;

/**
 * Get all trips from the content collection
 */
export async function getAllTrips(): Promise<TripEntry[]> {
  return await getCollection('trips');
}

/**
 * Get trips by status
 */
export async function getTripsByStatus(status: Trip['status']): Promise<TripEntry[]> {
  const trips = await getAllTrips();
  return trips.filter(trip => trip.data.status === status);
}

/**
 * Get current trip (if any)
 */
export async function getCurrentTrip(): Promise<TripEntry | null> {
  const currentTrips = await getTripsByStatus('current');
  return currentTrips.length > 0 ? currentTrips[0] : null;
}

/**
 * Get completed trips sorted by end date (most recent first)
 */
export async function getCompletedTrips(): Promise<TripEntry[]> {
  const trips = await getTripsByStatus('completed');
  return trips.sort((a, b) => b.data.endDate.getTime() - a.data.endDate.getTime());
}

/**
 * Get planned trips sorted by start date (soonest first)
 */
export async function getPlannedTrips(): Promise<TripEntry[]> {
  const trips = await getTripsByStatus('planned');
  return trips.sort((a, b) => a.data.startDate.getTime() - b.data.startDate.getTime());
}

/**
 * Get trip by slug
 */
export async function getTripBySlug(slug: string): Promise<TripEntry | undefined> {
  const trips = await getAllTrips();
  return trips.find(trip => trip.slug === slug);
}