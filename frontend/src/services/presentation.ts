import type { Body } from '../types/science';
import type { SiteLocation } from '../types/view';
export interface WorldConfig { key:Body; name:string; tagline:string; atmosphereColor:string; glowRgba:string; accentClass:string; borderClass:string; badgeBg:string; thumbImg:string; textureUrls:string[]; bumpUrls?:string[]; specularUrls?:string[]; cloudUrls?:string[]; locations:SiteLocation[]; }
export const WORLD_PRESENTATION:Record<Body,WorldConfig> = {
  Mars: {
    key: 'Mars',
    name: 'Mars',
    tagline: 'Explore source-qualified Martian research evidence',
    atmosphereColor: '#f97316',
    glowRgba: 'rgba(249, 115, 22, 0.45)',
    accentClass: 'text-orange-400',
    borderClass: 'border-orange-500/60',
    badgeBg: 'from-orange-500/20 to-red-900/30',
    thumbImg: '/textures/mars_original_thumbnail.jpg',
    textureUrls: [
      '/textures/mars_2k.jpg',
      'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/mars_1k_color.jpg',
      'https://raw.githubusercontent.com/turban/webgl-earth/master/images/mars_1024.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Mars_equirectangular_projection.jpg/1024px-Mars_equirectangular_projection.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1024px-OSIRIS_Mars_true_color.jpg'
    ],
    bumpUrls: [
      'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/mars_1k_topo.jpg',
      'https://raw.githubusercontent.com/turban/webgl-earth/master/images/mars_1024.jpg'
    ],
    locations: []
  },
  Moon: {
    key: 'Moon',
    name: 'Moon',
    tagline: 'Explore lunar reference targets and research evidence',
    atmosphereColor: '#94a3b8',
    glowRgba: 'rgba(148, 163, 184, 0.4)',
    accentClass: 'text-slate-200',
    borderClass: 'border-slate-400/60',
    badgeBg: 'from-slate-500/20 to-slate-900/40',
    thumbImg: '/textures/moon_original_thumbnail.jpg',
    textureUrls: [
      '/textures/moon_1024.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
      'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_1k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Moonmap_from_clementine_data.png/1024px-Moonmap_from_clementine_data.png'
    ],
    bumpUrls: [
      '/textures/moon_1024.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
      'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit.jpg'
    ],
    locations: []
  },
  Earth: {
    key: 'Earth',
    name: 'Earth',
    tagline: 'Explore analyzed and proposed Earth screening sites',
    atmosphereColor: '#06b6d4',
    glowRgba: 'rgba(6, 182, 212, 0.5)',
    accentClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/60',
    badgeBg: 'from-cyan-500/20 to-blue-900/40',
    thumbImg: '/textures/earth_original_thumbnail.jpg',
    textureUrls: [
      '/textures/earth_atmos_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Land_ocean_ice_2048.jpg/1024px-Land_ocean_ice_2048.jpg'
    ],
    bumpUrls: [
      '/textures/earth_normal_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    ],
    specularUrls: [
      '/textures/earth_specular_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
    ],
    cloudUrls: [
      '/textures/earth_clouds_1024.png',
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
    ],
    locations: []
  }
};
