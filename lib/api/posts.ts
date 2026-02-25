import Post from '@/types/post';
import { axiosInstance } from '@/lib/axios';
interface ApiResponse {
    posts: Post[];
}

export interface PaginatedPostsResponse {
  posts: Post[];
  total: number;
  totalPages: number;
}

export interface FetchPaginatedPostsParams {
  page: number;
  perPage: number;
  domain?: string;
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

export const fetchPaginatedPosts = async ({ page, perPage, domain }: FetchPaginatedPostsParams): Promise<PaginatedPostsResponse> => {
  try {
    const currentDomain = domain || (typeof window !== 'undefined' ? window.location.origin : '');
    const cleanedDomain = cleanDomain(currentDomain === 'http://localhost:3000' ? 'https://www.tendenciascripto.com/' : currentDomain);

    console.log(`📄 Fetching paginated posts — page: ${page}, perPage: ${perPage}, domain: ${cleanedDomain}`);

    const response = await axiosInstance.get<PaginatedPostsResponse>(
      `/api/wp/v2/posts?domain=${cleanedDomain}&page=${page}&per_page=${perPage}`
    );

    return {
      posts: response.data?.posts || [],
      total: response.data?.total || 0,
      totalPages: response.data?.totalPages || 0,
    };
  } catch (error) {
    console.error('❌ Error fetching paginated posts:', error);
    return { posts: [], total: 0, totalPages: 0 };
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