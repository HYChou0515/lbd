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
  Avatar,
  Tabs,
  Stack,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { 
  mockProgram, 
  mockSubmissions, 
  mockEvaluationResults,
  mockExecutionResults,
  mockAlgoCode,
  mockCases,
  mockEvalCode,
} from '../../data/mockProgramData';
import type { 
  ExecutionResult,
  EvaluationResult,
  Submission,
} from '../../types/program';
import type { Resource } from '../../types/meta';
import { TimeDisplay } from '../TimeDisplay';

interface LeaderboardSectionProps {
  programId: string;
  caseType?: 'open data' | 'open exam' | 'close exam';
  onViewDetail?: (submissionId: string) => void;
}

interface LeaderboardRow {
  rank: number;
  user: string;
  submission: Resource<Submission>;
  algorithm: string;
  submissionTime: string;
  finalScore?: number;
  [key: string]: string | number | Resource<Submission> | ExecutionResult | EvaluationResult | undefined;
}

const CURRENT_USER = 'user1';

type CaseType = 'open data' | 'open exam' | 'close exam';

export function LeaderboardSection({ programId, onViewDetail, caseType }: LeaderboardSectionProps) {
  const navigate = useNavigate();
  const program = mockProgram;

  // Active tab state - set based on caseType if provided
  const getInitialTab = () => {
    if (caseType === 'open data') return 'open-data';
    if (caseType === 'open exam') return 'open-exam';
    if (caseType === 'close exam') return 'close-exam';
    return 'open-data';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Get available cases by type
  const openDataCases = useMemo(() => 
    mockCases.filter(c => c.data.case_type === 'open data' && program.data.case_ids.includes(c.meta.resourceId)),
    [program.data.case_ids]
  );

  const openExamCases = useMemo(() => 
    mockCases.filter(c => c.data.case_type === 'open exam' && program.data.case_ids.includes(c.meta.resourceId)),
    [program.data.case_ids]
  );

  const closeExamCases = useMemo(() => 
    mockCases.filter(c => c.data.case_type === 'close exam' && program.data.case_ids.includes(c.meta.resourceId)),
    [program.data.case_ids]
  );

  // Case selection state per tab
  const [selectedODCases, setSelectedODCases] = useState<string[]>([]);
  const [selectedOECases, setSelectedOECases] = useState<string[]>([]);
  const [selectedCECases, setSelectedCECases] = useState<string[]>([]);

  // Evaluation metrics selection state per tab
  const [selectedODEvals, setSelectedODEvals] = useState<string[]>([]);
  const [selectedOEEvals, setSelectedOEEvals] = useState<string[]>([]);
  const [selectedCEEvals, setSelectedCEEvals] = useState<string[]>([]);

  // Get available evaluation metrics
  const availableEvals = useMemo(() => {
    return mockEvalCode;
  }, []);

  // Helper function to compute leaderboard data for a specific case type
  const computeLeaderboardData = (caseType: CaseType, selectedCases: string[], selectedEvals: string[]) => {
    const userSubmissions = new Map<string, Resource<Submission>>();
    
    // Group submissions by user and keep only the most recent one
    mockSubmissions.forEach((submission) => {
      const userId = submission.data.submitter;
      const existing = userSubmissions.get(userId);
      
      if (!existing || 
          new Date(submission.data.submission_time) > new Date(existing.data.submission_time)) {
        userSubmissions.set(userId, submission);
      }
    });

    // Get cases for this type
    const typeCases = mockCases.filter(c => 
      c.data.case_type === caseType && 
      program.data.case_ids.includes(c.meta.resourceId) &&
      (selectedCases.length === 0 || selectedCases.includes(c.meta.resourceId))
    );

    // Get metrics
    const allMetrics = [
      ...mockEvalCode.map(e => ({ id: e.meta.resourceId, name: e.data.name, type: 'score' as const })),
      { id: '__wall_time__', name: 'Wall Time', type: 'execution' as const },
      { id: '__cpu_time__', name: 'CPU Time', type: 'execution' as const },
      { id: '__memory__', name: 'Memory', type: 'execution' as const },
    ];
    
    const filteredMetrics = selectedEvals.length > 0
      ? allMetrics.filter(m => selectedEvals.includes(m.id))
      : allMetrics;

    // Convert to array format with final score and all metrics
    const data: LeaderboardRow[] = [];
    
    userSubmissions.forEach((submission, userId) => {
      const algo = mockAlgoCode.find(a => a.meta.resourceId === submission.data.algo_id);
      
      // Calculate final score (first case's first eval)
      let finalScore: number | undefined;
      if (typeCases.length > 0 && filteredMetrics.length > 0) {
        const firstCase = typeCases[0];
        const firstScoreMetric = filteredMetrics.find(m => m.type === 'score');
        
        if (firstScoreMetric) {
          const evalResult = mockEvaluationResults.find(r => 
            r.submission_id === submission.meta.resourceId &&
            r.case_id === firstCase.meta.resourceId &&
            r.eval_code_id === firstScoreMetric.id
          );
          finalScore = evalResult?.score;
        }
      }
      
      const row: LeaderboardRow = {
        rank: 0, // Will be set after sorting
        user: userId,
        submission,
        algorithm: algo?.data.name || submission.data.algo_id,
        submissionTime: submission.data.submission_time,
        finalScore,
      };

      // Add data for each case
      typeCases.forEach(caseItem => {
        const execResult = mockExecutionResults.find(
          r => r.submission_id === submission.meta.resourceId && r.case_id === caseItem.meta.resourceId
        );
        
        if (execResult) {
          // Add evaluation results
          filteredMetrics.forEach(metric => {
            const key = `${caseItem.meta.resourceId}_${metric.id}`;
            
            if (metric.type === 'score') {
              const evalResult = mockEvaluationResults.find(
                r => r.submission_id === submission.meta.resourceId && 
                    r.case_id === caseItem.meta.resourceId && 
                    r.eval_code_id === metric.id
              );
              row[key] = evalResult?.score;
            } else if (metric.type === 'execution') {
              if (metric.id === '__wall_time__') row[key] = execResult.wall_time;
              else if (metric.id === '__cpu_time__') row[key] = execResult.cpu_time;
              else if (metric.id === '__memory__') row[key] = execResult.memory;
            }
          });
        }
      });

      data.push(row);
    });

    // Sort by final score (descending), then by submission time
    const sorted = data.sort((a, b) => {
      if (a.finalScore !== undefined && b.finalScore !== undefined) {
        if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      }
      if (a.finalScore !== undefined && b.finalScore === undefined) return -1;
      if (a.finalScore === undefined && b.finalScore !== undefined) return 1;
      return new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime();
    });

    // Assign ranks
    sorted.forEach((row, index) => {
      row.rank = index + 1;
    });

    return { data: sorted, cases: typeCases, metrics: filteredMetrics };
  };

  // Compute data for each tab
  const openDataLeaderboard = useMemo(() => 
    computeLeaderboardData('open data', selectedODCases, selectedODEvals),
    [selectedODCases, selectedODEvals]
  );

  const openExamLeaderboard = useMemo(() => 
    computeLeaderboardData('open exam', selectedOECases, selectedOEEvals),
    [selectedOECases, selectedOEEvals]
  );

  const closeExamLeaderboard = useMemo(() => 
    computeLeaderboardData('close exam', selectedCECases, selectedCEEvals),
    [selectedCECases, selectedCEEvals]
  );

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

  // Build table columns for a specific dataset
  const buildColumns = (cases: typeof mockCases, metrics: ReturnType<typeof computeLeaderboardData>['metrics']): MRT_ColumnDef<LeaderboardRow>[] => {
    const cols: MRT_ColumnDef<LeaderboardRow>[] = [
      {
        accessorKey: 'rank',
        header: 'Rank',
        size: 80,
        enableResizing: false,
        Cell: ({ row }) => (
          <Text size="sm" fw={700} c={row.original.rank <= 3 ? 'blue' : undefined}>
            #{row.original.rank}
          </Text>
        ),
      },
      {
        accessorKey: 'user',
        header: 'User',
        size: 150,
        enableResizing: false,
        Cell: ({ row }) => (
          <Group gap="sm">
            <Avatar size="sm" radius="xl" color="blue">
              {row.original.user.charAt(0).toUpperCase()}
            </Avatar>
            <Text size="sm" fw={row.original.user === CURRENT_USER ? 700 : 400}>
              {row.original.user}
            </Text>
            {row.original.user === CURRENT_USER && (
              <Badge size="xs" variant="light" color="blue">You</Badge>
            )}
          </Group>
        ),
      },
      {
        accessorKey: 'algorithm',
        header: 'Algorithm',
        size: 250,
        Cell: ({ row }) => (
          <Group gap="xs">
            <Text size="sm" fw={500}>
              {row.original.algorithm}
            </Text>
            {row.original.user === CURRENT_USER && (
              <Tooltip label="View submission files">
                <ActionIcon
                  size="sm"
                  variant="light"
                  color="blue"
                  onClick={() => {
                    const submissionId = row.original.submission.meta.resourceId;
                    navigate({ 
                      to: '/programs/$programId/submissions/$submissionId', 
                      params: { programId, submissionId } 
                    });
                    onViewDetail?.(submissionId);
                  }}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        ),
      },
      {
        accessorKey: 'submissionTime',
        header: 'Submission Time',
        size: 180,
        Cell: ({ row }) => (
          <TimeDisplay time={row.original.submission.data.submission_time} />
        ),
      },
      {
        accessorKey: 'finalScore',
        header: 'Final Score',
        size: 120,
        Cell: ({ row }) => (
          <Text size="sm" fw={600} c={row.original.finalScore !== undefined ? 'blue' : 'dimmed'}>
            {row.original.finalScore !== undefined ? row.original.finalScore.toFixed(4) : '-'}
          </Text>
        ),
      },
    ];

    // Add columns for each case - with grouping
    cases.forEach(caseItem => {
      const caseColumns: MRT_ColumnDef<LeaderboardRow>[] = [];

      metrics.forEach(metric => {
        const key = `${caseItem.meta.resourceId}_${metric.id}`;
        
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
            const value = row.original[key] as number | undefined;
            return (
              <Text size="xs">
                {formatMetric(value, metric.type === 'score' ? 'score' : metric.id.replace('__', ''))}
              </Text>
            );
          },
        });
      });

      // Add grouped columns
      cols.push({
        id: `case_${caseItem.meta.resourceId}`,
        header: caseItem.data.name,
        columns: caseColumns,
        Header: () => (
          <Text size="sm" fw={600}>
            {caseItem.data.name}
          </Text>
        ),
      });
    });

    return cols;
  };

  // Render a leaderboard table for a specific case type
  const renderLeaderboard = (
    data: LeaderboardRow[], 
    cases: typeof mockCases, 
    metrics: ReturnType<typeof computeLeaderboardData>['metrics'],
    selectedCases: string[],
    setSelectedCases: (cases: string[]) => void,
    selectedEvals: string[],
    setSelectedEvals: (evals: string[]) => void,
    caseOptions: { value: string; label: string }[]
  ) => {
    const columns = buildColumns(cases, metrics);

    // Evaluation metrics options
    const evalOptions = [
      {
        group: 'Scores',
        items: availableEvals.map(e => ({ value: e.meta.resourceId, label: e.data.name }))
      },
      {
        group: 'Execution Metrics',
        items: [
          { value: '__wall_time__', label: 'Wall Time' },
          { value: '__cpu_time__', label: 'CPU Time' },
          { value: '__memory__', label: 'Memory' },
        ]
      },
    ];

    return (
      <Stack gap="md">
        <Group gap="md">
          <MultiSelect
            label="Cases"
            placeholder="All cases"
            data={caseOptions}
            value={selectedCases}
            onChange={setSelectedCases}
            clearable
            searchable
            w={300}
          />
          <MultiSelect
            label="Metrics"
            placeholder="All metrics"
            data={evalOptions}
            value={selectedEvals}
            onChange={setSelectedEvals}
            clearable
            searchable
            w={300}
          />
        </Group>

        <Box>
          <MantineReactTable
            columns={columns}
            data={data}
            enableRowVirtualization
            enableColumnPinning
            enablePinning
            initialState={{
              columnPinning: { left: ['rank', 'user', 'algorithm', 'submissionTime', 'finalScore'] },
              showGlobalFilter: true,
            }}
            enableGlobalFilter
            positionGlobalFilter="left"
            enableSorting={false}
            enableColumnFilters={false}
            enableFilters={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableColumnOrdering={false}
            enableColumnActions={false}
            enableTopToolbar
            enableBottomToolbar={false}
            mantineTableBodyRowProps={({ row }) => ({
              style: {
                backgroundColor: row.original.user === CURRENT_USER 
                  ? 'rgba(34, 139, 230, 0.08)' 
                  : undefined,
              },
            })}
            mantineTableProps={{
              highlightOnHover: true,
            }}
            mantineTableContainerProps={{
              style: { maxHeight: '600px' },
            }}
          />
        </Box>
      </Stack>
    );
  };

  // If caseType is specified, render single leaderboard without tabs
  if (caseType) {
    if (caseType === 'open data') {
      return renderLeaderboard(
        openDataLeaderboard.data,
        openDataLeaderboard.cases,
        openDataLeaderboard.metrics,
        selectedODCases,
        setSelectedODCases,
        selectedODEvals,
        setSelectedODEvals,
        openDataCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))
      );
    } else if (caseType === 'open exam') {
      return renderLeaderboard(
        openExamLeaderboard.data,
        openExamLeaderboard.cases,
        openExamLeaderboard.metrics,
        selectedOECases,
        setSelectedOECases,
        selectedOEEvals,
        setSelectedOEEvals,
        openExamCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))
      );
    } else if (caseType === 'close exam') {
      return renderLeaderboard(
        closeExamLeaderboard.data,
        closeExamLeaderboard.cases,
        closeExamLeaderboard.metrics,
        selectedCECases,
        setSelectedCECases,
        selectedCEEvals,
        setSelectedCEEvals,
        closeExamCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))
      );
    }
  }

  // Otherwise, render tabs for all three types
  return (
    <Box>
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'open-data')}>
        <Tabs.List>
          <Tabs.Tab value="open-data">Open Data</Tabs.Tab>
          <Tabs.Tab value="open-exam">Open Exam</Tabs.Tab>
          <Tabs.Tab value="close-exam">Close Exam</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="open-data" pt="md">
          {renderLeaderboard(
            openDataLeaderboard.data,
            openDataLeaderboard.cases,
            openDataLeaderboard.metrics,
            selectedODCases,
            setSelectedODCases,
            selectedODEvals,
            setSelectedODEvals,
            openDataCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))
          )}
        </Tabs.Panel>

        <Tabs.Panel value="open-exam" pt="md">
          {renderLeaderboard(
            openExamLeaderboard.data,
            openExamLeaderboard.cases,
            openExamLeaderboard.metrics,
            selectedOECases,
            setSelectedOECases,
            selectedOEEvals,
            setSelectedOEEvals,
            openExamCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))
          )}
        </Tabs.Panel>

        <Tabs.Panel value="close-exam" pt="md">
          {renderLeaderboard(
            closeExamLeaderboard.data,
            closeExamLeaderboard.cases,
            closeExamLeaderboard.metrics,
            selectedCECases,
            setSelectedCECases,
            selectedCEEvals,
            setSelectedCEEvals,
            closeExamCases.map(c => ({ value: c.meta.resourceId, label: c.data.name }))
          )}
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
