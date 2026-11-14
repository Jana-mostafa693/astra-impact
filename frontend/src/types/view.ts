import type { Body, SiteDetail } from './science';
export interface DisplayProvenance {
  field: string;
  sourceField: string;
  sourceId: string | null;
  unit: string | null;
  value: unknown;
  dataClass: string | null;
}
export interface SiteLocation {
  id: string;
  name: string;
  world: Body;
  subtitle: string;
  verificationLabel: string;
  pinColor: 'green' | 'yellow' | 'red';
  pinHex: string;
  temp: string;
  temperatureDefinition: string;
  terrain: string;
  slope: string;
  elevation: string;
  atmosphereOrPressure: string;
  composition: string;
  lat: number;
  lon: number;
  img: string;
  description: string;
  detail: SiteDetail;
  displayProvenance: DisplayProvenance[];
}
