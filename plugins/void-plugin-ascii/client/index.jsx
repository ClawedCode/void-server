/**
 * ASCII Plugin Client Entry Point
 *
 * Exports all client components for dynamic loading by void-server-core.
 */

// Page Components
export { default as AsciiGeneratorPage } from './pages/AsciiGeneratorPage';

// Route definitions from manifest
export const routes = [
  {
    path: '',
    component: 'AsciiGeneratorPage',
    title: 'ASCII Generator'
  }
];

// Default navigation config
export const defaultNav = {
  section: null,
  title: 'ASCII',
  icon: 'terminal'
};

// Component map for dynamic loading
export const componentMap = {
  AsciiGeneratorPage: () => import('./pages/AsciiGeneratorPage')
};
