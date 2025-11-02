import type { 
  Program, 
  Case, 
  Code, 
  Submission, 
  ExecutionResult,
  EvaluationResult,
  LeaderboardEntry,
} from '../types/program';
import type { Resource } from '../types/meta';

/**
 * Helper type for working with Resources
 */
type CaseResource = Resource<Case>;
type CodeResource = Resource<Code>;
type ProgramResource = Resource<Program>;
type SubmissionResource = Resource<Submission>;

/**
 * Mock Cases
 */
export const mockCases: CaseResource[] = [
  {
    meta: {
      resourceId: 'case-od1',
      revisionId: 'case-od1-v1',
      creator: 'admin',
      createdTime: '2025-10-01T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-10-01T10:00:00Z',
    },
    data: {
      dataset_revision_id: 'ds-rev-001',
      case_type: 'open data',
      name: 'OD1',
      description: 'Open Data Case 1: Basic classification task',
    },
  },
  {
    meta: {
      resourceId: 'case-od2',
      revisionId: 'case-od2-v1',
      creator: 'admin',
      createdTime: '2025-10-02T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-10-02T10:00:00Z',
    },
    data: {
      dataset_revision_id: 'ds-rev-002',
      case_type: 'open data',
      name: 'OD2',
      description: 'Open Data Case 2: Advanced classification',
    },
  },
  {
    meta: {
      resourceId: 'case-oe1',
      revisionId: 'case-oe1-v1',
      creator: 'admin',
      createdTime: '2025-10-05T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-10-05T10:00:00Z',
    },
    data: {
      dataset_revision_id: 'ds-rev-003',
      case_type: 'open exam',
      name: 'OE1',
      description: 'Open Exam 1: Public test set',
    },
  },
  {
    meta: {
      resourceId: 'case-oe2',
      revisionId: 'case-oe2-v1',
      creator: 'admin',
      createdTime: '2025-10-06T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-10-06T10:00:00Z',
    },
    data: {
      dataset_revision_id: 'ds-rev-004',
      case_type: 'open exam',
      name: 'OE2',
      description: 'Open Exam 2: Extended test set',
    },
  },
  {
    meta: {
      resourceId: 'case-ce1',
      revisionId: 'case-ce1-v1',
      creator: 'admin',
      createdTime: '2025-10-10T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-10-10T10:00:00Z',
    },
    data: {
      dataset_revision_id: 'ds-rev-005',
      case_type: 'close exam',
      name: 'CE1',
      description: 'Close Exam 1: Hidden test set',
    },
  },
  {
    meta: {
      resourceId: 'case-ce2',
      revisionId: 'case-ce2-v1',
      creator: 'admin',
      createdTime: '2025-10-11T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-10-11T10:00:00Z',
    },
    data: {
      dataset_revision_id: 'ds-rev-006',
      case_type: 'close exam',
      name: 'CE2',
      description: 'Close Exam 2: Final evaluation',
    },
  },
  {
    meta: {
      resourceId: 'case-ce3',
      revisionId: 'case-ce3-v1',
      creator: 'admin',
      createdTime: '2025-10-12T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-10-12T10:00:00Z',
    },
    data: {
      dataset_revision_id: 'ds-rev-007',
      case_type: 'close exam',
      name: 'CE3',
      description: 'Close Exam 3: Comprehensive test',
    },
  },
];

/**
 * Mock Sample Code
 */
export const mockSampleCode: CodeResource[] = [
  {
    meta: {
      resourceId: 'sample-code-1',
      revisionId: 'sample-code-1-v1',
      creator: 'admin',
      createdTime: '2025-09-15T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-09-15T10:00:00Z',
    },
    data: {
      name: 'SC1',
      description: 'Baseline implementation using random forest',
      gitlab_url: 'https://gitlab.com/project/sample-algo',
      commit_hash: 'a1b2c3d4',
      code_type: 'sample',
    },
  },
];

/**
 * Mock Eval Code
 */
export const mockEvalCode: CodeResource[] = [
  {
    meta: {
      resourceId: 'eval-code-1',
      revisionId: 'eval-code-1-v1',
      creator: 'admin',
      createdTime: '2025-09-10T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-09-10T10:00:00Z',
    },
    data: {
      name: 'EC1',
      description: 'Accuracy evaluator',
      gitlab_url: 'https://gitlab.com/project/eval-accuracy',
      commit_hash: 'e1f2g3h4',
      code_type: 'evaluation',
    },
  },
  {
    meta: {
      resourceId: 'eval-code-2',
      revisionId: 'eval-code-2-v1',
      creator: 'admin',
      createdTime: '2025-09-11T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-09-11T10:00:00Z',
    },
    data: {
      name: 'EC2',
      description: 'F1 score evaluator',
      gitlab_url: 'https://gitlab.com/project/eval-f1',
      commit_hash: 'i1j2k3l4',
      code_type: 'evaluation',
    },
  },
  {
    meta: {
      resourceId: 'eval-code-3',
      revisionId: 'eval-code-3-v1',
      creator: 'admin',
      createdTime: '2025-09-12T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-09-12T10:00:00Z',
    },
    data: {
      name: 'EC3',
      description: 'AUC evaluator',
      gitlab_url: 'https://gitlab.com/project/eval-auc',
      commit_hash: 'm1n2o3p4',
      code_type: 'evaluation',
    },
  },
  {
    meta: {
      resourceId: 'eval-code-4',
      revisionId: 'eval-code-4-v1',
      creator: 'admin',
      createdTime: '2025-09-13T10:00:00Z',
      updater: 'admin',
      updatedTime: '2025-09-13T10:00:00Z',
    },
    data: {
      name: 'EC4',
      description: 'Precision evaluator',
      gitlab_url: 'https://gitlab.com/project/eval-precision',
      commit_hash: 'q1r2s3t4',
      code_type: 'evaluation',
    },
  },
];

/**
 * Mock Algo Code (for submissions)
 */
export const mockAlgoCode: CodeResource[] = [
  {
    meta: {
      resourceId: 'algo-rf-v1',
      revisionId: 'algo-rf-v1-r1',
      creator: 'user1',
      createdTime: '2025-10-20T10:00:00Z',
      updater: 'user1',
      updatedTime: '2025-10-20T10:00:00Z',
    },
    data: {
      name: 'Random Forest v1',
      description: 'Initial random forest implementation',
      gitlab_url: 'https://gitlab.com/user1/rf-model',
      commit_hash: 'abc123',
      code_type: 'algo',
    },
  },
  {
    meta: {
      resourceId: 'algo-rf-v2',
      revisionId: 'algo-rf-v2-r1',
      creator: 'user1',
      createdTime: '2025-10-21T10:00:00Z',
      updater: 'user1',
      updatedTime: '2025-10-21T10:00:00Z',
    },
    data: {
      name: 'Random Forest v2',
      description: 'Improved random forest with tuning',
      gitlab_url: 'https://gitlab.com/user1/rf-model',
      commit_hash: 'def456',
      code_type: 'algo',
    },
  },
  {
    meta: {
      resourceId: 'algo-xgb-v1',
      revisionId: 'algo-xgb-v1-r1',
      creator: 'user2',
      createdTime: '2025-10-22T10:00:00Z',
      updater: 'user2',
      updatedTime: '2025-10-22T10:00:00Z',
    },
    data: {
      name: 'XGBoost v1',
      description: 'XGBoost baseline',
      gitlab_url: 'https://gitlab.com/user2/xgboost-model',
      commit_hash: 'ghi789',
      code_type: 'algo',
    },
  },
  {
    meta: {
      resourceId: 'algo-xgb-v2',
      revisionId: 'algo-xgb-v2-r1',
      creator: 'user2',
      createdTime: '2025-10-23T10:00:00Z',
      updater: 'user2',
      updatedTime: '2025-10-23T10:00:00Z',
    },
    data: {
      name: 'XGBoost v2',
      description: 'XGBoost with feature engineering',
      gitlab_url: 'https://gitlab.com/user2/xgboost-model',
      commit_hash: 'jkl012',
      code_type: 'algo',
    },
  },
  {
    meta: {
      resourceId: 'algo-nn-v1',
      revisionId: 'algo-nn-v1-r1',
      creator: 'user3',
      createdTime: '2025-10-24T10:00:00Z',
      updater: 'user3',
      updatedTime: '2025-10-24T10:00:00Z',
    },
    data: {
      name: 'Neural Network',
      description: 'Deep learning approach',
      gitlab_url: 'https://gitlab.com/user3/neural-net',
      commit_hash: 'mno345',
      code_type: 'algo',
    },
  },
];

/**
 * Mock Program
 */
export const mockProgram: ProgramResource = {
  meta: {
    resourceId: 'program-001',
    revisionId: 'program-001-v1',
    creator: 'admin',
    createdTime: '2025-09-01T10:00:00Z',
    updater: 'admin',
    updatedTime: '2025-10-01T10:00:00Z',
  },
  data: {
    name: 'ML Classification Challenge 2025',
    description: 'A comprehensive machine learning classification competition',
    case_ids: mockCases.map(c => c.meta.resourceId),
    code_ids: [...mockSampleCode.map(c => c.meta.resourceId), ...mockEvalCode.map(c => c.meta.resourceId)],
  },
};

/**
 * Mock Submissions
 */
export const mockSubmissions: SubmissionResource[] = [
  {
    meta: {
      resourceId: 'sub-001',
      revisionId: 'sub-001-v1',
      creator: 'user1',
      createdTime: '2025-10-20T14:30:00Z',
      updater: 'user1',
      updatedTime: '2025-10-20T14:30:00Z',
    },
    data: {
      program_id: mockProgram.meta.resourceId,
      algo_id: mockAlgoCode[0].meta.resourceId,
      submitter: 'user1',
      submission_time: '2025-10-20T14:30:00Z',
      status: 'completed',
    },
  },
  {
    meta: {
      resourceId: 'sub-002',
      revisionId: 'sub-002-v1',
      creator: 'user1',
      createdTime: '2025-10-21T15:45:00Z',
      updater: 'user1',
      updatedTime: '2025-10-21T15:45:00Z',
    },
    data: {
      program_id: mockProgram.meta.resourceId,
      algo_id: mockAlgoCode[1].meta.resourceId,
      submitter: 'user1',
      submission_time: '2025-10-21T15:45:00Z',
      status: 'completed',
    },
  },
  {
    meta: {
      resourceId: 'sub-003',
      revisionId: 'sub-003-v1',
      creator: 'user2',
      createdTime: '2025-10-22T09:15:00Z',
      updater: 'user2',
      updatedTime: '2025-10-22T09:15:00Z',
    },
    data: {
      program_id: mockProgram.meta.resourceId,
      algo_id: mockAlgoCode[2].meta.resourceId,
      submitter: 'user2',
      submission_time: '2025-10-22T09:15:00Z',
      status: 'completed',
    },
  },
  {
    meta: {
      resourceId: 'sub-004',
      revisionId: 'sub-004-v1',
      creator: 'user2',
      createdTime: '2025-10-23T16:20:00Z',
      updater: 'user2',
      updatedTime: '2025-10-23T16:20:00Z',
    },
    data: {
      program_id: mockProgram.meta.resourceId,
      algo_id: mockAlgoCode[3].meta.resourceId,
      submitter: 'user2',
      submission_time: '2025-10-23T16:20:00Z',
      status: 'completed',
    },
  },
  {
    meta: {
      resourceId: 'sub-005',
      revisionId: 'sub-005-v1',
      creator: 'user3',
      createdTime: '2025-10-24T11:00:00Z',
      updater: 'user3',
      updatedTime: '2025-10-24T11:00:00Z',
    },
    data: {
      program_id: mockProgram.meta.resourceId,
      algo_id: mockAlgoCode[4].meta.resourceId,
      submitter: 'user3',
      submission_time: '2025-10-24T11:00:00Z',
      status: 'completed',
    },
  },
];

/**
 * Generate Mock Execution Results
 */
export const mockExecutionResults: ExecutionResult[] = [];
mockSubmissions.forEach((submission) => {
  mockCases.forEach((caseItem) => {
    mockExecutionResults.push({
      submission_id: submission.meta.resourceId,
      case_id: caseItem.meta.resourceId,
      wall_time: Math.random() * 10 + 1,
      cpu_time: Math.random() * 8 + 0.5,
      memory: Math.random() * 500 + 100,
      status: Math.random() > 0.1 ? 'success' : 'failed',
      log_url: `https://logs.example.com/${submission.meta.resourceId}/${caseItem.meta.resourceId}`,
      artifact_url: `https://artifacts.example.com/${submission.meta.resourceId}/${caseItem.meta.resourceId}`,
    });
  });
});

/**
 * Generate Mock Evaluation Results
 */
export const mockEvaluationResults: EvaluationResult[] = [];
mockSubmissions.forEach((submission, subIdx) => {
  mockCases.forEach((caseItem) => {
    mockEvalCode.forEach((evalCode, evalIdx) => {
      const baseScore = 0.6 + (subIdx * 0.05) + (evalIdx * 0.03);
      const variance = (Math.random() - 0.5) * 0.1;
      const score = Math.min(1.0, Math.max(0.0, baseScore + variance));
      
      mockEvaluationResults.push({
        submission_id: submission.meta.resourceId,
        case_id: caseItem.meta.resourceId,
        eval_code_id: evalCode.meta.resourceId,
        score: score,
        evaluated_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      });
    });
  });
});

/**
 * Calculate leaderboard
 */
export function calculateLeaderboard(): LeaderboardEntry[] {
  return mockSubmissions.map(submission => {
    const submissionResults = mockEvaluationResults.filter(
      r => r.submission_id === submission.meta.resourceId
    );
    const overallScore = submissionResults.reduce((sum, r) => sum + r.score, 0) / submissionResults.length;
    
    const caseScores: Record<string, Record<string, number>> = {};
    submissionResults.forEach(result => {
      if (!caseScores[result.case_id]) {
        caseScores[result.case_id] = {};
      }
      caseScores[result.case_id][result.eval_code_id] = result.score;
    });
    
    const algoCode = mockAlgoCode.find(c => c.meta.resourceId === submission.data.algo_id);
    
    return {
      submission_id: submission.meta.resourceId,
      algo_name: algoCode?.data.name || 'Unknown',
      submitter: submission.data.submitter,
      submission_time: submission.data.submission_time,
      overall_score: overallScore,
      case_scores: caseScores,
    };
  }).sort((a, b) => b.overall_score - a.overall_score);
}
