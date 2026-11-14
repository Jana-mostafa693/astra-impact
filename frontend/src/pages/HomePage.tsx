import { ArrowRight, Globe, Target, Database, AlertCircle } from 'lucide-react';
import { GlassPanel } from '../components/OriginalUI';
import { InteractivePlanetGlobe } from '../components/InteractivePlanetGlobe';
import type { SiteLocation } from '../types/view';
interface Props {
  sites: SiteLocation[];
  selected: SiteLocation;
  summary: Record<string, unknown> | null;
  onSelect: (site: SiteLocation) => void;
  onExplore: () => void;
  onPlan: () => void;
}
export function HomePage({ sites, selected, summary, onSelect, onExplore, onPlan }: Props) {
  const count = (key: string) => typeof summary?.[key] === 'number' ? String(summary[key]) : 'Data unavailable';
  return <div className="flex flex-col gap-6 animate-in fade-in duration-500" data-testid="home-page">
    <div className="border-b border-slate-800/80 pb-4"><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-2">Explore · investigate · compare</div><h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">Terra<span className="text-cyan-400">Twin</span></h1><p className="text-slate-400 text-sm mt-2">Research planetary environments through source-qualified Earth analog evidence.</p></div>
    <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.85fr)] gap-6 items-stretch">
      <GlassPanel className="p-5 sm:p-6 flex flex-col justify-center order-2"><div className="flex items-center gap-2 text-cyan-300 text-xs uppercase font-bold tracking-widest"><Globe className="w-4 h-4"/>Real worlds. Traceable evidence.</div><h2 className="text-2xl font-bold text-white mt-4">Explore Earth, Moon and Mars</h2><p className="text-sm text-slate-400 leading-relaxed mt-4">Compare selected measurements, terrain profiles and research-purpose evidence from the validated MASTER dataset. Each value retains its source, coordinate frame, quality flags and scientific limitations.</p><div className="grid grid-cols-3 gap-3 mt-6 border-y border-slate-800/80 py-4">{[['active_sites','Registered sites'],['series_files','Chart files'],['recommendation_records','Purpose evidence rows']].map(([key,label])=><div key={key}><p className="text-xl font-bold text-cyan-300 font-mono" data-summary-field={key}>{count(key)}</p><p className="text-[10px] text-slate-400 mt-1">{label}</p></div>)}</div><p className="text-xs text-amber-200/90 flex gap-2 mt-5"><AlertCircle className="w-4 h-4 shrink-0"/>A research analog is not a complete planetary replica, landing approval or calibrated similarity percentage.</p><div className="flex flex-wrap gap-2 mt-6"><button onClick={onExplore} className="px-4 py-2 rounded-lg bg-cyan-950/70 border border-cyan-400/70 text-sm text-cyan-300 hover:bg-cyan-900/70 transition-all flex gap-2 items-center">Explore measurements <ArrowRight className="w-4 h-4"/></button><button onClick={onPlan} className="px-4 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-sm hover:border-cyan-400 transition-all flex gap-2 items-center"><Target className="w-4 h-4"/>Plan a research test</button></div><p className="text-[10px] text-slate-500 mt-4 flex gap-2"><Database className="w-3.5 h-3.5"/>Scientific values served by the read-only MASTER-data backend.</p></GlassPanel>
      <GlassPanel className="p-4 sm:p-6 min-h-[500px] sm:min-h-[560px] flex flex-col order-1"><div className="text-xs font-bold uppercase tracking-widest text-slate-400">3D Earth Explorer</div><div className="flex-1 flex items-center justify-center py-5"><InteractivePlanetGlobe worldKey="Earth" locations={sites.filter(s=>s.world==='Earth')} selectedLocation={selected} onSelectLocation={onSelect} activeOverlay="none" showGridLines={false}/></div><p className="text-xs text-center text-cyan-300">{selected.name}</p><p className="text-[10px] text-center text-slate-500 mt-2">Drag to rotate · scroll or ± to zoom · select a pin</p><div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px] text-slate-400"><span><i className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1"/>Analyzed Earth reference</span><span><i className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"/>Proposed Earth screening</span></div><p className="text-[9px] text-center text-slate-500 mt-2">Decorative imagery; markers use actual registered coordinates.</p></GlassPanel>
    </div>
  </div>;
}
