# Requirements Document

## Introduction

This feature enhances each trip page with a photo gallery that displays trip photos in a horizontally auto-scrolling strip arranged across 3 rows. The gallery supports mixed portrait and landscape orientations, pauses scrolling on hover, and opens a lightbox with metadata (date, location, description) when a photo is clicked. The gallery placement on the page depends on the trip's status. Gallery data is sourced from the trip markdown frontmatter.

## Glossary

- **Photo_Gallery**: The horizontally scrolling component that displays trip photos arranged in 3 rows on each trip page.
- **Gallery_Item**: A single photo entry in the gallery, containing an image path, date, location, and optional description.
- **Lightbox**: A full-screen modal overlay that displays a selected photo at full size along with its metadata.
- **Trip_Page**: The Astro page rendered for each trip at `/trips/[slug]`.
- **Trip_Layout**: The layout component (`TripLayout.astro`) that defines the section ordering for trip pages.
- **Trip_Status**: The status field in the trip frontmatter, one of: "completed", "current", "planned", or "hidden".
- **Auto_Scroll**: The continuous horizontal scrolling animation applied to the Photo_Gallery when the user is not hovering over it.
- **Activities_Section**: The "Activities & Events" section on the Trip_Page.
- **Participants_Section**: The "Meet the team" section on the Trip_Page.

## Requirements

### Requirement 1: Gallery Data Model

**User Story:** As a content author, I want to define photo gallery data in the trip markdown frontmatter, so that I can manage gallery content alongside other trip data.

#### Acceptance Criteria

1. THE Gallery_Item SHALL include the following fields: image path (required), date (optional), location (optional), and description (optional).
2. WHEN a trip markdown file contains a `gallery` array in its frontmatter, THE Photo_Gallery SHALL use each entry to render a Gallery_Item.
3. THE Trip type definition SHALL be updated to include date and location fields on the TripGalleryItem interface.

### Requirement 2: Gallery Layout and Display

**User Story:** As a visitor, I want to see trip photos displayed in a visually appealing multi-row horizontal strip, so that I can browse through the trip's photo collection.

#### Acceptance Criteria

1. THE Photo_Gallery SHALL arrange photos in 3 horizontal rows.
2. THE Photo_Gallery SHALL allow portrait-oriented photos to span the full height of the 3-row layout.
3. THE Photo_Gallery SHALL allow 2 landscape-oriented photos to be stacked vertically within the height of the 3-row layout.
4. THE Photo_Gallery SHALL display photos in a continuous horizontal strip that overflows the viewport width.
5. WHEN the Photo_Gallery contains no Gallery_Items, THE Photo_Gallery SHALL not render on the Trip_Page.

### Requirement 3: Auto-Scroll Behavior

**User Story:** As a visitor, I want the photo gallery to slowly scroll horizontally on its own, so that I can passively view all the trip photos.

#### Acceptance Criteria

1. THE Auto_Scroll SHALL move the Photo_Gallery content horizontally at a slow, constant speed.
2. WHEN the user hovers the mouse cursor over the Photo_Gallery, THE Auto_Scroll SHALL pause.
3. WHEN the user moves the mouse cursor away from the Photo_Gallery, THE Auto_Scroll SHALL resume from the current scroll position.
4. THE Auto_Scroll SHALL loop seamlessly so that photos repeat continuously without visible jumps.

### Requirement 4: Conditional Gallery Placement

**User Story:** As a visitor, I want the photo gallery to appear in the appropriate location on the trip page based on the trip status, so that the page layout reflects whether the trip is completed or upcoming.

#### Acceptance Criteria

1. WHEN the Trip_Status is "completed", THE Photo_Gallery SHALL appear above the Activities_Section on the Trip_Page.
2. WHEN the Trip_Status is not "completed", THE Photo_Gallery SHALL appear between the Activities_Section and the Participants_Section on the Trip_Page.

### Requirement 5: Lightbox Modal

**User Story:** As a visitor, I want to click on a gallery photo to see it in a larger view with its date, location, and description, so that I can learn more about each photo.

#### Acceptance Criteria

1. WHEN a user clicks on a Gallery_Item thumbnail, THE Lightbox SHALL open and display the full-size image.
2. THE Lightbox SHALL display the Gallery_Item date when available.
3. THE Lightbox SHALL display the Gallery_Item location when available.
4. THE Lightbox SHALL display the Gallery_Item description when available.
5. WHEN the user clicks the close button or presses the Escape key, THE Lightbox SHALL close and return focus to the previously focused Gallery_Item.
6. WHEN the Lightbox is open, THE Lightbox SHALL provide navigation controls to move to the next and previous Gallery_Items.
7. WHEN the Lightbox is open, THE user SHALL be able to navigate using left and right arrow keys.
8. WHEN the Lightbox is open, THE Lightbox SHALL prevent scrolling of the page behind it.

### Requirement 6: Responsive Design

**User Story:** As a visitor on a mobile device, I want the photo gallery to adapt to smaller screens, so that I can still browse photos comfortably.

#### Acceptance Criteria

1. THE Photo_Gallery SHALL adapt its row height and thumbnail sizes for viewports narrower than 768px.
2. THE Photo_Gallery SHALL remain horizontally scrollable via touch gestures on mobile devices.
3. THE Lightbox SHALL adapt its layout to fit smaller screens while keeping the image and metadata visible.

### Requirement 7: Visual Quality

**User Story:** As a visitor, I want the photo gallery to look polished and consistent with the rest of the site, so that the browsing experience feels cohesive.

#### Acceptance Criteria

1. THE Photo_Gallery SHALL use smooth transitions and subtle hover effects on thumbnails.
2. THE Lightbox SHALL use a semi-transparent dark backdrop and smooth open/close transitions.
3. THE Photo_Gallery SHALL use optimized image loading (lazy loading for off-screen images) to maintain page performance.
