import { useState } from 'react';
import {
  AppShell,
  Stack,
  Title,
  Text,
  ScrollArea,
  Box,
  Group,
  Badge,
} from '@mantine/core';
import { ProgramTree } from '../components/program/ProgramTree';
import { ProgramContent } from '../components/program/ProgramContent';
import { ProgramMetaInfo } from '../components/program/ProgramMetaInfo';
import type { Resource } from '../types/meta';
import type { Program } from '../types/program';

export type ProgramNodeType = 
  | 'program'
  | 'open-data'
  | 'open-exam'
  | 'close-exam'
  | 'case'
  | 'sample-code'
  | 'eval-code'
  | 'code'
  | 'submissions'
  | 'leaderboard';

export type ProgramNode = {
  id: string;
  type: ProgramNodeType;
  label: string;
  children?: ProgramNode[];
  metadata?: Record<string, any>;
};

interface ProgramPageProps {
  program: Resource<Program>;
}

export function ProgramPage({ program }: ProgramPageProps) {
  const [selectedNode, setSelectedNode] = useState<ProgramNode | null>(null);

  return (
    <AppShell
      padding={0}
      navbar={{ width: 300, breakpoint: 'sm' }}
      aside={{ width: 300, breakpoint: 'md' }}
    >
      {/* Left Sidebar - Navigation Tree */}
      <AppShell.Navbar p="md">
        <ScrollArea>
          <Stack gap="lg">
            {/* Program Header */}
            <Box>
              <Group gap="xs" mb="xs">
                <Title order={4}>{program.data.name}</Title>
                <Badge size="sm" variant="light">Active</Badge>
              </Group>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {program.data.description}
              </Text>
            </Box>

            {/* Program Tree */}
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">STRUCTURE</Text>
              <ProgramTree
                program={program}
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
              />
            </Box>

            {/* ZIP Structure Preview */}
            <Box>
              <Text size="xs" fw={600} c="dimmed" mb="xs">FOLDER STRUCTURE</Text>
              <Box
                p="xs"
                style={{
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  borderRadius: 'var(--mantine-radius-sm)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                <Text size="xs">📁 program-{program.meta.resourceId}</Text>
                <Text size="xs" pl="md">📁 data/</Text>
                <Text size="xs" pl="xl">📄 cases/</Text>
                <Text size="xs" pl="md">📁 algos/</Text>
                <Text size="xs" pl="xl">📄 sample/</Text>
                <Text size="xs" pl="xl">📄 eval/</Text>
                <Text size="xs" pl="md">📁 submissions/</Text>
                <Text size="xs" pl="md">📄 README.md</Text>
              </Box>
            </Box>
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main Content Area */}
      <AppShell.Main>
        <ProgramContent
          program={program}
          selectedNode={selectedNode}
        />
      </AppShell.Main>

      {/* Right Sidebar - Meta Info */}
      <AppShell.Aside p="md">
        <ScrollArea>
          <ProgramMetaInfo
            program={program}
            selectedNode={selectedNode}
          />
        </ScrollArea>
      </AppShell.Aside>
    </AppShell>
  );
}
