import { Card, Group, Text, Button, Stack, Box } from '@mantine/core';
import { IconEye, IconDownload, IconUser, IconClock } from '@tabler/icons-react';
import { TimeDisplay } from './TimeDisplay';
import type { ReactNode } from 'react';

interface ResourceCardProps {
  // Header
  title: string;
  titlePrefix?: string; // e.g., "📦" or "🏆"
  badge: ReactNode;
  
  // Content (optional middle sections)
  children?: ReactNode;
  
  // Footer
  creator: string;
  createdTime: string | Date;
  
  // Actions
  onView: () => void;
  onDownload: () => void;
}

/**
 * A reusable card component for displaying resources (Dataset, Program, etc.)
 * Provides consistent layout with header, content area, and footer with actions
 */
export function ResourceCard({
  title,
  titlePrefix,
  badge,
  children,
  creator,
  createdTime,
  onView,
  onDownload,
}: ResourceCardProps) {
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
            {titlePrefix && `${titlePrefix} `}{title}
          </Text>
          {badge}
        </Group>

        {/* Content (provided by children) */}
        {children}

        {/* Spacer to push footer to bottom */}
        <Box style={{ flex: 1 }} />

        {/* Footer */}
        <Group justify="space-between" mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Stack gap={4}>
            <Group gap="xs">
              <IconUser size={14} />
              <Text size="xs" c="dimmed">{creator}</Text>
            </Group>
            <Group gap="xs">
              <IconClock size={14} />
              <TimeDisplay time={createdTime} size="xs" color="dimmed" />
            </Group>
          </Stack>

          <Group gap="xs">
            <Button 
              leftSection={<IconEye size={16} />}
              variant="filled"
              size="sm"
              onClick={onView}
            >
              View
            </Button>
            <Button 
              leftSection={<IconDownload size={16} />}
              variant="light"
              size="sm"
              onClick={onDownload}
            >
              Download
            </Button>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
