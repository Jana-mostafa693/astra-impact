export type View = 'home' | 'explorer' | 'compare' | 'finder' | 'evidence' | 'notfound';
export const PAGE_PATHS: Record<Exclude<View, 'notfound'>, string> = {
  home: '/', explorer: '/explore', compare: '/compare', finder: '/test-planner', evidence: '/about'
};
export const PAGE_LABELS: Record<Exclude<View, 'notfound'>, string> = {
  home: 'Home', explorer: 'Explore', compare: 'Compare', finder: 'Test Planner', evidence: 'About'
};
export function viewFromPath(path: string): View {
  const normalized = path.length > 1 ? path.replace(/\/$/, '') : path;
  return (Object.entries(PAGE_PATHS).find(([, value]) => value === normalized)?.[0] as View) ?? 'notfound';
}
