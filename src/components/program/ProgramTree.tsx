import { useState } from 'react';
import { Tree, type RenderTreeNodePayload } from '@mantine/core';
import {
  IconFolder,
  IconFolderOpen,
  IconDatabase,
  IconCode,
  IconTrophy,
  IconList,
  IconFileCode,
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

export function ProgramTree({ program, selectedNode, onNodeSelect }: ProgramTreeProps) {
  const [expandedNodes] = useState<string[]>(['root']);

  // Build tree structure from program data
  const buildTreeData = (): ProgramNode[] => {
    // Group cases by type
    const openDataCases = mockCases.filter(c => c.data.case_type === 'open data');
    const openExamCases = mockCases.filter(c => c.data.case_type === 'open exam');
    const closeExamCases = mockCases.filter(c => c.data.case_type === 'close exam');

    return [
      {
        id: 'root',
        type: 'program',
        label: program.data.name,
        children: [
          {
            id: 'open-data',
            type: 'open-data',
            label: `Open Data (${openDataCases.length})`,
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
            label: `Open Exam (${openExamCases.length})`,
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
            label: `Close Exam (${closeExamCases.length})`,
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
            label: `Sample Code (${mockSampleCode.length})`,
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
            label: `Eval Code (${mockEvalCode.length})`,
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
            label: 'My Submissions',
          },
          {
            id: 'leaderboard',
            type: 'leaderboard',
            label: 'Leaderboard',
          },
        ],
      },
    ];
  };

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

  const renderNode = (node: ProgramNode, _payload: RenderTreeNodePayload) => {
    const isExpanded = expandedNodes.includes(node.id);
    const isSelected = selectedNode?.id === node.id;

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onNodeSelect(node);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : 'transparent',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {getNodeIcon(node.type, isExpanded)}
        <span>{node.label}</span>
      </div>
    );
  };

  const treeData = buildTreeData();

  return (
    <Tree
      data={treeData as any}
      renderNode={renderNode as any}
      levelOffset={16}
    />
  );
}
