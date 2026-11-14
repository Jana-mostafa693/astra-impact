import * as THREE from 'three';

/** Equirectangular source textures: -180° at u=0; north at v=1. */
export function latLonToVector3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** Choose the nearest equivalent yaw; compensate camera-tilt rotation on focus. */
export function focusRotation(lat: number, lon: number, currentYaw: number, tilt = 0): {x:number;y:number} {
  const desiredYaw = -THREE.MathUtils.degToRad(lon) - Math.PI / 2;
  const shortestDelta = Math.atan2(Math.sin(desiredYaw - currentYaw), Math.cos(desiredYaw - currentYaw));
  return { y: currentYaw + shortestDelta, x: THREE.MathUtils.degToRad(lat) - tilt };
}

/** Perspective horizon: facing camera direction alone wrongly exposes rear-rim points. */
export function isSurfaceVisible(surfacePoint: THREE.Vector3, cameraPosition: THREE.Vector3): boolean {
  return surfacePoint.clone().normalize().dot(cameraPosition.clone().sub(surfacePoint)) > 0;
}

/** The pin tip is at SVG y=41.5 of 44, not at the icon centre. */
export const PIN_TIP_PERCENT = 100 * 41.5 / 44;
