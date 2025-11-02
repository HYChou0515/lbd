import { Badge, Group, Text } from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';
import type { Resource } from '../types/meta';
import type { Program } from '../types/program';
import { ResourceCard } from './ResourceCard';

interface ProgramCardProps {
  program: Resource<Program>;
  onViewDetails: (id: string) => void;
}

export function ProgramCard({ program, onViewDetails }: ProgramCardProps) {
  const { meta, data } = program;
  
  // TODO: Add download functionality later
  const handleDownload = () => {
    console.log('Download program:', meta.resourceId);
    // Will implement program download later
  };

  return (
    <ResourceCard
      titlePrefix="🏆"
      title={data.name}
      badge={
        <Badge color="green" variant="filled" size="lg">
          Active
        </Badge>
      }
      creator={meta.creator}
      createdTime={meta.createdTime}
      onView={() => onViewDetails(meta.resourceId)}
      onDownload={handleDownload}
    >
      {/* Description */}
      <Text size="sm" c="dimmed" lineClamp={3}>
        {data.description}
      </Text>

      {/* Stats */}
      <Group gap="md">
        <Group gap="xs">
          <IconDatabase size={16} />
          <Text size="sm" fw={500}>
            {data.case_ids.length} cases
          </Text>
        </Group>
      </Group>
    </ResourceCard>
  );
}
