import { createFileRoute } from '@tanstack/react-router';
import { SubmissionPage } from '../../pages/SubmissionPage';

export const Route = createFileRoute('/submissions/')({
  component: SubmissionPage,
});
