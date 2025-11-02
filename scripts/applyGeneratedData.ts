/**
 * Script to apply generated mock data to mockProgramData.ts
 * Run with: npx tsx scripts/applyGeneratedData.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  generateUsers, 
  generateAlgoCodes, 
  generateSubmissions,
  generateExecutionResults,
  generateEvaluationResults 
} from './generateMockSubmissions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MOCK_DATA_FILE = path.join(__dirname, '../src/data/mockProgramData.ts');

// Configuration
const CONFIG = {
  numUsers: 10,
  submissionsPerUser: 50,
  // Use actual case IDs from mockProgramData
  caseIds: ['case-od1', 'case-od2'],
//   caseIds: ['case-od1', 'case-od2', 'case-oe1', 'case-oe2', 'case-ce1', 'case-ce2', 'case-ce3'],
  // Use actual eval code IDs from mockProgramData
  evalCodeIds: ['eval-code-1', 'eval-code-2'],
  programId: 'program-001',
};

function main() {
  console.log('Reading original file...');
  const originalContent = fs.readFileSync(MOCK_DATA_FILE, 'utf-8');
  
  console.log('Generating new data...');
  const users = generateUsers(CONFIG.numUsers);
  const algoCodes = generateAlgoCodes(users, CONFIG.submissionsPerUser);
  const submissions = generateSubmissions(users, algoCodes, CONFIG.submissionsPerUser, CONFIG.programId);
  const executionResults = generateExecutionResults(submissions, CONFIG.caseIds);
  const evaluationResults = generateEvaluationResults(submissions, CONFIG.caseIds, CONFIG.evalCodeIds);
  
  console.log(`Generated ${algoCodes.length} algo codes`);
  console.log(`Generated ${submissions.length} submissions`);
  console.log(`Generated ${executionResults.length} execution results`);
  console.log(`Generated ${evaluationResults.length} evaluation results`);
  
  // Find the sections to replace
  const algoCodeStart = originalContent.indexOf('export const mockAlgoCode: CodeResource[] = [');
  const algoCodeEnd = originalContent.indexOf('];', algoCodeStart) + 2;
  
  const submissionsStart = originalContent.indexOf('export const mockSubmissions: SubmissionResource[] = [');
  const submissionsEnd = originalContent.indexOf('];', submissionsStart) + 2;
  
  const executionStart = originalContent.indexOf('export const mockExecutionResults: ExecutionResult[] = [');
  const executionEnd = originalContent.indexOf('];', executionStart) + 2;
  
  const evaluationStart = originalContent.indexOf('export const mockEvaluationResults: EvaluationResult[] = [');
  const evaluationEnd = originalContent.indexOf('];', evaluationStart) + 2;
  
  if (algoCodeStart === -1 || submissionsStart === -1 || executionStart === -1 || evaluationStart === -1) {
    console.error('Could not find sections to replace!');
    process.exit(1);
  }
  
  // Generate new sections
  const algoCodeSection = generateAlgoCodeSection(algoCodes);
  const submissionsSection = generateSubmissionsSection(submissions);
  const executionSection = generateExecutionSection(executionResults);
  const evaluationSection = generateEvaluationSection(evaluationResults);
  
  // Build new content
  const beforeAlgoCode = originalContent.substring(0, algoCodeStart);
  const betweenAlgoAndSubmissions = originalContent.substring(algoCodeEnd, submissionsStart);
  const betweenSubmissionsAndExecution = originalContent.substring(submissionsEnd, executionStart);
  const betweenExecutionAndEvaluation = originalContent.substring(executionEnd, evaluationStart);
  const afterEvaluation = originalContent.substring(evaluationEnd);
  
  const newContent = beforeAlgoCode + algoCodeSection + 
                     betweenAlgoAndSubmissions + submissionsSection + 
                     betweenSubmissionsAndExecution + executionSection +
                     betweenExecutionAndEvaluation + evaluationSection +
                     afterEvaluation;
  
  console.log('Writing updated file...');
  fs.writeFileSync(MOCK_DATA_FILE, newContent, 'utf-8');
  
  console.log('✅ Successfully updated mockProgramData.ts');
  console.log(`   - ${algoCodes.length} algorithm codes`);
  console.log(`   - ${submissions.length} submissions`);
  console.log(`   - ${executionResults.length} execution results`);
  console.log(`   - ${evaluationResults.length} evaluation results`);
}

function generateAlgoCodeSection(algoCodes: any[]): string {
  const lines: string[] = [];
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
  
  return lines.join('\n');
}

function generateSubmissionsSection(submissions: any[]): string {
  const lines: string[] = [];
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
  
  return lines.join('\n');
}

function generateExecutionSection(executionResults: any[]): string {
  const lines: string[] = [];
  lines.push('export const mockExecutionResults: ExecutionResult[] = [');
  
  executionResults.forEach((exec, idx) => {
    lines.push('  {');
    lines.push(`    submission_id: '${exec.submission_id}',`);
    lines.push(`    case_id: '${exec.case_id}',`);
    lines.push(`    status: '${exec.status}',`);
    lines.push(`    wall_time: ${exec.wall_time},`);
    lines.push(`    cpu_time: ${exec.cpu_time},`);
    lines.push(`    memory: ${exec.memory},`);
    lines.push(`    exit_code: ${exec.exit_code},`);
    lines.push(idx < executionResults.length - 1 ? '  },' : '  }');
  });
  
  lines.push('];');
  lines.push('');
  
  return lines.join('\n');
}

function generateEvaluationSection(evaluationResults: any[]): string {
  const lines: string[] = [];
  lines.push('export const mockEvaluationResults: EvaluationResult[] = [');
  
  evaluationResults.forEach((evalResult, idx) => {
    lines.push('  {');
    lines.push(`    submission_id: '${evalResult.submission_id}',`);
    lines.push(`    case_id: '${evalResult.case_id}',`);
    lines.push(`    eval_code_id: '${evalResult.eval_code_id}',`);
    lines.push(`    score: ${evalResult.score},`);
    lines.push(idx < evaluationResults.length - 1 ? '  },' : '  }');
  });
  
  lines.push('];');
  lines.push('');
  
  return lines.join('\n');
}

main();
