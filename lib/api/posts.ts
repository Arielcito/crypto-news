import axios from 'axios';
import { Post } from '@/types/post';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  content: string;
  categories: Array<{ name: string }>;
  featuredMedia: string;
}

interface ApiResponse {
  data: {
    posts: ApiPost[];
  };
}

export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get<ApiResponse>(`${API_URL}/api/wp/v2/posts`);
    const apiPosts = response.data.data?.posts || [];

    return apiPosts.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      excerpt: post.excerpt || '',
      category: post.categories?.[0]?.name || 'Noticias',
      date: new Date(post.date).toISOString().split('T')[0],
      readTime: '5 min',
      image: post.featuredMedia || 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: post.content || ''
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}; 