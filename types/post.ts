interface Post {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  content: string;
  categories: Array<{ id: number; name: string }>;
  featuredMedia: string;
  slug: string;
  domain: string;
  views?: number;
}

export default Post;