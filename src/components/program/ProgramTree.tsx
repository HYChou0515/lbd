import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
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
  IconFileText,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react';
import classes from './ProgramTree.module.css';
import type { ProgramNode } from '../../pages/ProgramPage';
import type { Resource } from '../../types/meta';
import type { Program } from '../../types/program';
import { mockCases, mockSampleCode, mockEvalCode, mockSubmissions, mockAlgoCode } from '../../data/mockProgramData';
import { formatAbsoluteTime } from '../../utils/timeUtils';

interface ProgramTreeProps {
  program: Resource<Program>;
  selectedNode: ProgramNode | null;
  onNodeSelect: (node: ProgramNode) => void;
  programId: string;
  submissionsPage: number;
  onSubmissionsPageChange: (page: number) => void;
}

interface TreeNodeProps {
  node: ProgramNode;
  level: number;
  selectedNode: ProgramNode | null;
  onNodeSelect: (node: ProgramNode) => void;
  programId: string;
  submissionsPage?: number;
  totalPages?: number;
  onSubmissionsPageChange?: (page: number) => void;
}

function TreeNode({ node, level, selectedNode, onNodeSelect, programId, submissionsPage, totalPages, onSubmissionsPageChange }: TreeNodeProps) {
  const navigate = useNavigate();
  
  // Determine initial open state
  const shouldBeOpen = () => {
    // Root node always starts open
    if (level === 0) return true;
    
    // If a submission is selected and this is the submissions node, open it
    if (node.type === 'submissions' && selectedNode?.type === 'submission') {
      return true;
    }
    
    return false;
  };
  
  const [isOpen, setIsOpen] = useState(shouldBeOpen());
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNode?.id === node.id;
  
  // Update open state when selectedNode changes
  useEffect(() => {
    // If a submission is selected and this is the submissions node, open it
    if (node.type === 'submissions' && selectedNode?.type === 'submission') {
      setIsOpen(true);
    }
  }, [selectedNode, node.type]);
  
  // Special rendering for pagination node
  if (node.type === 'pagination' && submissionsPage !== undefined && totalPages !== undefined && onSubmissionsPageChange) {
    return (
      <Box pl={level * 16 + 32} py={4}>
        <Group className={classes.pagination} style={{justifyContent: "space-between"}} gap="0.25rem" wrap="nowrap">
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={() => onSubmissionsPageChange(0)}
            disabled={submissionsPage === 0}
          >
            <IconChevronsLeft size={14} />
          </ActionIcon>
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={() => onSubmissionsPageChange(Math.max(0, submissionsPage - 1))}
            disabled={submissionsPage === 0}
          >
            <IconChevronLeft size={14} />
          </ActionIcon>
          <Text size="xs" c="dimmed" style={{whiteSpace: 'nowrap'}}>
            Page {submissionsPage + 1} / {totalPages}
          </Text>
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={() => onSubmissionsPageChange(Math.min(totalPages - 1, submissionsPage + 1))}
            disabled={submissionsPage >= totalPages - 1}
          >
            <IconChevronRight size={14} />
          </ActionIcon>
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={() => onSubmissionsPageChange(totalPages - 1)}
            disabled={submissionsPage >= totalPages - 1}
          >
            <IconChevronsRight size={14} />
          </ActionIcon>
        </Group>
      </Box>
    );
  }

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
      case 'submission':
        return <IconFileText {...iconProps} />;
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
        onClick={(e) => {
          // Select the node first
          onNodeSelect(node);
          
          // If clicking submissions node, navigate to submissions URL
          if (node.type === 'submissions') {
            navigate({ to: '/programs/$programId/submissions', params: { programId } });
          }
          // If clicking a submission child node, navigate to that submission's detail
          else if (node.type === 'submission') {
            e.stopPropagation(); // Prevent parent from being selected
            navigate({ 
              to: '/programs/$programId/submissions/$submissionId', 
              params: { programId, submissionId: node.id } 
            });
          }
          
          // Toggle expansion for nodes with children
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
              programId={programId}
              submissionsPage={submissionsPage}
              totalPages={totalPages}
              onSubmissionsPageChange={onSubmissionsPageChange}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export function ProgramTree({ program, selectedNode, onNodeSelect, programId, submissionsPage, onSubmissionsPageChange }: ProgramTreeProps) {
  const SUBMISSIONS_PER_PAGE = 5;
  
  // Calculate submissions for current user
  const CURRENT_USER = 'user1';
  const allSubmissions = mockSubmissions
    .filter(s => s.data.submitter === CURRENT_USER)
    .sort((a, b) => new Date(b.data.submission_time).getTime() - new Date(a.data.submission_time).getTime());
  
  const totalPages = Math.ceil(allSubmissions.length / SUBMISSIONS_PER_PAGE);
  
  // Build tree structure from program data
  const buildTreeData = (): ProgramNode => {
    // Group cases by type
    const openDataCases = mockCases.filter(c => c.data.case_type === 'open data');
    const openExamCases = mockCases.filter(c => c.data.case_type === 'open exam');
    const closeExamCases = mockCases.filter(c => c.data.case_type === 'close exam');

    // Calculate pagination
    const startIdx = submissionsPage * SUBMISSIONS_PER_PAGE;
    const endIdx = startIdx + SUBMISSIONS_PER_PAGE;
    const pagedSubmissions = allSubmissions.slice(startIdx, endIdx);
    
    // Build submission children nodes
    const submissionChildren: ProgramNode[] = pagedSubmissions.map(s => {
      const algo = mockAlgoCode.find(a => a.meta.resourceId === s.data.algo_id);
      const algoName = algo?.data.name || 'Unknown';
      const submissionTime = formatAbsoluteTime(s.data.submission_time);
      
      return {
        id: s.meta.resourceId,
        type: 'submission' as const,
        label: `${algoName} (${submissionTime})`,
        metadata: { 
          submission: s,
          pageIndex: allSubmissions.indexOf(s),
          page: Math.floor(allSubmissions.indexOf(s) / SUBMISSIONS_PER_PAGE)
        },
      };
    });
    
    // Add pagination control node if there are multiple pages
    if (totalPages > 1) {
      submissionChildren.push({
        id: 'pagination-control',
        type: 'pagination' as const,
        label: `Page ${submissionsPage + 1} / ${totalPages}`,
        metadata: {
          currentPage: submissionsPage,
          totalPages,
        },
      });
    }

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
          children: submissionChildren,
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
        programId={programId}
        submissionsPage={submissionsPage}
        totalPages={totalPages}
        onSubmissionsPageChange={onSubmissionsPageChange}
      />
    </Box>
  );
}
