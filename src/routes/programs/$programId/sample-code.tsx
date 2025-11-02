import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../pages/ProgramPage'
import { mockProgram } from '../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/sample-code')({
  component: SampleCodeComponent,
})

function SampleCodeComponent() {
  return <ProgramPage program={mockProgram} />
}
