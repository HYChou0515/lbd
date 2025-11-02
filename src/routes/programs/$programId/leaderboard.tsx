import { createFileRoute } from '@tanstack/react-router'
import { ProgramPage } from '../../../pages/ProgramPage'
import { mockProgram } from '../../../data/mockProgramData'

export const Route = createFileRoute('/programs/$programId/leaderboard')({
  component: LeaderboardComponent,
})

function LeaderboardComponent() {
  return <ProgramPage program={mockProgram} />
}
