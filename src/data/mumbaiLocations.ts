export interface PresetLocation {
  name: string;
  area: string;
  latitude: number;
  longitude: number;
}

export const MUMBAI_PRESET_LOCATIONS: PresetLocation[] = [
  { name: 'BKC Bandra Kurla Complex', area: 'Bandra East', latitude: 19.0657, longitude: 72.8687 },
  { name: 'Western Express Highway (Andheri)', area: 'Andheri East', latitude: 19.1136, longitude: 72.8697 },
  { name: 'Dadar TT Circle', area: 'Dadar East', latitude: 19.0178, longitude: 72.8478 },
  { name: 'Bandra-Worli Sea Link Toll', area: 'Worli', latitude: 19.0222, longitude: 72.8155 },
  { name: 'Eastern Freeway (Wadala Exit)', area: 'Wadala', latitude: 19.0312, longitude: 72.8795 },
  { name: 'JVLR (IIT Bombay Powai)', area: 'Powai', latitude: 19.1254, longitude: 72.9150 },
  { name: 'Marine Drive (Churchgate)', area: 'Churchgate', latitude: 18.9340, longitude: 72.8229 },
  { name: 'Flora Fountain / Fort', area: 'Fort', latitude: 18.9322, longitude: 72.8335 },
  { name: 'Kurla Station West Road', area: 'Kurla', latitude: 19.0682, longitude: 72.8790 },
  { name: 'Sion Circle Flyover', area: 'Sion', latitude: 19.0385, longitude: 72.8617 },
  { name: 'Goregaon Aarey Signal', area: 'Goregaon East', latitude: 19.1550, longitude: 72.8590 },
  { name: 'Vashi Creek Bridge Entry', area: 'Mankhurd', latitude: 19.0435, longitude: 72.9640 },
];

export const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];
export const DEFAULT_ZOOM = 12;
