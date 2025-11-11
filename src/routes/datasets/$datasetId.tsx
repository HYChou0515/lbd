import { createFileRoute } from '@tanstack/react-router';
import { DatasetDetailPage } from '../../pages/DatasetDetailPage';
import { mockDatasets } from '../../data/mockData';

export const Route = createFileRoute('/datasets/$datasetId')({
  component: () => {
    const { datasetId } = Route.useParams();
    
    // Find the root dataset - search through all datasets and their subdatasets
    const findRootDataset = (targetId: string): typeof mockDatasets[0] | null => {
      const checkDataset = (dataset: typeof mockDatasets[0]): boolean => {
        if (dataset.meta.resourceId === targetId) return true;
        // Check if targetId is in subdatasets recursively
        const checkSubs = (ds: typeof mockDatasets[0]): boolean => {
          if (ds.meta.resourceId === targetId) return true;
          const subdatasets = mockDatasets.filter(d => 
            ds.data.sub_dataset_revision_ids.includes(d.meta.revisionId)
          );
          return subdatasets.some(sub => checkSubs(sub));
        };
        return checkSubs(dataset);
      };

      // Find the root dataset that contains the target
      for (const dataset of mockDatasets) {
        if (checkDataset(dataset)) {
          // Check if this dataset is a root (not a subdataset of anyone)
          const isRoot = !mockDatasets.some(d => 
            d.data.sub_dataset_revision_ids.includes(dataset.meta.revisionId)
          );
          if (isRoot) {
            return dataset;
          }
        }
      }
      return null;
    };

    const rootDataset = findRootDataset(datasetId);
    
    if (!rootDataset) {
      return <div>Dataset not found</div>;
    }
    
    // If datasetId is the root, don't pass selectedDatasetId
    const selectedDatasetId = rootDataset.meta.resourceId === datasetId 
      ? undefined 
      : datasetId;
    
    return <DatasetDetailPage datasetMeta={rootDataset} selectedDatasetId={selectedDatasetId} />;
  },
});
