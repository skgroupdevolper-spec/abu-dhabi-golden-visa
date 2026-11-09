// Built-in cities for the About page "Clients worldwide" globe. Admin > Site settings can replace them.
export type WorldCity = { country: string; city: string; lat: number; lng: number };
export const WORLD: WorldCity[] = [
  { country: 'United Arab Emirates', city: 'Abu Dhabi', lat: 24.45, lng: 54.38 },
  { country: 'United Kingdom', city: 'London', lat: 51.51, lng: -0.13 },
  { country: 'United States', city: 'New York', lat: 40.71, lng: -74.01 },
  { country: 'Canada', city: 'Toronto', lat: 43.65, lng: -79.38 },
  { country: 'Brazil', city: 'São Paulo', lat: -23.55, lng: -46.63 },
  { country: 'Nigeria', city: 'Lagos', lat: 6.52, lng: 3.38 },
  { country: 'South Africa', city: 'Johannesburg', lat: -26.2, lng: 28.05 },
  { country: 'Egypt', city: 'Cairo', lat: 30.04, lng: 31.24 },
  { country: 'France', city: 'Paris', lat: 48.86, lng: 2.35 },
  { country: 'Germany', city: 'Berlin', lat: 52.52, lng: 13.4 },
  { country: 'Türkiye', city: 'Istanbul', lat: 41.01, lng: 28.98 },
  { country: 'Russia', city: 'Moscow', lat: 55.76, lng: 37.62 },
  { country: 'Saudi Arabia', city: 'Riyadh', lat: 24.71, lng: 46.68 },
  { country: 'Pakistan', city: 'Lahore', lat: 31.52, lng: 74.36 },
  { country: 'India', city: 'Mumbai', lat: 19.08, lng: 72.88 },
  { country: 'China', city: 'Shanghai', lat: 31.23, lng: 121.47 },
  { country: 'Japan', city: 'Tokyo', lat: 35.68, lng: 139.69 },
  { country: 'Singapore', city: 'Singapore', lat: 1.35, lng: 103.82 },
  { country: 'Australia', city: 'Sydney', lat: -33.87, lng: 151.21 },
];
