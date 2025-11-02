import { Stack, Title, Text, Box } from '@mantine/core';
import type { ProgramNode } from '../../pages/ProgramPage';
import type { Resource } from '../../types/meta';
import type { Program } from '../../types/program';

interface ProgramContentProps {
  program: Resource<Program>;
  selectedNode: ProgramNode | null;
}

export function ProgramContent({ program, selectedNode }: ProgramContentProps) {
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
        return (
          <Stack gap="md">
            <Title order={2}>{program.data.name}</Title>
            <Text>{program.data.description}</Text>
            <Box>
              <Text size="sm" fw={600} mb="xs">Program Information</Text>
              <Text size="sm" c="dimmed">Resource ID: {program.meta.resourceId}</Text>
              <Text size="sm" c="dimmed">Created: {program.meta.createdTime}</Text>
            </Box>
          </Stack>
        );

      case 'open-data':
      case 'open-exam':
      case 'close-exam':
        return (
          <Stack gap="md">
            <Title order={2}>{selectedNode.label}</Title>
            <Text c="dimmed">
              {selectedNode.children?.length || 0} cases in this category
            </Text>
          </Stack>
        );

      case 'case':
        const caseData = selectedNode.metadata?.case;
        return (
          <Stack gap="md">
            <Title order={2}>{selectedNode.label}</Title>
            {caseData && (
              <>
                <Text>{caseData.data.description}</Text>
                <Box>
                  <Text size="sm" fw={600} mb="xs">Case Information</Text>
                  <Text size="sm" c="dimmed">Type: {caseData.data.case_type}</Text>
                  <Text size="sm" c="dimmed">Dataset Revision: {caseData.data.dataset_revision_id}</Text>
                </Box>
              </>
            )}
          </Stack>
        );

      case 'sample-code':
      case 'eval-code':
        return (
          <Stack gap="md">
            <Title order={2}>{selectedNode.label}</Title>
            <Text c="dimmed">
              {selectedNode.children?.length || 0} code files in this category
            </Text>
          </Stack>
        );

      case 'code':
        const codeData = selectedNode.metadata?.code;
        return (
          <Stack gap="md">
            <Title order={2}>{selectedNode.label}</Title>
            {codeData && (
              <>
                <Text>{codeData.data.description}</Text>
                <Box>
                  <Text size="sm" fw={600} mb="xs">Code Information</Text>
                  <Text size="sm" c="dimmed">Type: {codeData.data.code_type}</Text>
                  <Text size="sm" c="dimmed">Commit: {codeData.data.commit_hash}</Text>
                  <Text 
                    size="sm" 
                    c="blue" 
                    component="a" 
                    href={codeData.data.gitlab_url}
                    target="_blank"
                  >
                    View on GitLab →
                  </Text>
                </Box>
              </>
            )}
          </Stack>
        );

      case 'submissions':
        return (
          <Stack gap="md">
            <Title order={2}>My Submissions</Title>
            <Text c="dimmed">
              View and manage your submissions for this program
            </Text>
            <Text size="sm" c="blue" component="a" href="/submissions">
              Go to Submissions Page →
            </Text>
          </Stack>
        );

      case 'leaderboard':
        return (
          <Stack gap="md">
            <Title order={2}>Leaderboard</Title>
            <Text c="dimmed">
              View rankings and compare performance across all submissions
            </Text>
            <Text size="sm">Leaderboard feature coming soon...</Text>
          </Stack>
        );

      default:
        return (
          <Text c="dimmed">Content for {selectedNode.type} node type</Text>
        );
    }
  };

  return (
    <Box p="xl">
      {renderContent()}
    </Box>
  );
}
