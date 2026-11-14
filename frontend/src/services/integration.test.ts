import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { adaptSite, finiteNumber, formatNumber } from './adapters';
import { pointAxis, numericFields } from '../charts/ScientificCharts';
import type { SiteDetail, SeriesData } from '../types/science';
const root = resolve(process.cwd(), '..');
const read = (p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const sites:SiteDetail[]=['earth','moon','mars'].flatMap(b=>read(`data/website_json/website_${b}_details.json`).sites);
const catalog = readFileSync(resolve(root,'data/catalogs/planetary_source_catalog.csv'),'utf8');
const active = read('data/website_json/website_sites.json').sites;
describe('actual MASTER → original component adapter',()=>{
 it('contains exactly the 17 real active IDs,14/2/1 distribution',()=>{
   expect(sites.length).toBe(17);expect(new Set(sites.map(s=>s.site_id))).toEqual(new Set(active.map((s:SiteDetail)=>s.site_id)));
   expect(sites.filter(s=>s.body==='Earth').length).toBe(14);expect(sites.filter(s=>s.body==='Moon').length).toBe(2);expect(sites.filter(s=>s.body==='Mars').length).toBe(1);
 });
 for(const site of sites)it(`traces all numerical display fields for ${site.site_id}`,()=>{
   const view=adaptSite(site);expect(view.id).toBe(site.site_id);expect(view.world).toBe(site.body);expect(view.lat).toBe(site.coordinates.latitude_deg);expect(view.lon).toBe(site.coordinates.longitude_east_deg);
   for(const field of view.displayProvenance){
     expect(field.value).toEqual(site.site_level_values[field.sourceField]??null);
     if(field.value!==null){expect(field.sourceId).not.toBeNull();expect(catalog).toContain(String(field.sourceId));expect(field.unit).not.toBeNull();expect(field.dataClass).not.toBeNull();}
   }
   expect('matchingSiteId' in view).toBe(false);expect('similarityScores' in view).toBe(false);expect('confidence' in view).toBe(false);
   if(site.body==='Earth')expect(site.coordinates.earth_epsg).toBe(4326);else expect(site.coordinates.earth_map_eligible).toBe(false);
 });
 it('never imputes missing values and never drops real zero values',()=>{
   expect(finiteNumber(null)).toBe(null);expect(finiteNumber(undefined)).toBe(null);expect(finiteNumber(NaN)).toBe(null);expect(finiteNumber(0)).toBe(0);
   expect(formatNumber(null,'Pa')).toBe('Data unavailable');expect(formatNumber(0,'Pa')).toBe('0 Pa');
 });
 it('uses sampled MCD model temperatures/pressures and does not claim observation',()=>{
   const view=adaptSite(sites.find(s=>s.site_id==='MARS-HELLAS')!);
   expect(view.temp).toContain('157.37');expect(view.temp).toContain('300.38');expect(view.atmosphereOrPressure).toContain('947.29');expect(view.temperatureDefinition).toContain('not observations');expect(view.composition).toBe('Data unavailable');
 });
 it('keeps lunar brightness and unavailable pressure separate from Earth air data',()=>{
   const view=adaptSite(sites.find(s=>s.site_id==='MOON-ORIENTALE')!);expect(view.temperatureDefinition).toContain('brightness');expect(view.atmosphereOrPressure).toBe('Data unavailable');
 });
});
describe('real chart-series contracts and science guardrails',()=>{
 const files=readdirSync(resolve(root,'data/website_timeseries')).filter(f=>f.endsWith('.json'));
 it('resolves all104existingchartreferences and stableIDs',()=>{
   expect(files.length).toBe(104);
   for(const file of files){const series:SeriesData=read(`data/website_timeseries/${file}`);expect(sites.some(s=>s.site_id===series.site_id)).toBe(true);expect(series.records.length).toBeGreaterThan(0);expect(series.source.source_id).toBeTruthy();expect(series.field_metadata).toBeDefined();}
 });
 it('uses actualcalendar-month and MODISdates for Earth axes',()=>{
   const clim=read('data/website_timeseries/EARTH-VREDEFORT_climatology_months.json');expect(pointAxis(clim.kind,clim.records[0]).label).toBe('Jan');
   const modis=read('data/website_timeseries/EARTH-VREDEFORT_modis_8day.json');expect(pointAxis(modis.kind,modis.records[0]).label).toBe('2015-01-01');
 });
 it('limits Diviner charts to qualifiedbrightness temperatures,excludingrawartifactvalues',()=>{
   const series:SeriesData=read('data/website_timeseries/MOON-ORIENTALE_diviner_local_time.json');const fields=numericFields(series,series.records,series.kind);expect(fields.length).toBeGreaterThan(0);expect(fields.every(f=>f.includes('brightness_temperature'))).toBe(true);expect(fields.some(f=>f.includes('raw_k'))).toBe(false);
 });
 it('keeps TES thermal inertia distinctfromtemperature',()=>{
   const series:SeriesData=read('data/website_timeseries/MARS-HELLAS_tes_inertia.json');expect(numericFields(series,series.records,series.kind)).toEqual(['thermal_inertia_j_m2_k_sqrt_s']);expect(pointAxis(series.kind,series.records[0]).label).not.toBe('—');
 });
 it('requires fixed Mars seasonal/localtime/height slices and doesnotbridge nulls',()=>{
   const source=readFileSync(resolve(root,'frontend/src/charts/ScientificCharts.tsx'),'utf8');expect(source).toContain('connectNulls={false}');expect(source).toContain('=== Number(selectedLocalTime)');expect(source).toContain("activeKind === 'mcd_seasonal_summary'");expect(source).toContain('Ls is not a calendar');
 });
 it('all210recommendations and420comparisons reference activepairs; nooverallscore',()=>{
   const ids=new Set(sites.map(s=>s.site_id));const recs=read('data/website_json/website_analog_recommendations.json').recommendations;const comparisons=read('data/website_json/website_comparisons.json').records;expect(recs.length).toBe(210);expect(comparisons.length).toBe(420);
   for(const r of [...recs,...comparisons]){expect(ids.has(r.earth_site_id)).toBe(true);expect(ids.has(r.planetary_site_id)).toBe(true);expect(r.numerical_similarity_score??null).toBe(null);expect(r.probability??null).toBe(null);}
 });
});
describe('original frontend preservation',()=>{
 const original=readFileSync(resolve(root,'original_frontend/frontend.txt'),'utf8');const globe=readFileSync(resolve(root,'frontend/src/components/InteractivePlanetGlobe.tsx'),'utf8');const ui=readFileSync(resolve(root,'frontend/src/components/OriginalUI.tsx'),'utf8');
 it('preserves exact interactiontimings, sizes and controlclasses',()=>{
   for(const snippet of ['dx * 0.0065','dy * 0.0055','dy * 0.07','dx * 0.07','+= 0.0028','+= 0.00045','* 0.1','timestamp - lastPinUpdate > 28','Math.max(1.85','Math.min(3.5','w-[320px] h-[320px] sm:w-[410px] sm:h-[410px] xl:w-[450px] xl:h-[450px]','animate-[spin_50s_linear_infinite]','transition-transform duration-150']){expect(original).toContain(snippet);expect(globe).toContain(snippet);}
 });
 it('retains sharedGlassPanelstyling byte-for-byte',()=>{
   const panel=original.slice(original.indexOf('const GlassPanel:'),original.indexOf('const ProgressBar:')).replace('const GlassPanel:','export const GlassPanel:').replace(/\r\n/g,'\n').trim();expect(ui).toContain(panel);
 });
 it('removes original mockdatasets,percentagematches and artistic scientificoverlays fromactivecomponents',()=>{
   for(const p of ['frontend/src/components/InteractivePlanetGlobe.tsx','frontend/src/components/CompareView.tsx','frontend/src/services/presentation.ts','frontend/src/services/adapters.ts','frontend/src/App.tsx']){
     const source=readFileSync(resolve(root,p),'utf8');for(const forbidden of ['mars-jezero','moon-shackleton','Optimal Safe Zone','Prime Earth Analog','similarityScores.overall','landingSafety','matchingSiteId','94% Match','const wave = Math.sin'])expect(source).not.toContain(forbidden);
   }
 });
});
