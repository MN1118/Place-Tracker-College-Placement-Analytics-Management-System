import ApplicantsListPage from './ApplicantsListPage';

export default function ShortlistedPage() {
  return <ApplicantsListPage statusFilter="SHORTLISTED" title="Shortlisted candidates" emptyTitle="No shortlisted candidates yet" />;
}
