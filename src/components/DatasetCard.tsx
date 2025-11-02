import { Badge, Group, Text, Stack, Tooltip } from '@mantine/core';
import { IconFolder } from '@tabler/icons-react';
import type { Resource } from '../types/meta';
import { DatasetTypeBadge, downloadDataset } from '../utils/datasetUtils';
import { ResourceCard } from './ResourceCard';
import type { Dataset } from '../types/dataset';

interface DatasetCardProps {
  datasetMeta: Resource<Dataset>;
  onViewDetails: (id: string) => void;
}

export function DatasetCard({ datasetMeta, onViewDetails }: DatasetCardProps) {
  const { meta, data } = datasetMeta;
  
  // 判斷是否為 Group 類型
  const isGroup = data.type === 'Group';

  return (
    <ResourceCard
      titlePrefix="📦"
      title={data.name}
      badge={<DatasetTypeBadge type={data.type} variant="filled" size="lg" />}
      creator={meta.creator}
      createdTime={meta.createdTime}
      onView={() => onViewDetails(meta.resourceId)}
      onDownload={() => downloadDataset(datasetMeta)}
    >
      {/* Recipe & Stage */}
      {!isGroup && 'recipe' in data && (
        <Stack gap="xs">
          <Group gap="xs">
            <Text size="sm" c="dimmed" fw={500}>Recipe:</Text>
            <Tooltip label={data.recipe} openDelay={300}>
              <Text size="sm" lineClamp={1}>{data.recipe}</Text>
            </Tooltip>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed" fw={500}>Stage:</Text>
            <Tooltip label={data.stage} openDelay={300}>
              <Text size="sm" lineClamp={1}>{data.stage}</Text>
            </Tooltip>
          </Group>
        </Stack>
      )}

      {/* Badges */}
      {!isGroup && 'toolId' in data && (
        <Group gap="xs">
          <Badge variant="light" color="gray">Tool: {data.toolId}</Badge>
          <Badge variant="light" color="gray">Wafer: {data.waferId}</Badge>
          <Badge variant="light" color="gray">Lot: {data.lotId}</Badge>
          <Badge variant="light" color="gray">Part: {data.part}</Badge>
        </Group>
      )}

      {/* Description */}
      <Text size="sm" c="dimmed" lineClamp={2}>
        {data.description}
      </Text>

      {/* Subdatasets */}
      {data.sub_dataset_revision_ids.length > 0 && (
        <Group gap="xs">
          <IconFolder size={16} />
          <Text size="sm" fw={500}>
            Subdatasets: {data.sub_dataset_revision_ids.length}
          </Text>
        </Group>
      )}
    </ResourceCard>
  );
}
