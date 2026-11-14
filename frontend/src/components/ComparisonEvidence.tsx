import React, { useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { GlassPanel } from './OriginalUI';
import { useApi } from '../hooks/useApi';
interface EvidenceRow {
  category: string; earth_value: unknown; planetary_value: unknown;
  earth_units: string | null; planetary_units: string | null;
  earth_variable_definition: string; planetary_variable_definition: string;
  earth_measurement_type: string; planetary_measurement_type: string;
  comparison_validity: string; missing_data_status: string;
  earth_source: string; planetary_source: string;
  earth_spatial_resolution: string; planetary_spatial_resolution: string;
  earth_temporal_context: string; planetary_temporal_or_illumination_context: string;
  phase45_new_interpretation?: string;
}
export function displayScientific(value: unknown): string {
  if (value === null || value === undefined) return 'Data unavailable';
  if (typeof value === 'number') return value.toLocaleString('en-US', {maximumFractionDigits: 6});
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(displayScientific).join(' · ');
  return Object.entries(value as Record<string, unknown>).map(([key,v]) => `${key.replaceAll('_',' ')}: ${displayScientific(v)}`).join(' · ');
}
export function ComparisonEvidence({earthId,targetId}:{earthId:string;targetId:string}) {
  const path = `/comparisons?earth_site_id=${encodeURIComponent(earthId)}&planetary_site_id=${encodeURIComponent(targetId)}&limit=500`;
  const {data,error,loading,retry} = useApi<EvidenceRow[]>(path);
  const [category,setCategory] = useState('all');
  const categories = Array.from(new Set(data?.map(r => r.category) ?? []));
  const records = data?.filter(r => category === 'all' || r.category === category) ?? [];
  return <GlassPanel className="p-5">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h3 className="text-lg font-bold text-white flex gap-2 items-center"><Info className="w-4 h-4 text-cyan-400"/>Scientific comparison evidence</h3><select aria-label="Comparison category" value={category} onChange={e=>setCategory(e.target.value)} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs"><option value="all">All available categories</option>{categories.map(item=><option key={item} value={item}>{item}</option>)}</select></div>
    <p className="text-xs text-amber-200/90 mb-4">No overall similarity or landing-safety score is supported. Different variables, reference datums and sampling scales may be incomparable.</p>
    {loading && <p className="text-slate-400">Loading real comparison records…</p>}
    {error && <p className="text-rose-300">{error} <button onClick={retry} className="underline">Retry</button></p>}
    {!loading&&!error&&!records.length&&<p className="text-slate-400">Data unavailable for this selected comparison.</p>}
    <div className="divide-y divide-slate-800">{records.map((r,index)=><details key={`${r.category}:${index}`} className="py-3" open={category !== 'all'}><summary className="cursor-pointer flex flex-wrap justify-between gap-2 text-sm font-semibold"><span>{r.category}</span><span className="text-[10px] text-cyan-300 font-mono break-all">{r.comparison_validity.replaceAll('_',' ')}</span></summary><div className="grid md:grid-cols-2 gap-4 text-xs mt-3"><div className="text-slate-300"><p className="text-cyan-300 font-bold mb-1">Earth evidence</p><p>{displayScientific(r.earth_value)} {r.earth_value != null ? r.earth_units : ''}</p><p className="mt-2 text-slate-400">{r.earth_variable_definition}</p><p className="mt-2">{r.earth_measurement_type}</p><p className="text-slate-500 mt-1">{r.earth_spatial_resolution} · {r.earth_temporal_context}</p><p className="break-words mt-1">Source: {r.earth_source}</p></div><div className="text-slate-300"><p className="text-orange-300 font-bold mb-1">Planetary evidence</p><p>{displayScientific(r.planetary_value)} {r.planetary_value != null ? r.planetary_units : ''}</p><p className="mt-2 text-slate-400">{r.planetary_variable_definition}</p><p className="mt-2">{r.planetary_measurement_type}</p><p className="text-slate-500 mt-1">{r.planetary_spatial_resolution} · {r.planetary_temporal_or_illumination_context}</p><p className="break-words mt-1">Source: {r.planetary_source}</p></div></div><p className="mt-3 text-xs text-amber-200/90 flex gap-2"><AlertCircle className="w-3.5 h-3.5 shrink-0"/>{r.missing_data_status.replaceAll('_',' ')}. {r.phase45_new_interpretation}</p></details>)}</div>
  </GlassPanel>;
}
