import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '../api';
import type {
  BlogQueryParams,
  CommentQueryParams,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateCommentDto,
  CreateCategoryDto,
} from '../types';

// Query keys factory
export const blogKeys = {
  all: ['blog'] as const,
  posts: () => [...blogKeys.all, 'posts'] as const,
  postsList: (params?: BlogQueryParams) => [...blogKeys.posts(), 'list', params] as const,
  postsDetail: () => [...blogKeys.posts(), 'detail'] as const,
  postDetail: (idOrSlug: string) => [...blogKeys.postsDetail(), idOrSlug] as const,
  myPosts: (params?: BlogQueryParams) => [...blogKeys.posts(), 'my', params] as const,
  comments: (postId: string, params?: CommentQueryParams) => [...blogKeys.all, 'comments', postId, params] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
  tags: () => [...blogKeys.all, 'tags'] as const,
  stats: () => [...blogKeys.all, 'stats'] as const,
};

// PUBLIC QUERIES
export function useBlogPosts(params?: BlogQueryParams) {
  return useQuery({
    queryKey: blogKeys.postsList(params),
    queryFn: () => blogApi.getPosts(params),
    staleTime: 30000,
  });
}

export function useBlogPostBySlug(slug: string | null) {
  return useQuery({
    queryKey: blogKeys.postDetail(slug || ''),
    queryFn: () => blogApi.getPostBySlug(slug!),
    enabled: !!slug,
    staleTime: 60000,
  });
}

export function useBlogPost(id: string | null) {
  return useQuery({
    queryKey: blogKeys.postDetail(id || ''),
    queryFn: () => blogApi.getPostById(id!),
    enabled: !!id,
    staleTime: 60000,
  });
}

// Alias for useBlogPost
export const useBlogPostById = useBlogPost;

export function useBlogComments(postId: string | null, params?: CommentQueryParams) {
  return useQuery({
    queryKey: blogKeys.comments(postId || '', params),
    queryFn: () => blogApi.getComments(postId!, params),
    enabled: !!postId,
    staleTime: 30000,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: blogKeys.categories(),
    queryFn: () => blogApi.getCategories(),
    staleTime: 300000,
  });
}

export function usePopularTags() {
  return useQuery({
    queryKey: blogKeys.tags(),
    queryFn: () => blogApi.getPopularTags(),
    staleTime: 300000,
  });
}

export function useBlogStats() {
  return useQuery({
    queryKey: blogKeys.stats(),
    queryFn: () => blogApi.getStats(),
    staleTime: 60000,
  });
}

// AUTHENTICATED MUTATIONS
export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => blogApi.toggleLike(postId),
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(postId) });
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
    },
  });
}

export function useRatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, rating }: { postId: string; rating: number }) =>
      blogApi.ratePost(postId, rating),
    onSuccess: (data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(postId) });
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CreateCommentDto }) =>
      blogApi.createComment(postId, data),
    onSuccess: (data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(postId) });
    },
  });
}

// BLOGGER ROLE MUTATIONS
export function useMyBlogPosts(params?: BlogQueryParams) {
  return useQuery({
    queryKey: blogKeys.myPosts(params),
    queryFn: () => blogApi.getMyPosts(params),
    staleTime: 30000,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogPostDto) => blogApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      queryClient.invalidateQueries({ queryKey: blogKeys.stats() });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostDto }) =>
      blogApi.updatePost(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(id) });
      queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(data.slug) });
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      queryClient.invalidateQueries({ queryKey: blogKeys.stats() });
    },
  });
}

export function useUploadBlogImages() {
  return useMutation({
    mutationFn: (files: File[]) => blogApi.uploadImages(files),
  });
}

// ADMIN MUTATIONS
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => blogApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
    },
  });
}

// UTILITY HOOKS
export function usePrefetchBlogPost() {
  const queryClient = useQueryClient();
  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: blogKeys.postDetail(slug),
      queryFn: () => blogApi.getPostBySlug(slug),
      staleTime: 60000,
    });
  };
}

export function useInvalidateBlogQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: blogKeys.all });
  };
}
