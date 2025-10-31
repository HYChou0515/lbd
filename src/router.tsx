import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { HomePage } from './pages/HomePage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';
import { mockDatasets } from './data/mockData';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Detail route
const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dataset/$resourceId',
  component: () => {
    const { resourceId } = detailRoute.useParams();
    const dataset = mockDatasets.find((d) => d.meta.resourceId === resourceId);
    
    if (!dataset) {
      return <div>Dataset not found</div>;
    }
    
    return <DatasetDetailPage datasetMeta={dataset} />;
  },
});

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, detailRoute]);

// Create router
export const router = createRouter({ routeTree });

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
