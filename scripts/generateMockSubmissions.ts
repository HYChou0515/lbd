/**
 * Script to generate mock submission data
 * Run with: npx tsx scripts/generateMockSubmissions.ts
 */

type ResourceMeta = {
  resourceId: string;
  revisionId: string;
  creator: string;
  createdTime: string;
  updater: string;
  updatedTime: string;
};

type Resource<T> = {
  meta: ResourceMeta;
  data: T;
};

type Submission = {
  program_id: string;
  algo_id: string;
  submitter: string;
  submission_time: string;
  status: 'completed' | 'running' | 'failed';
};

type Code = {
  name: string;
  description: string;
  gitlab_url: string;
  commit_hash: string;
  code_type: 'algo' | 'evaluation' | 'sample';
};

type ExecutionResult = {
  submission_id: string;
  case_id: string;
  wall_time: number;
  cpu_time: number;
  memory: number;
  status: 'success' | 'failed';
  log_url: string;
  artifact_url: string;
};

type EvaluationResult = {
  submission_id: string;
  case_id: string;
  eval_code_id: string;
  score: number;
  evaluated_at: string;
};

// Configuration
const CONFIG = {
  numUsers: 10,
  submissionsPerUser: 5,
  // Use actual case IDs from mockProgramData
  caseIds: ['case-od1', 'case-od2', 'case-oe1', 'case-oe2', 'case-ce1', 'case-ce2', 'case-ce3'],
  // Use actual eval code IDs from mockProgramData
  evalCodeIds: ['eval-code-1', 'eval-code-2', 'eval-code-3', 'eval-code-4'],
  programId: 'program-001',
};

// Helper functions
function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function randomCommitHash(): string {
  return Math.random().toString(36).substring(2, 8);
}

function randomStatus(): 'success' | 'failed' {
  return Math.random() > 0.15 ? 'success' : 'failed'; // 85% success rate
}

function randomScore(baseScore: number, variance: number): number {
  const score = baseScore + (Math.random() - 0.5) * variance;
  return Math.min(1.0, Math.max(0.0, score));
}

// Generate users
function generateUsers(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `user${i + 1}`);
}

// Generate algorithm codes
function generateAlgoCodes(users: string[], versionsPerUser: number): Resource<Code>[] {
  const algos: Resource<Code>[] = [];
  const algoTypes = [
    { prefix: 'rf', name: 'Random Forest', desc: 'Random forest implementation' },
    { prefix: 'xgb', name: 'XGBoost', desc: 'XGBoost model' },
    { prefix: 'lgb', name: 'LightGBM', desc: 'LightGBM model' },
    { prefix: 'nn', name: 'Neural Network', desc: 'Deep learning approach' },
    { prefix: 'svm', name: 'SVM', desc: 'Support vector machine' },
    { prefix: 'lr', name: 'Logistic Regression', desc: 'Logistic regression model' },
    { prefix: 'dt', name: 'Decision Tree', desc: 'Decision tree classifier' },
    { prefix: 'nb', name: 'Naive Bayes', desc: 'Naive Bayes classifier' },
    { prefix: 'knn', name: 'KNN', desc: 'K-nearest neighbors' },
    { prefix: 'ens', name: 'Ensemble', desc: 'Ensemble method' },
  ];

  users.forEach((user, userIdx) => {
    const algoType = algoTypes[userIdx % algoTypes.length];
    
    for (let v = 1; v <= versionsPerUser; v++) {
      const algoId = `algo-${algoType.prefix}-${user}-v${v}`;
      const timestamp = randomDate(new Date('2025-10-01'), new Date('2025-11-02'));
      
      algos.push({
        meta: {
          resourceId: algoId,
          revisionId: `${algoId}-r1`,
          creator: user,
          createdTime: timestamp,
          updater: user,
          updatedTime: timestamp,
        },
        data: {
          name: `${algoType.name} v${v}`,
          description: `${algoType.desc} - version ${v}`,
          gitlab_url: `https://gitlab.com/${user}/${algoType.prefix}-model`,
          commit_hash: randomCommitHash(),
          code_type: 'algo',
        },
      });
    }
  });

  return algos;
}

// Generate submissions
function generateSubmissions(
  users: string[],
  algoCodes: Resource<Code>[],
  submissionsPerUser: number,
  programId: string
): Resource<Submission>[] {
  const submissions: Resource<Submission>[] = [];
  let submissionCounter = 1;

  users.forEach(user => {
    // Get this user's algo codes
    const userAlgos = algoCodes.filter(a => a.meta.creator === user);
    
    for (let i = 0; i < submissionsPerUser; i++) {
      // Pick an algo (usually the latest ones)
      const algoIndex = Math.min(
        Math.floor(Math.random() * userAlgos.length * 0.7) + Math.floor(userAlgos.length * 0.3),
        userAlgos.length - 1
      );
      const algo = userAlgos[algoIndex];
      
      const submissionId = `sub-${String(submissionCounter).padStart(3, '0')}`;
      const timestamp = randomDate(new Date(algo.meta.createdTime), new Date('2025-11-02'));
      
      submissions.push({
        meta: {
          resourceId: submissionId,
          revisionId: `${submissionId}-v1`,
          creator: user,
          createdTime: timestamp,
          updater: user,
          updatedTime: timestamp,
        },
        data: {
          program_id: programId,
          algo_id: algo.meta.resourceId,
          submitter: user,
          submission_time: timestamp,
          status: 'completed',
        },
      });
      
      submissionCounter++;
    }
  });

  // Sort by submission time
  submissions.sort((a, b) => 
    new Date(a.data.submission_time).getTime() - new Date(b.data.submission_time).getTime()
  );

  return submissions;
}

// Generate execution results
function generateExecutionResults(
  submissions: Resource<Submission>[],
  caseIds: string[]
): ExecutionResult[] {
  const results: ExecutionResult[] = [];

  submissions.forEach(submission => {
    caseIds.forEach(caseId => {
      results.push({
        submission_id: submission.meta.resourceId,
        case_id: caseId,
        wall_time: Math.random() * 10 + 1,
        cpu_time: Math.random() * 8 + 0.5,
        memory: Math.random() * 500 + 100,
        status: randomStatus(),
        log_url: `https://logs.example.com/${submission.meta.resourceId}/${caseId}`,
        artifact_url: `https://artifacts.example.com/${submission.meta.resourceId}/${caseId}`,
      });
    });
  });

  return results;
}

// Generate evaluation results
function generateEvaluationResults(
  submissions: Resource<Submission>[],
  caseIds: string[],
  evalCodeIds: string[]
): EvaluationResult[] {
  const results: EvaluationResult[] = [];

  submissions.forEach((submission, subIdx) => {
    // Each submission has a base quality that improves over time
    const submissionQuality = 0.5 + (subIdx / submissions.length) * 0.3;
    
    caseIds.forEach(caseId => {
      evalCodeIds.forEach(evalCodeId => {
        // Different eval codes might have different scores
        const evalVariance = Math.random() * 0.1;
        const score = randomScore(submissionQuality, 0.15) + evalVariance;
        
        results.push({
          submission_id: submission.meta.resourceId,
          case_id: caseId,
          eval_code_id: evalCodeId,
          score: Math.min(1.0, Math.max(0.0, score)),
          evaluated_at: randomDate(
            new Date(submission.data.submission_time),
            new Date('2025-11-02')
          ),
        });
      });
    });
  });

  return results;
}

// Format output as TypeScript code
function formatAsTypeScript(
  algoCodes: Resource<Code>[],
  submissions: Resource<Submission>[],
  executionResults: ExecutionResult[],
  evaluationResults: EvaluationResult[]
): string {
  const lines: string[] = [];

  // Algo codes
  lines.push('// Generated Algorithm Codes');
  lines.push('export const mockAlgoCode: CodeResource[] = [');
  algoCodes.forEach((algo, idx) => {
    lines.push('  {');
    lines.push('    meta: {');
    lines.push(`      resourceId: '${algo.meta.resourceId}',`);
    lines.push(`      revisionId: '${algo.meta.revisionId}',`);
    lines.push(`      creator: '${algo.meta.creator}',`);
    lines.push(`      createdTime: '${algo.meta.createdTime}',`);
    lines.push(`      updater: '${algo.meta.updater}',`);
    lines.push(`      updatedTime: '${algo.meta.updatedTime}',`);
    lines.push('    },');
    lines.push('    data: {');
    lines.push(`      name: '${algo.data.name}',`);
    lines.push(`      description: '${algo.data.description}',`);
    lines.push(`      gitlab_url: '${algo.data.gitlab_url}',`);
    lines.push(`      commit_hash: '${algo.data.commit_hash}',`);
    lines.push(`      code_type: '${algo.data.code_type}',`);
    lines.push('    },');
    lines.push(idx < algoCodes.length - 1 ? '  },' : '  }');
  });
  lines.push('];');
  lines.push('');

  // Submissions
  lines.push('// Generated Submissions');
  lines.push('export const mockSubmissions: SubmissionResource[] = [');
  submissions.forEach((sub, idx) => {
    lines.push('  {');
    lines.push('    meta: {');
    lines.push(`      resourceId: '${sub.meta.resourceId}',`);
    lines.push(`      revisionId: '${sub.meta.revisionId}',`);
    lines.push(`      creator: '${sub.meta.creator}',`);
    lines.push(`      createdTime: '${sub.meta.createdTime}',`);
    lines.push(`      updater: '${sub.meta.updater}',`);
    lines.push(`      updatedTime: '${sub.meta.updatedTime}',`);
    lines.push('    },');
    lines.push('    data: {');
    lines.push(`      program_id: '${sub.data.program_id}',`);
    lines.push(`      algo_id: '${sub.data.algo_id}',`);
    lines.push(`      submitter: '${sub.data.submitter}',`);
    lines.push(`      submission_time: '${sub.data.submission_time}',`);
    lines.push(`      status: '${sub.data.status}',`);
    lines.push('    },');
    lines.push(idx < submissions.length - 1 ? '  },' : '  }');
  });
  lines.push('];');
  lines.push('');

  // Stats
  lines.push('// Statistics');
  lines.push(`// Total Algorithm Codes: ${algoCodes.length}`);
  lines.push(`// Total Submissions: ${submissions.length}`);
  lines.push(`// Total Execution Results: ${executionResults.length}`);
  lines.push(`// Total Evaluation Results: ${evaluationResults.length}`);

  return lines.join('\n');
}

// Main execution
function main() {
  console.log('Generating mock data...');
  console.log(`Config: ${CONFIG.numUsers} users, ${CONFIG.submissionsPerUser} submissions each`);
  console.log('');

  const users = generateUsers(CONFIG.numUsers);
  const algoCodes = generateAlgoCodes(users, CONFIG.submissionsPerUser);
  const caseIds = CONFIG.caseIds;
  const evalCodeIds = CONFIG.evalCodeIds;
  
  const submissions = generateSubmissions(
    users,
    algoCodes,
    CONFIG.submissionsPerUser,
    CONFIG.programId
  );
  
  const executionResults = generateExecutionResults(submissions, caseIds);
  const evaluationResults = generateEvaluationResults(submissions, caseIds, evalCodeIds);

  console.log('Generated:');
  console.log(`  - ${users.length} users`);
  console.log(`  - ${algoCodes.length} algorithm codes`);
  console.log(`  - ${submissions.length} submissions`);
  console.log(`  - ${executionResults.length} execution results`);
  console.log(`  - ${evaluationResults.length} evaluation results`);
  console.log('');

  // Output TypeScript code
  const tsCode = formatAsTypeScript(algoCodes, submissions, executionResults, evaluationResults);
  console.log('='.repeat(80));
  console.log('TypeScript Code (copy to mockProgramData.ts):');
  console.log('='.repeat(80));
  console.log(tsCode);
  console.log('='.repeat(80));

  // Also output JSON for inspection
  console.log('');
  console.log('JSON Data (for inspection):');
  console.log(JSON.stringify({ users, algoCodes: algoCodes.slice(0, 2), submissions: submissions.slice(0, 3) }, null, 2));
}

// Run if called directly
// Check if this is the main module in ES module context
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main();
}

export { generateUsers, generateAlgoCodes, generateSubmissions, generateExecutionResults, generateEvaluationResults };
