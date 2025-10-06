import { z } from 'zod';

// Test-specific version of validation utilities without astro:content dependency

export const tripSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['completed', 'current', 'planned']),
  headerImage: z.string().min(1, "Header image is required"),
  stats: z.array(z.object({
    id: z.string().min(1, "Stat id is required"),
    value: z.number().min(0, "Stat value must be positive"),
    label: z.string().min(1, "Stat label is required"),
    icon: z.string().min(1, "Stat icon is required"),
    unit: z.string().optional()
  })),
  route: z.object({
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(2, "Route must have at least 2 coordinates"),
    waypoints: z.array(z.object({
      name: z.string().min(1, "Waypoint name is required"),
      coordinates: z.tuple([z.number(), z.number()])
    })).min(1, "Route must have at least 1 waypoint")
  }),
  gallery: z.array(z.object({
    image: z.string().min(1, "Gallery image path is required"),
    title: z.string().optional(),
    description: z.string().optional()
  })).min(1, "Gallery must have at least 1 image"),
  activities: z.array(z.object({
    name: z.string().min(1, "Activity name is required"),
    description: z.string().min(1, "Activity description is required"),
    date: z.date().optional(),
    registrationUrl: z.string().url().optional(),
    isPublic: z.boolean().default(false)
  })),
  participants: z.array(z.object({
    name: z.string().min(1, "Participant name is required"),
    photo: z.string().optional(),
    role: z.string().optional()
  }))
});

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TripValidationResult extends ValidationResult {
  tripId: string;
}

/**
 * Validates a single trip's data structure
 */
export function validateTripData(tripData: any, tripId: string): TripValidationResult {
  const result: TripValidationResult = {
    tripId,
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Validate against schema
    tripSchema.parse(tripData);
  } catch (error) {
    result.isValid = false;
    if (error instanceof z.ZodError) {
      result.errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
    } else {
      result.errors.push(`Unexpected validation error: ${error}`);
    }
  }

  // Additional business logic validations
  if (tripData && tripData.startDate && tripData.endDate) {
    if (tripData.startDate > tripData.endDate) {
      result.errors.push('startDate must be before endDate');
      result.isValid = false;
    }

    // Calculate expected days and compare with duration stat if present
    const daysDiff = Math.ceil((tripData.endDate - tripData.startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (tripData.stats && Array.isArray(tripData.stats)) {
      const durationStat = tripData.stats.find(stat => stat.id === 'duration' || stat.id === 'days');
      if (durationStat && Math.abs(daysDiff - durationStat.value) > 1) {
        result.warnings.push(`stats duration (${durationStat.value}) doesn't match calculated days (${daysDiff})`);
      }
    }
  }

  // Validate status-specific requirements
  if (tripData && tripData.status === 'current') {
    const now = new Date();
    if (tripData.startDate > now) {
      result.warnings.push('Trip marked as "current" but start date is in the future');
    }
    if (tripData.endDate < now) {
      result.warnings.push('Trip marked as "current" but end date is in the past');
    }
  }

  if (tripData && tripData.status === 'completed' && tripData.endDate > new Date()) {
    result.warnings.push('Trip marked as "completed" but end date is in the future');
  }

  if (tripData && tripData.status === 'planned' && tripData.startDate < new Date()) {
    result.warnings.push('Trip marked as "planned" but start date is in the past');
  }

  // Validate image paths
  if (tripData && tripData.headerImage && !tripData.headerImage.startsWith('/')) {
    result.warnings.push('headerImage should start with "/" for absolute path');
  }

  if (tripData && tripData.gallery) {
    tripData.gallery.forEach((item: any, index: number) => {
      if (item.image && !item.image.startsWith('/')) {
        result.warnings.push(`gallery[${index}].image should start with "/" for absolute path`);
      }
    });
  }

  // Validate coordinates are within valid ranges
  if (tripData && tripData.route?.coordinates) {
    tripData.route.coordinates.forEach((coord: [number, number], index: number) => {
      const [lng, lat] = coord;
      if (lat < -90 || lat > 90) {
        result.errors.push(`route.coordinates[${index}] latitude ${lat} is out of range (-90 to 90)`);
        result.isValid = false;
      }
      if (lng < -180 || lng > 180) {
        result.errors.push(`route.coordinates[${index}] longitude ${lng} is out of range (-180 to 180)`);
        result.isValid = false;
      }
    });
  }

  if (tripData && tripData.route?.waypoints) {
    tripData.route.waypoints.forEach((waypoint: any, index: number) => {
      const [lng, lat] = waypoint.coordinates;
      if (lat < -90 || lat > 90) {
        result.errors.push(`route.waypoints[${index}] latitude ${lat} is out of range (-90 to 90)`);
        result.isValid = false;
      }
      if (lng < -180 || lng > 180) {
        result.errors.push(`route.waypoints[${index}] longitude ${lng} is out of range (-180 to 180)`);
        result.isValid = false;
      }
    });
  }

  return result;
}

/**
 * Validates all trips in a provided collection (test version)
 */
export function validateAllTripsFromData(trips: any[]): TripValidationResult[] {
  try {
    return trips.map(trip => validateTripData(trip.data, trip.id));
  } catch (error) {
    return [{
      tripId: 'collection',
      isValid: false,
      errors: [`Failed to process trips data: ${error}`],
      warnings: []
    }];
  }
}

/**
 * Validates content format and structure
 */
export function validateContentFormat(content: string, tripId: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check for frontmatter
  if (!content.startsWith('---')) {
    result.errors.push('Content must start with frontmatter (---)');
    result.isValid = false;
    return result;
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    result.errors.push('Frontmatter must be properly closed with ---');
    result.isValid = false;
    return result;
  }

  const frontmatter = content.slice(3, frontmatterEnd);
  const markdownContent = content.slice(frontmatterEnd + 3);

  // Basic YAML validation
  try {
    // Simple check for common YAML issues
    const lines = frontmatter.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && !line.includes(':') && !line.startsWith('-')) {
        result.warnings.push(`Line ${i + 2}: Possible YAML formatting issue`);
      }
    }
  } catch (error) {
    result.warnings.push('Frontmatter may have YAML formatting issues');
  }

  // Check markdown content structure
  if (markdownContent.trim().length === 0) {
    result.warnings.push('No markdown content found after frontmatter');
  }

  // Check for required markdown sections
  const hasMainHeading = /^#\s+/.test(markdownContent);
  if (!hasMainHeading) {
    result.warnings.push('Consider adding a main heading (# Title) to the markdown content');
  }

  // Check for very short content
  if (markdownContent.trim().length < 100) {
    result.warnings.push('Markdown content is very short, consider adding more details');
  }

  return result;
}

/**
 * Generates a validation report
 */
export function generateValidationReport(results: TripValidationResult[]): string {
  const validTrips = results.filter(r => r.isValid);
  const invalidTrips = results.filter(r => !r.isValid);
  const tripsWithWarnings = results.filter(r => r.warnings.length > 0);

  let report = `# Trip Content Validation Report\n\n`;
  report += `**Summary:**\n`;
  report += `- Total trips: ${results.length}\n`;
  report += `- Valid trips: ${validTrips.length}\n`;
  report += `- Invalid trips: ${invalidTrips.length}\n`;
  report += `- Trips with warnings: ${tripsWithWarnings.length}\n\n`;

  if (invalidTrips.length > 0) {
    report += `## ❌ Invalid Trips\n\n`;
    invalidTrips.forEach(trip => {
      report += `### ${trip.tripId}\n`;
      trip.errors.forEach(error => {
        report += `- ❌ ${error}\n`;
      });
      if (trip.warnings.length > 0) {
        trip.warnings.forEach(warning => {
          report += `- ⚠️ ${warning}\n`;
        });
      }
      report += `\n`;
    });
  }

  if (tripsWithWarnings.length > 0) {
    report += `## ⚠️ Trips with Warnings\n\n`;
    tripsWithWarnings.filter(t => t.isValid).forEach(trip => {
      report += `### ${trip.tripId}\n`;
      trip.warnings.forEach(warning => {
        report += `- ⚠️ ${warning}\n`;
      });
      report += `\n`;
    });
  }

  if (validTrips.length > 0 && invalidTrips.length === 0 && tripsWithWarnings.length === 0) {
    report += `## ✅ All trips are valid!\n\n`;
    report += `All ${validTrips.length} trips passed validation without errors or warnings.\n`;
  }

  return report;
}