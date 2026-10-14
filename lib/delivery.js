export const DELIVERY_AREAS = [
  { value: "bole", label: "Bole - Woreda 03", fee: 65, etaMinutes: [35, 45], lat: 8.9950, lng: 38.7896 },
  { value: "piazza", label: "Piazza", fee: 55, etaMinutes: [30, 40], lat: 9.0350, lng: 38.7469 },
  { value: "cmc", label: "CMC", fee: 70, etaMinutes: [40, 50], lat: 9.0190, lng: 38.8330 },
  { value: "megenagna", label: "Megenagna", fee: 60, etaMinutes: [30, 40], lat: 9.0200, lng: 38.8010 },
  { value: "sarbet", label: "Sarbet", fee: 65, etaMinutes: [35, 45], lat: 8.9930, lng: 38.7260 },
];

// Where orders leave from. Approximate coordinates, [lat, lng] (Leaflet order).
export const KITCHEN = { name: "Addis Eats kitchen", lat: 9.0108, lng: 38.7613 };

export function getArea(areaValue) {
  return DELIVERY_AREAS.find((a) => a.value === areaValue) ?? DELIVERY_AREAS[0];
}

export function getDeliveryEstimate(areaValue) {
  const area = DELIVERY_AREAS.find((a) => a.value === areaValue) ?? DELIVERY_AREAS[0];
  return { fee: area.fee, etaLabel: `${area.etaMinutes[0]}-${area.etaMinutes[1]} min` };
}