import { Text, Tooltip } from '@mantine/core';
import { formatTimeWithTooltip } from '../utils/timeUtils';
import { useUserPreferences } from '../hooks/useUserPreferences';
import type { TimeDisplayMode } from '../hooks/useUserPreferences';

interface TimeDisplayProps {
  time: Date | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  mode?: TimeDisplayMode;
  threshold?: number;
}

export function TimeDisplay({ 
  time, 
  size = 'xs', 
  color = 'dimmed',
  mode,
  threshold 
}: TimeDisplayProps) {
  const { preferences } = useUserPreferences();
  
  const displayMode = mode ?? preferences.timeDisplayMode;
  const displayThreshold = threshold ?? preferences.timeDisplayThreshold;
  
  const { display, tooltip } = formatTimeWithTooltip(
    time,
    displayMode,
    displayThreshold
  );
  
  if (tooltip) {
    return (
      <Tooltip label={tooltip} withArrow>
        <span style={{ cursor: 'help' }}>
          <Text size={size} c={color} w="max-content">
            {display}
          </Text>
        </span>
      </Tooltip>
    );
  }
  
  return <Text size={size} c={color}>{display}</Text>;
}
