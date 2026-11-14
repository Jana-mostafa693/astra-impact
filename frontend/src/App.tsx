import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Globe, Rocket, Compass, ArrowRightLeft, Info, MapPin, Layers, Thermometer, Mountain, Target, Search, RotateCcw, ChevronRight, ChevronLeft, Wind, Hexagon, X, AlertCircle, Home } from 'lucide-react';
import { InteractivePlanetGlobe } from './components/InteractivePlanetGlobe';
import { GlassPanel, PlanetMiniThumb } from './components/OriginalUI';
import { CompareView } from './components/CompareView';
import { HomePage } from './pages/HomePage';
import { TestPlannerPage } from './pages/TestPlannerPage';
import { AboutPage } from './pages/AboutPage';
import { PAGE_PATHS, PAGE_LABELS, viewFromPath, type View } from './services/pages';
import { SourceLibrary } from './components/SourceLibrary';
import { ScientificEvidence } from './components/ScientificEvidence';
import { ScientificCharts } from './charts/ScientificCharts';
import { WORLD_PRESENTATION } from './services/presentation';
import { adaptSite, verificationClasses } from './services/adapters';
import { apiGet } from './services/api';
import { useApi } from './hooks/useApi';
import type { Body, SiteDetail, SiteSummary } from './types/science';
import type { SiteLocation } from './types/view';
type Overlay = 'none' | 'thermal' | 'elevation' | 'safety';
interface Summary { [key:string]:unknown; }
const worlds: Body[] = ['Mars','Moon','Earth'];

function SitePanel({site,onClose,onCompare,onFinder}:{site:SiteLocation;onClose:()=>void;onCompare:()=>void;onFinder:()=>void}) {
  const rows = [
    [Thermometer,site.world==='Earth'?'2 m Air Temperature':site.world==='Moon'?'Brightness Temperature':'Modeled Surface Temperature',site.temp,site.temperatureDefinition],
    [Mountain,'Terrain & Slope',site.slope,'Local DEM patch mean slope; not landing engineering safety'],
    [Layers,'Elevation',site.elevation,'Body-specific vertical datum; not cross-planet comparable height'],
    [Wind,site.world==='Mars'?'Modeled Surface Pressure':'Surface Pressure',site.atmosphereOrPressure,site.world==='Earth'?'ERA5 reanalysis; hPa':'No assumed vacuum or climate measurement'],
    [Hexagon,site.world==='Earth'?'Mapped Rock Type':'Exact-Point Composition',site.composition,'Mapped/regional evidence is not a mineral assay'],
  ] as const;
  return <GlassPanel className="p-5 h-full" glowColor={site.world==='Mars'?'orange':site.world==='Moon'?'slate':'cyan'}>
    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 mb-4"><div className="flex items-center gap-3.5"><PlanetMiniThumb world={site.world}/><div><span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">{site.world} reference</span><h2 className="text-xl font-bold text-white mt-1" data-testid="site-title" data-site-id={site.id} data-body={site.world}>{site.name}</h2><p className="text-xs text-slate-400 mt-1">{site.subtitle}</p></div></div><button aria-label="Close site panel" title="Close site panel" onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4"/></button></div>
    <div className="flex flex-wrap justify-between gap-2 mb-4"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${verificationClasses(site)}`}>{site.verificationLabel}</span><span className="text-xs font-mono text-slate-400">{Math.abs(site.lat)}° {site.lat>=0?'N':'S'} · {Math.abs(site.lon)}° {site.lon>=0?'E':'W'}</span></div>
    <div className="grid gap-3 text-sm">{rows.map(([Icon,label,value,meaning])=><div key={label} className="border-b border-slate-800/80 pb-3" title={meaning}><div className="flex justify-between items-start gap-4"><span className="flex items-center gap-2 text-slate-400 text-xs"><Icon className="w-4 h-4 text-cyan-400 shrink-0"/>{label}</span><span className="font-mono text-slate-100 text-right text-sm" data-value-field={label}>{value}</span></div><p className="text-[10px] text-slate-500 mt-1.5">{meaning}</p></div>)}</div>
    <p className="text-xs text-slate-400 leading-relaxed mt-4">{site.description}</p>
    <p className="text-[10px] text-slate-500 mt-2 break-words">Coordinate frame: {site.detail.coordinates.reference_system}</p>
    <p className="text-xs text-amber-200/90 mt-4">No full landing-safety assessment or accessible water-ice confirmation. Scientific status colors are not safety or match probabilities.</p>
    <div className="flex flex-wrap gap-2 mt-5"><button onClick={onCompare} className="px-3 py-2 rounded-lg bg-cyan-950/70 border border-cyan-400/70 text-xs text-cyan-300 hover:bg-cyan-900/70 transition-all flex gap-2"><ArrowRightLeft className="w-4 h-4"/>Compare evidence</button><button onClick={onFinder} className="px-3 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-xs hover:border-cyan-400 transition-all flex gap-2"><Target className="w-4 h-4"/>Find Earth analog</button></div>
  </GlassPanel>;
}

export default function App() {
 const [allSites,setAllSites] = useState<SiteLocation[]>([]);
 const [world,setWorld] = useState<Body>('Mars');
 const [selectedId,setSelectedId] = useState<string>('');
 const [view,setViewState] = useState<View>(()=>viewFromPath(window.location.pathname));
 const setView=useCallback((next:View)=>{
   if(next==='notfound')return;
   if(window.location.pathname!==PAGE_PATHS[next])window.history.pushState({},'',PAGE_PATHS[next]);
   setViewState(next);window.scrollTo({top:0,behavior:'auto'});
 },[]);
 useEffect(()=>{
   const onPopState=()=>setViewState(viewFromPath(window.location.pathname));
   window.addEventListener('popstate',onPopState);
   return()=>window.removeEventListener('popstate',onPopState);
 },[]);
 useEffect(()=>{document.title=(view==='notfound'?'Page not found':PAGE_LABELS[view])+' — TerraTwin'},[view]);
 const [overlay,setOverlay] = useState<Overlay>('none');
 const [grid,setGrid] = useState(false);
 const [panelOpen,setPanelOpen] = useState(true);
 const [search,setSearch] = useState('');
 const [status,setStatus] = useState('all');
 const [purposeFilter,setPurposeFilter] = useState('all');
 const [loading,setLoading] = useState(true);
 const [error,setError] = useState<string|null>(null);
 const [attempt,setAttempt] = useState(0);
 const [comparisonEarthId,setComparisonEarthId] = useState<string|null>(null);
 const {data:summary} = useApi<Summary>('/summary');
 const {data:purposes} = useApi<string[]>('/research-purposes');
 useEffect(()=>{
   const controller=new AbortController();let active=true;
   async function load(){
     setLoading(true);setError(null);
     try{
       const summaries=await apiGet<SiteSummary[]>('/sites?limit=500',controller.signal);
       const details=await Promise.all(summaries.map(s=>apiGet<SiteDetail>(`/sites/${encodeURIComponent(s.site_id)}`,controller.signal)));
       if(!active)return;
       const sites=details.map(adaptSite);setAllSites(sites);
       const first=sites.find(s=>s.world==='Mars');if(first){setSelectedId(first.id);setWorld(first.world)}
     }catch(err){if(active&&!controller.signal.aborted)setError(err instanceof Error?err.message:'Unable to load verified data')}
     finally{if(active)setLoading(false)}
   }
   void load();return()=>{active=false;controller.abort()};
 },[attempt]);
 const selected=allSites.find(s=>s.id===selectedId);
 const worldSites=useMemo(()=>allSites.filter(s=>s.world===world),[allSites,world]);
 const filtered=useMemo(()=>worldSites.filter(s=>{
   const label=s.name.toLowerCase().includes(search.toLowerCase())||s.id.toLowerCase().includes(search.toLowerCase());
   const statusOk=status==='all'||s.detail.site_verification_status===status;
   const recommendations=s.detail.purpose_specific_analog_evidence;
   const purposeOk=purposeFilter==='all'||Array.isArray(recommendations)&&recommendations.some(r=>r.research_purpose===purposeFilter);
   return label&&statusOk&&purposeOk;
 }),[worldSites,search,status,purposeFilter]);
 useLayoutEffect(()=>{
   if(view==='explorer'&&filtered.length&&!filtered.some(s=>s.id===selectedId)){
     setSelectedId(filtered[0].id);setPanelOpen(true)
   }
 },[filtered,selectedId,view]);
 const chooseSite=useCallback((s:SiteLocation)=>{
   if(s.world!==world){setSearch('');setStatus('all');setPurposeFilter('all');setOverlay('none')}
   setSelectedId(s.id);setWorld(s.world);setPanelOpen(true)
 },[world]);
 function chooseWorld(next:Body){setWorld(next);setSelectedId(allSites.find(s=>s.world===next)?.id||'');setSearch('');setStatus('all');setPurposeFilter('all');setPanelOpen(true);setOverlay('none')}
 function openEarth(s:SiteLocation){chooseSite(s);setView('explorer')}
 function comparePair(planet:SiteLocation,earthId:string){chooseSite(planet);setComparisonEarthId(earthId);setView('compare')}
 const activeWorld=WORLD_PRESENTATION[world];
 const homeSite=(selected?.world==='Earth'?selected:allSites.find(s=>s.id==='EARTH-VREDEFORT'))||allSites.find(s=>s.world==='Earth');
 const nav=[['home','Home',Home],['explorer','Explore',Globe],['compare','Compare',ArrowRightLeft],['finder','Test Planner',Target],['evidence','About',Info]] as const;
 return <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
   <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.12),transparent_55%)] pointer-events-none"/>
   <div className="fixed inset-0 opacity-20 pointer-events-none" style={{backgroundImage:'radial-gradient(#94a3b8 0.6px,transparent 0.6px)',backgroundSize:'83px 83px'}}/>
   <header className="relative z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-wrap items-center justify-between gap-4"><button onClick={()=>setView('home')} className="flex items-center gap-3 text-left"><div className="w-10 h-10 bg-cyan-950/70 border border-cyan-400/60 rounded-full flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.3)]"><Rocket className="w-5 h-5 text-cyan-400"/></div><div><span className="font-extrabold text-white tracking-wide text-lg">ASTRA <span className="text-cyan-400">IMPACT</span></span><p className="text-[9px] text-slate-500 tracking-[0.2em] uppercase">NASA Space Apps · source-qualified explorer</p></div></button><nav className="flex flex-wrap gap-1 sm:gap-2" aria-label="Main navigation">{nav.map(([key,label,Icon])=><button key={key} onClick={()=>setView(key)} aria-current={view===key?'page':undefined} data-page-path={PAGE_PATHS[key]} className={`px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-2 border ${view===key?'bg-cyan-950/70 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.12)]':'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/80'}`}><Icon className="w-3.5 h-3.5"/>{label}</button>)}</nav></div></header>
   <main className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-9">
   {loading&&<GlassPanel className="p-10 text-center"><RotateCcw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4"/><h1 className="text-xl font-bold">Loading verified planetary data</h1><p className="text-sm text-slate-400 mt-2">Connecting to the read-only scientific API. No demonstration values are used.</p></GlassPanel>}
   {error&&<GlassPanel className="p-8"><h2 className="text-xl font-bold text-rose-300">Scientific data could not be loaded</h2><p className="text-sm text-slate-400 mt-3">{error}</p><button onClick={()=>setAttempt(x=>x+1)} className="mt-4 px-4 py-2 rounded-lg border border-cyan-400/50 bg-cyan-950/70 text-cyan-300">Retry connection</button><p className="text-xs text-slate-500 mt-3">Unavailable API data is never replaced with fictional site values.</p></GlassPanel>}
   {!loading&&!error&&view==='home'&&homeSite&&<HomePage sites={allSites} selected={homeSite} summary={summary} onSelect={chooseSite} onExplore={()=>{chooseSite(homeSite);setView('explorer')}} onPlan={()=>setView('finder')}/>}
   {!loading&&!error&&view==='notfound'&&<GlassPanel className="p-8"><h1 className="text-3xl font-bold">Page not found</h1><button onClick={()=>setView('home')} className="text-cyan-300 underline mt-4">Return Home</button></GlassPanel>}
   {!loading&&!error&&selected&&view==='explorer'&&<div className="flex flex-col gap-6 animate-in fade-in duration-500">
     <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800/80 pb-4"><div><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 mb-2">Explore · investigate · compare</div><h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">Explore <span className={activeWorld.accentClass}>{world}</span></h1><p className="text-slate-400 text-sm mt-2">{activeWorld.tagline}</p></div><div className="flex flex-wrap gap-2" aria-label="Select a world">{worlds.map(w=><button key={w} onClick={()=>chooseWorld(w)} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-md border transition-all group ${world===w?`${WORLD_PRESENTATION[w].borderClass} bg-gradient-to-br ${WORLD_PRESENTATION[w].badgeBg}`:'border-slate-700/70 bg-slate-900/65 hover:border-slate-500'}`}><PlanetMiniThumb world={w}/><div className="text-left"><p className={`text-sm font-bold ${WORLD_PRESENTATION[w].accentClass}`}>{w}</p><p className="text-[9px] text-slate-400">{allSites.filter(s=>s.world===w).length} registry {allSites.filter(s=>s.world===w).length===1?'point':'points'}</p></div></button>)}</div></div>
     <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.85fr)] gap-6 items-stretch">
       <GlassPanel className="p-4 sm:p-6 min-h-[500px] sm:min-h-[560px] flex flex-col" glowColor={world==='Mars'?'orange':world==='Moon'?'slate':'cyan'}><div className="flex flex-wrap justify-between items-center gap-2"><span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex gap-2"><Compass className="w-4 h-4 text-cyan-400"/>3D Planetary Explorer</span><button onClick={()=>setGrid(x=>!x)} className={`text-[10px] border rounded px-2 py-1 transition-colors ${grid?'text-cyan-300 border-cyan-400/60':'text-slate-400 border-slate-700'}`} aria-pressed={grid}>Coordinate grid</button></div><div className="flex-1 flex items-center justify-center py-5 overflow-visible"><InteractivePlanetGlobe worldKey={world} locations={filtered} selectedLocation={selected} onSelectLocation={chooseSite} activeOverlay="none" showGridLines={grid}/></div><div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 text-[10px] text-slate-400 mb-3">{([['none','Surface',Globe],['thermal','Thermal Profiles',Thermometer],['elevation','Terrain Samples',Mountain],['safety','Analog Evidence',Target]] as const).map(([k,l,Icon])=><button key={k} onClick={()=>setOverlay(k)} className={`px-2 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${overlay===k?'border-cyan-400/70 text-cyan-300 bg-cyan-950/70':'border-slate-700/60 hover:border-cyan-500/40'}`}><Icon className="w-3 h-3"/>{l}</button>)}</div><p className="text-[10px] text-center text-slate-500">Drag to rotate · scroll or ± to zoom · click a pin to focus · pause spin · 3D tilt</p><div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px] text-slate-400"><span><i className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1"/>Existing analyzed reference</span><span><i className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"/>Proposed Earth screening</span><span><i className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1"/>Qualified feature reference</span></div><p className="text-[9px] text-center text-slate-500 mt-2">Decorative planet imagery is not a measured global scientific overlay.</p></GlassPanel>
       {!filtered.length?<GlassPanel className="p-5 flex items-center justify-center"><p className="text-sm text-slate-400">No site matches the current filters. Clear a filter to load location details.</p></GlassPanel>:panelOpen?<SitePanel site={selected} onClose={()=>setPanelOpen(false)} onCompare={()=>{setComparisonEarthId(selected.world==='Earth'?selected.id:null);setView('compare')}} onFinder={()=>setView('finder')}/>:<GlassPanel className="p-5 flex items-center justify-center"><button onClick={()=>setPanelOpen(true)} className="border border-cyan-500/40 rounded-lg px-4 py-2 text-sm text-cyan-300">Open selected site details</button></GlassPanel>}
     </div>
     {overlay!=='none'&&<GlassPanel className="p-4"><p className="text-xs text-amber-200/90">{overlay==='thermal'?'Spatial thermal heatmap unavailable — site-level measurements and profiles shown instead.':overlay==='elevation'?'Local terrain sample values shown; no artistic sine-wave contours or unsupported global terrain map.':'Analog Evidence / Research Suitability — purpose-specific evidence only, never landing-safety certification.'}</p>{overlay==='safety'&&<button onClick={()=>setView('finder')} className="text-xs text-cyan-300 underline mt-2">Open documented research-purpose evidence</button>}</GlassPanel>}
     <GlassPanel className="p-5"><div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h3 className="text-sm font-bold tracking-wide text-white flex gap-2"><MapPin className="w-4 h-4 text-cyan-400"/>Select a registered {world} location</h3><div className="flex flex-wrap gap-2"><label className="relative"><Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500"/><input aria-label="Search sites" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search site…" className="bg-slate-900/90 border border-cyan-500/40 rounded-lg pl-8 pr-3 py-2 text-xs w-40"/></label>{world==='Earth'&&<select aria-label="Site verification status" value={status} onChange={e=>setStatus(e.target.value)} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs"><option value="all">All registry statuses</option><option value="EXISTING_ANALYZED">Existing analyzed</option><option value="PROPOSED_SCREENING">Proposed screening</option></select>}<select aria-label="Explorer research purpose" value={purposeFilter} onChange={e=>setPurposeFilter(e.target.value)} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs"><option value="all">All research purposes</option>{purposes?.map(p=><option key={p}>{p}</option>)}</select></div></div><div className="flex flex-wrap gap-2">{filtered.map(s=><button key={s.id} onClick={()=>chooseSite(s)} className={`px-3 py-2 rounded-lg border text-xs transition-all flex items-center gap-2 ${s.id===selectedId?'border-cyan-400/70 bg-cyan-950/70 text-cyan-300':'border-slate-700/70 bg-slate-900/65 text-slate-300 hover:border-cyan-500/40'}`}><span className="w-1.5 h-1.5 rounded-full" style={{background:s.pinHex}}/>{s.name}</button>)}</div>{!filtered.length&&<p className="text-xs text-slate-400">No registered locations match this filter.</p>}</GlassPanel>
     {filtered.length>0&&<ScientificCharts key={selected.id} site={selected.detail}/>}
     {filtered.length>0&&<ScientificEvidence site={selected.detail}/>}
   </div>}
   {!loading&&!error&&selected&&view==='compare'&&<CompareView primarySite={selected} allSites={allSites} onSelectSiteForCompare={chooseSite} initialEarthId={comparisonEarthId}/>}
   {!loading&&!error&&view==='finder'&&<TestPlannerPage allSites={allSites} onOpen={openEarth} onCompare={comparePair} initialTargetId={selected?.world !== 'Earth' ? selected?.id : undefined}/>}
   {!loading&&!error&&view==='evidence'&&<AboutPage/>}
   </main>
   <footer className="relative border-t border-slate-800/80 py-5 px-4 text-center text-[10px] text-slate-500"><p>Validated MASTER dataset · source-qualified screening evidence · no overall similarity or landing-safety probability</p><p className="mt-1">Scientific values served by FastAPI · decorative imagery: Solar System Scope (Mars, CC BY 4.0) and original Three.js assets</p></footer>
 </div>;
}
