import { Card, Badge, Group, Text, Button, Stack, Tooltip, Box } from '@mantine/core';
import { IconEye, IconDownload, IconFolder, IconUser, IconClock } from '@tabler/icons-react';
import type { DatasetDataMeta } from '../types/dataset';
import { DatasetTypeBadge, downloadDataset } from '../utils/datasetUtils';
import { TimeDisplay } from './TimeDisplay';

interface DatasetCardProps {
  datasetMeta: DatasetDataMeta;
  onViewDetails: (id: string) => void;
}

export function DatasetCard({ datasetMeta, onViewDetails }: DatasetCardProps) {
  const { meta, data } = datasetMeta;
  
  // 判斷是否為 Group 類型
  const isGroup = data.type === 'Group';

  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Stack gap="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Text fw={600} size="lg" style={{ flex: 1 }}>
            📦 {data.name}
          </Text>
          <DatasetTypeBadge type={data.type} variant="filled" size="lg" />
        </Group>

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

        {/* Spacer to push footer to bottom */}
        <Box style={{ flex: 1 }} />

        {/* Footer */}
        <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Stack gap={4}>
            <Group gap="xs">
              <IconUser size={14} />
              <Text size="xs" c="dimmed">{meta.creator}</Text>
            </Group>
            <Group gap="xs">
              <IconClock size={14} />
              <TimeDisplay time={meta.createdTime} size="xs" color="dimmed" />
            </Group>
          </Stack>

          <Group gap="xs">
            <Button 
              leftSection={<IconEye size={16} />}
              variant="filled"
              size="sm"
              onClick={() => onViewDetails(meta.resourceId)}
            >
              View
            </Button>
            <Button 
              leftSection={<IconDownload size={16} />}
              variant="light"
              size="sm"
              onClick={() => downloadDataset(datasetMeta)}
            >
              Download
            </Button>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
