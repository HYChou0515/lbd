import type { Dataset } from '../types/dataset';
import type { Resource } from '../types/meta';

export const mockDatasets: Resource<Dataset>[] = [
  // 葉子節點 - 沒有 subdataset
  {
    meta: {
      creator: 'Diana Zhang',
      createdTime: '2025-11-01T00:25:00Z',
      updater: 'Eva Wu',
      updatedTime: '2025-11-01T00:30:00Z',
      resourceId: 'res_003',
      revisionId: 'rev_rsem_analysis_001',
    },
    data: {
      type: 'RSEM',
      name: 'RSEM Analysis Dataset',
      description: 'Scanning electron microscopy data for defect verification and detailed analysis.',
      sub_dataset_revision_ids: [],
      toolId: 'T03',
      waferId: 'W2025C',
      lotId: 'L12',
      part: 'P09',
      recipe: 'rsem_detailed_scan_v1.5',
      stage: 'Stage C - Detailed Analysis',
    },
  },
  {
    meta: {
      creator: 'Eva Wu',
      createdTime: '2025-10-23T14:20:00Z',
      updater: 'Eva Wu',
      updatedTime: '2025-10-23T14:20:00Z',
      resourceId: 'res_007',
      revisionId: 'rev_rsem_result_001',
    },
    data: {
      type: 'RSEM Result',
      name: 'RSEM Result - Defect Classification',
      description: 'Classified defect data from RSEM analysis with categorization and severity levels.',
      sub_dataset_revision_ids: [],
      toolId: 'T03',
      waferId: 'W2025C',
      lotId: 'L12',
      part: 'P09',
      recipe: 'rsem_detailed_scan_v1.5',
      stage: 'Stage C - Result Processing',
    },
  },
  {
    meta: {
      creator: 'Frank Chen',
      createdTime: '2025-10-18T13:20:00Z',
      updater: 'Frank Chen',
      updatedTime: '2025-10-18T13:20:00Z',
      resourceId: 'res_008',
      revisionId: 'rev_gds_layer_001',
    },
    data: {
      type: 'GDS',
      name: 'GDS Layer Stack Reference',
      description: 'Detailed layer stack information for wafer layout reference.',
      sub_dataset_revision_ids: [],
      toolId: 'T04',
      waferId: 'W2025D',
      lotId: 'L13',
      part: 'P10',
      recipe: 'gds_layer_stack_v2.0',
      stage: 'Stage D - Layer Definition',
    },
  },
  {
    meta: {
      creator: 'Isabel Wang',
      createdTime: '2025-10-27T09:30:00Z',
      updater: 'Isabel Wang',
      updatedTime: '2025-10-27T09:30:00Z',
      resourceId: 'res_009',
      revisionId: 'rev_primev_result_001',
    },
    data: {
      type: 'PrimeV IDT Result',
      name: 'PrimeV Detection Results - High Priority',
      description: 'High priority defects detected by PrimeV with AI confidence scores.',
      sub_dataset_revision_ids: [],
      toolId: 'T05',
      waferId: 'W2025E',
      lotId: 'L14',
      part: 'P11',
      recipe: 'primev_ai_enhanced_v4.2',
      stage: 'Stage E - Result Analysis',
    },
  },
  {
    meta: {
      creator: 'Jack Lee',
      createdTime: '2025-10-24T16:45:00Z',
      updater: 'Jack Lee',
      updatedTime: '2025-10-24T16:45:00Z',
      resourceId: 'res_010',
      revisionId: 'rev_escan_result_001',
    },
    data: {
      type: 'Escan IDT Result',
      name: 'E-Scan Analysis Results',
      description: 'Processed e-scan results with defect annotations and metadata.',
      sub_dataset_revision_ids: [],
      toolId: 'T02',
      waferId: 'W2025B',
      lotId: 'L11',
      part: 'P08',
      recipe: 'escan_standard_v2.1_production',
      stage: 'Stage B - Result Generation',
    },
  },

  // 中間層 - 有 subdataset 但也可能是其他的 subdataset
  {
    meta: {
      creator: 'Charlie Liu',
      createdTime: '2025-10-20T09:15:00Z',
      updater: 'Charlie Liu',
      updatedTime: '2025-10-20T09:15:00Z',
      resourceId: 'res_002',
      revisionId: 'rev_escan_idt_002',
    },
    data: {
      type: 'Escan IDT',
      name: 'E-Scan Training Data',
      description: 'High-resolution e-scan images with labeled defects for model training.',
      sub_dataset_revision_ids: ['rev_escan_result_001'], // -> E-Scan Analysis Results
      toolId: 'T02',
      waferId: 'W2025B',
      lotId: 'L11',
      part: 'P08',
      recipe: 'escan_standard_v2.1_production',
      stage: 'Stage B - E-Scan Process',
    },
  },
  {
    meta: {
      creator: 'Frank Chen',
      createdTime: '2025-10-18T13:20:00Z',
      updater: 'Frank Chen',
      updatedTime: '2025-10-18T13:20:00Z',
      resourceId: 'res_004',
      revisionId: 'rev_gds_layout_003',
    },
    data: {
      type: 'GDS',
      name: 'GDS Layout Reference',
      description: 'Complete GDS layout files for wafer design reference and comparison.',
      sub_dataset_revision_ids: ['rev_gds_layer_001'], // -> GDS Layer Stack Reference
      toolId: 'T04',
      waferId: 'W2025D',
      lotId: 'L13',
      part: 'P10',
      recipe: 'gds_export_standard_v3.0',
      stage: 'Stage D - Layout Export',
    },
  },
  {
    meta: {
      creator: 'Henry Zhao',
      createdTime: '2025-10-26T10:30:00Z',
      updater: 'Isabel Wang',
      updatedTime: '2025-10-29T12:15:00Z',
      resourceId: 'res_006',
      revisionId: 'rev_primev_idt_004',
    },
    data: {
      type: 'PrimeV IDT',
      name: 'PrimeV Defect Detection',
      description: 'Advanced defect detection using PrimeV inspection technology with AI-enhanced classification.',
      sub_dataset_revision_ids: ['rev_primev_result_001'], // -> PrimeV Detection Results
      toolId: 'T05',
      waferId: 'W2025E',
      lotId: 'L14',
      part: 'P11',
      recipe: 'primev_ai_enhanced_v4.2',
      stage: 'Stage E - AI Detection',
    },
  },
  {
    meta: {
      creator: 'Karen Zhou',
      createdTime: '2025-10-21T10:00:00Z',
      updater: 'Karen Zhou',
      updatedTime: '2025-10-21T10:00:00Z',
      resourceId: 'res_011',
      revisionId: 'rev_review_ready_005',
    },
    data: {
      type: 'Review Ready',
      name: 'Review Ready - Q4 Batch',
      description: 'Datasets prepared and ready for expert review with annotations and preliminary analysis.',
      sub_dataset_revision_ids: ['rev_rsem_analysis_001', 'rev_primev_result_001', 'rev_escan_idt_002'], // -> RSEM Analysis, PrimeV Detection Results
      toolId: 'T06',
      waferId: 'W2025F',
      lotId: 'L15',
      part: 'P12',
      recipe: 'review_preparation_v1.0',
      stage: 'Stage F - Review Preparation',
    },
  },

  // 頂層 - 主要入口點
  {
    meta: {
      creator: 'Alice Chen',
      createdTime: '2025-10-15T10:30:00Z',
      updater: 'Bob Wang',
      updatedTime: '2025-10-28T14:20:00Z',
      resourceId: 'res_001',
      revisionId: 'rev_ebi_wafer_006',
    },
    data: {
      type: 'EBI',
      name: 'Wafer Inspection Dataset',
      description: 'Complete EBI inspection data for wafer batch W2025-10-A with defect analysis results and classification metrics.',
      sub_dataset_revision_ids: ['rev_escan_idt_002', 'rev_rsem_analysis_001', 'rev_gds_layout_003'], // -> E-Scan, RSEM, GDS
      toolId: 'T01',
      waferId: 'W2025A',
      lotId: 'L10',
      part: 'P07',
      recipe: 'wafer_inspection_3.2_pre-test',
      stage: 'Stage A - Initial Inspection',
    },
  },
  {
    meta: {
      creator: 'Grace Lin',
      createdTime: '2025-11-01T15:00:00Z',
      updater: 'Grace Lin',
      updatedTime: '2025-11-01T15:00:00Z',
      resourceId: 'res_005',
      revisionId: 'rev_group_q4_007',
    },
    data: {
      type: 'Group',
      name: 'Q4 Production Dataset Collection',
      description: 'Consolidated dataset collection for Q4 production analysis and reporting.',
      sub_dataset_revision_ids: ['rev_ebi_wafer_006', 'rev_escan_idt_002', 'rev_primev_idt_004', 'rev_review_ready_005'], // -> EBI, E-Scan, PrimeV, Review Ready
    },
  },
];
