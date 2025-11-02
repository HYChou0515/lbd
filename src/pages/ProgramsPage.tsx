import { Container, Title, Text, Stack, SimpleGrid, Tabs } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { IconTrophy, IconDatabase } from '@tabler/icons-react';
import { mockProgram } from '../data/mockProgramData';
import { ProgramCard } from '../components/ProgramCard';

export function ProgramsPage() {
  const navigate = useNavigate();
  
  // In a real app, this would fetch multiple programs
  const programs = [mockProgram];

  const handleViewDetails = (resourceId: string) => {
    navigate({ to: '/program/$resourceId', params: { resourceId } });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Navigation Tabs */}
        <Tabs value="programs" onChange={(value) => {
          if (value === 'datasets') {
            navigate({ to: '/datasets' });
          }
        }}>
          <Tabs.List>
            <Tabs.Tab value="programs" leftSection={<IconTrophy size={16} />}>
              Programs
            </Tabs.Tab>
            <Tabs.Tab value="datasets" leftSection={<IconDatabase size={16} />}>
              Datasets
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Page Header */}
        <div>
          <Title order={1} mb="sm">Programs</Title>
          <Text c="dimmed">
            Browse and participate in data science competitions
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {programs.map((program) => (
            <ProgramCard
              key={program.meta.resourceId}
              program={program}
              onViewDetails={handleViewDetails}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
