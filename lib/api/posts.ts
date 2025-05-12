import Post from '@/types/post';
import { axiosInstance } from '@/lib/axios';
interface ApiResponse {
  data: {
    posts: Post[];
  };
}

interface SinglePostResponse {
  data: Post;
  error: string | null;
  message: string | null;
}

export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await axiosInstance.get<ApiResponse>(`/api/wp/v2/posts?domain=${currentDomain === 'http://localhost:3000' ? 'bitcoinarg.news' : currentDomain}`);
    const apiPosts = response.data.data?.posts || [];

    return apiPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const fetchPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
    const response = await axiosInstance.get<SinglePostResponse>(
      `/api/wp/v2/posts/by-slug/${slug}`
    );
    
    if (response.data.error) {
      console.error('Error fetching post:', response.data.error);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}; 