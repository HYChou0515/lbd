import { Stack, Title, Text, Box } from '@mantine/core';
import type { ProgramNode } from '../../pages/ProgramPage';
import type { Resource } from '../../types/meta';
import type { Program } from '../../types/program';
import { SubmissionSection } from '../submission/SubmissionSection';
import { ContentViewer } from '../ContentViewer';
import { generateCaseMarkdown } from '../../utils/contentGenerators';
import type { FileNode } from '../../data/mockFileStructure';

interface ProgramContentProps {
  program: Resource<Program>;
  selectedNode: ProgramNode | null;
  onSubmissionSelect?: (submissionId: string | null) => void;
  selectedFile?: FileNode | null;
}

export function ProgramContent({ program, selectedNode, onSubmissionSelect, selectedFile }: ProgramContentProps) {

  // If a file is selected, show its content
  if (selectedFile) {
    // Determine language based on file extension
    let language = 'plaintext';
    let showToggle = false;
    
    if (selectedFile.name.endsWith('.md')) {
      language = 'markdown';
      showToggle = true;
    } else if (selectedFile.name.endsWith('.py')) {
      language = 'python';
    } else if (selectedFile.name.endsWith('.js') || selectedFile.name.endsWith('.ts')) {
      language = 'javascript';
    } else if (selectedFile.name.endsWith('.json')) {
      language = 'json';
    } else if (selectedFile.name.endsWith('.yml') || selectedFile.name.endsWith('.yaml')) {
      language = 'yaml';
    } else if (selectedFile.name === 'logs') {
      language = 'markdown'; // logs 檔案用 markdown 顯示
      showToggle = true;
    }
    
    return (
      <ContentViewer
        content={selectedFile.content || 'No content available'}
        language={language}
        title={selectedFile.name}
        resourceType="file"
        showToggle={showToggle}
      />
    );
  }

  if (!selectedNode) {
    return (
      <Stack align="center" justify="center" h="100%" p="xl">
        <Title order={3} c="dimmed">Select a node to view details</Title>
        <Text c="dimmed" size="sm">
          Choose an item from the navigation tree on the left
        </Text>
      </Stack>
    );
  }

  // Render different content based on node type
  const renderContent = () => {
    switch (selectedNode.type) {
      case 'program':
        const programMarkdown = `# ${program.data.name}

## Description
${program.data.description}

## Resource Information
- Resource ID: ${program.meta.resourceId}
- Revision ID: ${program.meta.revisionId}
- Creator: ${program.meta.creator}
- Created: ${program.meta.createdTime}
- Updated: ${program.meta.updatedTime}
`;
        return (
          <ContentViewer
            content={programMarkdown}
            language="markdown"
            title={program.data.name}
            resourceType="program"
          />
        );

      case 'open-data':
      case 'open-exam':
      case 'close-exam':
      case 'sample-code':
      case 'eval-code':
        return (
          <Stack align="center" justify="center" h="100%" p="xl">
            <Title order={3} c="dimmed">{selectedNode.label}</Title>
            <Text c="dimmed" size="sm">
              Select a specific item from this category
            </Text>
          </Stack>
        );

      case 'case':
        const caseData = selectedNode.metadata?.case;
        if (!caseData) {
          return (
            <Stack align="center" justify="center" h="100%" p="xl">
              <Title order={3} c="dimmed">Case not found</Title>
            </Stack>
          );
        }
        
        // TODO: 從 dataset_revision_id 查找實際的 Dataset 並傳入
        const caseMarkdown = generateCaseMarkdown(caseData);
        
        return (
          <ContentViewer
            content={caseMarkdown}
            language="markdown"
            title={caseData.data.name}
            resourceType="case"
          />
        );

      case 'code':
        const codeData = selectedNode.metadata?.code;
        if (!codeData) {
          return (
            <Stack align="center" justify="center" h="100%" p="xl">
              <Title order={3} c="dimmed">Code not found</Title>
            </Stack>
          );
        }
        
        // TODO: 從 GitLab 或 API 獲取實際代碼內容
        const codeContent = `"""
${codeData.data.description}

Code Type: ${codeData.data.code_type}
Commit Hash: ${codeData.data.commit_hash}
GitLab URL: ${codeData.data.gitlab_url}

TODO: Fetch actual code content from GitLab API or storage
"""

def sample_algorithm():
    # This is placeholder content
    # Real code should be fetched from GitLab
    pass
`;
        
        return (
          <ContentViewer
            content={codeContent}
            language="python"
            title={codeData.data.name}
            resourceType="code"
            showToggle={false}
          />
        );

      case 'submissions':
        // Show SubmissionSection inline without changing route
        return <SubmissionSection onViewDetail={onSubmissionSelect} />;

      case 'leaderboard':
        return (
          <Stack align="center" justify="center" h="100%" p="xl">
            <Title order={3} c="dimmed">Leaderboard</Title>
            <Text c="dimmed" size="sm">
              Coming soon...
            </Text>
          </Stack>
        );

      default:
        return (
          <Text c="dimmed">Content for {selectedNode.type} node type</Text>
        );
    }
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderContent()}
    </Box>
  );
}
