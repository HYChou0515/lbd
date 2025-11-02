import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../pages/ProgramPage'
import { mockProgram } from '../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/open-data')({
  component: OpenDataComponent,
})

function OpenDataComponent() {
  return <ProgramPage program={mockProgram} />
}
