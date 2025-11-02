import { createFileRoute } from '@tanstack/react-router';
import { ProgramPage } from '../../../pages/ProgramPage';
import { mockProgram } from '../../../data/mockProgramData';

export const Route = createFileRoute('/programs/$programId/submissions')({
  component: () => {
    const { programId } = Route.useParams();
    
    // For now, we only have one mock program
    if (mockProgram.meta.resourceId !== programId) {
      return <div>Program not found</div>;
    }
    
    return <ProgramPage program={mockProgram} />;
  },
});
