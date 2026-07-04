import { TagsList } from '@/components/admin/tags-list';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export default function AdminTagsPage() {
  return (
    <div>
      <AdminPageHeader eyebrow="Taxonomía" title="Tags" />
      <TagsList />
    </div>
  );
}
