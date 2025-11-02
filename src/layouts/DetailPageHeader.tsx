import { Box, Group, Title, Badge, Button, Breadcrumbs, Anchor } from '@mantine/core';
import { IconChevronRight, IconArrowLeft } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface BreadcrumbItem {
  title: string;
  href?: string;
  onClick?: () => void;
}

interface DetailPageHeaderProps {
  title: string;
  titleIcon?: ReactNode;
  badge?: {
    label: string;
    color: string;
  };
  breadcrumbs: BreadcrumbItem[];
  onBack?: () => void;
  actions?: ReactNode;
}

/**
 * A reusable header component for detail pages
 * - Displays breadcrumb navigation
 * - Shows page title with optional icon and badge
 * - Provides action buttons area
 * - Includes back button
 */
export function DetailPageHeader({
  title,
  titleIcon,
  badge,
  breadcrumbs,
  onBack,
  actions,
}: DetailPageHeaderProps) {
  return (
    <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Breadcrumbs separator={<IconChevronRight size={14} />}>
            {breadcrumbs.map((item, index) => (
              <Anchor
                key={index}
                href={item.href || '#'}
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick?.();
                }}
              >
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>
        </Box>
        {onBack && (
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={onBack}
            style={{ flexShrink: 0 }}
          >
            Back
          </Button>
        )}
      </Group>
      
      <Group justify="space-between" wrap="nowrap">
        <Group style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
          {titleIcon && <Box style={{ flexShrink: 0 }}>{titleIcon}</Box>}
          <Title 
            order={3} 
            style={{ 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}
          >
            {title}
          </Title>
          {badge && (
            <Badge 
              color={badge.color} 
              variant="filled"
              size="lg"
              style={{ flexShrink: 0 }}
            >
              {badge.label}
            </Badge>
          )}
        </Group>
        {actions && (
          <Group gap="xs" style={{ flexShrink: 0 }}>
            {actions}
          </Group>
        )}
      </Group>
    </Box>
  );
}
