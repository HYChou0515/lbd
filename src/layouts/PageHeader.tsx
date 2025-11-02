import { Box } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  children: ReactNode;
}

/**
 * A reusable page header component that sits above the three-column layout
 */
export function PageHeader({ children }: PageHeaderProps) {
  return (
    <Box 
      p="md" 
      style={{ 
        borderBottom: '1px solid var(--mantine-color-gray-3)', 
        flexShrink: 0 
      }}
    >
      {children}
    </Box>
  );
}
