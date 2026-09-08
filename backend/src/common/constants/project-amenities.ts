/** Infrastructure / amenities a development project can advertise. */
export const PROJECT_AMENITIES = [
  'sea_view',
  'beach_access',
  'pool',
  'gym',
  'spa',
  'parking',
  'underground_parking',
  'concierge',
  'security',
  'playground',
  'garden',
  'rooftop',
  'restaurant',
  'shopping',
  'coworking',
  'cinema',
  'elevator',
  'generator',
  'smart_home',
  'hotel_management',
] as const;

export type ProjectAmenity = (typeof PROJECT_AMENITIES)[number];
