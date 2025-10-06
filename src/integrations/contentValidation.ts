import type { AstroIntegration } from 'astro';

export interface ContentValidationOptions {
  /**
   * Whether to fail the build on validation errors
   * @default true
   */
  failOnError?: boolean;
  
  /**
   * Whether to show warnings in the build output
   * @default true
   */
  showWarnings?: boolean;
  
  /**
   * Whether to generate a validation report file
   * @default false
   */
  generateReport?: boolean;
  
  /**
   * Path to write the validation report
   * @default 'validation-report.md'
   */
  reportPath?: string;
}

export default function contentValidation(options: ContentValidationOptions = {}): AstroIntegration {
  const {
    failOnError = true,
    showWarnings = true,
    generateReport = false,
    reportPath = 'validation-report.md'
  } = options;

  return {
    name: 'content-validation',
    hooks: {
      'astro:build:start': async ({ logger }) => {
        logger.info('🔍 Validating trip content...');
        
        try {
          // Dynamically import validation functions to avoid config-time issues
          const { validateAllTrips, generateValidationReport } = await import('../utils/contentValidation.ts');
          const results = await validateAllTrips();
          const validTrips = results.filter(r => r.isValid);
          const invalidTrips = results.filter(r => !r.isValid);
          const tripsWithWarnings = results.filter(r => r.warnings.length > 0);

          // Log summary
          logger.info(`📊 Validation Summary:`);
          logger.info(`   ✅ Valid: ${validTrips.length}`);
          if (invalidTrips.length > 0) {
            logger.error(`   ❌ Invalid: ${invalidTrips.length}`);
          }
          if (tripsWithWarnings.length > 0 && showWarnings) {
            logger.warn(`   ⚠️  Warnings: ${tripsWithWarnings.length}`);
          }

          // Log detailed errors
          if (invalidTrips.length > 0) {
            logger.error('❌ Content validation errors found:');
            invalidTrips.forEach(trip => {
              logger.error(`   ${trip.tripId}:`);
              trip.errors.forEach(error => {
                logger.error(`     - ${error}`);
              });
            });
          }

          // Log warnings if enabled
          if (showWarnings && tripsWithWarnings.length > 0) {
            logger.warn('⚠️  Content validation warnings:');
            tripsWithWarnings.forEach(trip => {
              if (trip.warnings.length > 0) {
                logger.warn(`   ${trip.tripId}:`);
                trip.warnings.forEach(warning => {
                  logger.warn(`     - ${warning}`);
                });
              }
            });
          }

          // Generate report if requested
          if (generateReport) {
            const { generateValidationReport: genReport } = await import('../utils/contentValidation.ts');
            const report = genReport(results);
            const fs = await import('fs');
            fs.writeFileSync(reportPath, report);
            logger.info(`📄 Validation report written to: ${reportPath}`);
          }

          // Fail build if there are errors and failOnError is true
          if (failOnError && invalidTrips.length > 0) {
            throw new Error(`Content validation failed with ${invalidTrips.length} invalid trips. Fix the errors above and try again.`);
          }

          if (invalidTrips.length === 0) {
            logger.info('✅ All trip content is valid!');
          }

        } catch (error) {
          if (error instanceof Error && error.message.includes('Content validation failed')) {
            throw error; // Re-throw validation errors
          }
          logger.error(`❌ Content validation error: ${error}`);
          if (failOnError) {
            throw new Error('Content validation could not be completed');
          }
        }
      }
    }
  };
}