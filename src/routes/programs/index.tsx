import { createFileRoute } from '@tanstack/react-router';
import { ProgramsPage } from '../../pages/ProgramsPage';

export const Route = createFileRoute('/programs/')({
  component: ProgramsPage,
});
