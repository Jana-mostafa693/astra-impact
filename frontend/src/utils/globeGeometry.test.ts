import { describe, expect, it } from 'vitest';
import { Vector3, Euler, SphereGeometry, MathUtils } from 'three';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { latLonToVector3, focusRotation, isSurfaceVisible, PIN_TIP_PERCENT } from './globeGeometry';
import { adaptSite, verificationClasses } from '../services/adapters';
import type { SiteDetail } from '../types/science';
const root=resolve(process.cwd(),'..');
const details:SiteDetail[]=['earth','moon','mars'].flatMap(body=>JSON.parse(readFileSync(resolve(root,`data/website_json/website_${body}_details.json`),'utf8')).sites);

describe('exact site projection and texture attachment',()=>{
  for(const site of details)it(`focuses ${site.site_id} at its true body coordinates, including poles`,()=>{
    const lon=site.coordinates.longitude_east_deg,lat=site.coordinates.latitude_deg;
    const vector=latLonToVector3(lat,lon);
    expect(vector.length()).toBeCloseTo(1,12);
    for(const tilt of [0,0.35]){
      const yaw=18*Math.PI;
      const focus=focusRotation(lat,lon,yaw,tilt);
      const focused=vector.clone().applyEuler(new Euler(focus.x+tilt,focus.y,0,'XYZ'));
      expect(focused.x).toBeCloseTo(0,10);expect(focused.y).toBeCloseTo(0,10);expect(focused.z).toBeCloseTo(1,10);
      expect(Math.abs(focus.y-yaw)).toBeLessThanOrEqual(Math.PI+1e-10);
      expect(isSurfaceVisible(focused,new Vector3(0,0,2.75))).toBe(true);
    }
  });
  it('matches Three SphereGeometry equirectangular UVs without longitude mirroring',()=>{
    const geometry=new SphereGeometry(1,64,32);const p=geometry.getAttribute('position'),uv=geometry.getAttribute('uv');
    for(let i=0;i<p.count;i++){
      const lat=(uv.getY(i)-0.5)*180,lon=uv.getX(i)*360-180;
      const projected=latLonToVector3(lat,lon);
      expect(projected.distanceTo(new Vector3().fromBufferAttribute(p,i))).toBeLessThan(1e-6);
    }
    geometry.dispose();
  });
  it('hides rear rim markers a facing-direction-only test wrongly exposes',()=>{
    const camera=new Vector3(0,0,2.75);
    const occluded=new Vector3(Math.sqrt(1-0.2**2),0,0.2);
    expect(occluded.dot(camera.clone().normalize())).toBeGreaterThan(0.08);
    expect(isSurfaceVisible(occluded,camera)).toBe(false);
    expect(isSurfaceVisible(new Vector3(0,0,1),camera)).toBe(true);
    expect(isSurfaceVisible(new Vector3(0,0,-1),camera)).toBe(false);
  });
  it('anchors scaled teardrop pins at the actual SVG tip, not their centre',()=>{
    expect(PIN_TIP_PERCENT).toBeCloseTo(94.31818181818181,10);
    const source=readFileSync(resolve(root,'frontend/src/components/InteractivePlanetGlobe.tsx'),'utf8');
    expect(source).toContain('transformOrigin: `50% ${PIN_TIP_PERCENT}%`');
    expect(source).toContain('translate(-50%, -${PIN_TIP_PERCENT}%)');
  });
});
describe('body appearance and category boundaries',()=>{
  it('assigns green only to3analyzedEarthsites,yellow to11proposedEarthsites,red to3planetaryreferences',()=>{
    const sites=details.map(adaptSite);
    expect(sites.filter(s=>s.pinColor==='green').length).toBe(3);
    expect(sites.filter(s=>s.pinColor==='yellow').length).toBe(11);
    expect(sites.filter(s=>s.pinColor==='red').length).toBe(3);
    for(const site of sites){expect(verificationClasses(site)).toContain(site.pinColor==='green'?'emerald':site.pinColor==='yellow'?'amber':'rose');}
  });
  it('resetsworldtexturesbeforepaint and neverreloadsEarthmaps when grid is toggled',()=>{
    const source=readFileSync(resolve(root,'frontend/src/components/InteractivePlanetGlobe.tsx'),'utf8');
    expect(source).toContain('useLayoutEffect(() =>');expect(source).toContain('replaceSurface(loadedImageCache[config.textureUrls[0]] ?? null)');
    expect(source).toContain('mat.color.set(0xffffff)');expect(source).toContain('map.colorSpace = THREE.SRGBColorSpace');
    expect(source).toContain("}, [worldKey]);");expect(source).toContain('}, [showGridLines]);');
    expect(source).toContain('if (isCancelled) return;');expect(source).not.toContain('dot > 0.08');
  });
  it('keeps filtering/recommendation/chart data scoped to selected site/request',()=>{
    const app=readFileSync(resolve(root,'frontend/src/App.tsx'),'utf8');
    const hook=readFileSync(resolve(root,'frontend/src/hooks/useApi.ts'),'utf8');
    expect(app).toContain("filtered.some(s=>s.id===selectedId)");expect(app).toContain('filtered.length>0&&<ScientificCharts');
    expect(hook).toContain('requestedPath === path');expect(hook).toContain('data: matchesCurrentSelection ? data : null');
  });
});
