import { Stack, Title, Text, Box } from '@mantine/core';
import type { ProgramNode } from '../../pages/ProgramPage';
import type { Resource } from '../../types/meta';
import type { Program } from '../../types/program';
import { SubmissionSection } from '../submission/SubmissionSection';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';
import { ContentViewer } from '../ContentViewer';
import { generateCaseMarkdown } from '../../utils/contentGenerators';
import type { FileNode } from '../../data/mockFileStructure';
import { 
  mockSubmissions, 
  mockAlgoCode, 
  mockExecutionResults, 
  mockEvaluationResults,
  mockCases,
  mockSampleCode,
  mockEvalCode
} from '../../data/mockProgramData';
import { formatAbsoluteTime } from '../../utils/timeUtils';

interface ProgramContentProps {
  program: Resource<Program>;
  selectedNode: ProgramNode | null;
  onSubmissionSelect?: (submissionId: string | null) => void;
  selectedFile?: FileNode | null;
  programId: string;
  selectedSubmissionId?: string | null;
}

export function ProgramContent({ program, selectedNode, onSubmissionSelect, selectedFile, programId, selectedSubmissionId }: ProgramContentProps) {

  // If a file is selected, show its content
  if (selectedFile) {
    // Determine language based on file extension
    let language = 'plaintext';
    let showToggle = false;
    
    if (selectedFile.name.endsWith('.md')) {
      language = 'markdown';
      showToggle = true;
    } else if (selectedFile.name.endsWith('.py')) {
      language = 'python';
    } else if (selectedFile.name.endsWith('.js') || selectedFile.name.endsWith('.ts')) {
      language = 'javascript';
    } else if (selectedFile.name.endsWith('.json')) {
      language = 'json';
    } else if (selectedFile.name.endsWith('.yml') || selectedFile.name.endsWith('.yaml')) {
      language = 'yaml';
    } else if (selectedFile.name === 'logs') {
      language = 'markdown'; // logs 檔案用 markdown 顯示
      showToggle = true;
    }
    
    return (
      <ContentViewer
        content={selectedFile.content || 'No content available'}
        language={language}
        title={selectedFile.name}
        resourceType="file"
        showToggle={showToggle}
      />
    );
  }

  if (!selectedNode) {
    return (
      <Stack align="center" justify="center" h="100%" p="xl">
        <Title order={3} c="dimmed">Select a node to view details</Title>
        <Text c="dimmed" size="sm">
          Choose an item from the navigation tree on the left
        </Text>
      </Stack>
    );
  }

  // Render different content based on node type
  const renderContent = () => {
    switch (selectedNode.type) {
      case 'program':
        const programMarkdown = `# ${program.data.name}

## Description
${program.data.description}

## Resource Information
- Resource ID: ${program.meta.resourceId}
- Revision ID: ${program.meta.revisionId}
- Creator: ${program.meta.creator}
- Created: ${program.meta.createdTime}
- Updated: ${program.meta.updatedTime}
`;
        return (
          <ContentViewer
            content={programMarkdown}
            language="markdown"
            title={program.data.name}
            resourceType="program"
          />
        );

      case 'open-data':
        const openDataCases = mockCases.filter(c => c.data.case_type === 'open data');
        const openDataMarkdown = `# Open Data Cases

Open Data cases are publicly available test cases that participants can use to develop and validate their algorithms.

## Summary
- **Total Cases:** ${openDataCases.length}
- **Purpose:** Training and development
- **Visibility:** Full dataset and expected outputs are available

## Available Cases

${openDataCases.map(c => `### ${c.data.name}
- **Case ID:** ${c.meta.resourceId}
- **Dataset:** ${c.data.dataset_revision_id}
- **Description:** ${c.data.description || 'N/A'}
- **Created:** ${c.meta.createdTime}

[View Case Details](/programs/${programId}/open-data/${c.meta.resourceId})

---
`).join('\n')}

*Click on any case above or select from the tree to view detailed information.*
`;
        return (
          <ContentViewer
            content={openDataMarkdown}
            language="markdown"
            title="Open Data Cases"
            resourceType="case"
            showToggle={true}
          />
        );

      case 'open-exam':
        const openExamCases = mockCases.filter(c => c.data.case_type === 'open exam');
        const openExamMarkdown = `# Open Exam Cases

Open Exam cases are public test cases used for evaluation. Input data is visible, but expected outputs may be hidden.

## Summary
- **Total Cases:** ${openExamCases.length}
- **Purpose:** Public evaluation and testing
- **Visibility:** Input data available, outputs may be hidden

## Available Cases

${openExamCases.map(c => `### ${c.data.name}
- **Case ID:** ${c.meta.resourceId}
- **Dataset:** ${c.data.dataset_revision_id}
- **Description:** ${c.data.description || 'N/A'}
- **Created:** ${c.meta.createdTime}

[View Case Details](/programs/${programId}/open-exam/${c.meta.resourceId})

---
`).join('\n')}

*Click on any case above or select from the tree to view detailed information.*
`;
        return (
          <ContentViewer
            content={openExamMarkdown}
            language="markdown"
            title="Open Exam Cases"
            resourceType="case"
            showToggle={true}
          />
        );

      case 'close-exam':
        const closeExamCases = mockCases.filter(c => c.data.case_type === 'close exam');
        const closeExamMarkdown = `# Close Exam Cases

Close Exam cases are private test cases used for final evaluation. Both input and output data are hidden from participants.

## Summary
- **Total Cases:** ${closeExamCases.length}
- **Purpose:** Final evaluation and ranking
- **Visibility:** Hidden until evaluation is complete

## Available Cases

${closeExamCases.map(c => `### ${c.data.name}
- **Case ID:** ${c.meta.resourceId}
- **Dataset:** ${c.data.dataset_revision_id}
- **Description:** ${c.data.description || 'N/A'}
- **Created:** ${c.meta.createdTime}

[View Case Details](/programs/${programId}/close-exam/${c.meta.resourceId})

---
`).join('\n')}

*Click on any case above or select from the tree to view detailed information.*
`;
        return (
          <ContentViewer
            content={closeExamMarkdown}
            language="markdown"
            title="Close Exam Cases"
            resourceType="case"
            showToggle={true}
          />
        );

      case 'sample-code':
        const sampleCodeMarkdown = `# Sample Code

Sample code provides baseline implementations and examples to help participants understand the problem and get started.

## Summary
- **Total Samples:** ${mockSampleCode.length}
- **Purpose:** Reference implementations and examples
- **Usage:** Use as starting point for your own algorithms

## Available Sample Code

${mockSampleCode.map(c => `### ${c.data.name}
- **Code ID:** ${c.meta.resourceId}
- **Type:** ${c.data.code_type}
- **Description:** ${c.data.description}
- **Commit:** ${c.data.commit_hash}
- **GitLab:** [View Source](${c.data.gitlab_url})

[View Code Details](/programs/${programId}/sample-code/${c.meta.resourceId})

---
`).join('\n')}

*Click on any code above or select from the tree to view the implementation.*
`;
        return (
          <ContentViewer
            content={sampleCodeMarkdown}
            language="markdown"
            title="Sample Code"
            resourceType="code"
            showToggle={true}
          />
        );

      case 'eval-code':
        const evalCodeMarkdown = `# Evaluation Code

Evaluation code is used to score and rank submissions. These scripts define the metrics and evaluation criteria.

## Summary
- **Total Evaluators:** ${mockEvalCode.length}
- **Purpose:** Scoring and ranking submissions
- **Metrics:** Custom evaluation functions

## Available Evaluation Code

${mockEvalCode.map(c => `### ${c.data.name}
- **Code ID:** ${c.meta.resourceId}
- **Type:** ${c.data.code_type}
- **Description:** ${c.data.description}
- **Commit:** ${c.data.commit_hash}
- **GitLab:** [View Source](${c.data.gitlab_url})

[View Code Details](/programs/${programId}/eval-code/${c.meta.resourceId})

---
`).join('\n')}

*Click on any evaluator above or select from the tree to view the implementation.*
`;
        return (
          <ContentViewer
            content={evalCodeMarkdown}
            language="markdown"
            title="Evaluation Code"
            resourceType="code"
            showToggle={true}
          />
        );

      case 'case':
        const caseData = selectedNode.metadata?.case;
        if (!caseData) {
          return (
            <Stack align="center" justify="center" h="100%" p="xl">
              <Title order={3} c="dimmed">Case not found</Title>
            </Stack>
          );
        }
        
        // TODO: 從 dataset_revision_id 查找實際的 Dataset 並傳入
        const caseMarkdown = generateCaseMarkdown(caseData);
        
        return (
          <ContentViewer
            content={caseMarkdown}
            language="markdown"
            title={caseData.data.name}
            resourceType="case"
          />
        );

      case 'code':
        const codeData = selectedNode.metadata?.code;
        if (!codeData) {
          return (
            <Stack align="center" justify="center" h="100%" p="xl">
              <Title order={3} c="dimmed">Code not found</Title>
            </Stack>
          );
        }
        
        // TODO: 從 GitLab 或 API 獲取實際代碼內容
        const codeContent = `"""
${codeData.data.description}

Code Type: ${codeData.data.code_type}
Commit Hash: ${codeData.data.commit_hash}
GitLab URL: ${codeData.data.gitlab_url}

TODO: Fetch actual code content from GitLab API or storage
"""

def sample_algorithm():
    # This is placeholder content
    # Real code should be fetched from GitLab
    pass
`;
        
        return (
          <ContentViewer
            content={codeContent}
            language="python"
            title={codeData.data.name}
            resourceType="code"
            showToggle={false}
          />
        );

      case 'submissions':
        // If a specific submission is selected, show its details
        if (selectedSubmissionId) {
          const submission = mockSubmissions.find(s => s.meta.resourceId === selectedSubmissionId);
          if (!submission) {
            return (
              <Stack align="center" justify="center" h="100%" p="xl">
                <Title order={3} c="dimmed">Submission not found</Title>
              </Stack>
            );
          }

          // Get algorithm info
          const algo = mockAlgoCode.find(a => a.meta.resourceId === submission.data.algo_id);
          const algoName = algo?.data.name || 'Unknown';
          
          // Get execution results
          const execResults = mockExecutionResults.filter(r => r.submission_id === selectedSubmissionId);
          const execSummary = execResults.reduce((acc, result) => {
            acc[result.status] = (acc[result.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Get evaluation results
          const evalResults = mockEvaluationResults.filter(r => r.submission_id === selectedSubmissionId);
          
          // Build submission detail markdown
          let markdown = `# Submission Details

## Basic Information
- **Algorithm:** ${algoName}
- **Submission ID:** ${submission.meta.resourceId}
- **Submitter:** ${submission.data.submitter}
- **Submission Time:** ${formatAbsoluteTime(submission.data.submission_time)}
- **Created:** ${submission.meta.createdTime}

## Execution Summary
Total Cases: ${execResults.length}

`;
          
          // Add execution status breakdown
          if (Object.keys(execSummary).length > 0) {
            markdown += '### Status Breakdown\n';
            Object.entries(execSummary).forEach(([status, count]) => {
              markdown += `- **${status}:** ${count} case(s)\n`;
            });
            markdown += '\n';
          }
          
          // Add evaluation results summary
          if (evalResults.length > 0) {
            markdown += '## Evaluation Results\n\n';
            markdown += '| Case | Eval Code | Score |\n';
            markdown += '|------|-----------|-------|\n';
            
            evalResults.forEach(evalResult => {
              const caseInfo = mockCases.find(c => c.meta.resourceId === evalResult.case_id);
              const caseName = caseInfo?.data.name || evalResult.case_id;
              markdown += `| ${caseName} | ${evalResult.eval_code_id} | ${evalResult.score.toFixed(4)} |\n`;
            });
            markdown += '\n';
          }
          
          // Add execution details
          if (execResults.length > 0) {
            markdown += '## Execution Details\n\n';
            execResults.forEach(execResult => {
              const caseInfo = mockCases.find(c => c.meta.resourceId === execResult.case_id);
              const caseName = caseInfo?.data.name || execResult.case_id;
              
              markdown += `### ${caseName}\n`;
              markdown += `- **Status:** ${execResult.status}\n`;
              markdown += `- **Wall Time:** ${execResult.wall_time}s\n`;
              markdown += `- **CPU Time:** ${execResult.cpu_time}s\n`;
              markdown += `- **Memory:** ${execResult.memory} MB\n`;
              
              if (execResult.log_url) {
                markdown += `- **Log URL:** ${execResult.log_url}\n`;
              }
              if (execResult.artifact_url) {
                markdown += `- **Artifact URL:** ${execResult.artifact_url}\n`;
              }
              markdown += '\n';
            });
          }
          
          markdown += `\n---\n\n*Select files from the left panel to view logs and artifacts.*`;
          
          return (
            <ContentViewer
              content={markdown}
              language="markdown"
              title={`${algoName} - ${formatAbsoluteTime(submission.data.submission_time)}`}
              resourceType="code"
              showToggle={true}
            />
          );
        }
        
        // Otherwise show SubmissionSection table
        return <SubmissionSection onViewDetail={onSubmissionSelect} programId={programId} />;

      case 'submission':
        // Show details for a specific submission node
        const submissionData = selectedNode.metadata?.submission;
        if (!submissionData) {
          return (
            <Stack align="center" justify="center" h="100%" p="xl">
              <Title order={3} c="dimmed">Submission not found</Title>
            </Stack>
          );
        }

        // Get algorithm info
        const submissionAlgo = mockAlgoCode.find(a => a.meta.resourceId === submissionData.data.algo_id);
        const submissionAlgoName = submissionAlgo?.data.name || 'Unknown';
        
        // Get execution results
        const submissionExecResults = mockExecutionResults.filter(r => r.submission_id === submissionData.meta.resourceId);
        const submissionExecSummary = submissionExecResults.reduce((acc, result) => {
          acc[result.status] = (acc[result.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Get evaluation results
        const submissionEvalResults = mockEvaluationResults.filter(r => r.submission_id === submissionData.meta.resourceId);
        
        // Build submission detail markdown
        let submissionMarkdown = `# Submission Details

## Basic Information
- **Algorithm:** ${submissionAlgoName}
- **Submission ID:** ${submissionData.meta.resourceId}
- **Submitter:** ${submissionData.data.submitter}
- **Submission Time:** ${formatAbsoluteTime(submissionData.data.submission_time)}
- **Created:** ${submissionData.meta.createdTime}

## Execution Summary
Total Cases: ${submissionExecResults.length}

`;
        
        // Add execution status breakdown
        if (Object.keys(submissionExecSummary).length > 0) {
          submissionMarkdown += '### Status Breakdown\n';
          Object.entries(submissionExecSummary).forEach(([status, count]) => {
            submissionMarkdown += `- **${status}:** ${count} case(s)\n`;
          });
          submissionMarkdown += '\n';
        }
        
        // Add evaluation results summary
        if (submissionEvalResults.length > 0) {
          submissionMarkdown += '## Evaluation Results\n\n';
          submissionMarkdown += '| Case | Eval Code | Score |\n';
          submissionMarkdown += '|------|-----------|-------|\n';
          
          submissionEvalResults.forEach(evalResult => {
            const caseInfo = mockCases.find(c => c.meta.resourceId === evalResult.case_id);
            const caseName = caseInfo?.data.name || evalResult.case_id;
            submissionMarkdown += `| ${caseName} | ${evalResult.eval_code_id} | ${evalResult.score.toFixed(4)} |\n`;
          });
          submissionMarkdown += '\n';
        }
        
        // Add execution details
        if (submissionExecResults.length > 0) {
          submissionMarkdown += '## Execution Details\n\n';
          submissionExecResults.forEach(execResult => {
            const caseInfo = mockCases.find(c => c.meta.resourceId === execResult.case_id);
            const caseName = caseInfo?.data.name || execResult.case_id;
            
            submissionMarkdown += `### ${caseName}\n`;
            submissionMarkdown += `- **Status:** ${execResult.status}\n`;
            submissionMarkdown += `- **Wall Time:** ${execResult.wall_time}s\n`;
            submissionMarkdown += `- **CPU Time:** ${execResult.cpu_time}s\n`;
            submissionMarkdown += `- **Memory:** ${execResult.memory} MB\n`;
            
            if (execResult.log_url) {
              submissionMarkdown += `- **Log URL:** ${execResult.log_url}\n`;
            }
            if (execResult.artifact_url) {
              submissionMarkdown += `- **Artifact URL:** ${execResult.artifact_url}\n`;
            }
            submissionMarkdown += '\n';
          });
        }
        
        submissionMarkdown += `\n---\n\n*Select files from the left panel to view logs and artifacts.*`;
        
        return (
          <ContentViewer
            content={submissionMarkdown}
            language="markdown"
            title={`${submissionAlgoName} - ${formatAbsoluteTime(submissionData.data.submission_time)}`}
            resourceType="code"
            showToggle={true}
          />
        );

      case 'leaderboard':
      case 'leaderboard-od':
      case 'leaderboard-oe':
      case 'leaderboard-ce':
        let caseType: 'open data' | 'open exam' | 'close exam' | undefined;
        if (selectedNode.type === 'leaderboard-od') {
          caseType = 'open data';
        } else if (selectedNode.type === 'leaderboard-oe') {
          caseType = 'open exam';
        } else if (selectedNode.type === 'leaderboard-ce') {
          caseType = 'close exam';
        }
        
        return (
          <LeaderboardSection 
            programId={program.meta.resourceId}
            caseType={caseType}
            onViewDetail={(submissionId) => {
              onSubmissionSelect?.(submissionId);
            }}
          />
        );

      default:
        return (
          <Text c="dimmed">Content for {selectedNode.type} node type</Text>
        );
    }
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderContent()}
    </Box>
  );
}
