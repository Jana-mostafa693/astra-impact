import React, { useState } from 'react';
import { ArrowRightLeft, ChevronRight, Target, AlertCircle } from 'lucide-react';
import { GlassPanel, PlanetMiniThumb } from './OriginalUI';
import type { SiteLocation } from '../types/view';
import { useApi } from '../hooks/useApi';
import { verificationClasses } from '../services/adapters';
interface RecommendationRow {
  earth_site_id:string;planetary_site_id:string;research_purpose:string;
  evidence_tier:string;rank:number|null;reason:string;limitations:string;
  experimental_shape_rmse_exact:number|null;earth_record_status:string;
}
export function AnalogFinder({allSites,onOpen,onCompare,initialTargetId}:{allSites:SiteLocation[];onOpen:(s:SiteLocation)=>void;onCompare:(planet:SiteLocation,earthId:string)=>void;initialTargetId?:string}) {
  const planets=allSites.filter(s=>s.world!=='Earth');
  const [target,setTarget]=useState(initialTargetId || planets[0]?.id || '');
  const {data:purposes}=useApi<string[]>('/research-purposes');
  const [purpose,setPurpose]=useState('Impact-crater morphology');
  const [tier,setTier]=useState('all');
  const path=target?`/recommendations?planetary_site_id=${encodeURIComponent(target)}&research_purpose=${encodeURIComponent(purpose)}&limit=500`:null;
  const {data,error,loading,retry}=useApi<RecommendationRow[]>(path);
  const targetSite=planets.find(s=>s.id===target);
  const records=data?.filter(r=>tier==='all'||r.evidence_tier===tier) || [];
  const tiers=Array.from(new Set(data?.map(r=>r.evidence_tier) || []));
  return <div className="flex flex-col gap-6 animate-in fade-in duration-500">
    <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-800/80 pb-4"><div><h2 className="text-3xl font-extrabold text-white tracking-wide">Find an <span className="text-cyan-400">Earth Analog</span></h2><p className="text-slate-400 text-sm mt-1">Research-purpose evidence, not a calibrated match probability</p></div></div>
    <GlassPanel className="p-5"><div className="flex flex-wrap items-end gap-4"><label className="text-xs text-slate-400 flex flex-col gap-2">Planetary target<select aria-label="Analog planetary target" value={target} onChange={e=>{setTarget(e.target.value);setTier('all')}} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white">{planets.map(s=><option key={s.id} value={s.id}>[{s.world}] {s.name}</option>)}</select></label><label className="text-xs text-slate-400 flex flex-col gap-2">Research purpose<select aria-label="Research purpose" value={purpose} onChange={e=>{setPurpose(e.target.value);setTier('all')}} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white">{(purposes||[purpose]).map(p=><option key={p}>{p}</option>)}</select></label><label className="text-xs text-slate-400 flex flex-col gap-2">Evidence tier<select aria-label="Evidence tier" value={tier} onChange={e=>setTier(e.target.value)} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white"><option value="all">All evidence tiers</option>{tiers.map(t=><option key={t} value={t}>{t.replaceAll('_',' ')}</option>)}</select></label></div><p className="text-xs text-amber-200/90 mt-4 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0"/>Earth environments reproduce selected research characteristics—not vacuum, gravity, radiation, or complete planetary conditions.</p></GlassPanel>
    {loading&&<GlassPanel className="p-5">Loading documented recommendations…</GlassPanel>}
    {error&&<GlassPanel className="p-5 text-rose-300">{error} <button onClick={retry} className="underline">Retry</button></GlassPanel>}
    <div className="flex flex-col gap-4" data-testid="recommendation-cards" data-target-id={target} data-purpose={purpose}>{records.map(r=>{
      const earth=allSites.find(s=>s.id===r.earth_site_id);if(!earth||!targetSite)return null;
      return <GlassPanel key={`${r.planetary_site_id}:${r.earth_site_id}:${r.research_purpose}`} className="p-5"><div className="flex flex-col md:flex-row gap-4 items-start"><PlanetMiniThumb world="Earth"/><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-white">{earth.name}</h3><span className={`px-2 py-0.5 text-[10px] rounded border ${verificationClasses(earth)}`}>{earth.verificationLabel}</span>{r.rank!==null&&<span className="text-xs text-cyan-300">Documented rank {r.rank}</span>}</div><p className="text-[10px] uppercase tracking-widest text-cyan-300 mt-2">{r.evidence_tier.replaceAll('_',' ')}</p><p className="text-sm text-slate-300 mt-2">{r.reason}</p>{r.experimental_shape_rmse_exact!==null&&<p className="text-xs font-mono mt-2 text-white">Normalized crater-profile RMSE: {r.experimental_shape_rmse_exact.toPrecision(9)}<span className="block font-sans text-slate-400 mt-1">Lower values indicate closer profile shapes within this specific experiment; not a similarity percentage.</span></p>}<details className="mt-3 text-xs text-slate-400"><summary className="cursor-pointer text-amber-200">Scientific limitations</summary><p className="mt-2">{r.limitations}</p></details></div><div className="flex md:flex-col gap-2"><button onClick={()=>onOpen(earth)} className="px-3 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-xs hover:border-cyan-400 flex gap-2 items-center"><ChevronRight className="w-4 h-4"/>Open Earth site</button><button onClick={()=>onCompare(targetSite,r.earth_site_id)} className="px-3 py-2 rounded-lg bg-cyan-950/70 border border-cyan-400/70 text-cyan-300 text-xs flex gap-2 items-center"><ArrowRightLeft className="w-4 h-4"/>Compare pair</button></div></div></GlassPanel>;
    })}</div>
    {!loading&&!error&&!records.length&&<GlassPanel className="p-5 text-slate-400">No evidence records for this filter. Data unavailable rather than a fabricated match.</GlassPanel>}
  </div>;
}
