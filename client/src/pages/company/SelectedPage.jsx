import ApplicantsListPage from './ApplicantsListPage';

export default function SelectedPage() {
  return <ApplicantsListPage statusFilter="SELECTED" title="Selected candidates" emptyTitle="No candidates selected yet" />;
}
