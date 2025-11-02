import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../../pages/ProgramPage'
import { mockProgram } from '../../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/sample-code/$codeId')({
  component: SampleCodeItemComponent,
})

function SampleCodeItemComponent() {
  return <ProgramPage program={mockProgram} />
}
