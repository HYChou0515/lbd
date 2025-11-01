import { useState, useMemo } from 'react';
import {
  Stack,
  Group,
  Title,
  Select,
  Button,
  Text,
  Table,
  Badge,
  Box,
  Paper,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import {
  IconExternalLink,
  IconFileText,
} from '@tabler/icons-react';
import { 
  mockProgram, 
  mockSubmissions, 
  mockEvaluationResults,
  mockExecutionResults,
} from '../data/mockProgramData';
import type { 
  ExecutionResult,
  MetricType 
} from '../types/program';
import { TimeDisplay } from '../components/TimeDisplay';

export function SubmissionPage() {
  // Filters
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'score' | 'wall_time'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Prepare filter options
  const caseOptions = [
    { value: 'all', label: 'All Cases' },
    ...mockProgram.cases.map(c => ({ value: c.id, label: c.name })),
  ];
  
  const evalOptions = [
    { value: 'all', label: 'All Metrics' },
    ...mockProgram.eval_code.map(e => ({ value: e.id, label: e.name })),
    { value: '__wall_time__', label: 'Wall Time' },
    { value: '__cpu_time__', label: 'CPU Time' },
    { value: '__memory__', label: 'Memory' },
  ];

  // Remove metric selector since we've integrated it into eval selector
  // const metricOptions: { value: MetricType; label: string }[] = [
  //   { value: 'score', label: 'Score' },
  //   { value: 'wall_time', label: 'Wall Time' },
  //   { value: 'cpu_time', label: 'CPU Time' },
  //   { value: 'memory', label: 'Memory' },
  // ];

  // Get filtered cases and evals
  const filteredCases = selectedCase && selectedCase !== 'all' 
    ? mockProgram.cases.filter(c => c.id === selectedCase)
    : mockProgram.cases;
    
  // When "all" is selected, show all metrics including execution metrics
  const allMetrics = [
    ...mockProgram.eval_code.map(e => ({ id: e.id, name: e.name, type: 'score' as const })),
    { id: '__wall_time__', name: 'Wall Time', type: 'execution' as const },
    { id: '__cpu_time__', name: 'CPU Time', type: 'execution' as const },
    { id: '__memory__', name: 'Memory', type: 'execution' as const },
  ];
    
  const filteredMetrics = !selectedEval || selectedEval === 'all'
    ? allMetrics
    : allMetrics.filter(m => m.id === selectedEval);

  // Build table data
  const tableData = useMemo(() => {
    return mockSubmissions.map(submission => {
      // Get evaluation results for this submission
      const evalResults = mockEvaluationResults.filter(
        r => r.submission_id === submission.id
      );
      
      // Get execution results for this submission
      const execResults = mockExecutionResults.filter(
        r => r.submission_id === submission.id
      );
      
      // Build case×eval matrix for scores
      const scoreMatrix: Record<string, Record<string, number>> = {};
      evalResults.forEach(result => {
        if (!scoreMatrix[result.case_id]) {
          scoreMatrix[result.case_id] = {};
        }
        scoreMatrix[result.case_id][result.eval_code_id] = result.score;
      });
      
      // Build case→execution result map
      const execMap: Record<string, ExecutionResult> = {};
      execResults.forEach(result => {
        execMap[result.case_id] = result;
      });
      
      // Calculate average score for sorting
      const avgScore = evalResults.reduce((sum, r) => sum + r.score, 0) / evalResults.length;
      const avgWallTime = execResults.reduce((sum, r) => sum + r.wall_time, 0) / execResults.length;
      
      return {
        submission,
        scoreMatrix,
        execMap,
        avgScore,
        avgWallTime,
      };
    });
  }, []);

  // Sort table data
  const sortedData = useMemo(() => {
    const sorted = [...tableData];
    sorted.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'time') {
        compareValue = new Date(a.submission.submission_time).getTime() - 
                      new Date(b.submission.submission_time).getTime();
      } else if (sortBy === 'score') {
        compareValue = a.avgScore - b.avgScore;
      } else if (sortBy === 'wall_time') {
        compareValue = a.avgWallTime - b.avgWallTime;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  }, [tableData, sortBy, sortOrder]);

  // Format metric value
  const formatMetric = (value: number, metric: MetricType | string): string => {
    if (metric === 'score') {
      return value.toFixed(4);
    } else if (metric === 'wall_time' || metric === 'cpu_time') {
      return `${value.toFixed(2)}s`;
    } else if (metric === 'memory') {
      return `${value.toFixed(0)} MB`;
    }
    return value.toString();
  };

  return (
    <Stack gap="md" p="md">
      {/* Header */}
      <Group justify="space-between">
        <Title order={2}>📊 Submissions</Title>
        <Badge size="lg" variant="light">
          {mockSubmissions.length} submissions
        </Badge>
      </Group>

      {/* Toolbar */}
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group gap="md" align="flex-end">
            <Select
              label="Case"
              placeholder="Select case"
              data={caseOptions}
              value={selectedCase || 'all'}
              onChange={setSelectedCase}
              style={{ flex: 1 }}
            />
            <Select
              label="Evaluation / Metric"
              placeholder="Select evaluation or metric"
              data={evalOptions}
              value={selectedEval || 'all'}
              onChange={setSelectedEval}
              style={{ flex: 1 }}
              description="Choose score evaluations or execution metrics"
            />
          </Group>
          
          <Group gap="md">
            <Text size="sm" fw={500}>Sort by:</Text>
            <Button.Group>
              <Button
                variant={sortBy === 'time' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setSortBy('time')}
              >
                Submission Time
              </Button>
              <Button
                variant={sortBy === 'score' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setSortBy('score')}
              >
                Score
              </Button>
              <Button
                variant={sortBy === 'wall_time' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setSortBy('wall_time')}
              >
                Wall Time
              </Button>
            </Button.Group>
            
            <Button.Group>
              <Button
                variant={sortOrder === 'asc' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setSortOrder('asc')}
              >
                ↑ Asc
              </Button>
              <Button
                variant={sortOrder === 'desc' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setSortOrder('desc')}
              >
                ↓ Desc
              </Button>
            </Button.Group>
          </Group>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper withBorder>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <Table.Thead>
              {/* First row: Case names */}
              <Table.Tr>
                <Table.Th rowSpan={2}>Submission</Table.Th>
                <Table.Th rowSpan={2}>Submitter</Table.Th>
                <Table.Th rowSpan={2}>Time</Table.Th>
                {filteredCases.map(caseItem => (
                  <Table.Th 
                    key={caseItem.id} 
                    colSpan={filteredMetrics.length + 1}
                    style={{ textAlign: 'center' }}
                  >
                    <Badge size="lg" variant="light">
                      {caseItem.name}
                    </Badge>
                  </Table.Th>
                ))}
              </Table.Tr>
              {/* Second row: Metrics and Actions */}
              <Table.Tr>
                {filteredCases.map(caseItem => (
                  <>
                    {filteredMetrics.map(metric => (
                      <Table.Th key={`${caseItem.id}-${metric.id}`}>
                        <Text size="xs" fw={500}>
                          {metric.name}
                        </Text>
                      </Table.Th>
                    ))}
                    <Table.Th key={`${caseItem.id}-actions`}>
                      <Text size="xs" fw={500}>
                        Actions
                      </Text>
                    </Table.Th>
                  </>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedData.map(({ submission, scoreMatrix, execMap }) => {
                return (
                  <Table.Tr key={submission.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="View on GitLab">
                          <ActionIcon
                            component="a"
                            href={submission.algo.gitlab_url}
                            target="_blank"
                            size="sm"
                            variant="subtle"
                          >
                            <IconExternalLink size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <Box>
                          <Text size="sm" fw={500}>
                            {submission.algo.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {submission.algo.commit_hash}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{submission.submitter}</Text>
                    </Table.Td>
                    <Table.Td>
                      <TimeDisplay 
                        time={submission.submission_time} 
                        size="sm"
                      />
                    </Table.Td>
                    {filteredCases.map(caseItem => {
                      const execResult = execMap[caseItem.id];
                      
                      return (
                        <>
                          {filteredMetrics.map(metric => {
                            if (metric.type === 'execution') {
                              // Execution metrics
                              if (!execResult) {
                                return (
                                  <Table.Td key={`${caseItem.id}-${metric.id}`}>
                                    <Text size="sm" c="dimmed">-</Text>
                                  </Table.Td>
                                );
                              }
                              
                              const metricKey = metric.id.replace(/__/g, '') as keyof ExecutionResult;
                              const value = execResult[metricKey];
                              
                              return (
                                <Table.Td key={`${caseItem.id}-${metric.id}`}>
                                  <Text size="sm" fw={500}>
                                    {formatMetric(value as number, metricKey as MetricType)}
                                  </Text>
                                </Table.Td>
                              );
                            } else {
                              // Score metrics
                              const score = scoreMatrix[caseItem.id]?.[metric.id];
                              
                              if (score === undefined) {
                                return (
                                  <Table.Td key={`${caseItem.id}-${metric.id}`}>
                                    <Text size="sm" c="dimmed">-</Text>
                                  </Table.Td>
                                );
                              }
                              
                              return (
                                <Table.Td key={`${caseItem.id}-${metric.id}`}>
                                  <Text size="sm" fw={500}>
                                    {score.toFixed(4)}
                                  </Text>
                                </Table.Td>
                              );
                            }
                          })}
                          {/* Actions column for this case */}
                          <Table.Td key={`${caseItem.id}-actions`}>
                            {execResult ? (
                              <Group gap="xs" wrap="nowrap">
                                <Badge 
                                  size="xs" 
                                  color={execResult.status === 'success' ? 'green' : 'red'}
                                >
                                  {execResult.status}
                                </Badge>
                                {execResult.log_url && (
                                  <Tooltip label="View Log">
                                    <ActionIcon
                                      component="a"
                                      href={execResult.log_url}
                                      target="_blank"
                                      size="sm"
                                      variant="light"
                                    >
                                      <IconFileText size={14} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                                {execResult.artifact_url && (
                                  <Tooltip label="View Artifact">
                                    <ActionIcon
                                      component="a"
                                      href={execResult.artifact_url}
                                      target="_blank"
                                      size="sm"
                                      variant="light"
                                    >
                                      <IconExternalLink size={14} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </Group>
                            ) : (
                              <Text size="sm" c="dimmed">-</Text>
                            )}
                          </Table.Td>
                        </>
                      );
                    })}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>
    </Stack>
  );
}
