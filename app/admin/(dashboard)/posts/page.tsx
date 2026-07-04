import { PostsList } from '@/components/admin/posts-list';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export default function AdminPostsPage() {
  return (
    <div>
      <AdminPageHeader eyebrow="Contenido" title="Notas" />
      <PostsList />
    </div>
  );
}
