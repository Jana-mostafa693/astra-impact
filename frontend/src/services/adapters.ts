import type { SiteDetail, Body } from '../types/science';
import type { SiteLocation, DisplayProvenance } from '../types/view';
import { WORLD_PRESENTATION } from './presentation';
export const UNAVAILABLE = 'Data unavailable';
export function verificationClasses(site: SiteLocation): string {
  return site.pinColor === 'green'
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : site.pinColor === 'yellow'
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : 'bg-rose-500/20 text-rose-300 border-rose-500/30';
}
export function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
export function formatNumber(value: unknown, unit: string, digits = 2): string {
  const n = finiteNumber(value);
  return n === null ? UNAVAILABLE : `${n.toLocaleString('en-US', { maximumFractionDigits: digits })}${unit ? ` ${unit}` : ''}`;
}
export function numericRange(min: unknown, max: unknown, unit: string): string {
  return finiteNumber(min) === null || finiteNumber(max) === null ? UNAVAILABLE : `${formatNumber(min, '', 2)} – ${formatNumber(max, unit, 2)}`;
}
function text(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : UNAVAILABLE;
}
export function adaptSite(detail: SiteDetail): SiteLocation {
  const v = detail.site_level_values;
  const body = detail.body as Body;
  const provenance: DisplayProvenance[] = [];
  function value(field: string, sourceField: string): unknown {
    const measurement = detail.environmental_measurements.find(x => x.variable === sourceField);
    const item = v[sourceField] ?? null;
    provenance.push({ field, sourceField, value: item, sourceId: measurement?.source_id ?? null, unit: measurement?.unit ?? null, dataClass: measurement?.data_class ?? null });
    return item;
  }
  const verification = detail.site_verification_status;
  const verified = body === 'Earth' && verification === 'EXISTING_ANALYZED';
  const label = body === 'Earth' ? verified ? 'Existing analyzed' : 'Proposed screening' : body === 'Moon' && detail.site_id === 'MOON-MONS-MOUTON' ? 'Feature reference • boundary unverified' : 'Reference target • qualified evidence';
  let temp: string;
  let definition: string;
  let pressure: string;
  if (body === 'Earth') {
    temp = formatNumber(value('temp', 'climate__air_temperature_mean_c'), '°C');
    definition = '2015–2024 mean 2 m air temperature • ERA5-Land reanalysis';
    pressure = formatNumber(value('atmosphereOrPressure', 'climate__surface_pressure_mean_hpa'), 'hPa');
  } else if (body === 'Moon') {
    temp = numericRange(value('temp', 'surface_temperature_min_k'), value('temp', 'surface_temperature_max_k'), 'K');
    definition = 'Diviner sampled bolometric brightness-temperature range • not kinetic temperature';
    pressure = formatNumber(value('atmosphereOrPressure', 'atmospheric_pressure_pa'), 'Pa');
  } else {
    temp = numericRange(value('temp', 'mcd__surface_temperature_sampled_model_min_k'), value('temp', 'mcd__surface_temperature_sampled_model_max_k'), 'K');
    definition = 'MCD 6.2 sampled modeled surface-temperature range • not observations';
    pressure = numericRange(value('atmosphereOrPressure', 'mcd__surface_pressure_sampled_model_min_pa'), value('atmosphereOrPressure', 'mcd__surface_pressure_sampled_model_max_pa'), 'Pa');
  }
  const terrain = text(body === 'Earth' ? v.site_geological_classification : v.geological_classification);
  const composition = body === 'Earth' ? text(v.mapped_rock_type) : UNAVAILABLE;
  const description = text(body === 'Earth' ? v.geological_unit : (detail.geology as Record<string, unknown> | null)?.geological_classification);
  return {
    id: detail.site_id, name: detail.site_name, world: body,
    subtitle: body === 'Earth' ? `${label} • climate and mapped environment` : label,
    verificationLabel: label, pinColor: verified ? 'green' : body === 'Earth' ? 'yellow' : 'red',
    pinHex: verified ? '#22c55e' : body === 'Earth' ? '#eab308' : '#ef4444',
    temp, temperatureDefinition: definition, terrain,
    slope: formatNumber(value('slope', 'slope_mean_deg'), '°'),
    elevation: formatNumber(value('elevation', 'elevation_m'), 'm'),
    atmosphereOrPressure: pressure, composition,
    lat: detail.coordinates.latitude_deg,
    lon: detail.coordinates.longitude_east_deg >= -180 && detail.coordinates.longitude_east_deg <= 180 ? detail.coordinates.longitude_east_deg : ((detail.coordinates.longitude_east_deg + 180) % 360 + 360) % 360 - 180,
    img: WORLD_PRESENTATION[body].thumbImg,
    description: description === UNAVAILABLE ? 'Exact-point composition unavailable; regional interpretations and source limitations remain visible.' : description,
    detail, displayProvenance: provenance,
  };
}
