import { createFileRoute } from '@tanstack/react-router';
import { DatasetDetailPage } from '../../pages/DatasetDetailPage';
import { mockDatasets } from '../../data/mockData';

export const Route = createFileRoute('/datasets/$datasetId')({
  component: () => {
    const { datasetId } = Route.useParams();
    const dataset = mockDatasets.find((d) => d.meta.resourceId === datasetId);
    
    if (!dataset) {
      return <div>Dataset not found</div>;
    }
    
    return <DatasetDetailPage datasetMeta={dataset} />;
  },
});
