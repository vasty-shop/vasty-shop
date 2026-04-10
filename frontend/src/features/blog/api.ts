import { apiClient } from '@/lib/api-client';
import type {
  BlogPost,
  BlogComment,
  BlogCategory,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateCommentDto,
  CreateCategoryDto,
  BlogQueryParams,
  CommentQueryParams,
  PaginatedResponse,
  LikeResponse,
  RatingResponse,
  ImageUploadResponse,
  BlogStats,
  PopularTag,
} from './types';

const BASE_URL = '/blog';

export const blogApi = {
  // PUBLIC ENDPOINTS
  async getPosts(params?: BlogQueryParams): Promise<PaginatedResponse<BlogPost>> {
    try {
      const response = await apiClient.get<PaginatedResponse<BlogPost>>(
        `${BASE_URL}/posts`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch blog posts');
    }
  },

  async getPostBySlug(slug: string): Promise<BlogPost> {
    try {
      const response = await apiClient.get<BlogPost>(`${BASE_URL}/posts/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Blog post not found');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch blog post');
    }
  },

  async getPostById(id: string): Promise<BlogPost> {
    try {
      const response = await apiClient.get<BlogPost>(`${BASE_URL}/posts/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Blog post not found');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch blog post');
    }
  },

  async getComments(postId: string, params?: CommentQueryParams): Promise<PaginatedResponse<BlogComment>> {
    try {
      const response = await apiClient.get<PaginatedResponse<BlogComment>>(
        `${BASE_URL}/posts/${postId}/comments`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  },

  async getCategories(): Promise<BlogCategory[]> {
    try {
      const response = await apiClient.get<BlogCategory[]>(`${BASE_URL}/categories`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  async getPopularTags(): Promise<PopularTag[]> {
    try {
      const response = await apiClient.get<PopularTag[]>(`${BASE_URL}/tags`);
      return response.data;
    } catch (error: any) {
      return [];
    }
  },

  async getStats(): Promise<BlogStats> {
    try {
      const response = await apiClient.get<BlogStats>(`${BASE_URL}/stats`);
      return response.data;
    } catch (error: any) {
      return {
        totalPosts: 0,
        publishedPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        categoriesCount: 0,
      };
    }
  },

  // AUTHENTICATED ENDPOINTS
  async toggleLike(postId: string): Promise<LikeResponse> {
    try {
      const response = await apiClient.post<LikeResponse>(`${BASE_URL}/posts/${postId}/like`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle like');
    }
  },

  async ratePost(postId: string, rating: number): Promise<RatingResponse> {
    try {
      const response = await apiClient.post<RatingResponse>(`${BASE_URL}/posts/${postId}/rate`, { rating });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to rate post');
    }
  },

  async createComment(postId: string, data: CreateCommentDto): Promise<BlogComment> {
    try {
      const response = await apiClient.post<BlogComment>(`${BASE_URL}/posts/${postId}/comments`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create comment');
    }
  },

  // BLOGGER ROLE ENDPOINTS
  async getMyPosts(params?: BlogQueryParams): Promise<PaginatedResponse<BlogPost>> {
    try {
      const response = await apiClient.get<PaginatedResponse<BlogPost>>(
        `${BASE_URL}/my-posts`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your posts');
    }
  },

  async createPost(data: CreateBlogPostDto): Promise<BlogPost> {
    try {
      const response = await apiClient.post<BlogPost>(`${BASE_URL}/posts`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to create blog posts.');
      }
      throw new Error(error.response?.data?.message || 'Failed to create blog post');
    }
  },

  async updatePost(id: string, data: UpdateBlogPostDto): Promise<BlogPost> {
    try {
      const response = await apiClient.put<BlogPost>(`${BASE_URL}/posts/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Blog post not found or you do not have permission to edit it');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to edit this blog post');
      }
      throw new Error(error.response?.data?.message || 'Failed to update blog post');
    }
  },

  async deletePost(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/posts/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Blog post not found or you do not have permission to delete it');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this blog post');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete blog post');
    }
  },

  async uploadImages(files: File[]): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      const response = await apiClient.post<ImageUploadResponse>(`${BASE_URL}/images/upload`, formData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to upload images');
      }
      throw new Error(error.response?.data?.message || 'Failed to upload images');
    }
  },

  // ADMIN ENDPOINTS
  async createCategory(data: CreateCategoryDto): Promise<BlogCategory> {
    try {
      const response = await apiClient.post<BlogCategory>(`${BASE_URL}/categories`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to create categories');
      }
      throw new Error(error.response?.data?.message || 'Failed to create category');
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/categories/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Category not found');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete categories');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete category');
    }
  },
};

export default blogApi;
