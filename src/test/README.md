# Testing Documentation

This directory contains unit tests for the home page components of the travel showcase website.

## Test Structure

### Test Files
- `components/HomePage.test.ts` - Tests for home page functionality including trip listing, filtering, and sorting
- `components/TripCard.test.ts` - Tests for the TripCard component rendering and behavior

### Mock Data
- `mocks/tripData.ts` - Mock trip data used across tests

### Utilities
- `utils/domHelpers.ts` - Helper functions for creating DOM structures and simulating user interactions
- `setup.ts` - Test setup configuration

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The tests cover the following functionality:

### Home Page Components
- ✅ Trip listing functionality with mock data
- ✅ Current trip highlighting logic
- ✅ Responsive card layouts
- ✅ Filtering by trip status (all, completed, planned)
- ✅ Sorting by date (newest/oldest first) and alphabetically
- ✅ Empty state handling
- ✅ DOM structure and accessibility

### TripCard Component
- ✅ Basic rendering with all required elements
- ✅ Correct trip information display
- ✅ Trip duration calculation
- ✅ Current trip highlighting and badge display
- ✅ Statistics display (kilometers, days, cities, activities)
- ✅ Date formatting and accessibility
- ✅ Image handling and alt text
- ✅ Semantic HTML structure

## Requirements Covered

These tests fulfill the requirements specified in the task:

**Requirement 3.1**: Home page displays list of all previous trips
- ✅ Tests verify trip listing functionality
- ✅ Tests check proper rendering of multiple trips
- ✅ Tests validate empty state handling

**Requirement 3.2**: Current trip highlighting and display
- ✅ Tests verify current trip badge display
- ✅ Tests check current trip section rendering
- ✅ Tests validate current trip styling

**Additional Coverage**:
- ✅ Responsive design validation
- ✅ Interactive filtering and sorting
- ✅ Accessibility compliance
- ✅ Error handling and edge cases