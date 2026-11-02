interface MapsTarget {
  address?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
}

const hasPin = (lat?: number, lng?: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) && Math.abs(lat!) <= 90 && Math.abs(lng!) <= 180;

/**
 * Google Maps directions from the picker's current location to the customer.
 * Uses the GPS pin the customer saved when booking (exact); the text address is only a fallback
 * because it can be just an area name.
 */
export function directionsUrl(stop: MapsTarget): string {
  const text = [stop.address, stop.locality].filter((v) => v && v !== '—').join(', ');
  const destination = hasPin(stop.latitude, stop.longitude)
    ? `${stop.latitude},${stop.longitude}`
    : encodeURIComponent(text);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export function openDirections(stop: MapsTarget): void {
  if (typeof window !== 'undefined') window.open(directionsUrl(stop), '_blank', 'noopener');
}
