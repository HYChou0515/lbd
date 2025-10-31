import '@mantine/core/styles.css';
import { MantineProvider, Container, Title, Text } from '@mantine/core';

function TestApp() {
  return (
    <MantineProvider>
      <Container>
        <Title>Test Page</Title>
        <Text>If you can see this, Mantine is working!</Text>
      </Container>
    </MantineProvider>
  );
}

export default TestApp;
