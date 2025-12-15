/**
 * Verify Plugin Client Entry Point
 *
 * Exports all client components for dynamic loading by void-server-core.
 */

// Page Components
export { default as VerifyMessagePage } from './pages/VerifyMessagePage';

// Route definitions from manifest
export const routes = [
  {
    path: '',
    component: 'VerifyMessagePage',
    title: 'Verify Signature'
  }
];

// Default navigation config
export const defaultNav = {
  section: null,
  title: 'Verify',
  icon: 'shield'
};

// Component map for dynamic loading
export const componentMap = {
  VerifyMessagePage: () => import('./pages/VerifyMessagePage')
};
