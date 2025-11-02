import { useState, useMemo } from 'react';
import {
  Stack,
  Group,
  Title,
  MultiSelect,
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
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectedEvals, setSelectedEvals] = useState<string[]>([]);

  // Prepare filter options (without 'all' option for MultiSelect)
  // Group cases by type
  const openDataCases = mockProgram.cases.filter(c => c.case_type === 'open data');
  const openExamCases = mockProgram.cases.filter(c => c.case_type === 'open exam');
  const closeExamCases = mockProgram.cases.filter(c => c.case_type === 'close exam');
  
  const caseOptions = [
    { 
      group: 'Open Data', 
      items: openDataCases.map(c => ({ value: c.id, label: c.name })) 
    },
    { 
      group: 'Open Exam', 
      items: openExamCases.map(c => ({ value: c.id, label: c.name })) 
    },
    { 
      group: 'Close Exam', 
      items: closeExamCases.map(c => ({ value: c.id, label: c.name })) 
    },
  ];
  
  const columnOptions = [
    { group: 'Score Evaluations', items: mockProgram.eval_code.map(e => ({ value: e.id, label: e.name })) },
    { 
      group: 'Execution Metrics', 
      items: [
        { value: '__wall_time__', label: 'Wall Time' },
        { value: '__cpu_time__', label: 'CPU Time' },
        { value: '__memory__', label: 'Memory' },
      ]
    },
    { 
      group: 'Other', 
      items: [
        { value: '__actions__', label: 'Actions' },
      ]
    },
  ];

  // Get filtered cases and metrics
  const filteredCases = selectedCases.length > 0
    ? mockProgram.cases.filter(c => selectedCases.includes(c.id))
    : mockProgram.cases;
    
  const allMetrics = [
    ...mockProgram.eval_code.map(e => ({ id: e.id, name: e.name, type: 'score' as const })),
    { id: '__wall_time__', name: 'Wall Time', type: 'execution' as const },
    { id: '__cpu_time__', name: 'CPU Time', type: 'execution' as const },
    { id: '__memory__', name: 'Memory', type: 'execution' as const },
  ];
    
  const filteredMetrics = selectedEvals.length > 0
    ? allMetrics.filter(m => selectedEvals.includes(m.id))
    : allMetrics;
  
  // Check if actions column should be displayed
  const showActions = selectedEvals.length === 0 || selectedEvals.includes('__actions__');

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

      // Add actions column if needed
      if (showActions) {
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
      }
      
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
  }, [filteredCases, filteredMetrics, showActions]);

  return (
    <Stack gap="lg" p="lg">
      {/* Header */}
      <Group justify="space-between">
        <Title order={2}>Submissions - {mockProgram.name}</Title>
      </Group>

      {/* Filters */}
      <Group gap="md">
        <MultiSelect
          label="Cases"
          placeholder="Select cases"
          data={caseOptions}
          value={selectedCases}
          onChange={setSelectedCases}
          style={{ flex: 1 }}
          clearable
          searchable
          description="Filter by specific cases (empty = all)"
        />
        
        <MultiSelect
          label="Columns"
          placeholder="Select columns to display"
          data={columnOptions}
          value={selectedEvals}
          onChange={setSelectedEvals}
          style={{ flex: 1 }}
          clearable
          searchable
          description="Choose which columns to display (empty = all)"
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
        enableColumnPinning
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
          columnPinning: {
            left: ['submission.algo.name', 'submission.submitter', 'submission.submission_time'],
          },
        }}
      />
    </Stack>
  );
}
