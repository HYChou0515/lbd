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
  SegmentedControl,
  Select,
} from '@mantine/core';
import {
  IconExternalLink,
  IconFileText,
  IconTable,
  IconChartLine,
} from '@tabler/icons-react';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { 
  mockProgram, 
  mockSubmissions, 
  mockEvaluationResults,
  mockExecutionResults,
  mockCases,
  mockEvalCode,
  mockAlgoCode,
} from '../data/mockProgramData';
import type { 
  ExecutionResult,
  EvaluationResult,
  Submission,
  ChartType,
} from '../types/program';
import type { Resource } from '../types/meta';
import { TimeDisplay } from '../components/TimeDisplay';
import { SubmissionCharts } from '../components/submission/SubmissionCharts';

// Table row type
type SubmissionRow = {
  submission: Resource<Submission>;
  [key: string]: any; // Dynamic fields for case metrics
};

// Current user (in real app, this would come from auth context)
const CURRENT_USER = 'user1';

export function SubmissionPage() {
  // Filter submissions to only show current user's submissions
  const mySubmissions = useMemo(
    () => mockSubmissions.filter(s => s.data.submitter === CURRENT_USER),
    []
  );

  // Filters
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectedEvals, setSelectedEvals] = useState<string[]>([]);
  
  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [chartType, setChartType] = useState<ChartType>('trend');
  
  // Chart filters (single selection)
  const [chartCase, setChartCase] = useState<string>(mockCases[0]?.meta.resourceId || '');
  const [chartMetricX, setChartMetricX] = useState<string>(mockEvalCode[0]?.meta.resourceId || '');
  const [chartMetricY, setChartMetricY] = useState<string>(mockEvalCode[1]?.meta.resourceId || mockEvalCode[0]?.meta.resourceId || '');

  // Prepare filter options (without 'all' option for MultiSelect)
  // Group cases by type
  const openDataCases = mockCases.filter(c => c.data.case_type === 'open data');
  const openExamCases = mockCases.filter(c => c.data.case_type === 'open exam');
  const closeExamCases = mockCases.filter(c => c.data.case_type === 'close exam');
  
  const caseOptions = [
    { 
      group: 'Open Data', 
      items: openDataCases.map(c => ({ value: c.meta.resourceId, label: c.data.name })) 
    },
    { 
      group: 'Open Exam', 
      items: openExamCases.map(c => ({ value: c.meta.resourceId, label: c.data.name })) 
    },
    { 
      group: 'Close Exam', 
      items: closeExamCases.map(c => ({ value: c.meta.resourceId, label: c.data.name })) 
    },
  ];
  
  const columnOptions = [
    { group: 'Score Evaluations', items: mockEvalCode.map(e => ({ value: e.meta.resourceId, label: e.data.name })) },
    { 
      group: 'Execution Metrics', 
      items: [
        { value: '__wall_time__', label: 'Wall Time' },
        { value: '__cpu_time__', label: 'CPU Time' },
        { value: '__memory__', label: 'Memory' },
      ]
    },
    { 
      group: 'Others', 
      items: [
        { value: '__status__', label: 'Status' },
        { value: '__log__', label: 'Log' },
        { value: '__artifact__', label: 'Artifact' },
      ]
    },
  ];

  // Get filtered cases and metrics
  const filteredCases = selectedCases.length > 0
    ? mockCases.filter(c => selectedCases.includes(c.meta.resourceId))
    : mockCases;
    
  const allMetrics = [
    ...mockEvalCode.map(e => ({ id: e.meta.resourceId, name: e.data.name, type: 'score' as const })),
    { id: '__wall_time__', name: 'Wall Time', type: 'execution' as const },
    { id: '__cpu_time__', name: 'CPU Time', type: 'execution' as const },
    { id: '__memory__', name: 'Memory', type: 'execution' as const },
    { id: '__status__', name: '', type: 'action' as const },
    { id: '__log__', name: '', type: 'action' as const },
    { id: '__artifact__', name: '', type: 'action' as const },
  ];
    
  const filteredMetrics = selectedEvals.length > 0
    ? allMetrics.filter(m => selectedEvals.includes(m.id))
    : allMetrics;

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
    return mySubmissions.map(submission => {
      const row: SubmissionRow = {
        submission,
      };

      // Get evaluation and execution results
      const evalResults = mockEvaluationResults.filter((r: EvaluationResult) => r.submission_id === submission.meta.resourceId);
      const execResults = mockExecutionResults.filter(r => r.submission_id === submission.meta.resourceId);

      // Build data for each case
      filteredCases.forEach(caseItem => {
        const execResult = execResults.find(r => r.case_id === caseItem.meta.resourceId);
        
        // Add metrics for this case
        filteredMetrics.forEach(metric => {
          const key = `${caseItem.meta.resourceId}_${metric.id}`;
          
          if (metric.type === 'execution' && execResult) {
            const metricKey = metric.id.replace(/__/g, '') as keyof ExecutionResult;
            row[key] = execResult[metricKey];
          } else if (metric.type === 'score') {
            const evalResult = evalResults.find(
              (r: EvaluationResult) => r.case_id === caseItem.meta.resourceId && r.eval_code_id === metric.id
            );
            row[key] = evalResult?.score;
          }
        });

        // Add execution result for actions
        row[`${caseItem.meta.resourceId}_execResult`] = execResult;
      });

      return row;
    });
  }, [mySubmissions, filteredCases, filteredMetrics]);

  // Build columns dynamically
  const columns = useMemo<MRT_ColumnDef<SubmissionRow>[]>(() => {
    const cols: MRT_ColumnDef<SubmissionRow>[] = [
      {
        accessorKey: 'submission.data.algo_id',
        header: 'Algorithm',
        size: 200,
        Cell: ({ row }) => {
          const algoId = row.original.submission.data.algo_id;
          const algo = mockAlgoCode.find(c => c.meta.resourceId === algoId);
          
          return (
            <Group gap="xs">
              {algo && (
                <Tooltip label="View on GitLab">
                  <ActionIcon
                    component="a"
                    href={algo.data.gitlab_url}
                    target="_blank"
                    size="sm"
                    variant="subtle"
                  >
                    <IconExternalLink size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Box>
                <Text size="sm" fw={500}>
                  {algo?.data.name || 'Unknown'}
                </Text>
                <Text size="xs" c="dimmed">
                  {algo?.data.commit_hash || '-'}
                </Text>
              </Box>
            </Group>
          );
        },
      },
      {
        accessorKey: 'submission.data.submission_time',
        header: 'Submission Time',
        size: 150,
        Cell: ({ row }) => (
          <TimeDisplay 
            time={row.original.submission.data.submission_time} 
            size="sm"
          />
        ),
      },
    ];

    // Add columns for each case - with grouping
    filteredCases.forEach(caseItem => {
      const caseColumns: MRT_ColumnDef<SubmissionRow>[] = [];
      
      // Add metric columns (including actions)
      filteredMetrics.forEach(metric => {
        const key = `${caseItem.meta.resourceId}_${metric.id}`;
        
        // Handle action columns differently
        if (metric.type === 'action') {
          if (metric.id === '__status__') {
            caseColumns.push({
              id: key,
              header: '',
              size: 100,
              enableSorting: false,
              Cell: ({ row }) => {
                const execResult = row.original[`${caseItem.meta.resourceId}_execResult`] as ExecutionResult | undefined;
                
                if (!execResult) {
                  return <Text size="sm" c="dimmed">-</Text>;
                }

                return (
                  <Badge 
                    size="sm" 
                    color={execResult.status === 'success' ? 'green' : 'red'}
                  >
                    {execResult.status}
                  </Badge>
                );
              },
            });
          } else if (metric.id === '__log__') {
            caseColumns.push({
              id: key,
              header: '',
              size: 80,
              enableSorting: false,
              Cell: ({ row }) => {
                const execResult = row.original[`${caseItem.meta.resourceId}_execResult`] as ExecutionResult | undefined;
                
                if (!execResult?.log_url) {
                  return <Text size="sm" c="dimmed">-</Text>;
                }

                return (
                  <Tooltip label="View Log">
                    <ActionIcon
                      component="a"
                      href={execResult.log_url}
                      target="_blank"
                      size="sm"
                      variant="light"
                    >
                      <IconFileText size={16} />
                    </ActionIcon>
                  </Tooltip>
                );
              },
            });
          } else if (metric.id === '__artifact__') {
            caseColumns.push({
              id: key,
              header: '',
              size: 80,
              enableSorting: false,
              Cell: ({ row }) => {
                const execResult = row.original[`${caseItem.meta.resourceId}_execResult`] as ExecutionResult | undefined;
                
                if (!execResult?.artifact_url) {
                  return <Text size="sm" c="dimmed">-</Text>;
                }

                return (
                  <Tooltip label="View Artifact">
                    <ActionIcon
                      component="a"
                      href={execResult.artifact_url}
                      target="_blank"
                      size="sm"
                      variant="light"
                    >
                      <IconExternalLink size={16} />
                    </ActionIcon>
                  </Tooltip>
                );
              },
            });
          }
        } else {
          // Regular metric columns (score and execution)
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
        }
      });
      
      // Add case group column
      cols.push({
        id: caseItem.meta.resourceId,
        header: caseItem.data.name,
        Header: () => (
          <Badge size="lg" variant="light">
            {caseItem.data.name}
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
        <div>
          <Title order={2}>My Submissions - {mockProgram.data.name}</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Showing {mySubmissions.length} submission{mySubmissions.length !== 1 ? 's' : ''} by {CURRENT_USER}
          </Text>
        </div>
        
        <Group gap="md">
          {/* View Mode Toggle */}
          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as 'table' | 'chart')}
            data={[
              {
                value: 'table',
                label: (
                  <Group gap={8} wrap="nowrap">
                    <IconTable size={16} />
                    <span>Table</span>
                  </Group>
                ),
              },
              {
                value: 'chart',
                label: (
                  <Group gap={8} wrap="nowrap">
                    <IconChartLine size={16} />
                    <span>Chart</span>
                  </Group>
                ),
              },
            ]}
          />
          
          {/* Chart Type Selector (only show in chart mode) */}
          {viewMode === 'chart' && (
            <Select
              value={chartType}
              onChange={(value) => setChartType(value as ChartType)}
              data={[
                { value: 'trend', label: 'Trend Chart' },
                { value: 'scatter', label: 'Scatter Plot' },
                { value: 'pareto', label: 'Pareto Chart' },
              ]}
              style={{ width: 150 }}
            />
          )}
        </Group>
      </Group>

      {/* Conditionally render Table or Chart */}
      {viewMode === 'table' ? (
        <>
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
            enableStickyHeader
            enableRowVirtualization
            mantineTableContainerProps={{
              style: {
                maxHeight: 'calc(100vh - 280px)',
              },
            }}
            rowVirtualizerOptions={{
                overscan: 25, //adjust the number or rows that are rendered above and below the visible area of the table
                estimateSize: () => 100, //if your rows are taller than normal, try tweaking this value to make scrollbar size more accurate
            }}
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
                left: ['submission.data.algo_id', 'submission.data.submission_time'],
              },
            }}
          />
        </>
      ) : (
        <SubmissionCharts
          submissions={mySubmissions}
          evaluationResults={mockEvaluationResults}
          executionResults={mockExecutionResults}
          chartType={chartType}
          selectedCase={chartCase}
          selectedMetricX={chartMetricX}
          selectedMetricY={chartMetricY}
          cases={mockCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))}
          metrics={[
            ...mockEvalCode.map(e => ({ value: e.meta.resourceId, label: e.data.name })),
            { value: '__wall_time__', label: 'Wall Time' },
            { value: '__cpu_time__', label: 'CPU Time' },
            { value: '__memory__', label: 'Memory' },
          ]}
          onCaseChange={(value) => setChartCase(value || '')}
          onMetricXChange={(value) => setChartMetricX(value || '')}
          onMetricYChange={(value) => setChartMetricY(value || '')}
          algoNames={Object.fromEntries(
            mockAlgoCode.map(algo => [algo.meta.resourceId, algo.data.name])
          )}
        />
      )}
    </Stack>
  );
}
