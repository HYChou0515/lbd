import type { 
  Program, 
  Case, 
  Code, 
  Submission, 
  ExecutionResult,
  EvaluationResult,
  LeaderboardEntry,
} from '../types/program';

/**
 * Mock Cases
 */
export const mockCases: Case[] = [
  {
    id: 'case-od1',
    dataset_revision_id: 'ds-rev-001',
    case_type: 'open data',
    name: 'OD1',
    description: 'Open Data Case 1: Basic classification task',
    creator: 'admin',
    createdTime: '2025-10-01T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-01T10:00:00Z',
  },
  {
    id: 'case-od2',
    dataset_revision_id: 'ds-rev-002',
    case_type: 'open data',
    name: 'OD2',
    description: 'Open Data Case 2: Advanced classification',
    creator: 'admin',
    createdTime: '2025-10-02T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-02T10:00:00Z',
  },
  {
    id: 'case-oe1',
    dataset_revision_id: 'ds-rev-003',
    case_type: 'open exam',
    name: 'OE1',
    description: 'Open Exam 1: Public test set',
    creator: 'admin',
    createdTime: '2025-10-05T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-05T10:00:00Z',
  },
  {
    id: 'case-oe2',
    dataset_revision_id: 'ds-rev-004',
    case_type: 'open exam',
    name: 'OE2',
    description: 'Open Exam 2: Extended test set',
    creator: 'admin',
    createdTime: '2025-10-06T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-06T10:00:00Z',
  },
  {
    id: 'case-ce1',
    dataset_revision_id: 'ds-rev-005',
    case_type: 'close exam',
    name: 'CE1',
    description: 'Close Exam 1: Hidden test set',
    creator: 'admin',
    createdTime: '2025-10-10T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-10T10:00:00Z',
  },
  {
    id: 'case-ce2',
    dataset_revision_id: 'ds-rev-006',
    case_type: 'close exam',
    name: 'CE2',
    description: 'Close Exam 2: Final evaluation',
    creator: 'admin',
    createdTime: '2025-10-11T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-11T10:00:00Z',
  },
  {
    id: 'case-ce3',
    dataset_revision_id: 'ds-rev-007',
    case_type: 'close exam',
    name: 'CE3',
    description: 'Close Exam 3: Comprehensive test',
    creator: 'admin',
    createdTime: '2025-10-12T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-12T10:00:00Z',
  },
];

/**
 * Mock Sample Code
 */
export const mockSampleCode: Code[] = [
  {
    id: 'sample-code-1',
    name: 'SC1',
    description: 'Baseline implementation using random forest',
    gitlab_url: 'https://gitlab.com/project/sample-algo',
    commit_hash: 'a1b2c3d4',
    creator: 'admin',
    createdTime: '2025-09-15T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-09-15T10:00:00Z',
  },
];

/**
 * Mock Eval Code
 */
export const mockEvalCode: Code[] = [
  {
    id: 'eval-code-1',
    name: 'EC1',
    description: 'Accuracy evaluator',
    gitlab_url: 'https://gitlab.com/project/eval-accuracy',
    commit_hash: 'e1f2g3h4',
    creator: 'admin',
    createdTime: '2025-09-10T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-09-10T10:00:00Z',
  },
  {
    id: 'eval-code-2',
    name: 'EC2',
    description: 'F1 score evaluator',
    gitlab_url: 'https://gitlab.com/project/eval-f1',
    commit_hash: 'i1j2k3l4',
    creator: 'admin',
    createdTime: '2025-09-11T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-09-11T10:00:00Z',
  },
  {
    id: 'eval-code-3',
    name: 'EC3',
    description: 'AUC evaluator',
    gitlab_url: 'https://gitlab.com/project/eval-auc',
    commit_hash: 'm1n2o3p4',
    creator: 'admin',
    createdTime: '2025-09-12T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-09-12T10:00:00Z',
  },
  {
    id: 'eval-code-4',
    name: 'EC4',
    description: 'Precision evaluator',
    gitlab_url: 'https://gitlab.com/project/eval-precision',
    commit_hash: 'q1r2s3t4',
    creator: 'admin',
    createdTime: '2025-09-13T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-09-13T10:00:00Z',
  },
];

/**
 * Mock Program
 */
export const mockProgram: Program = {
  id: 'program-001',
  name: 'ML Classification Challenge 2025',
  description: 'A comprehensive machine learning classification competition with multiple test cases and evaluation metrics.',
  cases: mockCases,
  sample_code: mockSampleCode,
  eval_code: mockEvalCode,
  creator: 'admin',
  createdTime: '2025-09-01T10:00:00Z',
  updater: 'admin',
  updatedTime: '2025-10-15T10:00:00Z',
};

/**
 * Mock Submissions
 */
export const mockSubmissions: Submission[] = [
  {
    id: 'sub-001',
    program_id: 'program-001',
    algo: {
      id: 'algo-001',
      name: 'Random Forest v1',
      description: 'Initial baseline with random forest',
      gitlab_url: 'https://gitlab.com/user/algo-rf',
      commit_hash: 'abc123',
      creator: 'user1',
      createdTime: '2025-10-20T08:00:00Z',
      updater: 'user1',
      updatedTime: '2025-10-20T08:00:00Z',
    },
    submitter: 'user1',
    submission_time: '2025-10-20T08:30:00Z',
    status: 'completed',
  },
  {
    id: 'sub-002',
    program_id: 'program-001',
    algo: {
      id: 'algo-002',
      name: 'XGBoost v1',
      description: 'XGBoost with default parameters',
      gitlab_url: 'https://gitlab.com/user/algo-xgb',
      commit_hash: 'def456',
      creator: 'user1',
      createdTime: '2025-10-21T09:00:00Z',
      updater: 'user1',
      updatedTime: '2025-10-21T09:00:00Z',
    },
    submitter: 'user1',
    submission_time: '2025-10-21T09:30:00Z',
    status: 'completed',
  },
  {
    id: 'sub-003',
    program_id: 'program-001',
    algo: {
      id: 'algo-003',
      name: 'Neural Network v1',
      description: 'Simple neural network with 2 hidden layers',
      gitlab_url: 'https://gitlab.com/user/algo-nn',
      commit_hash: 'ghi789',
      creator: 'user2',
      createdTime: '2025-10-22T10:00:00Z',
      updater: 'user2',
      updatedTime: '2025-10-22T10:00:00Z',
    },
    submitter: 'user2',
    submission_time: '2025-10-22T10:30:00Z',
    status: 'completed',
  },
  {
    id: 'sub-004',
    program_id: 'program-001',
    algo: {
      id: 'algo-004',
      name: 'XGBoost v2',
      description: 'XGBoost with tuned hyperparameters',
      gitlab_url: 'https://gitlab.com/user/algo-xgb',
      commit_hash: 'jkl012',
      creator: 'user1',
      createdTime: '2025-10-23T11:00:00Z',
      updater: 'user1',
      updatedTime: '2025-10-23T11:00:00Z',
    },
    submitter: 'user1',
    submission_time: '2025-10-23T11:30:00Z',
    status: 'completed',
  },
  {
    id: 'sub-005',
    program_id: 'program-001',
    algo: {
      id: 'algo-005',
      name: 'Ensemble v1',
      description: 'Ensemble of RF, XGB, and NN',
      gitlab_url: 'https://gitlab.com/user/algo-ensemble',
      commit_hash: 'mno345',
      creator: 'user3',
      createdTime: '2025-10-24T12:00:00Z',
      updater: 'user3',
      updatedTime: '2025-10-24T12:00:00Z',
    },
    submitter: 'user3',
    submission_time: '2025-10-24T12:30:00Z',
    status: 'completed',
  },
];

/**
 * Mock Execution Results
 * 為每個 submission × case 生成執行結果
 */
export const mockExecutionResults: ExecutionResult[] = [];

mockSubmissions.forEach((submission) => {
  mockCases.forEach((caseItem) => {
    mockExecutionResults.push({
      submission_id: submission.id,
      case_id: caseItem.id,
      wall_time: 10 + Math.random() * 50,
      cpu_time: 8 + Math.random() * 40,
      memory: 512 + Math.random() * 1024,
      status: 'success',
      log_url: `https://logs.example.com/${submission.id}/${caseItem.id}`,
      artifact_url: `https://artifacts.example.com/${submission.id}/${caseItem.id}`,
      executed_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    });
  });
});

/**
 * Mock Evaluation Results
 * 為每個 submission × case × eval 生成評估分數
 */
export const mockEvaluationResults: EvaluationResult[] = [];

// 生成所有組合的評估結果
mockSubmissions.forEach((submission, subIdx) => {
  mockCases.forEach((caseItem) => {
    mockEvalCode.forEach((evalCode, evalIdx) => {
      // 模擬不同的分數
      const baseScore = 0.75 + (subIdx * 0.03) + (Math.random() * 0.1);
      const score = Math.min(0.99, baseScore + (evalIdx * 0.02));
      
      mockEvaluationResults.push({
        submission_id: submission.id,
        case_id: caseItem.id,
        eval_code_id: evalCode.id,
        score: parseFloat(score.toFixed(4)),
        evaluated_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      });
    });
  });
});

/**
 * 計算 Leaderboard
 */
export function calculateLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  
  mockSubmissions.forEach(submission => {
    const submissionResults = mockEvaluationResults.filter(
      r => r.submission_id === submission.id
    );
    
    // 計算 overall score（所有 case×eval 的平均分）
    const overallScore = submissionResults.reduce((sum, r) => sum + r.score, 0) / submissionResults.length;
    
    // 組織 case_scores: { case_id: { eval_id: score } }
    const caseScores: Record<string, Record<string, number>> = {};
    submissionResults.forEach(result => {
      if (!caseScores[result.case_id]) {
        caseScores[result.case_id] = {};
      }
      caseScores[result.case_id][result.eval_code_id] = result.score;
    });
    
    entries.push({
      submission_id: submission.id,
      algo_name: submission.algo.name,
      submitter: submission.submitter,
      submission_time: submission.submission_time,
      overall_score: parseFloat(overallScore.toFixed(4)),
      case_scores: caseScores,
    });
  });
  
  // 按 overall_score 降序排列
  return entries.sort((a, b) => b.overall_score - a.overall_score);
}

export const mockLeaderboard = calculateLeaderboard();
