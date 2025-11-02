import { Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { ThreeColumnLayout } from './ThreeColumnLayout';

interface DetailPageLayoutProps {
  header: ReactNode;
  leftPanel: ReactNode;
  mainPanel: ReactNode;
  rightPanel: ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  leftMinWidth?: string;
  rightMinWidth?: string;
  leftMaxWidth?: string;
  rightMaxWidth?: string;
}

/**
 * A complete detail page layout with header and three columns
 * Used by DatasetDetailPage and ProgramPage
 */
export function DetailPageLayout({
  header,
  leftPanel,
  mainPanel,
  rightPanel,
  leftWidth,
  rightWidth,
  leftMinWidth,
  rightMinWidth,
  leftMaxWidth,
  rightMaxWidth,
}: DetailPageLayoutProps) {
  return (
    <Stack h="100vh" w="100vw" style={{ overflow: 'hidden' }} gap={0}>
      <PageHeader>{header}</PageHeader>
      
      <ThreeColumnLayout
        leftColumn={leftPanel}
        middleColumn={mainPanel}
        rightColumn={rightPanel}
        leftWidth={leftWidth}
        rightWidth={rightWidth}
        leftMinWidth={leftMinWidth}
        rightMinWidth={rightMinWidth}
        leftMaxWidth={leftMaxWidth}
        rightMaxWidth={rightMaxWidth}
      />
    </Stack>
  );
}
