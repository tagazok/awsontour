#!/usr/bin/env node

/**
 * Content validation script for trip data
 * Usage: node scripts/validate-content.js [options]
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYAML } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Import validation functions (simplified for Node.js environment)
const tripSchema = {
  validate: (data) => {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!data.title || typeof data.title !== 'string') {
      errors.push('title is required and must be a string');
    }
    if (!data.description || typeof data.description !== 'string') {
      errors.push('description is required and must be a string');
    }
    if (!data.startDate) {
      errors.push('startDate is required');
    }
    if (!data.endDate) {
      errors.push('endDate is required');
    }
    if (!['completed', 'current', 'planned'].includes(data.status)) {
      errors.push('status must be one of: completed, current, planned');
    }
    if (!data.headerImage || typeof data.headerImage !== 'string') {
      errors.push('headerImage is required and must be a string');
    }

    // Stats validation
    if (!data.stats || typeof data.stats !== 'object') {
      errors.push('stats object is required');
    } else {
      const requiredStats = ['kilometers', 'activities', 'peopleMet', 'cities', 'days'];
      requiredStats.forEach(stat => {
        if (typeof data.stats[stat] !== 'number' || data.stats[stat] < 0) {
          errors.push(`stats.${stat} must be a positive number`);
        }
      });
    }

    // Route validation
    if (!data.route || typeof data.route !== 'object') {
      errors.push('route object is required');
    } else {
      if (!Array.isArray(data.route.coordinates) || data.route.coordinates.length < 2) {
        errors.push('route.coordinates must be an array with at least 2 coordinate pairs');
      }
      if (!Array.isArray(data.route.waypoints) || data.route.waypoints.length < 1) {
        errors.push('route.waypoints must be an array with at least 1 waypoint');
      }
    }

    // Gallery validation
    if (!Array.isArray(data.gallery) || data.gallery.length < 1) {
      errors.push('gallery must be an array with at least 1 image');
    }

    // Activities validation
    if (!Array.isArray(data.activities)) {
      errors.push('activities must be an array');
    }

    // Participants validation
    if (!Array.isArray(data.participants)) {
      errors.push('participants must be an array');
    }

    // Date logic validation
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start > end) {
        errors.push('startDate must be before endDate');
      }

      // Check days calculation
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (data.stats && Math.abs(daysDiff - data.stats.days) > 1) {
        warnings.push(`stats.days (${data.stats.days}) doesn't match calculated days (${daysDiff})`);
      }
    }

    // Status-specific validations
    const now = new Date();
    if (data.status === 'current') {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start > now) {
        warnings.push('Trip marked as "current" but start date is in the future');
      }
      if (end < now) {
        warnings.push('Trip marked as "current" but end date is in the past');
      }
    }

    return { errors, warnings };
  }
};

function validateContentFormat(content, filename) {
  const errors = [];
  const warnings = [];

  // Check frontmatter structure
  if (!content.startsWith('---')) {
    errors.push('Content must start with frontmatter (---)');
    return { errors, warnings };
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    errors.push('Frontmatter must be properly closed with ---');
    return { errors, warnings };
  }

  const frontmatter = content.slice(3, frontmatterEnd);
  const markdownContent = content.slice(frontmatterEnd + 3);

  // Parse YAML frontmatter
  try {
    const data = parseYAML(frontmatter);
    const validation = tripSchema.validate(data);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
  } catch (error) {
    errors.push(`YAML parsing error: ${error.message}`);
  }

  // Check markdown content
  if (markdownContent.trim().length === 0) {
    warnings.push('No markdown content found after frontmatter');
  }

  const hasMainHeading = /^#\s+/.test(markdownContent);
  if (!hasMainHeading) {
    warnings.push('Consider adding a main heading (# Title) to the markdown content');
  }

  if (markdownContent.trim().length < 100) {
    warnings.push('Markdown content is very short, consider adding more details');
  }

  return { errors, warnings };
}

function validateAllTripFiles() {
  const tripsDir = join(projectRoot, 'src/content/trips');
  const results = [];

  try {
    const files = readdirSync(tripsDir).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filepath = join(tripsDir, file);
      const content = readFileSync(filepath, 'utf-8');
      const validation = validateContentFormat(content, file);
      
      results.push({
        tripId: file.replace('.md', ''),
        filename: file,
        isValid: validation.errors.length === 0,
        errors: validation.errors,
        warnings: validation.warnings
      });
    }
  } catch (error) {
    results.push({
      tripId: 'collection',
      filename: 'N/A',
      isValid: false,
      errors: [`Failed to read trips directory: ${error.message}`],
      warnings: []
    });
  }

  return results;
}

function generateReport(results) {
  const validTrips = results.filter(r => r.isValid);
  const invalidTrips = results.filter(r => !r.isValid);
  const tripsWithWarnings = results.filter(r => r.warnings.length > 0);

  let report = `# Trip Content Validation Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `**Summary:**\n`;
  report += `- Total trips: ${results.length}\n`;
  report += `- Valid trips: ${validTrips.length}\n`;
  report += `- Invalid trips: ${invalidTrips.length}\n`;
  report += `- Trips with warnings: ${tripsWithWarnings.length}\n\n`;

  if (invalidTrips.length > 0) {
    report += `## ❌ Invalid Trips\n\n`;
    invalidTrips.forEach(trip => {
      report += `### ${trip.tripId} (${trip.filename})\n`;
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
      report += `### ${trip.tripId} (${trip.filename})\n`;
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

// CLI execution
function main() {
  const args = process.argv.slice(2);
  const options = {
    output: null,
    verbose: false,
    exitOnError: false
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--exit-on-error':
        options.exitOnError = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: node scripts/validate-content.js [options]

Options:
  -o, --output <file>    Write report to file instead of stdout
  -v, --verbose          Show detailed validation results
  --exit-on-error        Exit with code 1 if validation errors found
  -h, --help             Show this help message

Examples:
  node scripts/validate-content.js
  node scripts/validate-content.js --output validation-report.md
  node scripts/validate-content.js --verbose --exit-on-error
        `);
        process.exit(0);
        break;
    }
  }

  console.log('🔍 Validating trip content...\n');

  const results = validateAllTripFiles();
  const report = generateReport(results);

  if (options.output) {
    writeFileSync(options.output, report);
    console.log(`📄 Report written to: ${options.output}`);
  } else {
    console.log(report);
  }

  // Summary output
  const validCount = results.filter(r => r.isValid).length;
  const invalidCount = results.filter(r => !r.isValid).length;
  const warningCount = results.filter(r => r.warnings.length > 0).length;

  console.log(`\n📊 Validation Summary:`);
  console.log(`   ✅ Valid: ${validCount}`);
  console.log(`   ❌ Invalid: ${invalidCount}`);
  console.log(`   ⚠️  Warnings: ${warningCount}`);

  if (options.verbose) {
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      const status = result.isValid ? '✅' : '❌';
      console.log(`   ${status} ${result.tripId}`);
      if (options.verbose && (result.errors.length > 0 || result.warnings.length > 0)) {
        result.errors.forEach(error => console.log(`      ❌ ${error}`));
        result.warnings.forEach(warning => console.log(`      ⚠️ ${warning}`));
      }
    });
  }

  if (options.exitOnError && invalidCount > 0) {
    console.log('\n💥 Exiting with error code due to validation failures');
    process.exit(1);
  }

  console.log('\n✨ Validation complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}