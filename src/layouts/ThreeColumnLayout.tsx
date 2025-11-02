import { Box, ScrollArea } from '@mantine/core';
import type { ReactNode } from 'react';

interface ThreeColumnLayoutProps {
  leftColumn: ReactNode;
  middleColumn: ReactNode;
  rightColumn: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  leftMinWidth?: string;
  rightMinWidth?: string;
  leftMaxWidth?: string;
  rightMaxWidth?: string;
}

/**
 * A reusable three-column layout component
 * - Left column: Typically for navigation tree/sidebar
 * - Middle column: Main content area
 * - Right column: Metadata/details sidebar
 */
export function ThreeColumnLayout({
  leftColumn,
  middleColumn,
  rightColumn,
  leftWidth = '20%',
  rightWidth = '20%',
  leftMinWidth = '250px',
  rightMinWidth = '250px',
  leftMaxWidth = '400px',
  rightMaxWidth = '400px',
}: ThreeColumnLayoutProps) {
  return (
    <Box w="100vw" pl="10px" pr="10px" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left Column */}
      <Box 
         p="10px"
        style={{ 
          width: leftWidth,
          minWidth: leftMinWidth,
          maxWidth: leftMaxWidth,
          borderRight: '1px solid var(--mantine-color-gray-3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ScrollArea style={{ flex: 1 }}>
          {leftColumn}
        </ScrollArea>
      </Box>

      {/* Middle Column */}
      <Box 
        style={{ 
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {middleColumn}
      </Box>

      {/* Right Column */}
      <Box 
         p="10px"
        style={{ 
          width: rightWidth,
          minWidth: rightMinWidth,
          maxWidth: rightMaxWidth,
          borderLeft: '1px solid var(--mantine-color-gray-3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ScrollArea style={{ flex: 1 }}>
          {rightColumn}
        </ScrollArea>
      </Box>
    </Box>
  );
}
