import { useState } from 'react';
import { Box, Group, ActionIcon, Text, Collapse } from '@mantine/core';
import {
  IconFolder,
  IconFolderOpen,
  IconDatabase,
  IconCode,
  IconTrophy,
  IconList,
  IconFileCode,
  IconChevronDown,
} from '@tabler/icons-react';
import type { ProgramNode } from '../../pages/ProgramPage';
import type { Resource } from '../../types/meta';
import type { Program } from '../../types/program';
import { mockCases, mockSampleCode, mockEvalCode } from '../../data/mockProgramData';

interface ProgramTreeProps {
  program: Resource<Program>;
  selectedNode: ProgramNode | null;
  onNodeSelect: (node: ProgramNode) => void;
}

interface TreeNodeProps {
  node: ProgramNode;
  level: number;
  selectedNode: ProgramNode | null;
  onNodeSelect: (node: ProgramNode) => void;
}

function TreeNode({ node, level, selectedNode, onNodeSelect }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0); // Root node starts open
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNode?.id === node.id;

  const getNodeIcon = (type: ProgramNode['type'], expanded: boolean) => {
    const iconProps = { size: 16 };
    
    switch (type) {
      case 'program':
        return expanded ? <IconFolderOpen {...iconProps} /> : <IconFolder {...iconProps} />;
      case 'open-data':
      case 'open-exam':
      case 'close-exam':
        return <IconDatabase {...iconProps} />;
      case 'case':
        return <IconFileCode {...iconProps} />;
      case 'sample-code':
      case 'eval-code':
      case 'code':
        return <IconCode {...iconProps} />;
      case 'submissions':
        return <IconList {...iconProps} />;
      case 'leaderboard':
        return <IconTrophy {...iconProps} />;
      default:
        return expanded ? <IconFolderOpen {...iconProps} /> : <IconFolder {...iconProps} />;
    }
  };

  return (
    <Box>
      <Group
        gap="xs"
        pl={level * 16}
        py={6}
        px={8}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : 'transparent',
          borderRadius: 4,
        }}
        onClick={() => {
          onNodeSelect(node);
          if (hasChildren) {
            setIsOpen(!isOpen);
          }
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
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
              size={14}
              style={{
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s',
              }}
            />
          </ActionIcon>
        )}
        {!hasChildren && <Box w={20} />}
        {getNodeIcon(node.type, isOpen)}
        <Text size="sm" style={{ flex: 1 }}>
          {node.label}
        </Text>
      </Group>
      {hasChildren && (
        <Collapse in={isOpen}>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedNode={selectedNode}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export function ProgramTree({ program, selectedNode, onNodeSelect }: ProgramTreeProps) {
  // Build tree structure from program data
  const buildTreeData = (): ProgramNode => {
    // Group cases by type
    const openDataCases = mockCases.filter(c => c.data.case_type === 'open data');
    const openExamCases = mockCases.filter(c => c.data.case_type === 'open exam');
    const closeExamCases = mockCases.filter(c => c.data.case_type === 'close exam');

    return {
      id: 'root',
      type: 'program',
      label: program.data.name,
      children: [
        {
          id: 'open-data',
          type: 'open-data',
          label: 'Open Data',
          children: openDataCases.map(c => ({
            id: c.meta.resourceId,
            type: 'case' as const,
            label: c.data.name,
            metadata: { case: c },
          })),
        },
        {
          id: 'open-exam',
          type: 'open-exam',
          label: 'Open Exam',
          children: openExamCases.map(c => ({
            id: c.meta.resourceId,
            type: 'case' as const,
            label: c.data.name,
            metadata: { case: c },
          })),
        },
        {
          id: 'close-exam',
          type: 'close-exam',
          label: 'Close Exam',
          children: closeExamCases.map(c => ({
            id: c.meta.resourceId,
            type: 'case' as const,
            label: c.data.name,
            metadata: { case: c },
          })),
        },
        {
          id: 'sample-code',
          type: 'sample-code',
          label: 'Sample Code',
          children: mockSampleCode.map(c => ({
            id: c.meta.resourceId,
            type: 'code' as const,
            label: c.data.name,
            metadata: { code: c },
          })),
        },
        {
          id: 'eval-code',
          type: 'eval-code',
          label: 'Eval Code',
          children: mockEvalCode.map(c => ({
            id: c.meta.resourceId,
            type: 'code' as const,
            label: c.data.name,
            metadata: { code: c },
          })),
        },
        {
          id: 'submissions',
          type: 'submissions',
          label: 'Submissions',
        },
        {
          id: 'leaderboard',
          type: 'leaderboard',
          label: 'Leaderboard',
        },
      ],
    };
  };

  const treeData = buildTreeData();

  return (
    <Box>
      <TreeNode
        node={treeData}
        level={0}
        selectedNode={selectedNode}
        onNodeSelect={onNodeSelect}
      />
    </Box>
  );
}
