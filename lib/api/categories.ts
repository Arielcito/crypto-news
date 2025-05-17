import { axiosInstance } from '@/lib/axios';
import Post from '@/types/post';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  domain: string;
  isActive: boolean;
}

interface CategoriesResponse {
  data: {
    categories: Category[];
    total: number;
  };
  error: string | null;
  message: string | null;
}

interface PostsResponse {
  data: {
    posts: Post[];
    total: number;
  };
  error: string | null;
  message: string | null;
}

interface SingleCategoryResponse {
  data: Category;
  error: string | null;
  message: string | null;
}

interface CreateCategoryData {
  name: string;
  slug: string;
  domain: string;
}

interface UpdateCategoryData {
  id: number;
  name?: string;
  slug?: string;
  domain?: string;
  isActive?: boolean;
}

const cleanDomain = (domain: string): string => {
  // Remove protocol (http:// or https://)
  let cleaned = domain.replace(/^https?:\/\//, '');
  // Remove www. if present
  cleaned = cleaned.replace(/^www\./, '');
  return cleaned;
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosInstance.get<CategoriesResponse>('/api/wp/v2/categories');
    const categories = response.data.data?.categories || [];
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const response = await axiosInstance.get<SingleCategoryResponse>(
      `/api/wp/v2/categories/by-slug/${slug}`
    );
    
    if (response.data.error) {
      console.error('Error fetching category:', response.data.error);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
};

export const fetchPostsByCategory = async (categorySlug: string): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get<PostsResponse>(`/api/wp/v2/posts?categories=${categorySlug}`);
    const posts = response.data.data?.posts || [];
    return posts;
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }
};

export const createCategory = async (data: CreateCategoryData): Promise<Category | null> => {
  try {
    const response = await axiosInstance.post<SingleCategoryResponse>('/api/wp/v2/categories', data);
    
    if (response.data.error) {
      console.error('Error creating category:', response.data.error);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error('Error creating category:', error);
    return null;
  }
};

export const updateCategory = async (data: UpdateCategoryData): Promise<Category | null> => {
  try {
    const response = await axiosInstance.put<SingleCategoryResponse>('/api/wp/v2/categories', data);
    
    if (response.data.error) {
      console.error('Error updating category:', response.data.error);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
};

export const deleteCategory = async (id: number): Promise<Category | null> => {
  try {
    const response = await axiosInstance.delete<SingleCategoryResponse>(`/api/wp/v2/categories?id=${id}`);
    
    if (response.data.error) {
      console.error('Error deleting category:', response.data.error);
      return null;
    }

    return response.data.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    return null;
  }
}; 