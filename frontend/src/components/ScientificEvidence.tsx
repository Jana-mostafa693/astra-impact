import { useMemo } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, ExternalLink, FileWarning, MapPin, ShieldAlert } from 'lucide-react';
import { GlassPanel } from './OriginalUI';
import type { Measurement, SiteDetail, UnknownRecord } from '../types/science';

export interface ScientificEvidenceProps {
  site: SiteDetail;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function value(value: unknown): string {
  if (value === null || value === undefined) return 'Data unavailable';
  if (typeof value === 'number') return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  return text(value);
}

function label(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// Non-breaking spaces retain the existing monospace label width and wrapping.
export function fieldLabel(key: string): string {
  return key.replace(/_/g, '\u00a0').replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

function quality(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not supplied';
  if (Array.isArray(value)) return value.map(text).join('; ');
  return text(value);
}

function ScalarList({ object }: { object: UnknownRecord }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Object.entries(object).map(([key, item]) => (
        <div key={key} className="rounded-lg border border-slate-800/80 bg-slate-900/35 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">{label(key)}</div>
          <div className="mt-1 break-words text-xs text-slate-200">{text(item)}</div>
        </div>
      ))}
    </div>
  );
}

function ReferenceList({ value: references }: { value: unknown }) {
  const items = Array.isArray(references) ? references : [references];
  return (
    <div className="space-y-2">
      {items.filter((item) => item !== null && item !== undefined).map((item, index) => {
        if (typeof item === 'string' && /^https?:\/\//i.test(item)) {
          return <a key={`${item}-${index}`} href={item} target="_blank" rel="noreferrer" className="flex items-center gap-2 break-all text-xs text-cyan-300 hover:text-cyan-100"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{item}</a>;
        }
        if (isRecord(item)) {
          const urlEntries = Object.entries(item).filter(([, entry]) => typeof entry === 'string' && /^https?:\/\//i.test(entry));
          return <div key={index} className="rounded-lg border border-slate-800/80 bg-slate-900/35 p-3"><ScalarList object={item} />{urlEntries.length > 0 && <div className="mt-2 space-y-1">{urlEntries.map(([key, entry]) => <a key={key} href={String(entry)} target="_blank" rel="noreferrer" className="flex items-center gap-2 break-all text-[11px] text-cyan-300 hover:text-cyan-100"><ExternalLink className="h-3 w-3 shrink-0" />{label(key)}: {String(entry)}</a>)}</div>}</div>;
        }
        return <div key={index} className="text-xs text-slate-300">{text(item)}</div>;
      })}
    </div>
  );
}

function MeasurementRow({ measurement }: { measurement: Measurement }) {
  const missing = measurement.value === null || measurement.value === undefined || measurement.missing === true;
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/35 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-xs font-semibold text-slate-100">{measurement.variable}</div>
          <div className="mt-1 text-[10px] text-slate-500">{measurement.data_class ?? 'data class not supplied'} · {measurement.source_id ?? 'source not supplied'}</div>
        </div>
        <div className={`font-mono text-sm font-semibold ${missing ? 'text-amber-300' : 'text-cyan-200'}`}>{value(measurement.value)}{!missing && measurement.unit ? <span className="ml-1 text-xs font-normal text-slate-400">{measurement.unit}</span> : null}</div>
      </div>
      <div className="mt-3 grid gap-2 border-t border-slate-800/80 pt-2 text-[10px] text-slate-400 sm:grid-cols-2">
        <div>Unit: <span className="text-slate-200">{measurement.unit ?? 'source-defined'}</span></div>
        <div>Class: <span className="text-slate-200">{measurement.data_class ?? 'not supplied'}</span></div>
        <div className="break-words">Source URL: {measurement.source_url && /^https?:\/\//i.test(measurement.source_url) ? <a href={measurement.source_url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-100">{measurement.source_url}</a> : <span className="text-slate-200">{measurement.source_url || 'not supplied'}</span>}</div>
        <div>QA: <span className="text-slate-200">{quality(measurement.quality_flags)}</span></div>
        {measurement.spatial_support && <div className="sm:col-span-2">Coverage/support: <span className="text-slate-200">{measurement.spatial_support}</span></div>}
      </div>
    </div>
  );
}

export default function ScientificEvidence({ site }: ScientificEvidenceProps) {
  const measurements = site.environmental_measurements ?? [];
  const groups = useMemo(() => {
    const grouped = new Map<string, Measurement[]>();
    measurements.forEach((measurement) => {
      const group = measurement.variable.split('_')[0] || 'other';
      const current = grouped.get(group) ?? [];
      current.push(measurement);
      grouped.set(group, current);
    });
    return [...grouped.entries()];
  }, [measurements]);
  const flags = Array.isArray(site.scientific_quality_flags) ? site.scientific_quality_flags : site.scientific_quality_flags ? [site.scientific_quality_flags] : [];
  const sourceRefs = site.source_catalog_references;
  const isModel = site.body === 'Mars';
  const isBrightness = site.body === 'Moon';
  const isMouton = site.site_id.toUpperCase().includes('MOUTON') || site.site_name.toUpperCase().includes('MOUTON');

  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="relative">
        <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-300"><BookOpen className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.22em]">Scientific evidence ledger</span></div>
            <h2 className="mt-1 text-xl font-bold text-white">Verification, provenance, and limitations</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">The panel preserves source classifications, missingness, product versions, spatial support, and quality flags alongside every available measurement.</p>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">{site.site_verification_status ?? 'status not supplied'}</span>
        </div>

        {(isModel || isBrightness || isMouton || (site.missing_variables?.length ?? 0) > 0) && <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {isModel && <div className="flex gap-3 rounded-xl border border-orange-500/40 bg-orange-950/25 p-3"><AlertTriangle className="h-5 w-5 shrink-0 text-orange-300" /><div><div className="text-xs font-bold uppercase tracking-wider text-orange-200">Model, not observation</div><p className="mt-1 text-xs leading-relaxed text-orange-100/80">Mars MCD values are interpolated climatology states and retain their model scenario and QA status. They are not measured weather extremes.</p></div></div>}
          {isBrightness && <div className="flex gap-3 rounded-xl border border-violet-500/40 bg-violet-950/25 p-3"><AlertTriangle className="h-5 w-5 shrink-0 text-violet-300" /><div><div className="text-xs font-bold uppercase tracking-wider text-violet-200">Brightness temperature</div><p className="mt-1 text-xs leading-relaxed text-violet-100/80">Diviner spectral and bolometric values are radiance-derived brightness temperatures, not air or kinetic temperature.</p></div></div>}
          {isMouton && <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-950/25 p-3"><MapPin className="h-5 w-5 shrink-0 text-amber-300" /><div><div className="text-xs font-bold uppercase tracking-wider text-amber-200">Proposed Mouton site</div><p className="mt-1 text-xs leading-relaxed text-amber-100/80">This proposed lunar reference is shown with its explicit spatial, product, and missing-data caveats; it is not a safety certification.</p></div></div>}
          {(site.missing_variables?.length ?? 0) > 0 && <div className="flex gap-3 rounded-xl border border-rose-500/40 bg-rose-950/20 p-3"><FileWarning className="h-5 w-5 shrink-0 text-rose-300" /><div><div className="text-xs font-bold uppercase tracking-wider text-rose-200">Missing variables retained</div><p className="mt-1 text-xs leading-relaxed text-rose-100/80">Unavailable variables remain unavailable; no values are inferred, interpolated, or replaced.</p></div></div>}
        </div>}

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <details open className="group rounded-xl border border-slate-800/80 bg-slate-900/25 p-3"><summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-cyan-200">Coordinate frame & verification</summary><div className="mt-3 space-y-2 text-xs text-slate-300"><div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" /><span>{site.coordinates.reference_system ?? site.coordinates.coordinate_reference_system ?? 'Coordinate reference not supplied'}</span></div><div><span className="text-slate-500">Latitude:</span> {text(site.coordinates.latitude_deg)} · <span className="text-slate-500">East longitude:</span> {text(site.coordinates.longitude_east_deg)}</div><div><span className="text-slate-500">Verification:</span> {site.coordinate_verification_status ?? 'not supplied'}</div><div><span className="text-slate-500">Boundary:</span> {site.boundary_status ?? 'not supplied'}</div><div><span className="text-slate-500">Map eligible:</span> {text(site.coordinates.earth_map_eligible)}</div></div></details>
          <details open className="group rounded-xl border border-slate-800/80 bg-slate-900/25 p-3"><summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-cyan-200">Quality flags & coverage</summary><div className="mt-3 space-y-2 text-xs text-slate-300"><div className="flex items-start gap-2"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" /><span>{flags.length ? flags.map(text).join('; ') : 'No site-level quality flags supplied'}</span></div><div><span className="text-slate-500">Source IDs:</span> {site.source_ids?.length ? site.source_ids.join(', ') : 'not supplied'}</div><div><span className="text-slate-500">Similarity:</span> {site.overall_similarity_percentage === null || site.overall_similarity_percentage === undefined ? 'not supplied' : `${site.overall_similarity_percentage}%`}</div></div></details>
          <details open className="group rounded-xl border border-slate-800/80 bg-slate-900/25 p-3"><summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-cyan-200">Missing variables</summary><div className="mt-3 flex flex-wrap gap-1.5">{site.missing_variables?.length ? site.missing_variables.map((item) => <span key={item} className="rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-1 font-mono text-[10px] text-rose-200">{fieldLabel(item)}</span>) : <span className="text-xs text-slate-400">No missing-variable list supplied.</span>}</div></details>
          <details open className="group rounded-xl border border-slate-800/80 bg-slate-900/25 p-3"><summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-cyan-200">Source catalog references</summary><div className="mt-3">{sourceRefs ? <ReferenceList value={sourceRefs} /> : <span className="text-xs text-slate-400">No catalog references supplied.</span>}</div></details>
        </div>

        {site.site_level_values && <details className="mt-4 rounded-xl border border-slate-800/80 bg-slate-900/25 p-3"><summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-cyan-200">Site-level values and product metadata</summary><div className="mt-3">{isRecord(site.site_level_values) ? <ScalarList object={site.site_level_values} /> : <div className="text-xs text-slate-300">{text(site.site_level_values)}</div>}</div></details>}

        <div className="mt-4 border-t border-slate-800/80 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Available environmental measurements</div><p className="mt-1 text-xs text-slate-400">Numeric values are listed with their unit, source URL, data class, coverage, and QA state. Null values are explicitly labeled unavailable.</p></div><span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] text-slate-400">{measurements.length} records</span></div>
          {groups.length ? <div className="space-y-2">{groups.map(([group, items]) => <details key={group} open={groups.length <= 3} className="rounded-xl border border-slate-800/80 bg-slate-900/20 p-3"><summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-slate-300">{label(group)} <span className="ml-1 text-slate-500">({items.length})</span></summary><div className="mt-3 grid gap-2">{items.map((measurement, index) => <MeasurementRow key={`${measurement.variable}-${index}`} measurement={measurement} />)}</div></details>)}</div> : <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3 text-xs text-amber-200">No environmental measurement records supplied for this site.</div>}
        </div>

        <div className="mt-4 flex items-start gap-2 border-t border-slate-800/80 pt-3 text-[10px] leading-relaxed text-slate-500"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" /><span>Interpretation is constrained to the retained product metadata. Product version, observation/model class, resolution, coverage, and QA caveats are not rewritten by the interface.</span></div>
      </div>
    </GlassPanel>
  );
}

export { ScientificEvidence };
