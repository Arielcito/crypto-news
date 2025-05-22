import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import BackButton from "@/components/back";
import { fetchCategoryBySlug, fetchPostsByCategory } from "@/lib/api/categories";
import Post from "@/types/post";
import { PostCard } from "@/app/posts/post-card";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await fetchCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: "Category not found",
      description: "The category you are looking for does not exist.",
      alternates: {
        canonical: `/categories/${params.slug}`,
      },
    };
  }

  return {
    title: `${category.name} - Category`,
    description: category.description || `Posts in category ${category.name}`,
    alternates: {
      canonical: `/posts/categories/${params.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await fetchCategoryBySlug(params.slug);
  const posts = await fetchPostsByCategory(params.slug);

  if (!category) {
    return (
      <Section>
        <Container>
          <h1>Category not found</h1>
          <p>The category you are looking for does not exist.</p>
          <div className="mt-8">
            <BackButton />
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="space-y-6">
        <Prose className="mb-8">
          <h1>{category.name}</h1>
          {category.description && (
            <div
              dangerouslySetInnerHTML={{ __html: category.description }}
              className="mt-4"
            />
          )}
        </Prose>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-center text-gray-500">
            No hay posts en esta categoría.
          </p>
        )}

        <div className="mt-8">
          <BackButton />
        </div>
      </Container>
    </Section>
  );
} 