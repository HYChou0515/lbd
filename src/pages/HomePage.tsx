import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Container, Center, Loader, Text, Stack } from '@mantine/core';

/**
 * HomePage - Landing page that redirects to programs
 */
export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to programs page
    navigate({ to: '/programs' });
  }, [navigate]);

  return (
    <Container size="xl" py="xl">
      <Center style={{ minHeight: '50vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Redirecting to Programs...</Text>
        </Stack>
      </Center>
    </Container>
  );
}
