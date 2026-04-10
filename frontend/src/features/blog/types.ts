// Blog Post Status
export type PostStatus = 'draft' | 'published' | 'archived';

// Blog Type (for filtering)
export type BlogType = 'popular' | 'featured' | 'latest' | 'all';

// Blog Post Interface
export interface BlogPost {
  id: string;
  userId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  category?: string;
  tags?: string[];
  imageUrls?: string[];
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  author?: string;
  authorAvatar?: string;
  rating?: number;
  ratingCount?: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  userHasLiked?: boolean;
  userRating?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Blog Comment Interface
export interface BlogComment {
  id: string;
  postId: string;
  userId?: string;
  content: string;
  parentCommentId?: string;
  authorName?: string;
  likesCount: number;
  replies?: BlogComment[];
  createdAt: string;
  updatedAt: string;
}

// Blog Category Interface
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

// Create Blog Post DTO
export interface CreateBlogPostDto {
  title: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  category?: string;
  tags?: string[];
  imageUrls?: string[];
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  author?: string;
}

// Update Blog Post DTO
export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  category?: string;
  tags?: string[];
  imageUrls?: string[];
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  author?: string;
}

// Create Comment DTO
export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

// Create Category DTO
export interface CreateCategoryDto {
  name: string;
  description?: string;
}

// Blog Query Parameters
export interface BlogQueryParams {
  type?: BlogType;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: PostStatus;
}

// Comment Query Parameters
export interface CommentQueryParams {
  page?: number;
  limit?: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Like Response
export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

// Rating Response
export interface RatingResponse {
  rating: number;
  averageRating: number;
  ratingCount: number;
}

// Image Upload Response
export interface ImageUploadResponse {
  urls: string[];
  message: string;
}

// Blog Stats
export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  totalComments: number;
  totalLikes: number;
  categoriesCount: number;
}

// Popular Tag
export interface PopularTag {
  name: string;
  count: number;
}
