export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type UnknownRecord = Record<string, unknown>;
export type Body = 'Earth' | 'Mars' | 'Moon';

export interface Coordinates extends UnknownRecord {
  body: Body;
  latitude_deg: number;
  longitude_east_deg: number;
  longitude_0_360_deg?: number | null;
  longitude_convention?: string | null;
  reference_system?: string | null;
  coordinate_reference_system?: string | null;
  earth_epsg?: number | null;
  earth_map_eligible?: boolean | null;
  radius_m?: number | null;
}

export interface Measurement extends UnknownRecord {
  variable: string;
  value: number | string | boolean | null;
  unit?: string | null;
  data_class?: string | null;
  source_id?: string | null;
  source_url?: string | null;
  source_file?: string | null;
  spatial_support?: string | null;
  quality_flags?: string | string[] | UnknownRecord | null;
  missing?: boolean;
}

export interface SiteSummary extends UnknownRecord {
  site_id: string;
  site_name: string;
  body: Body;
  coordinates: Coordinates;
  scientific_quality_flags?: string | string[] | UnknownRecord | null;
  environmental_measurements: Measurement[];
  missing_variables?: string[];
  purpose_specific_analog_evidence?: UnknownRecord | UnknownRecord[] | null;
  time_series?: Record<string, TimeSeriesReference>;
}

export interface SiteDetail extends SiteSummary {
  site_verification_status?: string | null;
  coordinate_verification_status?: string | null;
  boundary_status?: string | null;
  source_ids?: string[];
  overall_similarity_percentage?: number | null;
  site_level_values: UnknownRecord;
  geology?: UnknownRecord | null;
  terrain?: UnknownRecord | null;
  landcover?: UnknownRecord | null;
  snow_ice?: UnknownRecord | null;
  purpose_evidence_matrix?: UnknownRecord | UnknownRecord[] | null;
  units_by_field?: Record<string, unknown> | null;
  source_catalog_references?: UnknownRecord | UnknownRecord[] | null;
}

export interface TimeSeriesReference extends UnknownRecord {
  path?: string | null;
  records?: number | null;
  source_id?: string | null;
  data_class?: string | null;
}

export interface FieldMetadata extends UnknownRecord {
  unit?: string | null;
  source_id?: string | null;
  data_class?: string | null;
  label?: string | null;
}

export interface SeriesData extends UnknownRecord {
  schema_version?: string;
  site_id?: string;
  body?: string;
  kind: string;
  source: UnknownRecord;
  units?: Record<string, string | null>;
  field_metadata?: Record<string, FieldMetadata>;
  source_policy?: string | null;
  records: UnknownRecord[];
  guardrail?: string | UnknownRecord | null;
  site_metadata?: UnknownRecord | null;
}

export interface Recommendation extends UnknownRecord {
  earth_site_id?: string;
  planetary_site_id?: string;
  research_purpose?: string;
  rank?: number | null;
  evidence_tier?: string;
  reason?: string;
  confidence?: string;
  limitations?: string;
}

export interface Comparison extends UnknownRecord {
  earth_site_id?: string;
  planetary_site_id?: string;
  planetary_body?: string;
  category?: string;
  earth_value?: number | null;
  planetary_value?: number | null;
  earth_units?: string | null;
  planetary_units?: string | null;
  quality_flags?: string | string[] | UnknownRecord | null;
}
