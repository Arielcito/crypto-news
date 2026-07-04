import { CategoriesList } from '@/components/admin/categories-list';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categorías</h1>
      <CategoriesList />
    </div>
  );
}
