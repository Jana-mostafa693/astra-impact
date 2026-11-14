import { AlertCircle, ClipboardList } from 'lucide-react';
import { GlassPanel } from '../components/OriginalUI';
import { AnalogFinder } from '../components/AnalogFinder';
import type { SiteLocation } from '../types/view';
export const OPERATIONAL_REQUIREMENTS = [
  'Exact field-test location, access rights and permits',
  'On-site terrain, weather and environmental hazard assessment',
  'Equipment specifications and test procedure validation',
  'Communications, power, transport and emergency support',
  'Local regulations and environmental protection requirements',
  'Operational feasibility and qualified human approval'
] as const;
export function TestPlannerPage({allSites,onOpen,onCompare,initialTargetId}:{allSites:SiteLocation[];onOpen:(site:SiteLocation)=>void;onCompare:(target:SiteLocation,earthId:string)=>void;initialTargetId?:string}) {
  return <div className="flex flex-col gap-6" data-testid="test-planner-page">
    <div className="border-b border-slate-800/80 pb-4"><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-2">Research-purpose screening</div><h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">Test <span className="text-cyan-400">Planner</span></h1><p className="text-slate-400 text-sm mt-2">Choose a planetary target and research purpose, inspect real Earth recommendations, then open or compare candidate evidence.</p></div>
    <GlassPanel className="p-5"><h2 className="text-lg font-bold text-white flex gap-2 items-center"><ClipboardList className="w-4 h-4 text-cyan-300"/>Operational requirements</h2><p className="text-xs text-amber-200/90 mt-3 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0"/>Research evidence does not establish an executable field test. Every requirement below remains UNVERIFIED by this application.</p><div className="divide-y divide-slate-800 mt-4">{OPERATIONAL_REQUIREMENTS.map(item=><div key={item} className="py-2 flex flex-wrap justify-between gap-2 text-xs"><span className="text-slate-300">{item}</span><span className="text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded px-2 py-0.5">UNVERIFIED</span></div>)}</div><p className="text-[10px] text-slate-500 mt-3">These are planning workflow checks, not new MASTER measurements or a landing-safety assessment. No equipment approval, operating window or feasibility certification is inferred.</p></GlassPanel>
    <AnalogFinder allSites={allSites} onOpen={onOpen} onCompare={onCompare} initialTargetId={initialTargetId}/>
  </div>;
}
