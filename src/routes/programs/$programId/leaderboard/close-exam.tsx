import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../../pages/ProgramPage'
import { mockProgram } from '../../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/leaderboard/close-exam')({
  component: LeaderboardCloseExamComponent,
})

function LeaderboardCloseExamComponent() {
  return <ProgramPage program={mockProgram} />
}
