import { PostsList } from '@/components/admin/posts-list';

export default function AdminPostsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notas</h1>
      <PostsList />
    </div>
  );
}
