import Post from '@/types/post';
import { axiosInstance } from '@/lib/axios';
interface ApiResponse {
    posts: Post[];
}

interface SinglePostResponse {
  data: Post;
  error: string | null;
  message: string | null;
}

export const cleanDomain = (domain: string): string => {
  // Remove protocol (http:// or https://)
  let cleaned = domain.replace(/^https?:\/\//, '');
  // Remove www. if present
  cleaned = cleaned.replace(/^www\./, '');
  // Remove trailing slash if present
  cleaned = cleaned.replace(/\/$/, '');
  
  return cleaned;
};

export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
    const cleanedDomain = cleanDomain(currentDomain === 'http://localhost:3000' ? 'https://www.tendenciascripto.com/' : currentDomain);
    const response = await axiosInstance.get<ApiResponse>(`/api/wp/v2/posts?domain=${cleanedDomain}`);
    const apiPosts = response.data?.posts || [];

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