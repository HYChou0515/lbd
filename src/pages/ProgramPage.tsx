import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
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
  Menu,
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
  IconDots,
} from '@tabler/icons-react';
import { ProgramTree } from '../components/program/ProgramTree';
import { DetailPageLayout } from '../layouts/DetailPageLayout';
import type { Resource } from '../types/meta';
import type { Program } from '../types/program';
import { ProgramContent } from '../components/program/ProgramContent';
import { ProgramMetaInfo } from '../components/program/ProgramMetaInfo';
import type { FileNode } from '../data/mockFileStructure';
import { mockProgramFileStructure } from '../data/mockProgramFileStructure';
import { mockExecutionResults, mockCases, mockSubmissions, mockAlgoCode } from '../data/mockProgramData';
import { formatAbsoluteTime } from '../utils/timeUtils';

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
  | 'submission'
  | 'leaderboard'
  | 'pagination';

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
  selectedFile: FileNode | null;
}

function FileTreeNode({ node, level, onSelectFile, selectedFile }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;
  // Compare by reference - node object should be the same instance
  const isSelected = node === selectedFile;

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
  const location = useLocation();
  const [selectedNode, setSelectedNode] = useState<ProgramNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [submissionsPage, setSubmissionsPage] = useState(0);

  // Set selectedNode and selectedSubmissionId based on URL path
  useEffect(() => {
    const pathname = location.pathname;
    const pathParts = pathname.split('/');
    
    // Clear selected file when URL changes
    setSelectedFile(null);
    
    if (pathname.includes('/submissions')) {
      // Check if there's a submissionId in the URL
      const submissionsIndex = pathParts.indexOf('submissions');
      if (submissionsIndex !== -1 && pathParts[submissionsIndex + 1]) {
        const submissionId = pathParts[submissionsIndex + 1];
        setSelectedSubmissionId(submissionId);
        
        // Find the submission and set it as selected node
        const submission = mockSubmissions.find(s => s.meta.resourceId === submissionId);
        if (submission) {
          const algo = mockAlgoCode.find(a => a.meta.resourceId === submission.data.algo_id);
          const algoName = algo?.data.name || 'Unknown';
          const submissionTime = formatAbsoluteTime(submission.data.submission_time);
          
          setSelectedNode({
            id: submissionId,
            type: 'submission',
            label: `${algoName} (${submissionTime})`,
            metadata: { submission },
          });
        }
        
        // Find which page this submission is on and navigate to it
        const CURRENT_USER = 'user1';
        const SUBMISSIONS_PER_PAGE = 5;
        const allSubmissions = mockSubmissions
          .filter(s => s.data.submitter === CURRENT_USER)
          .sort((a, b) => new Date(b.data.submission_time).getTime() - new Date(a.data.submission_time).getTime());
        
        const submissionIndex = allSubmissions.findIndex(s => s.meta.resourceId === submissionId);
        if (submissionIndex !== -1) {
          const targetPage = Math.floor(submissionIndex / SUBMISSIONS_PER_PAGE);
          setSubmissionsPage(targetPage);
        }
      } else {
        // No specific submission selected, select submissions node
        setSelectedNode({
          id: 'submissions',
          type: 'submissions',
          label: 'Submissions',
        });
        setSelectedSubmissionId(null);
      }
    }
  }, [location.pathname]);

  // Generate submissions list for left panel when in submissions view
  const recentSubmissionsStructure = useMemo<FileNode>(() => {
    // Get user's submissions sorted by time (newest first)
    const CURRENT_USER = 'user1';
    const userSubmissions = mockSubmissions
      .filter(s => s.data.submitter === CURRENT_USER)
      .sort((a, b) => new Date(b.data.submission_time).getTime() - new Date(a.data.submission_time).getTime())
      .slice(0, 10); // 最多顯示 10 筆

    const children: FileNode[] = userSubmissions.map(submission => {
      const algo = mockAlgoCode.find(a => a.meta.resourceId === submission.data.algo_id);
      const algoName = algo?.data.name || 'Unknown';
      const submissionTime = formatAbsoluteTime(submission.data.submission_time);
      
      // Get execution results for this submission
      const execResults = mockExecutionResults.filter(
        r => r.submission_id === submission.meta.resourceId
      );

      // Build case folders with logs and artifacts
      const caseChildren: FileNode[] = [];
      execResults.forEach(execResult => {
        const caseInfo = mockCases.find(c => c.meta.resourceId === execResult.case_id);
        if (!caseInfo) return;

        const caseFolderChildren: FileNode[] = [];

        // Add logs file
        if (execResult.log_url) {
          caseFolderChildren.push({
            name: 'logs',
            type: 'file',
            content: `# Execution Logs for ${caseInfo.data.name}

**Submission ID:** ${submission.meta.resourceId}
**Algorithm:** ${algoName}
**Case:** ${caseInfo.data.name} (${caseInfo.data.case_type})
**Status:** ${execResult.status}
**Wall Time:** ${execResult.wall_time}s
**CPU Time:** ${execResult.cpu_time}s
**Memory:** ${execResult.memory} MB

## Execution Output

\`\`\`
[${new Date(submission.data.submission_time).toISOString()}] Starting execution for ${caseInfo.data.name}
[${new Date(submission.data.submission_time).toISOString()}] Loading dataset from ${caseInfo.data.dataset_revision_id}
[${new Date(submission.data.submission_time).toISOString()}] Initializing algorithm: ${algoName}
[${new Date(submission.data.submission_time).toISOString()}] Processing data...
[${new Date(submission.data.submission_time).toISOString()}] Algorithm completed with status: ${execResult.status}
[${new Date(submission.data.submission_time).toISOString()}] Wall time: ${execResult.wall_time}s, CPU time: ${execResult.cpu_time}s
[${new Date(submission.data.submission_time).toISOString()}] Memory usage: ${execResult.memory} MB
[${new Date(submission.data.submission_time).toISOString()}] Execution finished
\`\`\`

## Log File
Full logs available at: ${execResult.log_url}

---
*Submission: ${submission.meta.resourceId} | Created: ${submission.meta.createdTime}*
`,
          });
        }

        // Add artifacts folder if exists
        if (execResult.artifact_url) {
          caseFolderChildren.push({
            name: 'artifacts',
            type: 'folder',
            children: [
              {
                name: 'result.zip',
                type: 'file',
                content: `# Artifact for ${caseInfo.data.name}

**Download URL:** ${execResult.artifact_url}

This archive contains the execution output and results.
`,
              },
            ],
          });
        }

        // Add case folder
        caseChildren.push({
          name: caseInfo.data.name,
          type: 'folder',
          children: caseFolderChildren,
        });
      });

      return {
        name: `${algoName} (${submissionTime})`,
        type: 'folder',
        children: caseChildren,
      };
    });

    return {
      name: 'Recent Submissions',
      type: 'folder',
      children,
    };
  }, []);

  // Generate file structure for selected submission
  const submissionFileStructure = useMemo<FileNode | null>(() => {
    if (!selectedSubmissionId) return null;

    // Get the submission info
    const submission = mockSubmissions.find(s => s.meta.resourceId === selectedSubmissionId);
    if (!submission) return null;

    // Get algo info
    const algo = mockAlgoCode.find(a => a.meta.resourceId === submission.data.algo_id);
    const algoName = algo?.data.name || 'Unknown';
    const submissionTime = formatAbsoluteTime(submission.data.submission_time);

    // Get execution results for this submission
    const execResults = mockExecutionResults.filter(
      r => r.submission_id === selectedSubmissionId
    );

    if (execResults.length === 0) return null;

    // Build file structure
    const children: FileNode[] = [];

    execResults.forEach(execResult => {
      const caseInfo = mockCases.find(c => c.meta.resourceId === execResult.case_id);
      if (!caseInfo) return;

      // Create case folder
      const caseChildren: FileNode[] = [];

      // Add logs file
      if (execResult.log_url) {
        caseChildren.push({
          name: 'logs',
          type: 'file',
          content: `# Execution Logs for ${caseInfo.data.name}

**Submission ID:** ${submission.meta.resourceId}
**Algorithm:** ${algoName}
**Case:** ${caseInfo.data.name} (${caseInfo.data.case_type})
**Status:** ${execResult.status}
**Wall Time:** ${execResult.wall_time}s
**CPU Time:** ${execResult.cpu_time}s
**Memory:** ${execResult.memory} MB

## Execution Output

\`\`\`
[${new Date(submission.data.submission_time).toISOString()}] Starting execution for ${caseInfo.data.name}
[${new Date(submission.data.submission_time).toISOString()}] Loading dataset from ${caseInfo.data.dataset_revision_id}
[${new Date(submission.data.submission_time).toISOString()}] Initializing algorithm: ${algoName}
[${new Date(submission.data.submission_time).toISOString()}] Processing data...
[${new Date(submission.data.submission_time).toISOString()}] Algorithm completed with status: ${execResult.status}
[${new Date(submission.data.submission_time).toISOString()}] Wall time: ${execResult.wall_time}s, CPU time: ${execResult.cpu_time}s
[${new Date(submission.data.submission_time).toISOString()}] Memory usage: ${execResult.memory} MB
[${new Date(submission.data.submission_time).toISOString()}] Execution finished
\`\`\`

## Log File
Full logs available at: ${execResult.log_url}

---
*Submission: ${submission.meta.resourceId} | Created: ${submission.meta.createdTime}*
`,
        });
      }

      // Add artifacts folder if exists
      if (execResult.artifact_url) {
        caseChildren.push({
          name: 'artifacts',
          type: 'folder',
          children: [
            {
              name: 'result.zip',
              type: 'file',
              content: `# Artifact for ${caseInfo.data.name}

**Artifact URL:** ${execResult.artifact_url}

This file contains the output artifacts from the execution.

Click the link above to download the artifact.
`,
            }
          ],
        });
      }

      children.push({
        name: caseInfo.data.name,
        type: 'folder',
        children: caseChildren,
      });
    });

    return {
      name: `${algoName} (${submissionTime})`,
      type: 'folder',
      children,
    };
  }, [selectedSubmissionId]);

  const onBack = () => {
    navigate({ to: '/programs' });
  };

  // Dynamic breadcrumb based on selected node
  const breadcrumbItems = [
    <Anchor key="home" href="/" onClick={(e) => { e.preventDefault(); navigate({ to: '/' }); }}>
      Home
    </Anchor>,
    <Anchor key="programs" href="/programs" onClick={(e) => { e.preventDefault(); navigate({ to: '/programs' }); }}>
      Programs
    </Anchor>,
    <Anchor 
      key="current" 
      href={`/programs/${program.meta.resourceId}`}
      onClick={(e) => { 
        e.preventDefault(); 
        navigate({ to: '/programs/$programId', params: { programId: program.meta.resourceId } });
        setSelectedNode(null);
        setSelectedSubmissionId(null);
        setSelectedFile(null);
      }}
    >
      {program.data.name}
    </Anchor>,
  ];

  // Add additional breadcrumb items based on selected node
  if (selectedNode?.type === 'submissions') {
    // Submissions breadcrumb with dropdown menu
    breadcrumbItems.push(
      <Group key="submissions-group" gap={4}>
        <Anchor 
          href={`/programs/${program.meta.resourceId}/submissions`}
          onClick={(e) => { 
            e.preventDefault(); 
            navigate({ to: '/programs/$programId/submissions', params: { programId: program.meta.resourceId } });
            setSelectedSubmissionId(null);
            setSelectedFile(null);
          }}
        >
          Submissions
        </Anchor>
        <Menu position="bottom-start" shadow="md">
          <Menu.Target>
            <ActionIcon size="xs" variant="subtle" color="gray">
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Switch Section</Menu.Label>
            <Menu.Item onClick={() => {
              setSelectedNode({ id: 'open-data', type: 'open-data', label: 'Open Data' });
              setSelectedSubmissionId(null);
              setSelectedFile(null);
            }}>
              Open Data
            </Menu.Item>
            <Menu.Item onClick={() => {
              setSelectedNode({ id: 'open-exam', type: 'open-exam', label: 'Open Exam' });
              setSelectedSubmissionId(null);
              setSelectedFile(null);
            }}>
              Open Exam
            </Menu.Item>
            <Menu.Item onClick={() => {
              setSelectedNode({ id: 'close-exam', type: 'close-exam', label: 'Close Exam' });
              setSelectedSubmissionId(null);
              setSelectedFile(null);
            }}>
              Close Exam
            </Menu.Item>
            <Menu.Item onClick={() => {
              setSelectedNode({ id: 'sample-code', type: 'sample-code', label: 'Sample Code' });
              setSelectedSubmissionId(null);
              setSelectedFile(null);
            }}>
              Sample Code
            </Menu.Item>
            <Menu.Item onClick={() => {
              setSelectedNode({ id: 'eval-code', type: 'eval-code', label: 'Eval Code' });
              setSelectedSubmissionId(null);
              setSelectedFile(null);
            }}>
              Eval Code
            </Menu.Item>
            <Menu.Item onClick={() => {
              setSelectedNode({ id: 'leaderboard', type: 'leaderboard', label: 'Leaderboard' });
              setSelectedSubmissionId(null);
              setSelectedFile(null);
            }}>
              Leaderboard
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    );
    
    // Add selected submission info with dropdown
    if (selectedSubmissionId) {
      const submission = mockSubmissions.find(s => s.meta.resourceId === selectedSubmissionId);
      if (submission) {
        const algo = mockAlgoCode.find(a => a.meta.resourceId === submission.data.algo_id);
        const algoName = algo?.data.name || 'Unknown';
        const submissionTime = formatAbsoluteTime(submission.data.submission_time);
        
        // Get all user submissions for dropdown
        const CURRENT_USER = 'user1';
        const userSubmissions = mockSubmissions
          .filter(s => s.data.submitter === CURRENT_USER)
          .sort((a, b) => new Date(b.data.submission_time).getTime() - new Date(a.data.submission_time).getTime());
        
        breadcrumbItems.push(
          <Group key="submission-detail-group" gap={4}>
            <Text>{algoName} ({submissionTime})</Text>
            <Menu position="bottom-start" shadow="md" width={300}>
              <Menu.Target>
                <ActionIcon size="xs" variant="subtle" color="gray">
                  <IconDots size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Switch Submission</Menu.Label>
                {userSubmissions.map(sub => {
                  const subAlgo = mockAlgoCode.find(a => a.meta.resourceId === sub.data.algo_id);
                  const subAlgoName = subAlgo?.data.name || 'Unknown';
                  const subTime = formatAbsoluteTime(sub.data.submission_time);
                  const isActive = sub.meta.resourceId === selectedSubmissionId;
                  
                  return (
                    <Menu.Item
                      key={sub.meta.resourceId}
                      onClick={() => {
                        navigate({ 
                          to: '/programs/$programId/submissions/$submissionId', 
                          params: { 
                            programId: program.meta.resourceId, 
                            submissionId: sub.meta.resourceId 
                          } 
                        });
                        setSelectedSubmissionId(sub.meta.resourceId);
                        setSelectedFile(null);
                      }}
                      color={isActive ? 'blue' : undefined}
                      style={{ fontWeight: isActive ? 600 : 400 }}
                    >
                      {subAlgoName} ({subTime})
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
          </Group>
        );
      }
    }
  } else if (selectedNode?.type === 'case') {
    breadcrumbItems.push(
      <Text key="case">{selectedNode.label}</Text>
    );
  } else if (selectedNode?.type === 'code') {
    breadcrumbItems.push(
      <Text key="code">{selectedNode.label}</Text>
    );
  }

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
        <Stack gap="lg" style={{ height: '100%', overflow: 'hidden' }}>
          {/* Program Structure - max 60% height */}
          <Box style={{ maxHeight: '60%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Title order={5} mb="md">Program Structure</Title>
            <Box style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <ProgramTree
                program={program}
                selectedNode={selectedNode}
                onNodeSelect={setSelectedNode}
                programId={program.meta.resourceId}
                submissionsPage={submissionsPage}
                onSubmissionsPageChange={setSubmissionsPage}
              />
            </Box>
          </Box>

          <Divider />

          {/* File Structure - flexible height */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Title order={5} mb="md">
              {selectedSubmissionId 
                ? 'Submission Files' 
                : selectedNode?.type === 'submissions'
                  ? 'Recent Submissions'
                  : 'Program Files'}
            </Title>
            <Card withBorder style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <FileTreeNode
                node={
                  selectedSubmissionId && submissionFileStructure 
                    ? submissionFileStructure 
                    : selectedNode?.type === 'submissions'
                      ? recentSubmissionsStructure
                      : mockProgramFileStructure
                }
                level={0}
                onSelectFile={setSelectedFile}
                selectedFile={selectedFile}
              />
            </Card>
          </Box>
        </Stack>
      }
      mainPanel={
        <ProgramContent
          program={program}
          selectedNode={selectedNode}
          onSubmissionSelect={setSelectedSubmissionId}
          selectedFile={selectedFile}
          programId={program.meta.resourceId}
          selectedSubmissionId={selectedSubmissionId}
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
