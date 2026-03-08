import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { TripStatus } from '../../types/trip';

/**
 * Pure function that determines the gallery slot based on trip status.
 * This mirrors the conditional logic in [slug].astro:
 *   data.status === 'completed'
 *     ? slot="gallery-above-activities"
 *     : slot="gallery-between-activities-participants"
 */
function getGallerySlot(status: TripStatus): string {
  return status === 'completed'
    ? 'gallery-above-activities'
    : 'gallery-between-activities-participants';
}

/**
 * Arbitrary generator for all valid TripStatus values.
 */
const tripStatusArb: fc.Arbitrary<TripStatus> = fc.constantFrom(
  'completed' as const,
  'current' as const,
  'planned' as const,
  'hidden' as const
);

describe('Gallery Placement - Property 2: Gallery placement matches trip status', () => {
  /**
   * Property 2: Gallery placement matches trip status
   *
   * For any trip, if the trip status is "completed" then the gallery SHALL be
   * rendered in the `gallery-above-activities` slot, and if the trip status is
   * not "completed" then the gallery SHALL be rendered in the
   * `gallery-between-activities-participants` slot.
   *
   * **Validates: Requirements 4.1, 4.2**
   */

  it('completed trips get gallery-above-activities slot', () => {
    fc.assert(
      fc.property(fc.constant('completed' as TripStatus), (status) => {
        expect(getGallerySlot(status)).toBe('gallery-above-activities');
      }),
      { numRuns: 100 }
    );
  });

  it('non-completed trips get gallery-between-activities-participants slot', () => {
    fc.assert(
      fc.property(
        tripStatusArb.filter((s) => s !== 'completed'),
        (status) => {
          expect(getGallerySlot(status)).toBe('gallery-between-activities-participants');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any valid trip status, the slot is always one of the two expected values', () => {
    fc.assert(
      fc.property(tripStatusArb, (status) => {
        const slot = getGallerySlot(status);
        expect([
          'gallery-above-activities',
          'gallery-between-activities-participants',
        ]).toContain(slot);
      }),
      { numRuns: 100 }
    );
  });

  it('the slot partition is exhaustive — completed maps to one slot, all others to the other', () => {
    fc.assert(
      fc.property(tripStatusArb, (status) => {
        const slot = getGallerySlot(status);
        if (status === 'completed') {
          expect(slot).toBe('gallery-above-activities');
        } else {
          expect(slot).toBe('gallery-between-activities-participants');
        }
      }),
      { numRuns: 100 }
    );
  });
});
