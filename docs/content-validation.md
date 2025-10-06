# Content Validation Guide

This document describes the content validation utilities available for the travel showcase website.

## Overview

The content validation system ensures that all trip content follows the required schema and maintains consistency across the site. It includes both runtime validation during builds and standalone validation tools for development.

## Validation Components

### 1. Content Schema Validation (`src/utils/contentValidation.ts`)

The core validation utilities that check trip content against the defined Zod schema:

- **Schema Validation**: Ensures all required fields are present and correctly typed
- **Business Logic Validation**: Checks date relationships, coordinate ranges, and status consistency
- **Format Validation**: Validates image paths, URLs, and content structure

### 2. CLI Validation Script (`scripts/validate-content.js`)

A standalone Node.js script for validating content outside of the Astro build process:

```bash
# Basic validation
npm run validate:content

# Generate a report file
npm run validate:content:report

# Validation for CI/CD (exits with error code on failures)
npm run validate:content:ci
```

**Available Options:**
- `--output <file>`: Write report to file instead of stdout
- `--verbose`: Show detailed validation results
- `--exit-on-error`: Exit with code 1 if validation errors found
- `--help`: Show help message

### 3. Build Integration (`src/integrations/contentValidation.ts`)

An Astro integration that runs validation during the build process:

- Automatically validates content during `astro build`
- Can fail builds on validation errors
- Provides detailed logging of issues
- Optional report generation

### 4. Content Linting Configuration (`.contentlintrc.json`)

Configuration file defining validation rules and standards:

```json
{
  "rules": {
    "title": {
      "required": true,
      "minLength": 5,
      "maxLength": 100
    },
    "description": {
      "required": true,
      "minLength": 20,
      "maxLength": 300
    }
  }
}
```

## Validation Rules

### Required Fields

All trip content must include:

- `title`: String, 1-100 characters
- `description`: String, 10+ characters
- `startDate`: Valid date
- `endDate`: Valid date (must be after startDate)
- `status`: One of 'completed', 'current', 'planned'
- `headerImage`: String path to image
- `stats`: Object with kilometers, activities, peopleMet, cities, days
- `route`: Object with coordinates array and waypoints array
- `gallery`: Array with at least one image object
- `activities`: Array of activity objects
- `participants`: Array of participant objects

### Business Logic Validation

- **Date Consistency**: Start date must be before end date
- **Status Validation**: 
  - 'current' trips should have dates spanning today
  - 'completed' trips should have end dates in the past
  - 'planned' trips should have start dates in the future
- **Coordinate Validation**: Latitude (-90 to 90), Longitude (-180 to 180)
- **Days Calculation**: stats.days should match calculated trip duration

### Content Format Validation

- **Frontmatter**: Must be valid YAML enclosed in `---`
- **Markdown Content**: Should include main heading and substantial content
- **Image Paths**: Should use absolute paths starting with `/`
- **URLs**: Registration URLs must be valid URLs

## Usage Examples

### Development Workflow

1. **Create/Edit Trip Content**: Add or modify trip files in `src/content/trips/`

2. **Validate During Development**:
   ```bash
   npm run validate:content
   ```

3. **Generate Detailed Report**:
   ```bash
   npm run validate:content:report
   ```

4. **Build with Validation**:
   ```bash
   npm run build
   ```

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
- name: Validate Content
  run: npm run validate:content:ci
  
- name: Build Site
  run: npm run build
```

### Custom Validation

Use the validation utilities in your own scripts:

```typescript
import { validateAllTrips, generateValidationReport } from './src/utils/contentValidation.js';

const results = await validateAllTrips();
const report = generateValidationReport(results);
console.log(report);
```

## Configuration

### Astro Integration Configuration

Configure the validation integration in `astro.config.mjs`:

```javascript
import contentValidation from './src/integrations/contentValidation.ts';

export default defineConfig({
  integrations: [
    contentValidation({
      failOnError: true,        // Fail build on validation errors
      showWarnings: true,       // Show warnings in build output
      generateReport: false,    // Generate validation report file
      reportPath: 'validation-report.md'  // Report file path
    })
  ]
});
```

### Package.json Scripts

The following npm scripts are available:

- `validate:content`: Run validation and show results
- `validate:content:report`: Generate markdown report file
- `validate:content:ci`: Run validation for CI (exits on error)
- `prebuild`: Automatically runs validation before build

## Error Types

### Validation Errors (Build Failing)

- Missing required fields
- Invalid data types
- Invalid coordinate ranges
- Malformed YAML frontmatter
- Invalid URLs

### Validation Warnings (Non-blocking)

- Status/date mismatches
- Calculated days discrepancies
- Missing optional fields
- Short content warnings
- Image path recommendations

## Troubleshooting

### Common Issues

1. **YAML Parsing Errors**
   - Check frontmatter syntax
   - Ensure proper indentation
   - Validate special characters are quoted

2. **Date Format Issues**
   - Use YYYY-MM-DD format
   - Ensure dates are valid
   - Check timezone considerations

3. **Coordinate Validation Failures**
   - Verify latitude/longitude ranges
   - Check coordinate array format: `[longitude, latitude]`
   - Ensure waypoints have valid coordinates

4. **Image Path Warnings**
   - Use absolute paths starting with `/`
   - Verify image files exist in public directory
   - Check supported formats (.jpg, .png, .webp, etc.)

### Getting Help

- Check the validation report for detailed error messages
- Use `--verbose` flag for additional debugging information
- Review the schema definition in `src/content/config.ts`
- Examine existing valid trip files for reference

## Best Practices

1. **Regular Validation**: Run validation frequently during development
2. **CI Integration**: Include validation in your build pipeline
3. **Report Generation**: Generate reports for documentation and tracking
4. **Schema Updates**: Update validation rules when schema changes
5. **Error Handling**: Address validation errors before warnings
6. **Content Review**: Use warnings to improve content quality