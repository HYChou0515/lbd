import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/programs/$programId/open-data/$caseId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/programs/$programId/open-data/$caseId"!</div>
}
