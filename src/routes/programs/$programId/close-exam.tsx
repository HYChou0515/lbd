import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../pages/ProgramPage'
import { mockProgram } from '../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/close-exam')({
  component: CloseExamComponent,
})

function CloseExamComponent() {
  return <ProgramPage program={mockProgram} />
}
