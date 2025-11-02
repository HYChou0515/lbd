import { useMemo } from 'react';
import {
  Stack,
  Group,
  Select,
  Text,
  Card,
  Box,
} from '@mantine/core';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Resource } from '../../types/meta';
import type {
  Submission,
  EvaluationResult,
  ExecutionResult,
  ChartType,
} from '../../types/program';

interface SubmissionChartsProps {
  submissions: Resource<Submission>[];
  evaluationResults: EvaluationResult[];
  executionResults: ExecutionResult[];
  chartType: ChartType;
  selectedCase: string;
  selectedMetricX: string;
  selectedMetricY: string;
  cases: { value: string; label: string }[];
  metrics: { value: string; label: string }[];
  onCaseChange: (value: string | null) => void;
  onMetricXChange: (value: string | null) => void;
  onMetricYChange: (value: string | null) => void;
  algoNames: Record<string, string>;
}

export function SubmissionCharts({
  submissions,
  evaluationResults,
  executionResults,
  chartType,
  selectedCase,
  selectedMetricX,
  selectedMetricY,
  cases,
  metrics,
  onCaseChange,
  onMetricXChange,
  onMetricYChange,
  algoNames,
}: SubmissionChartsProps) {
  
  // Helper function to get metric value
  const getMetricValue = (submissionId: string, caseId: string, metricId: string): number | undefined => {
    const execResult = executionResults.find(
      r => r.submission_id === submissionId && r.case_id === caseId
    );
    
    if (metricId === '__wall_time__' || metricId === '__cpu_time__' || metricId === '__memory__') {
      const metricKey = metricId.replace(/__/g, '') as keyof ExecutionResult;
      return execResult?.[metricKey] as number | undefined;
    } else {
      // It's a score metric
      const evalResult = evaluationResults.find(
        r => r.submission_id === submissionId && 
             r.case_id === caseId && 
             r.eval_code_id === metricId
      );
      return evalResult?.score;
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (chartType === 'trend') {
      // Trend chart: only needs Y axis metric
      return submissions.map((submission, index) => {
        const valueY = getMetricValue(submission.meta.resourceId, selectedCase, selectedMetricY);
        
        const execResult = executionResults.find(
          r => r.submission_id === submission.meta.resourceId && r.case_id === selectedCase
        );
        
        return {
          submission_id: submission.meta.resourceId,
          algo_name: algoNames[submission.data.algo_id] || 'Unknown',
          submission_time: submission.data.submission_time,
          submission_index: index + 1,
          timestamp: new Date(submission.data.submission_time).getTime(),
          valueY: valueY ?? 0,
          wall_time: execResult?.wall_time,
          cpu_time: execResult?.cpu_time,
          memory: execResult?.memory,
        };
      }).filter(d => d.valueY !== undefined);
    } else {
      // Scatter/Pareto: needs both X and Y axis metrics
      return submissions.map((submission, index) => {
        const valueX = getMetricValue(submission.meta.resourceId, selectedCase, selectedMetricX);
        const valueY = getMetricValue(submission.meta.resourceId, selectedCase, selectedMetricY);
        
        const execResult = executionResults.find(
          r => r.submission_id === submission.meta.resourceId && r.case_id === selectedCase
        );
        
        return {
          submission_id: submission.meta.resourceId,
          algo_name: algoNames[submission.data.algo_id] || 'Unknown',
          submission_time: submission.data.submission_time,
          submission_index: index + 1,
          timestamp: new Date(submission.data.submission_time).getTime(),
          valueX: valueX ?? 0,
          valueY: valueY ?? 0,
          wall_time: execResult?.wall_time,
          cpu_time: execResult?.cpu_time,
          memory: execResult?.memory,
        };
      }).filter(d => d.valueX !== undefined && d.valueY !== undefined);
    }
  }, [submissions, evaluationResults, executionResults, selectedCase, selectedMetricX, selectedMetricY, chartType, algoNames]);

  // Calculate Pareto frontier
  const paretoFrontier = useMemo(() => {
    if (chartType !== 'pareto' || chartData.length === 0) return [];
    
    // Only calculate if chartData has valueX (i.e., scatter/pareto mode)
    const scatterData = chartData.filter((d): d is typeof chartData[number] & { valueX: number } => 
      'valueX' in d
    );
    
    if (scatterData.length === 0) return [];
    
    // Sort by X value
    const sorted = [...scatterData].sort((a, b) => a.valueX - b.valueX);
    const frontier: typeof scatterData = [];
    let maxY = -Infinity;
    
    for (const point of sorted) {
      const y = point.valueY || 0;
      if (y > maxY) {
        maxY = y;
        frontier.push(point);
      }
    }
    
    return frontier;
  }, [chartData, chartType]);

  // Format metric value for display
  const formatValue = (value: number, metricId: string) => {
    if (metricId === '__wall_time__' || metricId === '__cpu_time__') {
      return `${value.toFixed(2)}s`;
    } else if (metricId === '__memory__') {
      return `${value.toFixed(0)} MB`;
    }
    return value.toFixed(4);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const metricLabelX = metrics.find(m => m.value === selectedMetricX)?.label || 'Value X';
      const metricLabelY = metrics.find(m => m.value === selectedMetricY)?.label || 'Value Y';
      
      return (
        <Card shadow="md" padding="sm" radius="md" withBorder>
          <Stack gap="xs">
            <Text size="sm" fw={600}>{data.algo_name}</Text>
            <Text size="xs" c="dimmed">Submission #{data.submission_index}</Text>
            <Text size="xs" c="dimmed">
              {new Date(data.submission_time).toLocaleString()}
            </Text>
            {chartType === 'trend' && (
              <Text size="sm" fw={500}>
                {metricLabelY}: {formatValue(data.valueY, selectedMetricY)}
              </Text>
            )}
            {(chartType === 'scatter' || chartType === 'pareto') && (
              <>
                <Text size="sm" fw={500}>
                  {metricLabelX}: {formatValue(data.valueX, selectedMetricX)}
                </Text>
                <Text size="sm" fw={500}>
                  {metricLabelY}: {formatValue(data.valueY, selectedMetricY)}
                </Text>
              </>
            )}
            {data.wall_time !== undefined && (
              <Text size="xs" c="dimmed">Wall Time: {data.wall_time.toFixed(2)}s</Text>
            )}
          </Stack>
        </Card>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <Box style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text c="dimmed">No data available for selected filters</Text>
        </Box>
      );
    }

    const metricLabelY = metrics.find(m => m.value === selectedMetricY)?.label || 'Value Y';
    const metricLabelX = metrics.find(m => m.value === selectedMetricX)?.label || 'Value X';

    switch (chartType) {
      case 'trend':
        // Time series chart
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="submission_index" 
                label={{ value: 'Submission #', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                domain={['dataMin - dataMin * 0.1', 'dataMax + dataMax * 0.1']}
                label={{ value: metricLabelY, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="valueY" 
                stroke="#339af0" 
                strokeWidth={2}
                dot={{ fill: '#339af0', r: 4 }}
                activeDot={{ r: 6 }}
                name={metricLabelY}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        // Scatter plot: X metric vs Y metric
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="valueX" 
                name={metricLabelX}
                domain={['dataMin - dataMin * 0.1', 'dataMax + dataMax * 0.1']}
                label={{ value: metricLabelX, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="valueY" 
                name={metricLabelY}
                domain={['dataMin - dataMin * 0.1', 'dataMax + dataMax * 0.1']}
                label={{ value: metricLabelY, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter 
                name="Submissions" 
                data={chartData} 
                fill="#339af0"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'pareto':
        // Pareto chart: X vs Y with Pareto frontier line
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="valueX" 
                name={metricLabelX}
                domain={['dataMin - dataMin * 0.1', 'dataMax + dataMax * 0.1']}
                label={{ value: metricLabelX, position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="valueY" 
                name={metricLabelY}
                domain={['dataMin - dataMin * 0.1', 'dataMax + dataMax * 0.1']}
                label={{ value: metricLabelY, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {/* All submissions */}
              <Scatter 
                name="All Submissions" 
                data={chartData} 
                fill="#adb5bd"
                opacity={0.5}
              />
              {/* Pareto frontier */}
              <Scatter 
                name="Pareto Frontier" 
                data={paretoFrontier} 
                fill="#51cf66"
                shape="star"
              />
              {/* Pareto frontier line */}
              <Line 
                type="monotone" 
                dataKey="valueY" 
                data={paretoFrontier}
                stroke="#51cf66" 
                strokeWidth={2}
                dot={false}
                name="Frontier Line"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Stack gap="md">
      <Group gap="md">
        <Select
          label="Case"
          placeholder="Select case"
          data={cases}
          value={selectedCase}
          onChange={onCaseChange}
          style={{ flex: 1 }}
          searchable
        />
        
        {chartType === 'trend' ? (
          <Select
            label="Metric (Y-axis)"
            placeholder="Select metric"
            data={metrics}
            value={selectedMetricY}
            onChange={onMetricYChange}
            style={{ flex: 1 }}
            searchable
          />
        ) : (
          <>
            <Select
              label="Metric (X-axis)"
              placeholder="Select X metric"
              data={metrics}
              value={selectedMetricX}
              onChange={onMetricXChange}
              style={{ flex: 1 }}
              searchable
            />
            <Select
              label="Metric (Y-axis)"
              placeholder="Select Y metric"
              data={metrics}
              value={selectedMetricY}
              onChange={onMetricYChange}
              style={{ flex: 1 }}
              searchable
            />
          </>
        )}
      </Group>

      <Card withBorder padding="lg">
        {renderChart()}
      </Card>
      
      <Text size="xs" c="dimmed">
        Showing {chartData.length} submissions
        {chartType === 'pareto' && ` (${paretoFrontier.length} on Pareto frontier)`}
      </Text>
    </Stack>
  );
}
