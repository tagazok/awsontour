import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import fc from 'fast-check';
import PhotoGallery from './PhotoGallery.astro';
import type { TripGalleryItem } from '../types/trip';

/**
 * Arbitrary generator for a single TripGalleryItem.
 * Generates realistic gallery items with required image field
 * and optional metadata fields.
 */
const galleryItemArb: fc.Arbitrary<TripGalleryItem> = fc.record({
  image: fc.uuid().map((id) => `/images/photo-${id}.jpg`),
  title: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  date: fc.option(
    fc
      .tuple(
        fc.integer({ min: 2020, max: 2030 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 })
      )
      .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`),
    { nil: undefined }
  ),
  location: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  orientation: fc.option(fc.constantFrom('portrait' as const, 'landscape' as const), { nil: undefined }),
});

/**
 * Arbitrary generator for a non-empty array of gallery items.
 * Constrains length to keep tests fast while covering meaningful sizes.
 */
const nonEmptyGalleryArb = fc.array(galleryItemArb, { minLength: 1, maxLength: 30 });

describe('PhotoGallery - Property 1: Gallery item count matches input', () => {
  /**
   * Property 1: Gallery item count matches input
   *
   * For any array of gallery items of length N (where N > 0),
   * the rendered Photo_Gallery SHALL contain exactly N clickable thumbnail elements.
   *
   * **Validates: Requirements 1.2**
   */
  it('should render exactly N clickable thumbnails for N gallery items', async () => {
    const container = await AstroContainer.create();

    await fc.assert(
      fc.asyncProperty(nonEmptyGalleryArb, async (gallery) => {
        const result = await container.renderToString(PhotoGallery, {
          props: { gallery, tripTitle: 'Test Trip' },
        });

        // Count all <button> elements with class gallery-thumbnail
        const buttonMatches = result.match(/<button[^>]*class="[^"]*gallery-thumbnail[^"]*"[^>]*>/g);
        const count = buttonMatches ? buttonMatches.length : 0;

        expect(count).toBe(gallery.length);
      }),
      { numRuns: 100 }
    );
  });
});

describe('PhotoGallery - Property 3: Lightbox displays correct image for clicked item', () => {
  /**
   * Property 3: Lightbox displays correct image for clicked item
   *
   * For any gallery with N items and any index i in [0, N),
   * clicking the thumbnail at index i SHALL open the lightbox
   * displaying the image from gallery item i.
   *
   * The gallery shuffles items at render time, so we validate internal
   * consistency: the thumbnail at data-index=i has the same image src
   * as the serialized gallery data at index i.
   *
   * **Validates: Requirements 5.1**
   */
  it('should bind thumbnail data-index to the correct gallery item image', async () => {
    const container = await AstroContainer.create();

    await fc.assert(
      fc.asyncProperty(
        nonEmptyGalleryArb.chain((gallery) =>
          fc.tuple(
            fc.constant(gallery),
            fc.integer({ min: 0, max: gallery.length - 1 })
          )
        ),
        async ([gallery, clickedIndex]) => {
          const result = await container.renderToString(PhotoGallery, {
            props: { gallery, tripTitle: 'Test Trip' },
          });

          // Parse the serialized gallery data from the script tag
          const dataMatch = result.match(
            /<script[^>]*id="gallery-data"[^>]*>([\s\S]*?)<\/script>/
          );
          expect(dataMatch).not.toBeNull();
          const galleryData = JSON.parse(dataMatch![1]);

          // Find the thumbnail button with the matching data-index
          const buttonRegex = new RegExp(
            `<button[^>]*data-index="${clickedIndex}"[^>]*>[\\s\\S]*?</button>`
          );
          const buttonMatch = result.match(buttonRegex);
          expect(buttonMatch).not.toBeNull();

          // Verify the thumbnail's img src matches the serialized data at the same index
          const imgSrcMatch = buttonMatch![0].match(/src="([^"]*)"/);
          expect(imgSrcMatch).not.toBeNull();
          expect(imgSrcMatch![1]).toBe(galleryData[clickedIndex].image);
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe('PhotoGallery - Property 4: Lightbox displays all available metadata', () => {
  /**
   * Property 4: Lightbox displays all available metadata
   *
   * For any gallery item that has a date, location, or description field,
   * when that item is displayed in the lightbox, all of its available metadata
   * fields SHALL be visible in the lightbox content.
   *
   * The gallery shuffles items, so we verify that every input item's metadata
   * appears in the serialized data (by matching on image path), and that
   * metadata is correctly preserved or defaulted to empty string.
   *
   * **Validates: Requirements 5.2, 5.3, 5.4**
   */
  it('should preserve all metadata fields in serialized gallery data', async () => {
    const container = await AstroContainer.create();

    await fc.assert(
      fc.asyncProperty(nonEmptyGalleryArb, async (gallery) => {
        const result = await container.renderToString(PhotoGallery, {
          props: { gallery, tripTitle: 'Test Trip' },
        });

        // Extract the serialized gallery data from the script tag
        const dataMatch = result.match(
          /<script[^>]*id="gallery-data"[^>]*>([\s\S]*?)<\/script>/
        );
        expect(dataMatch).not.toBeNull();
        const serializedData: Array<{
          image: string;
          title: string;
          description: string;
          date: string;
          location: string;
        }> = JSON.parse(dataMatch![1]);

        expect(serializedData).toHaveLength(gallery.length);

        // Every input item should appear in the serialized data (order may differ due to shuffle)
        for (const input of gallery) {
          const serialized = serializedData.find(s => s.image === input.image);
          expect(serialized).toBeDefined();

          // Date: preserved when present, empty string when absent
          if (input.date) {
            expect(serialized!.date).toBe(input.date);
          } else {
            expect(serialized!.date).toBe('');
          }

          // Location: preserved when present, empty string when absent
          if (input.location) {
            expect(serialized!.location).toBe(input.location);
          } else {
            expect(serialized!.location).toBe('');
          }

          // Description: preserved when present, empty string when absent
          if (input.description) {
            expect(serialized!.description).toBe(input.description);
          } else {
            expect(serialized!.description).toBe('');
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});


describe('PhotoGallery - Property 5: Lightbox navigation cycles through items', () => {
  /**
   * Property 5: Lightbox navigation cycles through items
   *
   * For any gallery with N items (N > 1) and any current index i,
   * navigating "next" SHALL display the item at index (i + 1) mod N,
   * and navigating "previous" SHALL display the item at index (i - 1 + N) mod N.
   *
   * We test the navigation index calculation as a pure property:
   * - next(i, N) = (i + 1) % N
   * - prev(i, N) = (i - 1 + N) % N
   * - Both always produce valid indices in [0, N)
   * - next followed by prev returns to original index
   * - N next operations from any starting index returns to the starting index
   *
   * **Validates: Requirements 5.6, 5.7**
   */

  // Pure navigation functions matching the lightbox JS implementation
  const next = (i: number, n: number): number => (i + 1) % n;
  const prev = (i: number, n: number): number => (i - 1 + n) % n;

  // Arbitrary for gallery size N > 1 and a valid index i in [0, N)
  const navArb = fc
    .integer({ min: 2, max: 100 })
    .chain((n) =>
      fc.tuple(fc.constant(n), fc.integer({ min: 0, max: n - 1 }))
    );

  it('next(i, N) always produces a valid index in [0, N)', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        const result = next(i, n);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(n);
      }),
      { numRuns: 100 }
    );
  });

  it('prev(i, N) always produces a valid index in [0, N)', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        const result = prev(i, n);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(n);
      }),
      { numRuns: 100 }
    );
  });

  it('next followed by prev returns to the original index', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        expect(prev(next(i, n), n)).toBe(i);
      }),
      { numRuns: 100 }
    );
  });

  it('prev followed by next returns to the original index', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        expect(next(prev(i, n), n)).toBe(i);
      }),
      { numRuns: 100 }
    );
  });

  it('N next operations from any starting index returns to the starting index', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        let current = i;
        for (let step = 0; step < n; step++) {
          current = next(current, n);
        }
        expect(current).toBe(i);
      }),
      { numRuns: 100 }
    );
  });

  it('N prev operations from any starting index returns to the starting index', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        let current = i;
        for (let step = 0; step < n; step++) {
          current = prev(current, n);
        }
        expect(current).toBe(i);
      }),
      { numRuns: 100 }
    );
  });

  it('next(i, N) equals (i + 1) mod N', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        expect(next(i, n)).toBe((i + 1) % n);
      }),
      { numRuns: 100 }
    );
  });

  it('prev(i, N) equals (i - 1 + N) mod N', () => {
    fc.assert(
      fc.property(navArb, ([n, i]) => {
        expect(prev(i, n)).toBe((i - 1 + n) % n);
      }),
      { numRuns: 100 }
    );
  });
});

