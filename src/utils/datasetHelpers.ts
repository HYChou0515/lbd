import { mockDatasets } from '../data/mockData';
import type { DatasetDataMeta } from '../types/dataset';

/**
 * 根據 revision ID 查找對應的 dataset
 */
export function findDatasetByRevisionId(revisionId: string): DatasetDataMeta | undefined {
  return mockDatasets.find((dataset) => dataset.meta.revisionId === revisionId);
}

/**
 * 根據 resource ID 查找對應的 dataset
 */
export function findDatasetByResourceId(resourceId: string): DatasetDataMeta | undefined {
  return mockDatasets.find((dataset) => dataset.meta.resourceId === resourceId);
}

/**
 * 獲取 dataset 的所有 subdatasets
 */
export function getSubdatasets(dataset: DatasetDataMeta): DatasetDataMeta[] {
  return dataset.data.sub_dataset_revision_ids
    .map((revId) => findDatasetByRevisionId(revId))
    .filter((ds): ds is DatasetDataMeta => ds !== undefined);
}

/**
 * 檢查 dataset 是否有 subdatasets
 */
export function hasSubdatasets(dataset: DatasetDataMeta): boolean {
  return dataset.data.sub_dataset_revision_ids.length > 0;
}

/**
 * 獲取 dataset 的所有祖先（父、祖父...）
 */
export function getAncestors(dataset: DatasetDataMeta): DatasetDataMeta[] {
  const ancestors: DatasetDataMeta[] = [];
  
  for (const potentialParent of mockDatasets) {
    if (potentialParent.data.sub_dataset_revision_ids.includes(dataset.meta.revisionId)) {
      ancestors.push(potentialParent);
      // 遞迴查找祖先的祖先
      ancestors.push(...getAncestors(potentialParent));
    }
  }
  
  return ancestors;
}

/**
 * 獲取所有頂層 datasets（沒有父節點的）
 */
export function getTopLevelDatasets(): DatasetDataMeta[] {
  const childRevisionIds = new Set<string>();
  
  mockDatasets.forEach((dataset) => {
    dataset.data.sub_dataset_revision_ids.forEach((revId) => {
      childRevisionIds.add(revId);
    });
  });
  
  return mockDatasets.filter((dataset) => !childRevisionIds.has(dataset.meta.revisionId));
}
