# Design Document

## Overview

The travel showcase website will be built as a static site using Astro's content collections and static site generation capabilities. The architecture leverages Astro's file-based routing, content collections for structured data management, and built-in image optimization for performance.

The site will use a content-driven approach where each trip is stored as a structured content entry with associated assets, enabling easy content management while maintaining consistent presentation across all trips.

## Architecture

### Content Structure
- **Content Collections**: Use Astro's content collections to manage trip data with TypeScript schemas for validation
- **File Organization**: 
  - `src/content/trips/` - Trip content files (Markdown with frontmatter)
  - `src/assets/trips/` - Trip-specific images and media
  - `src/components/` - Reusable UI components
  - `src/layouts/` - Page layouts and templates
  - `src/pages/` - Route definitions and dynamic pages

### Routing Strategy
- **Static Generation**: Use `getStaticPaths()` for dynamic trip pages
- **Home Page**: `/` - Lists all trips with current trip highlighting
- **Trip Pages**: `/trips/[slug]` - Individual trip detail pages
- **Asset Optimization**: Leverage Astro's built-in image optimization for performance

### Data Flow
1. Trip content stored in content collections with structured frontmatter
2. Static pages generated at build time using `getCollection()` and `getStaticPaths()`
3. Images optimized automatically through Astro's asset pipeline
4. Map integration through client-side JavaScript components

## Components and Interfaces

### Core Components

#### TripCard Component
- **Purpose**: Display trip summary on home page
- **Props**: Trip metadata (title, dates, featured image, basic stats)
- **Features**: Responsive design, optimized images, link to full trip page

#### TripHeader Component
- **Purpose**: Hero section for individual trip pages
- **Props**: Header image, title, description overlay
- **Features**: Responsive background image, text overlay positioning

#### TripStats Component
- **Purpose**: Display key trip statistics
- **Props**: Statistics object (kilometers, activities, people, cities, days)
- **Features**: Icon-based display, responsive grid layout

#### TripGallery Component
- **Purpose**: Photo gallery with titles and descriptions
- **Props**: Array of image objects with metadata
- **Features**: Lazy loading, lightbox functionality, responsive grid

#### ActivityCard Component
- **Purpose**: Display individual activities with registration options
- **Props**: Activity data including registration URL if available
- **Features**: Conditional registration button, responsive card layout

#### TripMap Component
- **Purpose**: Interactive map showing trip route
- **Props**: Route coordinates, waypoints, map configuration
- **Features**: Client-side rendering, zoom controls, route visualization

#### PersonCard Component
- **Purpose**: Display trip participants
- **Props**: Person data (name, photo, role/description)
- **Features**: Avatar display, responsive layout

### Layout Components

#### BaseLayout
- **Purpose**: Common page structure and meta tags
- **Features**: SEO optimization, responsive navigation, footer

#### TripLayout
- **Purpose**: Specific layout for trip detail pages
- **Features**: Structured content sections, consistent spacing

## Data Models

### Trip Content Schema
```typescript
const tripSchema = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['completed', 'current', 'planned']),
  headerImage: z.string(),
  stats: z.object({
    kilometers: z.number(),
    activities: z.number(),
    peopleMet: z.number(),
    cities: z.number(),
    days: z.number()
  }),
  route: z.object({
    coordinates: z.array(z.tuple([z.number(), z.number()])),
    waypoints: z.array(z.object({
      name: z.string(),
      coordinates: z.tuple([z.number(), z.number()])
    }))
  }),
  gallery: z.array(z.object({
    image: z.string(),
    title: z.string().optional(),
    description: z.string().optional()
  })),
  activities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    date: z.date().optional(),
    registrationUrl: z.string().url().optional(),
    location: z.date().optional(),
    isPublic: z.boolean().default(false)
  })),
  participants: z.array(z.object({
    name: z.string(),
    photo: z.string().optional(),
    role: z.string().optional()
  }))
});
```

### Content Collection Configuration
- **Collection Name**: `trips`
- **Schema Validation**: Zod schema for type safety and validation
- **File Format**: Markdown with YAML frontmatter
- **Slug Generation**: Automatic from filename or custom slug field

## Error Handling

### Content Validation
- **Schema Validation**: Zod schemas ensure data integrity at build time
- **Required Fields**: Enforce required fields through TypeScript and schema validation
- **Image Validation**: Validate image paths and formats during build

### Route Handling
- **404 Pages**: Custom 404 page for missing trips
- **Fallback Handling**: Graceful degradation for missing optional content
- **Build-time Errors**: Clear error messages for content validation failures

### Image Handling
- **Missing Images**: Fallback images for missing trip photos
- **Format Support**: Support for multiple image formats with automatic optimization
- **Loading States**: Proper loading states and alt text for accessibility

## Testing Strategy

### Content Validation Testing
- **Schema Tests**: Validate content collection schemas work correctly
- **Content Tests**: Ensure all trip content validates against schemas
- **Image Tests**: Verify image optimization and loading

### Component Testing
- **Unit Tests**: Test individual components with mock data
- **Integration Tests**: Test component interactions and data flow
- **Visual Tests**: Ensure responsive design works across devices

### Build Testing
- **Static Generation**: Verify all pages generate correctly
- **Performance Tests**: Check image optimization and page load times
- **Accessibility Tests**: Ensure proper semantic HTML and ARIA labels

### Map Integration Testing
- **Client-side Rendering**: Test map component loads and displays correctly
- **Route Visualization**: Verify route coordinates display properly
- **Interactive Features**: Test zoom, pan, and waypoint interactions

## Technical Implementation Notes

### Image Optimization
- Use Astro's built-in `<Image />` component for automatic optimization
- Support for multiple formats (WebP, AVIF) with fallbacks
- Responsive images with appropriate sizing for different viewports

### Map Integration
- Client-side map component using a mapping library (e.g., Leaflet, Mapbox)
- Lazy loading for performance optimization
- Fallback static map image for accessibility

### Performance Considerations
- Static site generation for optimal loading times
- Image lazy loading and optimization
- Minimal JavaScript for enhanced performance
- Progressive enhancement for interactive features

### Content Management
- Simple file-based content management through Markdown files
- Structured frontmatter for consistent data entry
- Asset organization with clear naming conventions
- Version control integration for content tracking