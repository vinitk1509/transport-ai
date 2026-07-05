export function normalizeStationName(name: string | undefined | null): string {
  if (!name) return 'Unknown'
  
  let clean = name.toLowerCase().trim()
  
  // Remove OCR noise (phone numbers, random digits)
  clean = clean.replace(/[0-9]+/g, '').trim()
  
  // Handle specific OCR misspellings
  clean = clean.replace(/kot\s*kapura/g, 'kotkapura')
  clean = clean.replace(/kotakapura/g, 'kotkapura')
  
  // Remove special characters, keep only letters and spaces
  clean = clean.replace(/[^a-z\s]/g, '').trim()
  
  // Normalize internal spaces
  clean = clean.replace(/\s+/g, ' ')
  
  if (!clean) return 'Unknown'
  
  // Title Case
  return clean.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function formatRoute(source: string | undefined | null, destination: string | undefined | null): string {
  const src = normalizeStationName(source)
  const dest = normalizeStationName(destination)
  return `${src} → ${dest}`
}

export function truncateRoute(route: string, maxLength: number = 20): string {
  if (route.length <= maxLength) return route;
  return route.substring(0, maxLength) + '...';
}

// Generate an array of consistent colors for charts
export const CHART_COLORS = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#9333ea', // purple-600
  '#0891b2', // cyan-600
  '#be185d', // pink-700
  '#ea580c', // orange-600
  '#4f46e5', // indigo-600
  '#059669', // emerald-600
]
