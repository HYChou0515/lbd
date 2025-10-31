import { Badge } from '@mantine/core';
import type { DatasetDataMeta } from '../types/dataset';

/**
 * Dataset Type 對應的顏色
 */
export const DATASET_TYPE_COLORS: Record<string, string> = {
  'EBI': 'blue',
  'Escan IDT': 'violet',
  'Escan IDT Result': 'grape',
  'PrimeV IDT': 'pink',
  'PrimeV IDT Result': 'red',
  'GDS': 'orange',
  'Review Ready': 'green',
  'RSEM': 'cyan',
  'RSEM Result': 'teal',
  'Group': 'indigo',
};

/**
 * 取得 Dataset Type 的顏色
 */
export function getDatasetTypeColor(type: string): string {
  return DATASET_TYPE_COLORS[type] || 'gray';
}

/**
 * 共用的 Type Badge 組件
 */
interface DatasetTypeBadgeProps {
  type: string;
  variant?: 'filled' | 'light' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function DatasetTypeBadge({ type, variant = 'light', size = 'sm' }: DatasetTypeBadgeProps) {
  return (
    <Badge 
      color={getDatasetTypeColor(type)} 
      variant={variant}
      size={size}
    >
      {type}
    </Badge>
  );
}

/**
 * 下載 Dataset 的共用函數
 */
export function downloadDataset(dataset: DatasetDataMeta): void {
  // TODO: 實作實際的下載邏輯
  // 這裡可以根據需求實作：
  // 1. 呼叫後端 API 取得下載連結
  // 2. 使用 FileReader 和 Blob 產生下載
  // 3. 觸發瀏覽器下載行為
  
  console.log('Downloading dataset:', {
    name: dataset.data.name,
    resourceId: dataset.meta.resourceId,
    type: dataset.data.type,
  });
  
  // 暫時使用 alert 提示
  alert(
    `Downloading: ${dataset.data.name}\n` +
    `Type: ${dataset.data.type}\n` +
    `Resource ID: ${dataset.meta.resourceId}\n\n` +
    `(Download functionality to be implemented)`
  );
  
  // 未來可以這樣實作：
  // const downloadUrl = `/api/datasets/${dataset.meta.resourceId}/download`;
  // window.open(downloadUrl, '_blank');
}
