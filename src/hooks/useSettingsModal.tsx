import { useState } from 'react';
import type { ReactNode } from 'react';
import { Modal, Stack, Title, Text, NumberInput, Group, Button, Divider, Paper } from '@mantine/core';
import { IconClock, IconCalendar, IconSettings, IconRefresh } from '@tabler/icons-react';
import { useUserPreferences } from './useUserPreferences';

interface UseSettingsModalReturn {
  toggleOpen: (opened: boolean) => void;
  modal: ReactNode;
}

export function useSettingsModal(): UseSettingsModalReturn {
  const [opened, setOpened] = useState(false);
  const {
    preferences,
    setTimeDisplayMode,
    setTimeDisplayThreshold,
    resetPreferences,
  } = useUserPreferences();

  const toggleOpen = (shouldOpen: boolean) => {
    setOpened(shouldOpen);
  };

  const modal = (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Group gap="xs">
          <IconSettings size={24} />
          <Title order={3}>Settings</Title>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="xl">
          {/* Time Display Mode Section */}
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Group gap="xs">
                <IconClock size={20} />
                <Title order={4}>Time Display Mode</Title>
              </Group>
              
              <Text size="sm" c="dimmed">
                Choose how timestamps are displayed throughout the application
              </Text>

              {/* Mode Descriptions - Clickable */}
              <Stack gap="xs" mt="xs">
                <Paper 
                  p="sm" 
                  bg={preferences.timeDisplayMode === 'absolute' ? 'blue.0' : 'gray.0'}
                  style={{ cursor: 'pointer', border: preferences.timeDisplayMode === 'absolute' ? '2px solid var(--mantine-color-blue-5)' : '2px solid transparent' }}
                  onClick={() => setTimeDisplayMode('absolute')}
                >
                  <Text size="sm" fw={preferences.timeDisplayMode === 'absolute' ? 600 : 400}>
                    <strong>Absolute:</strong> Always show full date and time
                  </Text>
                  <Text size="xs" c="dimmed">
                    Example: 2024/11/01 14:30:25
                  </Text>
                </Paper>

                <Paper 
                  p="sm" 
                  bg={preferences.timeDisplayMode === 'relative' ? 'blue.0' : 'gray.0'}
                  style={{ cursor: 'pointer', border: preferences.timeDisplayMode === 'relative' ? '2px solid var(--mantine-color-blue-5)' : '2px solid transparent' }}
                  onClick={() => setTimeDisplayMode('relative')}
                >
                  <Text size="sm" fw={preferences.timeDisplayMode === 'relative' ? 600 : 400}>
                    <strong>Relative:</strong> Always show time elapsed from now
                  </Text>
                  <Text size="xs" c="dimmed">
                    Example: 5 days ago, 3 hours ago
                  </Text>
                </Paper>

                <Paper 
                  p="sm" 
                  bg={preferences.timeDisplayMode === 'smart' ? 'blue.0' : 'gray.0'}
                  style={{ cursor: 'pointer', border: preferences.timeDisplayMode === 'smart' ? '2px solid var(--mantine-color-blue-5)' : '2px solid transparent' }}
                  onClick={() => setTimeDisplayMode('smart')}
                >
                  <Text size="sm" fw={preferences.timeDisplayMode === 'smart' ? 600 : 400}>
                    <strong>Smart:</strong> Show relative time for recent events, absolute for older ones
                  </Text>
                  <Text size="xs" c="dimmed">
                    Switches based on smart mode threshold
                  </Text>
                </Paper>
              </Stack>
            </Stack>
          </Paper>

          {/* Threshold Settings - Only visible in Smart mode */}
          {preferences.timeDisplayMode === 'smart' && (
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Group gap="xs">
                  <IconCalendar size={20} />
                  <Title order={4}>Smart Mode Threshold</Title>
                </Group>

                <Text size="sm" c="dimmed">
                  Events within this time range will show relative time. Older events show absolute time.
                </Text>

                <NumberInput
                  label="Threshold (hours)"
                  description="Events newer than this many hours will show as relative time"
                  value={preferences.timeDisplayThreshold}
                  onChange={(value) => {
                    if (typeof value === 'number' && value > 0) {
                      setTimeDisplayThreshold(value);
                    }
                  }}
                  min={1}
                  max={168} // 7 days max
                  step={1}
                  suffix=" hours"
                />

                <Stack gap="xs">
                  <Text size="xs" c="dimmed">
                    <strong>Suggestions:</strong>
                  </Text>
                  <Group gap="xs">
                    <Button 
                      size="xs" 
                      variant={preferences.timeDisplayThreshold === 6 ? 'filled' : 'light'}
                      onClick={() => setTimeDisplayThreshold(6)}
                    >
                      6 hours
                    </Button>
                    <Button 
                      size="xs" 
                      variant={preferences.timeDisplayThreshold === 24 ? 'filled' : 'light'}
                      onClick={() => setTimeDisplayThreshold(24)}
                    >
                      1 day
                    </Button>
                    <Button 
                      size="xs" 
                      variant={preferences.timeDisplayThreshold === 48 ? 'filled' : 'light'}
                      onClick={() => setTimeDisplayThreshold(48)}
                    >
                      2 days
                    </Button>
                    <Button 
                      size="xs" 
                      variant={preferences.timeDisplayThreshold === 168 ? 'filled' : 'light'}
                      onClick={() => setTimeDisplayThreshold(168)}
                    >
                      7 days
                    </Button>
                  </Group>
                </Stack>
              </Stack>
            </Paper>
          )}

          <Divider />

          {/* Footer */}
          <Group justify="space-between">
            <Button 
              variant="light" 
              color="red"
              leftSection={<IconRefresh size={16} />}
              onClick={() => {
                if (confirm('Are you sure you want to reset all customization settings to default?')) {
                  resetPreferences();
                }
              }}
            >
              Reset to Default
            </Button>
            <Button variant="filled" onClick={() => setOpened(false)}>
              Done
            </Button>
          </Group>
        </Stack>
      </Modal>
  );

  return {
    toggleOpen,
    modal,
  };
}
