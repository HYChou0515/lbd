import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../../pages/ProgramPage'
import { mockProgram } from '../../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/open-exam/$caseId')({
  component: OpenExamCaseComponent,
})

function OpenExamCaseComponent() {
  return <ProgramPage program={mockProgram} />
}
