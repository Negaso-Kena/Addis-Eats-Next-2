export const DELIVERY_AREAS = [
  { value: "bole", label: "Bole - Woreda 03", fee: 65, etaMinutes: [35, 45] },
  { value: "piazza", label: "Piazza", fee: 55, etaMinutes: [30, 40] },
  { value: "cmc", label: "CMC", fee: 70, etaMinutes: [40, 50] },
  { value: "megenagna", label: "Megenagna", fee: 60, etaMinutes: [30, 40] },
  { value: "sarbet", label: "Sarbet", fee: 65, etaMinutes: [35, 45] },
];

export function getDeliveryEstimate(areaValue) {
  const area = DELIVERY_AREAS.find((a) => a.value === areaValue) ?? DELIVERY_AREAS[0];
  return { fee: area.fee, etaLabel: `${area.etaMinutes[0]}-${area.etaMinutes[1]} min` };
}