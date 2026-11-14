import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AlertCircle, BarChart3, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { GlassPanel } from '../components/OriginalUI';
import type { FieldMetadata, SeriesData, SiteDetail, UnknownRecord } from '../types/science';

export interface ScientificChartsProps {
  site: SiteDetail;
}

type ChartPoint = UnknownRecord & { __x: string | number; __label: string };
type AxisMode = 'ls' | 'localtime';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const chartColors = ['#22d3ee', '#fb923c', '#a78bfa', '#34d399'];

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function humanize(value: string): string {
  return value
    .replace(/_c$|_k$|_pa$|_m2_k_sqrt_s$|_m_s$|_ms$|_m3$|_pct$|_mm$|_deg$/g, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function metadataFor(series: SeriesData, field: string): FieldMetadata {
  return series.field_metadata?.[field] ?? {};
}

function unitFor(series: SeriesData, field: string): string {
  const metadata = metadataFor(series, field);
  const declared = metadata.unit ?? series.units?.[field];
  return declared && declared.trim() ? declared : 'source-defined';
}

function sourceFor(series: SeriesData, field: string): string {
  const fieldSource = metadataFor(series, field).source_id;
  const source = series.source;
  const sourceId = typeof fieldSource === 'string' ? fieldSource : source.source_id;
  return typeof sourceId === 'string' && sourceId ? sourceId : 'source not specified';
}

function classFor(series: SeriesData, field: string): string {
  const fieldClass = metadataFor(series, field).data_class;
  const sourceClass = series.source.data_class ?? series.source.observation_model_or_proxy_status;
  if (typeof fieldClass === 'string' && fieldClass) return fieldClass;
  return typeof sourceClass === 'string' && sourceClass ? sourceClass : 'classification not specified';
}

function qualityFor(point: UnknownRecord): string {
  const candidate = point.quality_flags ?? point.quality_status ?? point.record_status ?? point.day_status;
  return asText(candidate);
}

function preferredKind(site: SiteDetail): string | null {
  const kinds = Object.keys(site.time_series ?? {});
  if (!kinds.length) return null;
  const preferred = site.body === 'Earth' ? 'climatology_months' : site.body === 'Moon' ? 'diviner_local_time' : 'mcd_seasonal';
  return kinds.includes(preferred) ? preferred : kinds[0];
}

export function numericFields(series: SeriesData, records: UnknownRecord[], kind: string): string[] {
  const excluded = new Set([
    'year',
    'month',
    'calendar_month',
    'ls_deg',
    'local_solar_time_martian_hours',
    'local_time_hours',
    'depth_top_cm',
    'depth_bottom_cm',
    'height_above_surface_m',
    'sample_latitude',
    'sample_longitude_east',
    'target_latitude',
    'target_longitude_east',
    'nominal_resolution_m',
    'query_height_als_m',
    'interpolation_mask',
    'unique_localtime_nodes',
    'latitude_deg',
    'longitude_deg',
    'spatial_resolution_deg'
  ]);
  const values = new Set<string>();
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (excluded.has(key) || key.endsWith('_raw_k')) continue;
      if (asNumber(value) !== null) values.add(key);
    }
  }

  if (kind === 'tes_inertia') {
    return [...values].filter((key) => key === 'thermal_inertia_j_m2_k_sqrt_s');
  }
  if (kind === 'diviner_local_time') {
    return [...values].filter((key) => /brightness_temperature_(k|c)$/.test(key));
  }
  return [...values].filter((key) => !/^(stable_id|negative_channel_artifact_count)$/.test(key));
}

export function pointAxis(kind: string, point: UnknownRecord): { value: string | number; label: string } {
  if (kind === 'annual_climate') {
    const year = asNumber(point.year);
    return { value: year ?? asText(point.year), label: year === null ? asText(point.year) : String(year) };
  }
  if (kind === 'monthly_climate' || kind === 'power_monthly' || kind === 'solar_monthly') {
    const year = asNumber(point.year);
    const month = asNumber(point.month);
    const value = year !== null && month !== null ? year * 100 + month : asText(point.period_start_utc ?? point.month);
    return { value, label: year !== null && month !== null ? `${year}-${String(month).padStart(2, '0')}` : asText(value) };
  }
  if (kind === 'climatology_months') {
    const month = asNumber(point.month ?? point.calendar_month);
    return { value: month ?? asText(point.month ?? point.calendar_month), label: month && month >= 1 && month <= 12 ? MONTHS[month - 1] : asText(point.month ?? point.calendar_month) };
  }
  if (kind === 'modis_8day') {
    const value = asText(point.composite_start_utc ?? point.composite_start ?? point.date_start ?? point.start_date ?? point.date);
    return { value, label: value };
  }
  if (kind === 'soil_depth_profiles') {
    const value = asNumber(point.depth_top_cm) ?? asText(point.depth_top_cm);
    return { value, label: `${asText(point.depth_top_cm)}–${asText(point.depth_bottom_cm)} cm` };
  }
  if (kind === 'diviner_local_time') {
    const value = asNumber(point.local_time_hours) ?? asText(point.local_time_hours);
    return { value, label: `${asText(point.local_time_hours)} h` };
  }
  if (kind === 'tes_inertia') {
    const context = asText(point.observation ?? point.time_of_day ?? point.day_night ?? point.source_map ?? point.local_time_context);
    return { value: context, label: context.replace(/^.*?\b(day|night|dayside|nightside)\b.*$/i, '$1') || context };
  }
  const value = asNumber(point.local_solar_time_martian_hours) ?? asText(point.local_solar_time_martian_hours);
  return { value, label: `${asText(point.local_solar_time_martian_hours)} h` };
}

function formatValue(value: unknown): string {
  const numeric = asNumber(value);
  return numeric === null ? asText(value) : numeric.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function SourceTooltip({ active, payload, label, series, field }: {
  active?: boolean;
  payload?: Array<{ value?: unknown; payload?: ChartPoint }>;
  label?: string | number;
  series: SeriesData;
  field: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload ?? {};
  return (
    <div className="max-w-xs rounded-xl border border-cyan-500/40 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-xl backdrop-blur-xl">
      <div className="mb-1 font-mono text-cyan-300">{asText(label)}</div>
      <div className="text-sm font-semibold text-white">{humanize(field)}: {formatValue(payload[0]?.value)} {unitFor(series, field)}</div>
      <div className="mt-2 space-y-0.5 border-t border-slate-800 pt-1.5 text-[10px] text-slate-400">
        <div>Source: <span className="text-slate-200">{sourceFor(series, field)}</span></div>
        <div>Class: <span className="text-slate-200">{classFor(series, field)}</span></div>
        <div>QA: <span className="text-slate-200">{qualityFor(point)}</span></div>
      </div>
    </div>
  );
}

function SelectBox({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-w-[9rem] flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-cyan-500/30 bg-slate-900/90 px-2.5 py-2 text-xs font-medium normal-case tracking-normal text-slate-100 outline-none focus:border-cyan-300">
        {children}
      </select>
    </label>
  );
}

export default function ScientificCharts({ site }: ScientificChartsProps) {
  const kinds = Object.keys(site.time_series ?? {});
  const [kind, setKind] = useState(preferredKind(site) ?? '');
  const [field, setField] = useState('');
  const [axisMode, setAxisMode] = useState<AxisMode>('localtime');
  const [selectedLs, setSelectedLs] = useState('180');
  const [selectedLocalTime, setSelectedLocalTime] = useState('12');

  const activeKind = kinds.includes(kind) ? kind : (kinds[0] ?? '');
  const path = activeKind ? `/sites/${encodeURIComponent(site.site_id)}/timeseries/${encodeURIComponent(activeKind)}?limit=5000` : null;
  const { data, error, loading, retry } = useApi<SeriesData>(path);

  const sourceRecords = data?.records ?? [];
  const isMarsSeasonal = site.body === 'Mars' && activeKind === 'mcd_seasonal';
  const isMarsSummary = site.body === 'Mars' && activeKind === 'mcd_seasonal_summary';
  const isMarsVertical = site.body === 'Mars' && activeKind === 'mcd_vertical_and_10m';
  const isTes = site.body === 'Mars' && activeKind === 'tes_inertia';

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    if (isMarsVertical) {
      return sourceRecords.filter((record) => {
        const scope = asText(record.profile_scope).toUpperCase();
        return scope.includes('VERTICALPROFILE') || scope.includes('VERTICAL_PROFILE');
      }).filter((record) => asNumber(record.ls_deg) === 180 && asNumber(record.local_solar_time_martian_hours) === Number(selectedLocalTime));
    }
    if (isMarsSeasonal) {
      const selected = axisMode === 'localtime' ? Number(selectedLs) : Number(selectedLocalTime);
      const key = axisMode === 'localtime' ? 'ls_deg' : 'local_solar_time_martian_hours';
      return sourceRecords.filter((record) => asNumber(record[key]) === selected);
    }
    return sourceRecords;
  }, [axisMode, data, isMarsSeasonal, isMarsVertical, selectedLocalTime, selectedLs, sourceRecords]);

  const fields = useMemo(() => numericFields(data ?? ({ kind: activeKind, source: {}, records: [] } as SeriesData), filteredRecords, activeKind), [activeKind, data, filteredRecords]);
  const preferredField = activeKind === 'diviner_local_time' ? 'bolometric_brightness_temperature_k' : activeKind === 'mcd_seasonal' ? 'modeled_surface_temperature_k' : activeKind === 'mcd_vertical_and_10m' ? 'atmospheric_temperature_k' : activeKind === 'mcd_seasonal_summary' ? 'sampled_model_surface_min_over_localtime_k' : activeKind === 'modis_8day' ? 'day_lst_c' : 'air_temperature_mean_c';
  const activeField = fields.includes(field) ? field : fields.includes(preferredField) ? preferredField : (fields[0] ?? '');

  const points = useMemo<ChartPoint[]>(() => filteredRecords.map((record) => {
    let axis = pointAxis(activeKind, record);
    if (isMarsSeasonal) {
      axis = axisMode === 'localtime'
        ? { value: asNumber(record.local_solar_time_martian_hours) ?? asText(record.local_solar_time_martian_hours), label: `${asText(record.local_solar_time_martian_hours)} h` }
        : { value: asNumber(record.ls_deg) ?? asText(record.ls_deg), label: `Ls ${asText(record.ls_deg)}°` };
    }
    if (isMarsSummary) axis = { value: asNumber(record.ls_deg) ?? asText(record.ls_deg), label: `Ls ${asText(record.ls_deg)}°` };
    if (isMarsVertical) {
      axis = { value: asNumber(record.height_above_surface_m) ?? asText(record.height_above_surface_m), label: `${asText(record.height_above_surface_m)} m` };
    }
    if (isTes) axis = pointAxis(activeKind, record);
    return { ...record, __x: axis.value, __label: axis.label };
  }), [activeKind, axisMode, filteredRecords, isMarsSeasonal, isMarsVertical, isMarsSummary, isTes]);

  const axisLabel = isMarsSummary ? 'Solar longitude, Ls (°); summary over local time' : isMarsVertical ? 'Height above surface (m)' : isMarsSeasonal ? (axisMode === 'localtime' ? 'Local solar time (Martian h)' : 'Solar longitude, Ls (°)') : activeKind === 'diviner_local_time' ? 'Local solar time (h)' : activeKind === 'tes_inertia' ? 'Observation context' : 'Record axis';
  const yLabel = activeField ? `${humanize(activeField)} · ${unitFor(data ?? ({ field_metadata: {} } as SeriesData), activeField)}` : 'Measured field';

  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="relative" data-testid="scientific-charts" data-site-id={site.site_id} data-body={site.body} data-series-kind={activeKind}>
        <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-300"><BarChart3 className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.22em]">Scientific time series</span></div>
            <h2 className="mt-1 text-xl font-bold text-white">Measured and modeled evidence</h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">Values are shown as delivered by the selected product. Nulls remain gaps; no interpolation or synthetic heatmap values are added.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <SelectBox label="Series" value={activeKind} onChange={(value) => { setKind(value); setField(''); }}>
              {kinds.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
            </SelectBox>
            {fields.length > 0 && <SelectBox label="Variable" value={activeField} onChange={setField}>{fields.map((item) => <option key={item} value={item}>{humanize(item)} · {unitFor(data ?? ({ field_metadata: {} } as SeriesData), item)}</option>)}</SelectBox>}
          </div>
        </div>

        {isMarsSeasonal && <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-orange-500/20 bg-orange-950/10 p-3"><SlidersHorizontal className="mb-2 h-4 w-4 text-orange-300" /><SelectBox label="Slice axis" value={axisMode} onChange={(value) => setAxisMode(value as AxisMode)}><option value="localtime">Fixed Ls → local time</option><option value="ls">Fixed local time → Ls</option></SelectBox>{axisMode === 'localtime' ? <SelectBox label="Fixed Ls" value={selectedLs} onChange={setSelectedLs}>{[0, 45, 90, 135, 180, 225, 270, 315].map((value) => <option key={value} value={value}>Ls {value}°</option>)}</SelectBox> : <SelectBox label="Fixed local time" value={selectedLocalTime} onChange={setSelectedLocalTime}>{Array.from({ length: 25 }, (_, value) => <option key={value} value={value}>{value}:00 h</option>)}</SelectBox>}<span className="mb-2 text-[10px] text-orange-200/80">Martian Ls is not a calendar. The fixed slice prevents connecting unrelated seasonal states.</span></div>}
        {isMarsVertical && <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-950/10 px-3 py-2 text-[10px] text-orange-200/80">Vertical-profile rows only · fixed Ls 180° · fixed local time · actual height field. The 10 m full-season rows are excluded from this profile view.<div className="mt-3"><SelectBox label="Profile local time" value={selectedLocalTime} onChange={setSelectedLocalTime}>{Array.from({length:25},(_,value)=><option key={value} value={value}>{value}:00 Martian h</option>)}</SelectBox></div></div>}
        {isTes && <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-950/10 px-3 py-2 text-[10px] text-orange-200/80">TES displays the two available thermal-inertia map estimates by observation context. Thermal inertia is not temperature.</div>}
        {activeKind === 'diviner_local_time' && <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2 text-[10px] text-slate-300">Diviner values are spectral or bolometric brightness temperatures, not air or kinetic temperature. Invalid channel artifacts remain null.</div>}

        <div className="relative mt-4 min-h-[18rem]">
          {loading && <div className="flex h-72 items-center justify-center text-sm text-cyan-300">Loading retained records…</div>}
          {error && !loading && <div className="flex h-72 flex-col items-center justify-center gap-3 text-center"><AlertCircle className="h-7 w-7 text-rose-300" /><p className="max-w-md text-sm text-rose-200">{error}</p><button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/10"><RefreshCw className="h-3.5 w-3.5" />Retry</button></div>}
          {!loading && !error && !activeField && <div className="flex h-72 items-center justify-center text-sm text-slate-400">No numeric measured values are available for this series.</div>}
          {!loading && !error && activeField && points.length === 0 && <div className="flex h-72 items-center justify-center text-sm text-slate-400">No records remain for this scientific slice.</div>}
          {!loading && !error && activeField && points.length > 0 && (
            <ResponsiveContainer width="100%" height={330}>
              {isTes ? <BarChart data={points} margin={{ top: 10, right: 12, left: 4, bottom: 34 }}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="__label" angle={-12} textAnchor="end" height={48} stroke="#94a3b8" tick={{ fontSize: 10 }} /><YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} /><Tooltip content={(props) => <SourceTooltip {...props} series={data!} field={activeField} />} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey={activeField} name={`${humanize(activeField)} · ${unitFor(data!, activeField)}`} fill={chartColors[0]} radius={[5, 5, 0, 0]} /></BarChart> : <LineChart data={points} margin={{ top: 10, right: 12, left: 4, bottom: 28 }}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="__label" stroke="#94a3b8" tick={{ fontSize: 10 }} minTickGap={24} label={{ value: axisLabel, position: 'insideBottom', offset: -16, fill: '#94a3b8', fontSize: 10 }} /><YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} /><Tooltip content={(props) => <SourceTooltip {...props} series={data!} field={activeField} />} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="linear" dataKey={activeField} name={`${humanize(activeField)} · ${unitFor(data!, activeField)}`} stroke={chartColors[0]} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} connectNulls={false} /></LineChart>}
            </ResponsiveContainer>
          )}
        </div>
        {data && activeField && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800/80 pt-3 text-[10px] text-slate-400"><span>Source: <strong className="font-medium text-slate-200">{sourceFor(data, activeField)}</strong></span><span>Class: <strong className="font-medium text-slate-200">{classFor(data, activeField)}</strong></span><span>Unit: <strong className="font-medium text-slate-200">{unitFor(data, activeField)}</strong></span><span>Records displayed: <strong className="font-medium text-slate-200">{points.length}</strong></span></div>}
      </div>
    </GlassPanel>
  );
}

export { formatValue };
export { ScientificCharts };
