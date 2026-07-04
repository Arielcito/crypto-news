import { CategoriesList } from '@/components/admin/categories-list';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

export default function AdminCategoriesPage() {
  return (
    <div>
      <AdminPageHeader eyebrow="Taxonomía" title="Categorías" />
      <CategoriesList />
    </div>
  );
}
