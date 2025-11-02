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
  Divider,
  Card,
  Collapse,
} from '@mantine/core';
import { 
  IconTrophy, 
  IconEye, 
  IconDownload, 
  IconArrowLeft, 
  IconChevronRight,
  IconFolder,
  IconFolderOpen,
  IconFile,
  IconChevronDown,
} from '@tabler/icons-react';
import { ProgramTree } from '../components/program/ProgramTree';
import { DetailPageLayout } from '../layouts/DetailPageLayout';
import type { Resource } from '../types/meta';
import type { Program } from '../types/program';
import { ProgramContent } from '../components/program/ProgramContent';
import { ProgramMetaInfo } from '../components/program/ProgramMetaInfo';
import type { FileNode } from '../data/mockFileStructure';
import { mockProgramFileStructure } from '../data/mockProgramFileStructure';

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

// File tree node component
interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onSelectFile: (node: FileNode) => void;
  selectedFile: string | null;
}

function FileTreeNode({ node, level, onSelectFile, selectedFile }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.name === selectedFile;

  return (
    <Box>
      <Group
        gap="xs"
        pl={level * 16}
        py={4}
        px={6}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : 'transparent',
          borderRadius: 4,
        }}
        onClick={() => {
          if (node.type === 'file') {
            onSelectFile(node);
          } else {
            setIsOpen(!isOpen);
          }
        }}
      >
        {hasChildren && (
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <IconChevronDown
              size={12}
              style={{
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
              }}
            />
          </ActionIcon>
        )}
        {!hasChildren && <Box w={16} />}
        {node.type === 'folder' ? (
          isOpen ? <IconFolderOpen size={14} color="var(--mantine-color-orange-6)" /> : <IconFolder size={14} color="var(--mantine-color-orange-6)" />
        ) : (
          <IconFile size={14} color="var(--mantine-color-blue-6)" />
        )}
        <Text size="xs" ff="monospace" style={{ flex: 1 }}>
          {node.name}
        </Text>
      </Group>
      {hasChildren && (
        <Collapse in={isOpen}>
          {node.children!.map((child, idx) => (
            <FileTreeNode
              key={idx}
              node={child}
              level={level + 1}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export function ProgramPage({ program }: ProgramPageProps) {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<ProgramNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

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
          {/* Program Structure */}
          <Box>
            <Title order={5} mb="md">Program Structure</Title>
            <ProgramTree
              program={program}
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
            />
          </Box>

          <Divider my="xl" />

          {/* File Structure */}
          <Box>
            <Title order={5} mb="md">File Structure</Title>
            <Card withBorder>
              <FileTreeNode
                node={mockProgramFileStructure}
                level={0}
                onSelectFile={setSelectedFile}
                selectedFile={selectedFile?.name || null}
              />
            </Card>
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
