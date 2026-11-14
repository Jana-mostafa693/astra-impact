import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {PAGE_PATHS,PAGE_LABELS,viewFromPath} from './pages';
import {OPERATIONAL_REQUIREMENTS} from '../pages/TestPlannerPage';
const root=resolve(process.cwd(),'..');
describe('five required TerraTwin pages',()=>{
  for(const [view,path]of Object.entries(PAGE_PATHS))it(`resolves ${path} to ${view}`,()=>{expect(viewFromPath(path)).toBe(view);expect(viewFromPath(path==='/'?path:path+'/')).toBe(view)});
  it('contains exactly Home Explore Compare TestPlanner About',()=>{expect(Object.values(PAGE_LABELS)).toEqual(['Home','Explore','Compare','Test Planner','About']);expect(Object.keys(PAGE_PATHS).length).toBe(5)});
  it('rejectsunknownroutesratherthaninventingapage',()=>{expect(viewFromPath('/unknown')).toBe('notfound')});
  it('declaresall5routesforscreenshotsandserving',()=>{const manifest=JSON.parse(readFileSync(resolve(root,'frontend/public/manus-routes.json'),'utf8'));expect(manifest.routes.map((r:{path:string})=>r.path)).toEqual(Object.values(PAGE_PATHS))});
  it('retainsbrowserhistoryandusesrealAPIHomecounts',()=>{const source=readFileSync(resolve(root,'frontend/src/App.tsx'),'utf8');expect(source).toContain("window.history.pushState");expect(source).toContain("window.addEventListener('popstate'");const home=readFileSync(resolve(root,'frontend/src/pages/HomePage.tsx'),'utf8');expect(home).toContain('summary[key]');expect(home).toContain('Data unavailable');expect(home).not.toContain('98%')});
  it('marksalloperationalchecks unverified anduses realrecommendations',()=>{expect(OPERATIONAL_REQUIREMENTS.length).toBe(6);const planner=readFileSync(resolve(root,'frontend/src/pages/TestPlannerPage.tsx'),'utf8');expect(planner).toContain('<AnalogFinder');expect(planner).toContain('UNVERIFIED');expect(planner).toContain('not new MASTER measurements');expect(planner).not.toContain('Optimal Safe')});
});
