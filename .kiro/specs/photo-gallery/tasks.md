# Implementation Plan: Photo Gallery

## Overview

Incrementally build the photo gallery feature by first updating the data model, then creating the gallery component with its 3-row grid layout and auto-scroll, then the lightbox, and finally wiring the conditional placement into the trip layout and page template.

## Tasks

- [x] 1. Update data model and types
  - [x] 1.1 Update `TripGalleryItem` in `src/types/trip.ts` to add optional `date`, `location`, and `orientation` fields
    - `date?: string`, `location?: string`, `orientation?: 'portrait' | 'landscape'`
    - _Requirements: 1.1, 1.3_
  - [x] 1.2 Update the Astro content collection schema (if one exists) to validate the new gallery fields
    - _Requirements: 1.1_

- [x] 2. Create the PhotoGallery component
  - [x] 2.1 Create `src/components/PhotoGallery.astro` with the 3-row CSS Grid layout
    - Accept `gallery: TripGalleryItem[]` and `tripTitle: string` props
    - Render a scrolling track with `grid-template-rows: repeat(3, 1fr)` and `grid-auto-flow: column`
    - Portrait items (`orientation === 'portrait'`) get `grid-row: span 3`
    - Landscape items span 1 row each
    - Return empty fragment when gallery is empty
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 2.2 Write property test: Gallery item count matches input
    - **Property 1: Gallery item count matches input**
    - **Validates: Requirements 1.2**
  - [x] 2.3 Add auto-scroll CSS animation and hover pause behavior
    - Duplicate the photo strip for seamless looping
    - Use `@keyframes` to translate the track horizontally
    - Pause animation on `:hover` using `animation-play-state: paused`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 2.4 Add responsive styles for mobile viewports
    - Reduce row height and thumbnail sizes below 768px
    - Ensure touch scrolling works on mobile
    - _Requirements: 6.1, 6.2_
  - [x] 2.5 Add visual polish: smooth transitions, hover effects, lazy loading
    - Thumbnail hover scale/shadow effects
    - Use `loading="lazy"` on off-screen images
    - _Requirements: 7.1, 7.3_

- [x] 3. Implement the Lightbox
  - [x] 3.1 Add lightbox modal markup and styles to `PhotoGallery.astro`
    - Full-screen fixed overlay with dark backdrop
    - Display image, date, location, and description
    - Close button, prev/next navigation buttons
    - Responsive layout for mobile
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 6.3, 7.2_
  - [x] 3.2 Add lightbox JavaScript behavior
    - Open lightbox on thumbnail click with correct image and metadata
    - Close on button click, Escape key, or backdrop click
    - Navigate with prev/next buttons and arrow keys
    - Prevent body scroll when open
    - Return focus to triggering thumbnail on close
    - _Requirements: 5.1, 5.5, 5.6, 5.7, 5.8_
  - [x] 3.3 Write property test: Lightbox displays correct image for clicked item
    - **Property 3: Lightbox displays correct image for clicked item**
    - **Validates: Requirements 5.1**
  - [x] 3.4 Write property test: Lightbox displays all available metadata
    - **Property 4: Lightbox displays all available metadata**
    - **Validates: Requirements 5.2, 5.3, 5.4**
  - [x] 3.5 Write property test: Lightbox navigation cycles through items
    - **Property 5: Lightbox navigation cycles through items**
    - **Validates: Requirements 5.6, 5.7**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire gallery into trip layout and page
  - [x] 5.1 Update `TripLayout.astro` to add two gallery slots
    - Add `gallery-above-activities` slot before the Activities section
    - Add `gallery-between-activities-participants` slot between Activities and Participants sections
    - _Requirements: 4.1, 4.2_
  - [x] 5.2 Update `src/pages/trips/[slug].astro` to conditionally render PhotoGallery
    - Import `PhotoGallery` instead of `TripGallery`
    - Render into `gallery-above-activities` slot when `status === 'completed'`
    - Render into `gallery-between-activities-participants` slot when `status !== 'completed'`
    - Only render when `gallery && gallery.length > 0`
    - _Requirements: 4.1, 4.2, 2.5_
  - [x] 5.3 Write property test: Gallery placement matches trip status
    - **Property 2: Gallery placement matches trip status**
    - **Validates: Requirements 4.1, 4.2**

- [x] 6. Clean up and final integration
  - [x] 6.1 Remove or deprecate the old `TripGallery.astro` component
    - Remove the import from `[slug].astro` if not already done
    - _Requirements: N/A_
  - [x] 6.2 Update sample trip markdown files with new gallery fields (date, location, orientation)
    - Add `date`, `location`, and `orientation` to existing gallery entries in at least one trip file
    - _Requirements: 1.1_

- [x] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses no new npm dependencies — only Astro built-ins, CSS, and vanilla JS
