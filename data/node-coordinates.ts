export interface NetworkNode {
  id: string
  label: string
  lat: number
  lng: number
  region: string
}

export const NETWORK_NODES: NetworkNode[] = [
  { id: 'DHK', label: "Dhaka Core",   lat: 23.81, lng: 90.41,  region: 'BD' },
  { id: 'COX', label: "Cox's Bazar",  lat: 21.43, lng: 92.01,  region: 'BD' },
  { id: 'KKT', label: 'Kutubdia',     lat: 21.83, lng: 91.86,  region: 'BD' },
  { id: 'MRS', label: 'Marseille',    lat: 43.30, lng: 5.38,   region: 'EU' },
  { id: 'SGP', label: 'Singapore',    lat: 1.35,  lng: 103.82, region: 'SG' },
]
