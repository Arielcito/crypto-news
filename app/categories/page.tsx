import { Section, Container, Prose } from "@/components/craft";
import { Metadata } from "next";
import BackButton from "@/components/back";
import Link from "next/link";
import { fetchCategories } from "@/lib/api/categories";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse all categories of our blog posts",
  alternates: {
    canonical: "/posts/categories",
  },
};

export default async function Page() {
  const categories = await fetchCategories();

  return (
    <Section>
      <Container className="space-y-6">
        <Prose className="mb-8">
          <h2>All Categories</h2>
          <ul className="grid gap-4">
            {categories.map((category: any) => (
              <li key={category.id} className="hover:text-primary transition-colors">
                <Link href={`/posts/categories/${category.slug}`}>
                  {category.name}
                  <span className="text-sm text-gray-500 ml-2">
                    ({category.count} posts)
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Prose>
        <BackButton />
      </Container>
    </Section>
  );
}
