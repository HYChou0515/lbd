import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Group,
  MultiSelect,
  Text,
  Badge,
  Box,
  Tooltip,
  ActionIcon,
  SegmentedControl,
  Select,
  Stack,
} from '@mantine/core';
import {
  IconExternalLink,
  IconTable,
  IconChartLine,
  IconEye,
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
} from '../../data/mockProgramData';
import type { 
  ExecutionResult,
  EvaluationResult,
  Submission,
  ChartType,
} from '../../types/program';
import type { Resource } from '../../types/meta';
import { TimeDisplay } from '../TimeDisplay';
import { SubmissionCharts } from './SubmissionCharts';

// Table row type
type SubmissionRow = {
  submission: Resource<Submission>;
  [key: string]: any; // Dynamic fields for case metrics
};

// Current user (in real app, this would come from auth context)
const CURRENT_USER = 'user1';

interface SubmissionSectionProps {
  onViewDetail?: (submissionId: string | null) => void;
  programId: string;
}

export function SubmissionSection({ onViewDetail, programId }: SubmissionSectionProps) {
  const navigate = useNavigate();
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
  
  // Get only cases that have execution results
  const availableCaseIds = useMemo(() => {
    const caseIds = new Set<string>();
    mockExecutionResults.forEach(result => {
      caseIds.add(result.case_id);
    });
    return Array.from(caseIds);
  }, []);
  
  const availableCases = useMemo(() => {
    return mockCases.filter(c => availableCaseIds.includes(c.meta.resourceId));
  }, [availableCaseIds]);
  
  // Chart filters (single selection)
  const [chartCase, setChartCase] = useState<string>(availableCases[0]?.meta.resourceId || '');
  const [chartMetricX, setChartMetricX] = useState<string>(mockEvalCode[0]?.meta.resourceId || '');
  const [chartMetricY, setChartMetricY] = useState<string>(mockEvalCode[1]?.meta.resourceId || mockEvalCode[0]?.meta.resourceId || '');

  // Prepare filter options (without 'all' option for MultiSelect)
  // Group cases by type - only show available cases
  const openDataCases = availableCases.filter(c => c.data.case_type === 'open data');
  const openExamCases = availableCases.filter(c => c.data.case_type === 'open exam');
  const closeExamCases = availableCases.filter(c => c.data.case_type === 'close exam');
  
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
      ]
    },
  ];

  // Get filtered cases and metrics
  const filteredCases = selectedCases.length > 0
    ? availableCases.filter(c => selectedCases.includes(c.meta.resourceId))
    : availableCases;
    
  const allMetrics = [
    ...mockEvalCode.map(e => ({ id: e.meta.resourceId, name: e.data.name, type: 'score' as const })),
    { id: '__wall_time__', name: 'Wall Time', type: 'execution' as const },
    { id: '__cpu_time__', name: 'CPU Time', type: 'execution' as const },
    { id: '__memory__', name: 'Memory', type: 'execution' as const },
    { id: '__status__', name: '', type: 'action' as const },
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
    const data = mySubmissions.map(submission => {
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
    
    return data;
  }, [mySubmissions, filteredCases, filteredMetrics, availableCaseIds]);

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
                <Stack gap="0">
          <Tooltip label="View submission files">
            <ActionIcon
              size="sm"
              variant="light"
              color="blue"
              onClick={() => {
                const submissionId = row.original.submission.meta.resourceId;
                // Navigate to submission detail URL
                navigate({ 
                  to: '/programs/$programId/submissions/$submissionId', 
                  params: { programId, submissionId } 
                });
                // Also call the callback for state management
                onViewDetail?.(submissionId);
              }}
            >
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
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
              </Stack>
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
              size: 95,
              enableResizing: false,
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
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with ContentViewer style */}
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" c="dimmed" ff="monospace">
            My Submissions - {mockProgram.data.name} ({mySubmissions.length} submission{mySubmissions.length !== 1 ? 's' : ''})
          </Text>
          
          <Group gap="xs">
            {/* View Mode Toggle */}
            <SegmentedControl
              size="xs"
              value={viewMode}
              onChange={(value) => setViewMode(value as 'table' | 'chart')}
              data={[
                {
                  value: 'table',
                  label: (
                    <Group gap={4} wrap="nowrap">
                      <IconTable size={14} />
                      <span>Table</span>
                    </Group>
                  ),
                },
                {
                  value: 'chart',
                  label: (
                    <Group gap={4} wrap="nowrap">
                      <IconChartLine size={14} />
                      <span>Chart</span>
                    </Group>
                  ),
                },
              ]}
            />
            
            {/* Chart Type Selector (only show in chart mode) */}
            {viewMode === 'chart' && (
              <Select
                size="xs"
                value={chartType}
                onChange={(value) => setChartType(value as ChartType)}
                data={[
                  { value: 'trend', label: 'Trend' },
                  { value: 'scatter', label: 'Scatter' },
                  { value: 'pareto', label: 'Pareto' },
                ]}
                style={{ width: 120 }}
              />
            )}
          </Group>
        </Group>
      </Box>

      {/* Main content area */}
      <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'table' ? (
          <>
            {/* Filters */}
            <Box p="md" pb={0} style={{ flexShrink: 0 }}>
              <Group gap="md">
                <MultiSelect
                  size="xs"
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
                  size="xs"
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
            </Box>

            {/* Table */}
            <Box px="md" pb="md" pt="sm" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
                enableStickyHeader
                enableColumnPinning
                enableRowVirtualization
                mantineTableContainerProps={{
                  style: {
                    maxHeight: '60vh',
                  },
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
                    left: ['submission.data.algo_id', 'submission.data.submission_time', 'view_detail'],
                  },
                }}
              />
            </Box>
          </>
        ) : (
          <Box p="md" style={{ height: '100%', overflow: 'auto' }}>
            <SubmissionCharts
              submissions={mySubmissions}
              evaluationResults={mockEvaluationResults}
              executionResults={mockExecutionResults}
              chartType={chartType}
              selectedCase={chartCase}
              selectedMetricX={chartMetricX}
              selectedMetricY={chartMetricY}
              cases={availableCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))}
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
          </Box>
        )}
      </Box>
    </Box>
  );
}
