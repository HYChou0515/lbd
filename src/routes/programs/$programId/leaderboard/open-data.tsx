import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../../pages/ProgramPage'
import { mockProgram } from '../../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/leaderboard/open-data')({
  component: LeaderboardOpenDataComponent,
})

function LeaderboardOpenDataComponent() {
  return <ProgramPage program={mockProgram} />
}
