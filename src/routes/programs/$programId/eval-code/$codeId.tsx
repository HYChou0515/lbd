import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../../pages/ProgramPage'
import { mockProgram } from '../../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/eval-code/$codeId')({
  component: EvalCodeItemComponent,
})

function EvalCodeItemComponent() {
  return <ProgramPage program={mockProgram} />
}
