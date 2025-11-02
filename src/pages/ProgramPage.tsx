import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Title,
  Text,
  Box,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
  Button,
  Stack,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { IconTrophy, IconEye, IconDownload, IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import { ProgramTree } from '../components/program/ProgramTree';
import { ProgramContent } from '../components/program/ProgramContent';
import { ProgramMetaInfo } from '../components/program/ProgramMetaInfo';
import { DetailPageLayout } from '../layouts/DetailPageLayout';
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
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<ProgramNode | null>(null);

  const onBack = () => {
    navigate({ to: '/programs' });
  };

  const breadcrumbItems = [
    <Anchor key="home" href="/" onClick={(e) => { e.preventDefault(); navigate({ to: '/' }); }}>
      Home
    </Anchor>,
    <Anchor key="programs" href="/programs" onClick={(e) => { e.preventDefault(); navigate({ to: '/programs' }); }}>
      Programs
    </Anchor>,
    <Text key="current">{program.data.name}</Text>,
  ];

  return (
    <DetailPageLayout
      header={
        <>
          <Group justify="space-between" mb="sm" wrap="nowrap">
            <Box style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <Breadcrumbs separator={<IconChevronRight size={14} />}>
                {breadcrumbItems}
              </Breadcrumbs>
            </Box>
            <Button 
              leftSection={<IconArrowLeft size={16} />}
              variant="subtle"
              onClick={onBack}
              style={{ flexShrink: 0 }}
            >
              Back
            </Button>
          </Group>
          
          <Group justify="space-between" wrap="nowrap">
            <Group style={{ flex: 1, minWidth: 0 }} wrap="nowrap">
              <IconTrophy size={28} />
              <Title order={3} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {program.data.name}
              </Title>
              <Badge 
                color="green" 
                variant="filled"
                size="lg"
                style={{ flexShrink: 0 }}
              >
                Active
              </Badge>
            </Group>
            <Group gap="xs" style={{ flexShrink: 0 }}>
              <Tooltip label="Preview">
                <ActionIcon variant="light" size="lg">
                  <IconEye size={20} />
                </ActionIcon>
              </Tooltip>
              <Button leftSection={<IconDownload size={16} />}>
                Download
              </Button>
            </Group>
          </Group>
        </>
      }
      leftPanel={
        <Stack gap="lg">
          {/* Program Header */}
          <Box>
            <Group gap="xs" mb="xs">
              <Title order={5}>{program.data.name}</Title>
              <Badge size="sm" color="green" variant="light">Active</Badge>
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
      }
      mainPanel={
        <ProgramContent
          program={program}
          selectedNode={selectedNode}
        />
      }
      rightPanel={
        <ProgramMetaInfo
          program={program}
          selectedNode={selectedNode}
        />
      }
    />
  );
}
