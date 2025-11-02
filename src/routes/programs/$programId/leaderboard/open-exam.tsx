import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../../pages/ProgramPage'
import { mockProgram } from '../../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/leaderboard/open-exam')({
  component: LeaderboardOpenExamComponent,
})

function LeaderboardOpenExamComponent() {
  return <ProgramPage program={mockProgram} />
}
