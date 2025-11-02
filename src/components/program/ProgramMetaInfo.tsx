import { Stack, Title, Text, Divider, Badge } from '@mantine/core';
import type { ProgramNode } from '../../pages/ProgramPage';
import type { Resource } from '../../types/meta';
import type { Program } from '../../types/program';
import { TimeDisplay } from '../TimeDisplay';

interface ProgramMetaInfoProps {
  program: Resource<Program>;
  selectedNode: ProgramNode | null;
}

export function ProgramMetaInfo({ program, selectedNode }: ProgramMetaInfoProps) {
  if (!selectedNode) {
    return (
      <Stack gap="md">
        <Title order={5}>Metadata</Title>
        <Text size="sm" c="dimmed">
          Select a node to view metadata
        </Text>
      </Stack>
    );
  }

  const renderMetadata = () => {
    switch (selectedNode.type) {
      case 'program':
        return (
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>STATUS</Text>
              <Badge color="green">Active</Badge>
            </div>

            <Divider />

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>RESOURCE ID</Text>
              <Text size="sm" ff="monospace">{program.meta.resourceId}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>CREATED</Text>
              <TimeDisplay time={program.meta.createdTime} size="sm" />
              <Text size="xs" c="dimmed" mt={2}>by {program.meta.creator}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>LAST UPDATED</Text>
              <TimeDisplay time={program.meta.updatedTime} size="sm" />
              <Text size="xs" c="dimmed" mt={2}>by {program.meta.updater}</Text>
            </div>
          </Stack>
        );

      case 'case':
        const caseData = selectedNode.metadata?.case;
        if (!caseData) return null;

        return (
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>TYPE</Text>
              <Badge>{caseData.data.case_type}</Badge>
            </div>

            <Divider />

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>RESOURCE ID</Text>
              <Text size="sm" ff="monospace">{caseData.meta.resourceId}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>DATASET REVISION</Text>
              <Text size="sm" ff="monospace">{caseData.data.dataset_revision_id}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>CREATED</Text>
              <TimeDisplay time={caseData.meta.createdTime} size="sm" />
            </div>
          </Stack>
        );

      case 'code':
        const codeData = selectedNode.metadata?.code;
        if (!codeData) return null;

        return (
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>TYPE</Text>
              <Badge>{codeData.data.code_type}</Badge>
            </div>

            <Divider />

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>COMMIT HASH</Text>
              <Text size="sm" ff="monospace">{codeData.data.commit_hash}</Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>REPOSITORY</Text>
              <Text 
                size="sm" 
                c="blue" 
                component="a" 
                href={codeData.data.gitlab_url}
                target="_blank"
                style={{ textDecoration: 'none' }}
              >
                View on GitLab →
              </Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>CREATED</Text>
              <TimeDisplay time={codeData.meta.createdTime} size="sm" />
              <Text size="xs" c="dimmed" mt={2}>by {codeData.meta.creator}</Text>
            </div>
          </Stack>
        );

      case 'submissions':
        return (
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>PAGE</Text>
              <Text size="sm">My Submissions</Text>
            </div>
            <Divider />
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>DESCRIPTION</Text>
              <Text size="sm">
                View and track all your submissions for this program
              </Text>
            </div>
          </Stack>
        );

      case 'leaderboard':
        return (
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>PAGE</Text>
              <Text size="sm">Leaderboard</Text>
            </div>
            <Divider />
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>DESCRIPTION</Text>
              <Text size="sm">
                Compare your performance with other participants
              </Text>
            </div>
          </Stack>
        );

      default:
        return (
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" fw={600} mb={4}>NODE TYPE</Text>
              <Text size="sm">{selectedNode.type}</Text>
            </div>
          </Stack>
        );
    }
  };

  return (
    <Stack gap="lg">
      <Title order={5}>Metadata</Title>
      {renderMetadata()}
    </Stack>
  );
}
