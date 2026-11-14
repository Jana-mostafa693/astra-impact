import React,{useEffect,useMemo,useState} from 'react';
import {Thermometer,Mountain,Layers,Hexagon,ArrowRightLeft} from 'lucide-react';
import {GlassPanel,PlanetMiniThumb} from './OriginalUI';
import {ComparisonEvidence} from './ComparisonEvidence';
import {TerrainProfileChart} from '../charts/TerrainProfileChart';
import type {SiteLocation} from '../types/view';
import {useApi} from '../hooks/useApi';
import {verificationClasses} from '../services/adapters';
interface Props {primarySite:SiteLocation;allSites:SiteLocation[];onSelectSiteForCompare:(site:SiteLocation)=>void;initialEarthId?:string|null;}
export const CompareView:React.FC<Props>=({primarySite,allSites,onSelectSiteForCompare,initialEarthId})=>{
 const [earthId,setEarthId]=useState(initialEarthId || (primarySite.world==='Earth'?primarySite.id:''));
 const [targetId,setTargetId]=useState(primarySite.world!=='Earth'?primarySite.id:'');
 useEffect(()=>{if(primarySite.world==='Earth')setEarthId(primarySite.id);else setTargetId(primarySite.id)},[primarySite.id]);
 useEffect(()=>{if(initialEarthId)setEarthId(initialEarthId)},[initialEarthId]);
 const leftSite=allSites.find(s=>s.id===targetId && s.world!=='Earth');
 const rightSite=allSites.find(s=>s.id===earthId && s.world==='Earth');
 const {data:scores}=useApi<Array<{earth_site_id:string;planetary_site_id:string;shape_rmse:number}>>('/crater-profile-scores');
 const pairScore=scores?.find(s=>s.earth_site_id===earthId && s.planetary_site_id===targetId)?.shape_rmse;
 if(!leftSite || !rightSite)return <GlassPanel className="p-6"><h2 className="text-3xl font-extrabold text-white">Choose a comparison pair</h2><p className="text-slate-400 text-sm mt-2">No automatic planetary match is assumed. Select a planetary target and an Earth screening candidate.</p><div className="flex flex-wrap gap-3 mt-4"><select aria-label="Comparison planetary target" value={targetId} onChange={e=>{setTargetId(e.target.value);const found=allSites.find(s=>s.id===e.target.value);if(found)onSelectSiteForCompare(found)}} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm"><option value="">Select Moon/Mars target</option>{allSites.filter(s=>s.world!=='Earth').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select aria-label="Comparison Earth candidate" value={earthId} onChange={e=>setEarthId(e.target.value)} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 text-sm"><option value="">Select Earth candidate</option>{allSites.filter(s=>s.world==='Earth').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div></GlassPanel>;
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500" data-testid="comparison-view" data-target-id={leftSite.id} data-earth-id={rightSite.id}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-wide">
            Compare <span className="text-cyan-400">Planetary Targets & Earth Evidence</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Side-by-side source-qualified research evidence; not landing safety or an overall match
          </p>
        </div>

        {/* Site Switcher Dropdown */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Choose Pair:
          </span>
          <select
            aria-label="Comparison planetary target"
            value={leftSite.id}
            onChange={(e) => {
              const found = allSites.find((s) => s.id === e.target.value);
              setTargetId(e.target.value);
              if (found) onSelectSiteForCompare(found);
            }}
            className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 max-w-full text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-cyan-400"
          >
            {allSites.filter(s => s.world !== 'Earth').map((s) => (
              <option key={s.id} value={s.id}>
                [{s.world}] {s.name}
              </option>
            ))}
          </select>
          <select aria-label="Comparison Earth candidate" value={rightSite.id} onChange={e => setEarthId(e.target.value)} className="bg-slate-900/90 border border-cyan-500/40 rounded-lg px-3 py-2 max-w-full text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-cyan-400">
            {allSites.filter(s => s.world === 'Earth').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch gap-6">
        {/* Planetary Target Card (Mars or Moon) */}
        <GlassPanel className="flex-1 p-5" glowColor={leftSite.world==='Moon'?'slate':'orange'}>
          <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3.5">
              <PlanetMiniThumb world={leftSite.world} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {leftSite.world} Target Zone
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${verificationClasses(leftSite)}`}>
                    {leftSite.verificationLabel}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{leftSite.name}</h3>
                <p className="text-slate-400 text-xs">{leftSite.subtitle}</p>
              </div>
            </div>
            <div className="text-orange-300 text-xs font-mono bg-orange-950/40 border border-orange-500/30 px-2.5 py-1 rounded">
              {Math.abs(leftSite.lat)}° {leftSite.lat >= 0 ? 'N' : 'S'}, {Math.abs(leftSite.lon)}°{' '}
              {leftSite.lon >= 0 ? 'E' : 'W'}
            </div>
          </div>

          <div className="h-44 rounded-xl overflow-hidden mb-4 relative border border-slate-700/60">
            <img src={leftSite.img} alt={`${leftSite.world} decorative imagery — not a site photograph`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-xs">
              <span className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-slate-700 text-slate-200">
                Slope: <strong className="text-emerald-400">{leftSite.slope}</strong>
              </span>
              <span className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-slate-700 text-slate-200">
                Elevation: {leftSite.elevation}
              </span>
            </div>
          </div>

          <div className="grid gap-2.5 text-sm">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 text-slate-400">
                <Thermometer className="w-4 h-4 text-orange-400" /> {leftSite.world === 'Moon' ? 'Brightness temperature' : 'Modeled surface temperature'}
              </span>
              <span className="font-mono text-slate-100" title={leftSite.temperatureDefinition}>{leftSite.temp}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 text-slate-400">
                <Mountain className="w-4 h-4 text-orange-400" /> Terrain & Slope
              </span>
              <span className="font-mono text-slate-100">{leftSite.terrain}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 text-slate-400">
                <Layers className="w-4 h-4 text-orange-400" /> Pressure / Env
              </span>
              <span className="font-mono text-slate-100">{leftSite.atmosphereOrPressure}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Hexagon className="w-4 h-4 text-orange-400" /> Composition
              </span>
              <span className="font-mono text-slate-100">{leftSite.composition}</span>
            </div>
          </div>
        </GlassPanel>

        {/* Center Sync Badge */}
        <div className="flex lg:flex-col items-center justify-center shrink-0 py-2">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-2 text-center">
            {pairScore != null ? `Crater-profile RMSE ${pairScore.toPrecision(6)}` : 'Evidence'}
          </span>
          <span className="text-[9px] text-slate-500 mt-1 text-center max-w-[120px]">{pairScore != null ? 'Normalized profile experiment; lower is closer. Not an overall match.' : 'No overall score is supported.'}</span>
        </div>

        <GlassPanel className="flex-1 p-5" glowColor="cyan">
          <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3.5">
              <PlanetMiniThumb world={rightSite.world} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Earth Screening Candidate
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${verificationClasses(rightSite)}`}>
                    {rightSite.verificationLabel}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{rightSite.name}</h3>
                <p className="text-slate-400 text-xs">{rightSite.subtitle}</p>
              </div>
            </div>
            <div className="text-cyan-300 text-xs font-mono bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded">
              {Math.abs(rightSite.lat)}° {rightSite.lat >= 0 ? 'N' : 'S'}, {Math.abs(rightSite.lon)}°{' '}
              {rightSite.lon >= 0 ? 'E' : 'W'}
            </div>
          </div>

          <div className="h-44 rounded-xl overflow-hidden mb-4 relative border border-slate-700/60">
            <img src={rightSite.img} alt="Decorative Earth imagery — not a site photograph" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-xs">
              <span className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-slate-700 text-slate-200">
                Slope: <strong className="text-emerald-400">{rightSite.slope}</strong>
              </span>
              <span className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-slate-700 text-slate-200">
                Elevation: {rightSite.elevation}
              </span>
            </div>
          </div>

          <div className="grid gap-2.5 text-sm">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 text-slate-400">
                <Thermometer className="w-4 h-4 text-cyan-400" /> 2 m air temperature
              </span>
              <span className="font-mono text-slate-100" title={rightSite.temperatureDefinition}>{rightSite.temp}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 text-slate-400">
                <Mountain className="w-4 h-4 text-cyan-400" /> Terrain & Slope
              </span>
              <span className="font-mono text-slate-100">{rightSite.terrain}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 text-slate-400">
                <Layers className="w-4 h-4 text-cyan-400" /> Pressure / Env
              </span>
              <span className="font-mono text-slate-100">{rightSite.atmosphereOrPressure}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <Hexagon className="w-4 h-4 text-cyan-400" /> Composition
              </span>
              <span className="font-mono text-slate-100">{rightSite.composition}</span>
            </div>
          </div>
        </GlassPanel>
      </div>
      <TerrainProfileChart earthId={rightSite.id} targetId={leftSite.id} />
      <ComparisonEvidence earthId={rightSite.id} targetId={leftSite.id} />
    </div>
  );
};

