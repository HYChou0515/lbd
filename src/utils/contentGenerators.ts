import type { Resource } from '../types/meta';
import type { Dataset } from '../types/dataset';
import type { Case } from '../types/program';
import { getSubdatasets } from './datasetHelpers';
import { formatFullAbsoluteTime } from './timeUtils';

/**
 * 生成 Dataset 的 Markdown 內容
 */
export function generateDatasetMarkdown(dataset: Resource<Dataset>): string {
  const isGroupType = dataset.data.type === 'Group';
  const subdatasets = getSubdatasets(dataset);
  
  return `# ${dataset.data.name}

## Description
${dataset.data.description}

## Metadata
- Type: ${dataset.data.type}
- Creator: ${dataset.meta.creator}
- Created: ${formatFullAbsoluteTime(dataset.meta.createdTime)}
- Resource ID: ${dataset.meta.resourceId}
- Revision ID: ${dataset.meta.revisionId}

${!isGroupType && 'toolId' in dataset.data ? `
## Process Information
- Tool ID: ${dataset.data.toolId}
- Wafer ID: ${dataset.data.waferId}
- Lot ID: ${dataset.data.lotId}
- Part: ${dataset.data.part}
- Recipe: ${dataset.data.recipe}
- Stage: ${dataset.data.stage}
` : ''}

## Subdatasets
${subdatasets.length > 0 
  ? subdatasets.map(sub => `- ${sub.data.name} (${sub.data.type})`).join('\n')
  : 'No subdatasets'}
`;
}

/**
 * 生成 Case 的 Markdown 內容（包含關聯的 Dataset 信息）
 */
export function generateCaseMarkdown(
  caseData: Resource<Case>,
  dataset?: Resource<Dataset>
): string {
  const baseInfo = `# ${caseData.data.name}

## Description
${caseData.data.description}

## Case Information
- Type: ${caseData.data.case_type}
- Dataset Revision ID: ${caseData.data.dataset_revision_id}

## Resource Information
- Resource ID: ${caseData.meta.resourceId}
- Creator: ${caseData.meta.creator}
- Created: ${caseData.meta.createdTime}
`;

  if (dataset) {
    // 如果有關聯的 Dataset，顯示 Dataset 的詳細信息
    return `${baseInfo}

---

## Associated Dataset

${generateDatasetMarkdown(dataset)}
`;
  }

  return `${baseInfo}

---

**Note**: Dataset details are not available. Dataset Revision ID: ${caseData.data.dataset_revision_id}
`;
}
