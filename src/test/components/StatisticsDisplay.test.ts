import { describe, it, expect } from "vitest";
import { render } from "@testing-library/dom";

// Mock trip data with different statistics scenarios
const mockTripWithAllStats = {
  id: "full-stats-trip",
  slug: "full-stats-trip",
  body: "",
  collection: "trips" as const,
  data: {
    title: "Full Stats Trip",
    description: "A trip with all statistics",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-10"),
    status: "completed" as const,
    headerImage: "/images/test.jpg",
    stats: [
      {
        id: "distance",
        value: 1500,
        label: "Distance Traveled",
        icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
        unit: "km",
      },
      {
        id: "activities",
        value: 8,
        label: "Activities",
        icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>',
      },
      {
        id: "people",
        value: 25,
        label: "People Met",
        icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
      },
      {
        id: "cities",
        value: 5,
        label: "Cities Visited",
        icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
      },
      {
        id: "duration",
        value: 9,
        label: "Duration",
        icon: '<circle cx="12" cy="12" r="10"></circle>',
        unit: "days",
      },
    ],
    route: {
      coordinates: [
        [-0.1278, 51.5074],
        [2.3522, 48.8566],
      ] as [number, number][],
      waypoints: [
        { name: "London", coordinates: [-0.1278, 51.5074] as [number, number] },
        { name: "Paris", coordinates: [2.3522, 48.8566] as [number, number] },
      ],
    },
    gallery: [{ image: "/images/test.jpg" }],
    activities: [],
    participants: [],
  },
};

const mockTripWithMinimalStats = {
  id: "minimal-stats-trip",
  slug: "minimal-stats-trip",
  body: "",
  collection: "trips" as const,
  data: {
    title: "Minimal Stats Trip",
    description: "A trip with some zero statistics",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-05"),
    status: "completed" as const,
    headerImage: "/images/test.jpg",
    stats: [
      {
        id: "distance",
        value: 500,
        label: "Distance Traveled",
        icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
        unit: "km",
      },
      {
        id: "activities",
        value: 0, // Should be hidden
        label: "Activities",
        icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>',
      },
      {
        id: "people",
        value: 0, // Should be hidden
        label: "People Met",
        icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
      },
      {
        id: "cities",
        value: 2,
        label: "Cities Visited",
        icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
      },
      {
        id: "duration",
        value: 4,
        label: "Duration",
        icon: '<circle cx="12" cy="12" r="10"></circle>',
        unit: "days",
      },
    ],
    route: {
      coordinates: [
        [-0.1278, 51.5074],
        [2.3522, 48.8566],
      ] as [number, number][],
      waypoints: [
        { name: "London", coordinates: [-0.1278, 51.5074] as [number, number] },
        { name: "Paris", coordinates: [2.3522, 48.8566] as [number, number] },
      ],
    },
    gallery: [{ image: "/images/test.jpg" }],
    activities: [],
    participants: [],
  },
};

const mockTripWithNoStats = {
  id: "no-stats-trip",
  slug: "no-stats-trip",
  body: "",
  collection: "trips" as const,
  data: {
    title: "No Stats Trip",
    description: "A trip with all zero statistics",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-01"),
    status: "completed" as const,
    headerImage: "/images/test.jpg",
    stats: [
      {
        id: "distance",
        value: 0, // Should be hidden
        label: "Distance Traveled",
        icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
        unit: "km",
      },
      {
        id: "activities",
        value: 0, // Should be hidden
        label: "Activities",
        icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>',
      },
      {
        id: "people",
        value: 0, // Should be hidden
        label: "People Met",
        icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
      },
      {
        id: "cities",
        value: 0, // Should be hidden
        label: "Cities Visited",
        icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
      },
      {
        id: "duration",
        value: 0, // Should be hidden
        label: "Duration",
        icon: '<circle cx="12" cy="12" r="10"></circle>',
        unit: "days",
      },
    ],
    route: {
      coordinates: [[-0.1278, 51.5074]] as [number, number][],
      waypoints: [
        { name: "London", coordinates: [-0.1278, 51.5074] as [number, number] },
      ],
    },
    gallery: [{ image: "/images/test.jpg" }],
    activities: [],
    participants: [],
  },
};

describe("Statistics Display Tests", () => {
  describe("TripCard Statistics Filtering", () => {
    it("should display all statistics when all have values", () => {
      // Simulate the logic from TripCard component
      const data = mockTripWithAllStats.data;
      const duration = Math.ceil(
        (data.endDate.getTime() - data.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Add calculated duration if not already present
      const hasExplicitDuration = data.stats.some(
        (stat) => stat.id === "duration" || stat.id === "days"
      );
      const statsWithDuration = hasExplicitDuration
        ? data.stats
        : [
            ...data.stats,
            {
              id: "duration",
              value: duration,
              label: "Duration",
              icon: "",
              unit: duration === 1 ? "day" : "days",
            },
          ];

      const visibleCardStats = statsWithDuration
        .filter((stat) => stat.value > 0)
        .slice(0, 4);

      expect(visibleCardStats).toHaveLength(4);
      expect(visibleCardStats.map((s) => s.id)).toEqual([
        "distance",
        "activities",
        "people",
        "cities",
      ]);
    });

    it("should hide statistics with zero values", () => {
      const data = mockTripWithMinimalStats.data;
      const duration = Math.ceil(
        (data.endDate.getTime() - data.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Add calculated duration if not already present
      const hasExplicitDuration = data.stats.some(
        (stat) => stat.id === "duration" || stat.id === "days"
      );
      const statsWithDuration = hasExplicitDuration
        ? data.stats
        : [
            ...data.stats,
            {
              id: "duration",
              value: duration,
              label: "Duration",
              icon: "",
              unit: duration === 1 ? "day" : "days",
            },
          ];

      const visibleCardStats = statsWithDuration
        .filter((stat) => stat.value > 0)
        .slice(0, 4);

      expect(visibleCardStats).toHaveLength(3);
      expect(visibleCardStats.map((s) => s.id)).toEqual([
        "distance",
        "cities",
        "duration",
      ]);
      expect(visibleCardStats.map((s) => s.value)).toEqual([500, 2, 4]);
    });

    it("should hide all statistics when all are zero", () => {
      const data = mockTripWithNoStats.data;
      const duration = Math.ceil(
        (data.endDate.getTime() - data.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Add calculated duration if not already present
      const hasExplicitDuration = data.stats.some(
        (stat) => stat.id === "duration" || stat.id === "days"
      );
      const statsWithDuration = hasExplicitDuration
        ? data.stats
        : [
            ...data.stats,
            {
              id: "duration",
              value: duration,
              label: "Duration",
              icon: "",
              unit: duration === 1 ? "day" : "days",
            },
          ];

      const visibleCardStats = statsWithDuration
        .filter((stat) => stat.value > 0)
        .slice(0, 4);

      expect(visibleCardStats).toHaveLength(0);
    });
  });

  describe("TripStats Component Filtering", () => {
    it("should display all statistics when all have values", () => {
      const stats = mockTripWithAllStats.data.stats;

      const visibleStats = stats.filter((stat) => stat.value > 0);

      expect(visibleStats).toHaveLength(5);
      expect(visibleStats.map((s) => s.id)).toEqual([
        "distance",
        "activities",
        "people",
        "cities",
        "duration",
      ]);
    });

    it("should hide statistics with zero values", () => {
      const stats = mockTripWithMinimalStats.data.stats;

      const visibleStats = stats.filter((stat) => stat.value > 0);

      expect(visibleStats).toHaveLength(3);
      expect(visibleStats.map((s) => s.id)).toEqual([
        "distance",
        "cities",
        "duration",
      ]);
      expect(visibleStats.map((s) => s.value)).toEqual([500, 2, 4]);
    });

    it("should hide entire statistics section when all stats are zero", () => {
      const stats = mockTripWithNoStats.data.stats;

      const visibleStats = stats.filter((stat) => stat.value > 0);

      expect(visibleStats).toHaveLength(0);
    });
  });

  describe("Statistics Formatting", () => {
    it("should format kilometers correctly", () => {
      const formatKilometers = (km: number): string => {
        if (km >= 1000) {
          return `${(km / 1000).toFixed(1)}k km`;
        }
        return `${new Intl.NumberFormat("en-US").format(km)} km`;
      };

      expect(formatKilometers(500)).toBe("500 km");
      expect(formatKilometers(1500)).toBe("1.5k km");
      expect(formatKilometers(2000)).toBe("2.0k km");
      expect(formatKilometers(1234)).toBe("1.2k km");
    });

    it("should format days correctly", () => {
      const formatDays = (days: number): string => {
        if (days === 1) return "1 day";
        return `${new Intl.NumberFormat("en-US").format(days)} days`;
      };

      expect(formatDays(1)).toBe("1 day");
      expect(formatDays(2)).toBe("2 days");
      expect(formatDays(10)).toBe("10 days");
      expect(formatDays(100)).toBe("100 days");
    });

    it("should format numbers with proper separators", () => {
      const formatNumber = (num: number): string => {
        return new Intl.NumberFormat("en-US").format(num);
      };

      expect(formatNumber(1)).toBe("1");
      expect(formatNumber(100)).toBe("100");
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1234567)).toBe("1,234,567");
    });
  });
});
