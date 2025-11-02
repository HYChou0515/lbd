import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { HomePage } from './pages/HomePage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';
import { SubmissionPage } from './pages/SubmissionPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ProgramPage } from './pages/ProgramPage';
import { mockDatasets } from './data/mockData';
import { mockProgram } from './data/mockProgramData';

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

// Submission route
const submissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submissions',
  component: SubmissionPage,
});

// Programs list route
const programsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/programs',
  component: ProgramsPage,
});

// Program detail route
const programRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/program/$resourceId',
  component: () => {
    const { resourceId } = programRoute.useParams();
    
    // For now, we only have one mock program
    if (mockProgram.meta.resourceId !== resourceId) {
      return <div>Program not found</div>;
    }
    
    return <ProgramPage program={mockProgram} />;
  },
});

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, detailRoute, submissionRoute, programsRoute, programRoute]);

// Create router
export const router = createRouter({ routeTree });

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
