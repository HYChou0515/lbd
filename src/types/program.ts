/**
 * Program 相關的類型定義
 */

/**
 * Case 類型
 */
export type CaseType = 'open data' | 'open exam' | 'close exam';
export type CodeType = "sample" | "evaluation" | "algo";
/**
 * Case 資料結構
 */
export interface Case {
  dataset_revision_id: string;
  case_type: CaseType;
  name: string;
  description: string;
}

/**
 * Code 資料結構
 */
export interface Code {
  name: string;
  description: string;
  gitlab_url: string;
  commit_hash: string;
  code_type: CodeType;
}

/**
 * Program 資料結構（比賽項目）
 */
export interface Program {
  name: string;
  description: string;
  case_ids: string[];
  code_ids: string[];
}

/**
 * Submission 資料結構
 */
export interface Submission {
  program_id: string;
  algo_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

/**
 * Execution Result（某個 submission 在某個 case 上的執行結果）
 * 包含執行層面的指標：wall_time, cpu_time, memory
 */
export interface ExecutionResult {
  submission_id: string;
  case_id: string;
  case_type: CaseType;
  wall_time: number; // 執行耗時（秒）
  cpu_time: number;
  memory: number; // MB
  status: 'success' | 'failed' | 'timeout';
  log_url?: string;
  artifact_url?: string;
}

/**
 * Evaluation Result（某個 submission 在某個 case×eval 上的評估分數）
 * 只包含評估指標：score
 */
export interface EvaluationResult {
  submission_id: string;
  case_id: string;
  eval_code_id: string;
  score: number;
  evaluated_at: string;
}

//這邊之後應概要搬去component
/**
 * Metric 類型（用於選擇顯示的指標）
 */
export type MetricType = 'score' | 'wall_time' | 'cpu_time' | 'memory';

/**
 * View 模式
 */
export type ViewMode = 'table' | 'chart';

/**
 * Chart 類型
 */
export type ChartType = 'trend' | 'scatter' | 'pareto';

/**
 * Submission 過濾器
 */
export interface SubmissionFilters {
  case_id?: string;
  eval_code_id?: string;
  metric: MetricType;
  sort_by: 'score' | 'wall_time' | 'submission_time';
  sort_order: 'asc' | 'desc';
}

/**
 * Program Tree Node（左側樹狀結構的節點）
 */
export type ProgramNodeType = 
  | 'program'
  | 'open_data'
  | 'open_exam'
  | 'close_exam'
  | 'sample_code'
  | 'eval_code'
  | 'submissions'
  | 'leaderboard'
  | 'case'
  | 'code';

export interface ProgramTreeNode {
  id: string;
  type: ProgramNodeType;
  name: string;
  children?: ProgramTreeNode[];
  data?: Case | Code | Program; // 對應的實際資料
}

/**
 * Leaderboard Entry（排行榜項目）
 */
export interface LeaderboardEntry {
  submission_id: string;
  algo_name: string;
  submitter: string;
  submission_time: string;
  overall_score: number; // 綜合分數（所有 case×eval 的平均或加權）
  case_scores: Record<string, Record<string, number>>; // case_id -> eval_id -> score
}

/**
 * Chart Data Point（圖表資料點）
 */
export interface ChartDataPoint {
  submission_id: string;
  algo_name: string;
  submission_time: string;
  x: number; // 可能是 time 或 eval1 score
  y: number; // score 或 eval2 score
  metadata?: {
    wall_time?: number;
    cpu_time?: number;
    memory?: number;
  };
}
