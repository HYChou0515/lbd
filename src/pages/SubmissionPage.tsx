import { useState, useMemo } from 'react';
import {
  Stack,
  Group,
  Title,
  Select,
  Text,
  Badge,
  Box,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import {
  IconExternalLink,
  IconFileText,
} from '@tabler/icons-react';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { 
  mockProgram, 
  mockSubmissions, 
  mockEvaluationResults,
  mockExecutionResults,
} from '../data/mockProgramData';
import type { 
  ExecutionResult,
  Submission,
} from '../types/program';
import { TimeDisplay } from '../components/TimeDisplay';

// Table row type
type SubmissionRow = {
  submission: Submission;
  [key: string]: any; // Dynamic fields for case metrics
};

export function SubmissionPage() {
  // Filters
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<string | null>(null);

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

  // Get filtered cases and metrics
  const filteredCases = selectedCase && selectedCase !== 'all' 
    ? mockProgram.cases.filter(c => c.id === selectedCase)
    : mockProgram.cases;
    
  const allMetrics = [
    ...mockProgram.eval_code.map(e => ({ id: e.id, name: e.name, type: 'score' as const })),
    { id: '__wall_time__', name: 'Wall Time', type: 'execution' as const },
    { id: '__cpu_time__', name: 'CPU Time', type: 'execution' as const },
    { id: '__memory__', name: 'Memory', type: 'execution' as const },
  ];
    
  const filteredMetrics = !selectedEval || selectedEval === 'all'
    ? allMetrics
    : allMetrics.filter(m => m.id === selectedEval);

  // Format metric value
  const formatMetric = (value: number | undefined, metricType: string): string => {
    if (value === undefined) return '-';
    
    if (metricType === 'score') {
      return value.toFixed(4);
    } else if (metricType === 'wall_time' || metricType === 'cpu_time') {
      return `${value.toFixed(2)}s`;
    } else if (metricType === 'memory') {
      return `${value.toFixed(0)} MB`;
    }
    return value.toString();
  };

  // Build table data with dynamic columns
  const tableData = useMemo(() => {
    return mockSubmissions.map(submission => {
      const row: SubmissionRow = {
        submission,
      };

      // Get evaluation and execution results
      const evalResults = mockEvaluationResults.filter(r => r.submission_id === submission.id);
      const execResults = mockExecutionResults.filter(r => r.submission_id === submission.id);

      // Build data for each case
      filteredCases.forEach(caseItem => {
        const execResult = execResults.find(r => r.case_id === caseItem.id);
        
        // Add metrics for this case
        filteredMetrics.forEach(metric => {
          const key = `${caseItem.id}_${metric.id}`;
          
          if (metric.type === 'execution' && execResult) {
            const metricKey = metric.id.replace(/__/g, '') as keyof ExecutionResult;
            row[key] = execResult[metricKey];
          } else if (metric.type === 'score') {
            const evalResult = evalResults.find(
              r => r.case_id === caseItem.id && r.eval_code_id === metric.id
            );
            row[key] = evalResult?.score;
          }
        });

        // Add execution result for actions
        row[`${caseItem.id}_execResult`] = execResult;
      });

      return row;
    });
  }, [filteredCases, filteredMetrics]);

  // Build columns dynamically
  const columns = useMemo<MRT_ColumnDef<SubmissionRow>[]>(() => {
    const cols: MRT_ColumnDef<SubmissionRow>[] = [
      {
        accessorKey: 'submission.algo.name',
        header: 'Submission',
        size: 200,
        Cell: ({ row }) => (
          <Group gap="xs">
            <Tooltip label="View on GitLab">
              <ActionIcon
                component="a"
                href={row.original.submission.algo.gitlab_url}
                target="_blank"
                size="sm"
                variant="subtle"
              >
                <IconExternalLink size={14} />
              </ActionIcon>
            </Tooltip>
            <Box>
              <Text size="sm" fw={500}>
                {row.original.submission.algo.name}
              </Text>
              <Text size="xs" c="dimmed">
                {row.original.submission.algo.commit_hash}
              </Text>
            </Box>
          </Group>
        ),
      },
      {
        accessorKey: 'submission.submitter',
        header: 'Submitter',
        size: 120,
      },
      {
        accessorKey: 'submission.submission_time',
        header: 'Time',
        size: 150,
        Cell: ({ row }) => (
          <TimeDisplay 
            time={row.original.submission.submission_time} 
            size="sm"
          />
        ),
      },
    ];

    // Add columns for each case - with grouping
    filteredCases.forEach(caseItem => {
      const caseColumns: MRT_ColumnDef<SubmissionRow>[] = [];
      
      // Add metric columns
      filteredMetrics.forEach(metric => {
        const key = `${caseItem.id}_${metric.id}`;
        caseColumns.push({
          accessorKey: key,
          id: key,
          header: metric.name,
          size: 100,
          Header: () => (
            <Text size="xs" fw={500}>
              {metric.name}
            </Text>
          ),
          Cell: ({ row }) => {
            const value = row.original[key];
            return (
              <Text size="sm" fw={500}>
                {formatMetric(value, metric.type === 'execution' ? metric.id.replace(/__/g, '') : 'score')}
              </Text>
            );
          },
        });
      });

      // Add actions column
      caseColumns.push({
        id: `${caseItem.id}_actions`,
        header: 'Actions',
        size: 150,
        enableSorting: false,
        Header: () => (
          <Text size="xs" fw={500}>
            Actions
          </Text>
        ),
        Cell: ({ row }) => {
          const execResult = row.original[`${caseItem.id}_execResult`] as ExecutionResult | undefined;
          
          if (!execResult) {
            return <Text size="sm" c="dimmed">-</Text>;
          }

          return (
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
          );
        },
      });
      
      // Add case group column
      cols.push({
        id: caseItem.id,
        header: caseItem.name,
        Header: () => (
          <Badge size="lg" variant="light">
            {caseItem.name}
          </Badge>
        ),
        columns: caseColumns,
      });
    });

    return cols;
  }, [filteredCases, filteredMetrics]);

  return (
    <Stack gap="lg" p="lg">
      {/* Header */}
      <Group justify="space-between">
        <Title order={2}>Submissions - {mockProgram.name}</Title>
      </Group>

      {/* Filters */}
      <Group gap="md">
        <Select
          label="Case"
          placeholder="Select case"
          data={caseOptions}
          value={selectedCase}
          onChange={setSelectedCase}
          style={{ flex: 1 }}
          clearable
          description="Filter by specific case"
        />
        
        <Select
          label="Metric"
          placeholder="Select metric"
          data={evalOptions}
          value={selectedEval}
          onChange={setSelectedEval}
          style={{ flex: 1 }}
          clearable
          description="Choose score evaluations or execution metrics"
        />
      </Group>

      {/* Table */}
      <MantineReactTable
        columns={columns}
        data={tableData}
        enableSorting
        enableColumnResizing
        enableColumnFilters={false}
        enableGlobalFilter={false}
        enablePagination={false}
        enableBottomToolbar={false}
        enableTopToolbar={false}
        enableColumnActions={false}
        mantineTableProps={{
          highlightOnHover: true,
          withColumnBorders: true,
          withTableBorder: true,
        }}
        mantineTableHeadCellProps={{
          style: {
            fontSize: '12px',
            fontWeight: 600,
          },
        }}
        initialState={{
          density: 'xs',
        }}
      />
    </Stack>
  );
}
