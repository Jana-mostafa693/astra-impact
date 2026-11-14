import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { Plus,Minus,RotateCcw } from 'lucide-react';
import { WORLD_PRESENTATION as PLANET_DATA } from '../services/presentation';
import type { SiteLocation } from '../types/view';
import { latLonToVector3, focusRotation, isSurfaceVisible, PIN_TIP_PERCENT } from '../utils/globeGeometry';
const loadedImageCache: Record<string, HTMLImageElement> = {};

function loadImageWithFallback(urls: string[]): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    let index = 0;
    const tryNext = () => {
      if (index >= urls.length) {
        resolve(null);
        return;
      }
      const url = urls[index++];
      if (loadedImageCache[url]) {
        resolve(loadedImageCache[url]);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImageCache[url] = img;
        resolve(img);
      };
      img.onerror = () => {
        tryNext();
      };
      img.src = url;
    };
    tryNext();
  });
}

// High-detail fallback generator used while satellite images stream in or if offline
function createPlanetaryTexture(
  world: 'Earth' | 'Mars' | 'Moon',
  activeOverlay: 'none' | 'thermal' | 'elevation' | 'safety',
  realSurfaceImg?: HTMLImageElement | null
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture; cloudsMap?: THREE.CanvasTexture } {
  const width = 2048;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // Deterministic pseudo-random helper
  let seed = world === 'Earth' ? 42 : world === 'Mars' ? 137 : 999;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Lon/Lat to X/Y helper
  const lonLatToXY = (lon: number, lat: number) => ({
    x: ((lon + 180) / 360) * width,
    y: ((90 - lat) / 180) * height
  });

  if (realSurfaceImg) {
    // Draw authentic high-res NASA satellite map directly onto the texture canvas
    ctx.drawImage(realSurfaceImg, 0, 0, width, height);
    bumpCtx.drawImage(realSurfaceImg, 0, 0, width, height);
  } else if (world === 'Earth') {
    // Deep rich ocean gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#0c2d57');
    oceanGrad.addColorStop(0.2, '#072247');
    oceanGrad.addColorStop(0.5, '#06346f');
    oceanGrad.addColorStop(0.8, '#072247');
    oceanGrad.addColorStop(1, '#0c2d57');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#151515';
    bumpCtx.fillRect(0, 0, width, height);
  } else if (world === 'Mars') {
    const marsGrad = ctx.createLinearGradient(0, 0, 0, height);
    marsGrad.addColorStop(0, '#7c2d12');
    marsGrad.addColorStop(0.2, '#b45309');
    marsGrad.addColorStop(0.5, '#c2410c');
    marsGrad.addColorStop(0.8, '#9a3412');
    marsGrad.addColorStop(1, '#6c240c');
    ctx.fillStyle = marsGrad;
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#606060';
    bumpCtx.fillRect(0, 0, width, height);
  } else {
    const moonGrad = ctx.createLinearGradient(0, 0, 0, height);
    moonGrad.addColorStop(0, '#64748b');
    moonGrad.addColorStop(0.5, '#94a3b8');
    moonGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = moonGrad;
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#707070';
    bumpCtx.fillRect(0, 0, width, height);
  }

  // MASTER has site/profile samples, not global georeferenced science rasters.
  // No artistic thermal gradients, sine-wave contours or safety corridors are overlaid.
  void activeOverlay;

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = 8;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);

  // Subtle atmospheric dust/cloud fallback texture if real clouds haven't loaded yet
  let cloudsMap: THREE.CanvasTexture | undefined;
  if (world === 'Earth' || world === 'Mars') {
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 1024;
    cloudCanvas.height = 512;
    const cCtx = cloudCanvas.getContext('2d')!;
    const count = world === 'Earth' ? 180 : 60;
    for (let i = 0; i < count; i++) {
      const x = rand() * 1024;
      const y = 25 + rand() * (512 - 50);
      const rx = 20 + rand() * 80;
      const ry = 6 + rand() * 22;
      const g = cCtx.createRadialGradient(x, y, 1, x, y, rx);
      const col = world === 'Earth' ? '255, 255, 255' : '253, 186, 116';
      const alpha = world === 'Earth' ? 0.28 * rand() : 0.12 * rand();
      g.addColorStop(0, `rgba(${col}, ${alpha})`);
      g.addColorStop(1, `rgba(${col}, 0)`);
      cCtx.fillStyle = g;
      cCtx.beginPath();
      cCtx.ellipse(x, y, rx, ry, (rand() - 0.5) * 0.5, 0, Math.PI * 2);
      cCtx.fill();
    }
    cloudsMap = new THREE.CanvasTexture(cloudCanvas);
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
  }

  return { map, bumpMap, cloudsMap };
}

interface ProjectedPin {
  site: SiteLocation;
  x: number;
  y: number;
  visible: boolean;
  scale: number;
  zDepth: number;
}

interface GlobeProps {
  worldKey: 'Mars' | 'Moon' | 'Earth';
  locations: SiteLocation[];
  selectedLocation: SiteLocation;
  onSelectLocation: (loc: SiteLocation) => void;
  activeOverlay: 'none' | 'thermal' | 'elevation' | 'safety';
  showGridLines: boolean;
}

export const InteractivePlanetGlobe: React.FC<GlobeProps> = ({
  worldKey,
  locations,
  selectedLocation,
  onSelectLocation,
  activeOverlay,
  showGridLines
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [projectedPins, setProjectedPins] = useState<ProjectedPin[]>([]);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [is3DTilt, setIs3DTilt] = useState<boolean>(false);
  const [zoomDistance, setZoomDistance] = useState<number>(2.75);

  // Refs for smooth animation inside requestAnimationFrame
  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;
  const is3DTiltRef = useRef(is3DTilt);
  is3DTiltRef.current = is3DTilt;
  const zoomDistanceRef = useRef(zoomDistance);
  zoomDistanceRef.current = zoomDistance;
  const locationsRef = useRef(locations);
  locationsRef.current = locations;
  const worldKeyRef = useRef(worldKey);
  worldKeyRef.current = worldKey;

  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ y: number; x: number } | null>(null);
  const currentRotRef = useRef({ y: 0.8, x: 0.15 });

  // Focus preserves the original interpolation speed and chooses a short rotation.
  useEffect(() => {
    if (!selectedLocation || selectedLocation.world !== worldKey) return;
    targetRotationRef.current = focusRotation(
      selectedLocation.lat, selectedLocation.lon, currentRotRef.current.y,
      is3DTilt ? 0.35 : 0
    );
  }, [selectedLocation.id, worldKey, is3DTilt]);

  // Initialize Three.js WebGL Scene
  const sceneObjectsRef = useRef<{
    planetMesh?: THREE.Mesh;
    cloudMesh?: THREE.Mesh;
    gridMesh?: THREE.LineSegments;
    atmoMaterial?: THREE.ShaderMaterial;
  }>({});

  useLayoutEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomDistanceRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting setup for realistic sunlit satellite globe + shadowed terminator
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.55);
    sunLight.position.set(4.5, 2.5, 4.5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-4, -2, -2.5);
    scene.add(rimLight);

    // Pivot Group that rotates the planet, clouds, and lat/lon grid together
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Main High-Res Planet Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const { map, bumpMap, cloudsMap } = createPlanetaryTexture(worldKey, activeOverlay);

    const planetMat = new THREE.MeshPhongMaterial({
      map,
      bumpMap,
      bumpScale: 0.025,
      specular: new THREE.Color(worldKey === 'Earth' ? 0x334155 : 0x1e293b),
      shininess: worldKey === 'Earth' ? 22 : 5
    });
    const planetMesh = new THREE.Mesh(sphereGeo, planetMat);
    globeGroup.add(planetMesh);

    // Cloud / Atmospheric Layer Sphere
    const cloudGeo = new THREE.SphereGeometry(1.014, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudsMap || null,
      transparent: true,
      opacity: cloudsMap ? 0.85 : 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // Optional Lat/Lon Graticule Wireframe
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(1.005, 24, 12));
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: showGridLines ? 0.18 : 0
    });
    const gridMesh = new THREE.LineSegments(wireGeo, wireMat);
    globeGroup.add(gridMesh);

    // Realistic Atmospheric Fresnel Rim Glow Shader Sphere
    const atmoGeo = new THREE.SphereGeometry(1.12, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(PLANET_DATA[worldKey].atmosphereColor) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(max(0.0, 0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.8);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 1.15;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    sceneObjectsRef.current = {
      planetMesh,
      cloudMesh,
      gridMesh,
      atmoMaterial: atmoMat
    };

    // Mouse & Touch Drag Handlers
    const onPointerDown = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      targetRotationRef.current = null; // Cancel auto-focus lerp when user drags
      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const dx = clientX - prevMouseRef.current.x;
      const dy = clientY - prevMouseRef.current.y;
      currentRotRef.current.y += dx * 0.0065;
      currentRotRef.current.x = Math.max(
        -1.1,
        Math.min(1.1, currentRotRef.current.x + dy * 0.0055)
      );
      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElem = renderer.domElement;
    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomDistance((prev) => Math.max(1.85, Math.min(3.5, prev + e.deltaY * 0.0012)));
    };

    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });

    // Responsive resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation & 3D Pin Projection Loop
    let frameId: number;
    let lastPinUpdate = 0;

    const animate = (timestamp: number) => {
      frameId = requestAnimationFrame(animate);

      // Smoothly interpolate toward target pin if recently selected, or auto-spin
      if (targetRotationRef.current) {
        const dy = targetRotationRef.current.y - currentRotRef.current.y;
        const dx = targetRotationRef.current.x - currentRotRef.current.x;
        currentRotRef.current.y += dy * 0.07;
        currentRotRef.current.x += dx * 0.07;
        if (Math.abs(dy) < 0.004 && Math.abs(dx) < 0.004) {
          targetRotationRef.current = null;
        }
      } else if (autoSpinRef.current && !isDraggingRef.current) {
        currentRotRef.current.y += 0.0028;
      }

      globeGroup.rotation.y = currentRotRef.current.y;
      globeGroup.rotation.x = currentRotRef.current.x + (is3DTiltRef.current ? 0.35 : 0);

      // Subtle atmospheric cloud drift
      if (cloudMesh) {
        cloudMesh.rotation.y += 0.00045;
      }

      // Smooth camera zoom
      camera.position.z += (zoomDistanceRef.current - camera.position.z) * 0.1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      // Project 3D surface coordinates of all pins to 2D overlay coordinates (~30fps)
      if (timestamp - lastPinUpdate > 28) {
        lastPinUpdate = timestamp;
        globeGroup.updateMatrixWorld();
        const w = container.clientWidth || 480;
        const h = container.clientHeight || 480;


        const nextPins: ProjectedPin[] = locationsRef.current.map((site) => {
          const localVec = latLonToVector3(site.lat, site.lon, 1.01);
          const worldVec = localVec.clone().applyMatrix4(globeGroup.matrixWorld);

          // Check if pin is on the front hemisphere facing the camera
          const surfaceNormal = worldVec.clone().normalize();
          const dot = surfaceNormal.dot(camera.position.clone().normalize());
          const surfacePoint = latLonToVector3(site.lat, site.lon, 1).applyMatrix4(globeGroup.matrixWorld);
          const visible = site.world === worldKeyRef.current && isSurfaceVisible(surfacePoint, camera.position);

          const projected = worldVec.clone().project(camera);
          const screenX = (projected.x * 0.5 + 0.5) * w;
          const screenY = (-projected.y * 0.5 + 0.5) * h;

          return {
            site,
            x: screenX,
            y: screenY,
            visible,
            scale: Math.max(0.65, Math.min(1.15, 0.7 + dot * 0.45)),
            zDepth: dot
          };
        });

        setProjectedPins(nextPins);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onPointerUp);
      domElem.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      scene.traverse((object) => {
        const renderable = object as THREE.Mesh;
        renderable.geometry?.dispose();
        const materials = renderable.material ? (Array.isArray(renderable.material) ? renderable.material : [renderable.material]) : [];
        materials.forEach((material) => {
          const m = material as THREE.MeshPhongMaterial;
          m.map?.dispose(); m.bumpMap?.dispose(); m.normalMap?.dispose(); m.specularMap?.dispose(); material.dispose();
        });
      });
      sceneObjectsRef.current = {};
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // A world change replaces the previous body's maps BEFORE the browser paints.
  // Local source assets are retained; a loading Earth can never keep orange Mars pixels.
  useLayoutEffect(() => {
    let isCancelled = false;
    const { planetMesh, cloudMesh, atmoMaterial } = sceneObjectsRef.current;
    if (!planetMesh) return;
    const config = PLANET_DATA[worldKey];
    const mat = planetMesh.material as THREE.MeshPhongMaterial;
    const cMat = cloudMesh?.material as THREE.MeshPhongMaterial | undefined;
    const container = mountRef.current;
    const replaceSurface = (surfaceImg: HTMLImageElement | null) => {
      const textures = createPlanetaryTexture(worldKey, 'none', surfaceImg);
      mat.map?.dispose(); mat.bumpMap?.dispose(); mat.normalMap?.dispose(); mat.specularMap?.dispose();
      mat.map = textures.map;
      mat.bumpMap = textures.bumpMap;
      mat.normalMap = null;
      mat.specularMap = null;
      mat.color.set(0xffffff);
      mat.emissive.set(0x000000);
      mat.bumpScale = worldKey === 'Moon' ? 0.032 : worldKey === 'Mars' ? 0.028 : 0.02;
      mat.specular = new THREE.Color(worldKey === 'Earth' ? 0x334155 : 0x222222);
      mat.shininess = worldKey === 'Earth' ? 24 : 5;
      mat.needsUpdate = true;
      if (cMat) {
        cMat.map?.dispose();
        cMat.map = textures.cloudsMap || null;
        cMat.opacity = worldKey === 'Earth' ? 0.75 : worldKey === 'Mars' ? 0.35 : 0;
        cMat.color.set(0xffffff);
        cMat.needsUpdate = true;
      }
      if (container) {
        container.dataset.textureWorld = worldKey;
        container.dataset.textureStatus = surfaceImg ? 'photographic' : 'loading-body-specific';
      }
    };
    // This synchronous reset also handles deliberately slow/offline texture requests.
    replaceSurface(loadedImageCache[config.textureUrls[0]] ?? null);
    if (atmoMaterial) atmoMaterial.uniforms.glowColor.value.set(config.atmosphereColor);

    void loadImageWithFallback(config.textureUrls).then((image) => {
      if (isCancelled) return;
      replaceSurface(image);
      if (!image && container) container.dataset.textureStatus = 'unavailable-body-specific-fallback';

      if (config.bumpUrls?.length) void loadImageWithFallback(config.bumpUrls).then((bumpImage) => {
        if (isCancelled || !bumpImage) return;
        const texture = new THREE.Texture(bumpImage);
        texture.needsUpdate = true;
        if (worldKey === 'Earth') {
          // The existing RGB Earth asset is a NORMAL map, not grayscale height.
          mat.bumpMap?.dispose(); mat.bumpMap = null;
          mat.normalMap?.dispose(); mat.normalMap = texture;
          mat.normalScale.set(0.45, 0.45);
        } else {
          mat.bumpMap?.dispose(); mat.bumpMap = texture;
        }
        mat.needsUpdate = true;
      });
      if (config.specularUrls?.length) void loadImageWithFallback(config.specularUrls).then((specularImage) => {
        if (isCancelled || !specularImage) return;
        const texture = new THREE.Texture(specularImage);
        texture.needsUpdate = true;
        mat.specularMap?.dispose(); mat.specularMap = texture;
        mat.needsUpdate = true;
      });
      if (cMat && config.cloudUrls?.length) void loadImageWithFallback(config.cloudUrls).then((cloudImage) => {
        if (isCancelled || !cloudImage) return;
        const texture = new THREE.Texture(cloudImage);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        cMat.map?.dispose(); cMat.map = texture;
        cMat.opacity = 0.88;
        cMat.needsUpdate = true;
      });
    });
    return () => { isCancelled = true; };
  }, [worldKey]);

  // A grid toggle cannot cancel/reload a body's surface map or reintroduce stale maps.
  useEffect(() => {
    const gridMesh = sceneObjectsRef.current.gridMesh;
    if (gridMesh) (gridMesh.material as THREE.LineBasicMaterial).opacity = showGridLines ? 0.22 : 0;
  }, [showGridLines]);

  const handleResetView = () => {
    setZoomDistance(2.75);
    setIs3DTilt(false);
    if (selectedLocation) {
      targetRotationRef.current = focusRotation(selectedLocation.lat, selectedLocation.lon, currentRotRef.current.y);
    }
  };

  const worldMeta = PLANET_DATA[worldKey];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {/* Outer Orbital Ring & Sci-Fi Halo matching reference image */}
      <div className="relative w-[320px] h-[320px] sm:w-[410px] sm:h-[410px] xl:w-[450px] xl:h-[450px] flex items-center justify-center">
        {/* Decorative glowing orbital arc */}
        <svg
          className="absolute inset-[-6%] w-[112%] h-[112%] pointer-events-none animate-[spin_50s_linear_infinite]"
          viewBox="0 0 400 400"
        >
          <defs>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={worldMeta.atmosphereColor} stopOpacity="0.85" />
              <stop offset="40%" stopColor={worldMeta.atmosphereColor} stopOpacity="0.1" />
              <stop offset="80%" stopColor={worldMeta.atmosphereColor} stopOpacity="0.0" />
              <stop offset="100%" stopColor={worldMeta.atmosphereColor} stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <circle
            cx="200"
            cy="200"
            r="192"
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="1.6"
            strokeDasharray="160 90 220 120"
          />
          <circle cx="200" cy="8" r="3" fill={worldMeta.atmosphereColor} />
          <circle cx="385" cy="252" r="2.5" fill={worldMeta.atmosphereColor} />
        </svg>

        {/* Radial Planetary Atmosphere Glow */}
        <div
          className="absolute inset-[7%] rounded-full pointer-events-none transition-all duration-700"
          style={{
            boxShadow: `0 0 70px 18px ${worldMeta.glowRgba}, inset 0 0 45px ${worldMeta.glowRgba}`
          }}
        />

        {/* Three.js WebGL Globe Container */}
        <div
          ref={mountRef}
          data-testid="planet-globe"
          data-body={worldKey}
          style={{ touchAction: 'none' }}
          className="relative w-full h-full cursor-grab active:cursor-grabbing z-10"
          title="Drag to rotate 3D globe • Scroll to zoom"
        />

        {/* 3D Surface-Anchored Pinpoint Markers Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {projectedPins.map(({ site, x, y, visible, scale, zDepth }) => {
            if (!visible) return null;
            if (site.world !== worldKey) return null;
            const isSelected = selectedLocation?.id === site.id;

            const badgeColorClasses =
              site.pinColor === 'green'
                ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.9)]'
                : site.pinColor === 'yellow'
                ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]'
                : 'text-rose-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.95)]';

            return (
              <button
                key={site.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLocation(site);
                }}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -${PIN_TIP_PERCENT}%) scale(${isSelected ? scale * 1.25 : scale})`,
                  transformOrigin: `50% ${PIN_TIP_PERCENT}%`,
                  zIndex: isSelected ? 50 : Math.round(zDepth * 30)
                }}
                className="absolute pointer-events-auto group focus:outline-none transition-transform duration-150"
                aria-label={`Select ${site.name}`}
                data-site-id={site.id}
                data-body={site.world}
                data-latitude={site.lat}
                data-longitude={site.lon}
                aria-pressed={isSelected}
              >
                {/* Glowing concentric target rings for selected or hovered pin */}
                {isSelected && (
                  <>
                    <span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 animate-ping opacity-70"
                      style={{ borderColor: site.pinHex }}
                    />
                    <span
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border"
                      style={{
                        borderColor: site.pinHex,
                        boxShadow: `0 0 18px ${site.pinHex}`
                      }}
                    />
                  </>
                )}

                {/* Teardrop Pin SVG matching reference screenshot */}
                <div className={`relative flex items-center justify-center ${badgeColorClasses}`}>
                  <svg
                    viewBox="0 0 36 44"
                    className="w-8 h-10 transition-transform group-hover:scale-110"
                  >
                    <path
                      d="M18 2C9.7 2 3 8.7 3 17c0 10.8 15 24.5 15 24.5S33 27.8 33 17c0-8.3-6.7-15-15-15z"
                      fill={site.pinHex}
                      stroke="#ffffff"
                      strokeWidth="2.2"
                    />
                    <circle cx="18" cy="16.5" r="5.5" fill="#0f172a" />
                    <circle cx="18" cy="16.5" r="2.8" fill="#ffffff" />
                  </svg>
                </div>

                {/* Floating HUD Micro-Tooltip on Hover / Selection */}
                <div
                  className={`
                    absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap px-2.5 py-0.5 rounded-full
                    text-[10px] font-bold tracking-wide bg-slate-950/90 border border-slate-700/80 text-white
                    shadow-lg transition-opacity duration-200 pointer-events-none
                    ${isSelected ? 'opacity-100 border-cyan-400/60' : 'opacity-0 group-hover:opacity-100'}
                  `}
                >
                  {site.name.split(',')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right-Side Vertical Globe Control Stack (+, -, Rotate/Reset, 3D) as in reference */}
        <div className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-30">
          <button
            type="button"
            onClick={() => setZoomDistance((d) => Math.max(1.85, d - 0.25))}
            className="w-10 h-10 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomDistance((d) => Math.min(3.5, d + 0.25))}
            className="w-10 h-10 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAutoSpin((s) => !s)}
            onDoubleClick={handleResetView}
            className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all ${
              autoSpin
                ? 'bg-cyan-950/70 border-cyan-400/70 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-300 hover:border-cyan-400'
            }`}
            title={autoSpin ? 'Pause Planet Spin (Double-click to reset)' : 'Resume Planet Spin'}
          >
            <RotateCcw className={`w-4 h-4 ${autoSpin ? 'animate-[spin_9s_linear_infinite]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIs3DTilt((t) => !t)}
            className={`w-10 h-10 rounded-full backdrop-blur-md border text-xs font-extrabold tracking-tight flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all ${
              is3DTilt
                ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-200 hover:border-cyan-400'
            }`}
            title="Toggle 3D Orbital Camera Tilt"
          >
            3D
          </button>
        </div>
      </div>
    </div>
  );
};
