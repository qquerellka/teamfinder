import { useAuthUserApplications } from '@/entities/application';
import { NoItems, Page } from '@/shared/ui';
import { ApplicationsList } from '@/widgets/applications/list/ui/ApplicationsList';

export const ApplicationsPage = () => {
  const { data: applications } = useAuthUserApplications();
  const filteredApplications = applications.filter(a => a.status === 'published');

  if (!filteredApplications || filteredApplications.length === 0) {
    return <NoItems title={'У вас нет активных анкет :('} />;
  }

  return (
    <Page>
      <ApplicationsList applications={filteredApplications} />
    </Page>
  );
};

export default ApplicationsPage;
