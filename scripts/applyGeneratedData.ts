/**
 * Script to apply generated mock data to mockProgramData.ts
 * Run with: npx tsx scripts/applyGeneratedData.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateUsers, generateAlgoCodes, generateSubmissions } from './generateMockSubmissions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MOCK_DATA_FILE = path.join(__dirname, '../src/data/mockProgramData.ts');

// Configuration matching the original
const CONFIG = {
  numUsers: 10,
  submissionsPerUser: 50,
  caseIds: ['case-od1', 'case-od2', 'case-oe1', 'case-oe2', 'case-ce1', 'case-ce2', 'case-ce3'],
  evalCodeIds: ['eval-code-1', 'eval-code-2', 'eval-code-3', 'eval-code-4'],
  programId: 'program-001',
};

function main() {
  console.log('Reading original file...');
  const originalContent = fs.readFileSync(MOCK_DATA_FILE, 'utf-8');
  
  console.log('Generating new data...');
  const users = generateUsers(CONFIG.numUsers);
  const algoCodes = generateAlgoCodes(users, CONFIG.submissionsPerUser);
  const submissions = generateSubmissions(users, algoCodes, CONFIG.submissionsPerUser, CONFIG.programId);
  
  console.log(`Generated ${algoCodes.length} algo codes and ${submissions.length} submissions`);
  
  // Find the sections to replace
  const algoCodeStart = originalContent.indexOf('export const mockAlgoCode: CodeResource[] = [');
  const algoCodeEnd = originalContent.indexOf('];', algoCodeStart) + 2;
  
  const submissionsStart = originalContent.indexOf('export const mockSubmissions: SubmissionResource[] = [');
  const submissionsEnd = originalContent.indexOf('];', submissionsStart) + 2;
  
  if (algoCodeStart === -1 || submissionsStart === -1) {
    console.error('Could not find sections to replace!');
    process.exit(1);
  }
  
  // Generate new sections
  const algoCodeSection = generateAlgoCodeSection(algoCodes);
  const submissionsSection = generateSubmissionsSection(submissions);
  
  // Build new content
  const beforeAlgoCode = originalContent.substring(0, algoCodeStart);
  const betweenSections = originalContent.substring(algoCodeEnd, submissionsStart);
  const afterSubmissions = originalContent.substring(submissionsEnd);
  
  const newContent = beforeAlgoCode + algoCodeSection + betweenSections + submissionsSection + afterSubmissions;
  
  console.log('Writing updated file...');
  fs.writeFileSync(MOCK_DATA_FILE, newContent, 'utf-8');
  
  console.log('✅ Successfully updated mockProgramData.ts');
  console.log(`   - ${algoCodes.length} algorithm codes`);
  console.log(`   - ${submissions.length} submissions`);
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

main();
