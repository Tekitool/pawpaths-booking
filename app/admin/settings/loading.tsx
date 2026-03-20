import { PageHeaderSkeleton, FormSkeleton } from '@/components/ui/skeletons';

export default function SettingsLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FormSkeleton fields={5} />
    </div>
  );
}
