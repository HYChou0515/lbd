import { Container, Title, Text, Card, Group, Badge, Stack, SimpleGrid } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { IconTrophy, IconUsers, IconCalendar } from '@tabler/icons-react';
import { mockProgram } from '../data/mockProgramData';
import { TimeDisplay } from '../components/TimeDisplay';

export function ProgramsPage() {
  // In a real app, this would fetch multiple programs
  const programs = [mockProgram];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="sm">Programs</Title>
          <Text c="dimmed">
            Browse and participate in data science competitions
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {programs.map((program) => (
            <Card
              key={program.meta.resourceId}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              component={Link}
              to={`/program/${program.meta.resourceId}`}
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <IconTrophy size={32} stroke={1.5} />
                  <Badge color="green" variant="light">
                    Active
                  </Badge>
                </Group>

                <div>
                  <Title order={3} mb="xs">
                    {program.data.name}
                  </Title>
                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {program.data.description}
                  </Text>
                </div>

                <Stack gap="xs">
                  <Group gap="xs">
                    <IconUsers size={16} stroke={1.5} />
                    <Text size="sm" c="dimmed">
                      {program.data.case_ids.length} cases
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <IconCalendar size={16} stroke={1.5} />
                    <Text size="sm" c="dimmed">
                      Created <TimeDisplay time={program.meta.createdTime} size="sm" />
                    </Text>
                  </Group>
                </Stack>

                <Text size="xs" c="dimmed" ff="monospace">
                  {program.meta.resourceId}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
