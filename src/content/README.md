# Content Collections

This directory contains the content collections for the travel showcase website.

## Trips Collection

The `trips` collection contains individual travel experiences with the following structure:

### Required Fields
- `title`: Trip title
- `description`: Brief trip description
- `startDate`: Trip start date
- `endDate`: Trip end date
- `status`: Trip status (`completed`, `current`, or `planned`)
- `headerImage`: Path to header image
- `stats`: Trip statistics object
- `route`: Route coordinates and waypoints
- `gallery`: Array of gallery images
- `activities`: Array of trip activities
- `participants`: Array of trip participants

### Content File Structure

Each trip is stored as a Markdown file in `src/content/trips/` with YAML frontmatter containing the structured data and optional Markdown content for detailed descriptions.

### Sample Content

See the existing trip files for examples:
- `iceland-adventure.md` - Completed trip example
- `japan-cultural-immersion.md` - Current trip example  
- `patagonia-expedition.md` - Planned trip example

### Image Organization

Trip images should be organized in the `public/images/trips/` directory with subdirectories for each trip slug.

### Validation

All content is validated using Zod schemas defined in `config.ts`. The build process will fail if content doesn't match the expected structure.