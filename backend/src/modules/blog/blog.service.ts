import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateCommentDto,
  CreateCategoryDto,
  BlogQueryDto,
  CommentQueryDto,
  BlogPostResponseDto,
  PaginatedBlogPostsDto,
  CommentResponseDto,
  PaginatedCommentsDto,
  CategoryResponseDto,
  LikeResponseDto,
  RatingResponseDto,
} from './dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly db: DatabaseService) {}

  // =============================================
  // POSTS
  // =============================================

  async getPosts(userId: string | null, query: BlogQueryDto): Promise<PaginatedBlogPostsDto> {
    const { type = 'latest', category, search, status = 'published', page = 1, limit = 10 } = query;

    try {
      let queryBuilder = this.db.query_builder()
        .from('blog_posts')
        .select('*');

      // Status filter (for public, only show published)
      queryBuilder = queryBuilder.where('status', status);

      // Search filter - use ilike for case-insensitive search
      if (search) {
        queryBuilder = queryBuilder.ilike('title', `%${search}%`);
      }

      // Featured filter
      if (type === 'featured') {
        queryBuilder = queryBuilder.where('featured', true);
      }

      // Apply ordering based on type
      if (type === 'popular') {
        queryBuilder = queryBuilder.orderBy('views_count', 'desc');
      } else {
        queryBuilder = queryBuilder.orderBy('published_at', 'desc');
      }

      let posts = await queryBuilder.get();

      // Category filter - filter in JavaScript since @> operator may not work
      // Category is stored in tags as 'cat:CategoryName'
      if (category && category !== 'all' && posts && posts.length > 0) {
        const categoryTag = `cat:${category}`;
        posts = posts.filter((post: any) => {
          const tags = post.tags || [];
          // Check if any tag matches the category (case-insensitive)
          return tags.some((tag: string) =>
            tag.toLowerCase() === categoryTag.toLowerCase()
          );
        });
      }

      // Calculate total before pagination
      const total = posts?.length || 0;

      // Apply pagination in JavaScript
      const offset = (page - 1) * limit;
      const paginatedPosts = (posts || []).slice(offset, offset + limit);

      // Map posts to response format
      const mappedPosts = await Promise.all(paginatedPosts.map(async (post: any) => {
        const mappedPost = this.mapPostRow(post);

        // Check if user has liked/rated this post
        if (userId) {
          try {
            const like = await this.db.query_builder()
              .from('blog_likes')
              .select('id')
              .where('post_id', post.id)
              .where('user_id', userId)
              .limit(1)
              .get();
            mappedPost.userHasLiked = like && like.length > 0;

            const rating = await this.db.query_builder()
              .from('blog_ratings')
              .select('rating')
              .where('post_id', post.id)
              .where('user_id', userId)
              .limit(1)
              .get();
            mappedPost.userRating = rating && rating.length > 0 ? rating[0].rating : null;
          } catch {
            // Tables might not exist yet
            mappedPost.userHasLiked = false;
            mappedPost.userRating = null;
          }
        }

        return mappedPost;
      }));

      return {
        data: mappedPosts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error(`Failed to get posts: ${error.message}`);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async getPostBySlug(userId: string | null, slug: string): Promise<BlogPostResponseDto> {
    try {
      const posts = await this.db.query_builder()
        .from('blog_posts')
        .select('*')
        .where('slug', slug)
        .limit(1)
        .get();

      if (!posts || posts.length === 0) {
        throw new NotFoundException('Blog post not found');
      }

      const post = posts[0];

      // Increment view count
      await this.db.query_builder()
        .from('blog_posts')
        .where('slug', slug)
        .update({ views_count: (post.views_count || 0) + 1 })
        .execute();

      const mappedPost = this.mapPostRow(post);

      // Check if user has liked/rated this post
      if (userId) {
        try {
          const like = await this.db.query_builder()
            .from('blog_likes')
            .select('id')
            .where('post_id', post.id)
            .where('user_id', userId)
            .limit(1)
            .get();
          mappedPost.userHasLiked = like && like.length > 0;

          const rating = await this.db.query_builder()
            .from('blog_ratings')
            .select('rating')
            .where('post_id', post.id)
            .where('user_id', userId)
            .limit(1)
            .get();
          mappedPost.userRating = rating && rating.length > 0 ? rating[0].rating : null;
        } catch {
          mappedPost.userHasLiked = false;
          mappedPost.userRating = null;
        }
      }

      return mappedPost;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to get post by slug: ${error.message}`);
      throw new NotFoundException('Blog post not found');
    }
  }

  async getPostById(userId: string | null, id: string): Promise<BlogPostResponseDto> {
    try {
      const posts = await this.db.query_builder()
        .from('blog_posts')
        .select('*')
        .where('id', id)
        .limit(1)
        .get();

      if (!posts || posts.length === 0) {
        throw new NotFoundException('Blog post not found');
      }

      const post = posts[0];
      const mappedPost = this.mapPostRow(post);

      // Check if user has liked/rated this post
      if (userId) {
        try {
          const like = await this.db.query_builder()
            .from('blog_likes')
            .select('id')
            .where('post_id', post.id)
            .where('user_id', userId)
            .limit(1)
            .get();
          mappedPost.userHasLiked = like && like.length > 0;

          const rating = await this.db.query_builder()
            .from('blog_ratings')
            .select('rating')
            .where('post_id', post.id)
            .where('user_id', userId)
            .limit(1)
            .get();
          mappedPost.userRating = rating && rating.length > 0 ? rating[0].rating : null;
        } catch {
          mappedPost.userHasLiked = false;
          mappedPost.userRating = null;
        }
      }

      return mappedPost;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to get post by id: ${error.message}`);
      throw new NotFoundException('Blog post not found');
    }
  }

  async getMyPosts(userId: string, query: BlogQueryDto): Promise<PaginatedBlogPostsDto> {
    const { status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    try {
      let queryBuilder = this.db.query_builder()
        .from('blog_posts')
        .select('*')
        .where('user_id', userId);

      if (status) {
        queryBuilder = queryBuilder.where('status', status);
      }

      queryBuilder = queryBuilder
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const posts = await queryBuilder.get();

      // Get total count
      let countQuery = this.db.query_builder()
        .from('blog_posts')
        .select('id')
        .where('user_id', userId);

      if (status) {
        countQuery = countQuery.where('status', status);
      }

      const allPosts = await countQuery.get();
      const total = allPosts?.length || 0;

      return {
        data: (posts || []).map((post: any) => this.mapPostRow(post)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error(`Failed to get user posts: ${error.message}`);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async createPost(userId: string, dto: CreateBlogPostDto, userContext?: any): Promise<BlogPostResponseDto> {
    const slug = await this.generateUniqueSlug(dto.title);

    // Get author name and avatar from user context or dto
    let authorName = dto.author || 'Anonymous';
    let authorAvatar = '';
    if (userContext) {
      if (!dto.author) {
        authorName = userContext.user_metadata?.full_name ||
                     userContext.user_metadata?.name ||
                     userContext.raw_user_meta_data?.full_name ||
                     userContext.raw_user_meta_data?.name ||
                     userContext.name ||
                     userContext.full_name ||
                     userContext.email?.split('@')[0] ||
                     'Anonymous';
      }
      // Get avatar URL
      authorAvatar = userContext.user_metadata?.avatar ||
                     userContext.user_metadata?.avatarUrl ||
                     userContext.raw_user_meta_data?.avatar ||
                     userContext.raw_user_meta_data?.avatarUrl ||
                     userContext.avatar ||
                     userContext.avatarUrl ||
                     '';
    }

    const publishedAt = dto.status === 'published' ? new Date().toISOString() : null;
    const now = new Date().toISOString();

    // Note: category and author columns may not exist in DB yet
    // Store category in tags array as first element with prefix, author in meta_title suffix
    const tagsWithCategory = dto.category
      ? [`cat:${dto.category}`, ...(dto.tags || [])]
      : (dto.tags || []);

    const postData = {
      user_id: userId,
      title: dto.title,
      slug: slug,
      excerpt: dto.excerpt || null,
      content: dto.content,
      image_urls: dto.imageUrls || [],
      status: dto.status || 'draft',
      tags: tagsWithCategory,
      featured: dto.featured || false,
      meta_title: dto.metaTitle || dto.title,
      meta_description: dto.metaDescription
        ? `${dto.metaDescription}||author:${authorName}||avatar:${authorAvatar}`
        : `||author:${authorName}||avatar:${authorAvatar}`,
      rating: 0,
      rating_count: 0,
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      published_at: publishedAt,
      created_at: now,
      updated_at: now,
    };

    try {
      const result = await this.db.query_builder()
        .from('blog_posts')
        .insert(postData)
        .returning('*')
        .execute();

      const post = result?.data?.[0] || result?.[0] || result;
      return this.mapPostRow(post);
    } catch (error: any) {
      this.logger.error(`Failed to create post: ${error.message}`);
      throw new BadRequestException('Failed to create blog post');
    }
  }

  async updatePost(userId: string, postId: string, dto: UpdateBlogPostDto): Promise<BlogPostResponseDto> {
    // Check ownership
    const post = await this.getPostById(null, postId);
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) {
      updateData.title = dto.title;
      // Update slug if title changes
      const newSlug = await this.generateUniqueSlug(dto.title, postId);
      updateData.slug = newSlug;
    }
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.excerpt !== undefined) updateData.excerpt = dto.excerpt;
    // Handle category and tags together (category stored as cat: prefix in tags)
    if (dto.category !== undefined || dto.tags !== undefined) {
      const existingTags = (post.tags || []).filter((t: string) => !t.startsWith('cat:'));
      const newTags = dto.tags !== undefined ? dto.tags : existingTags;
      const tagsWithCategory = dto.category
        ? [`cat:${dto.category}`, ...newTags.filter((t: string) => !t.startsWith('cat:'))]
        : newTags;
      updateData.tags = tagsWithCategory;
    }
    if (dto.imageUrls !== undefined) updateData.image_urls = dto.imageUrls;
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      // Set published_at if publishing
      if (dto.status === 'published' && post.status !== 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (dto.featured !== undefined) updateData.featured = dto.featured;
    if (dto.metaTitle !== undefined) updateData.meta_title = dto.metaTitle;
    // Handle meta_description and author together
    if (dto.metaDescription !== undefined || dto.author !== undefined) {
      const currentMeta = post.metaDescription || '';
      const [existingDesc] = currentMeta.split('||author:');
      const newDesc = dto.metaDescription !== undefined ? dto.metaDescription : existingDesc;
      const newAuthor = dto.author !== undefined ? dto.author : post.author;
      updateData.meta_description = newAuthor ? `${newDesc}||author:${newAuthor}` : newDesc;
    }

    try {
      const result = await this.db.query_builder()
        .from('blog_posts')
        .where('id', postId)
        .update(updateData)
        .returning('*')
        .execute();

      const updatedPost = result?.data?.[0] || result?.[0] || result;
      return this.mapPostRow(updatedPost);
    } catch (error: any) {
      this.logger.error(`Failed to update post: ${error.message}`);
      throw new BadRequestException('Failed to update blog post');
    }
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.getPostById(null, postId);
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    try {
      await this.db.query_builder()
        .from('blog_posts')
        .where('id', postId)
        .delete()
        .execute();
    } catch (error: any) {
      this.logger.error(`Failed to delete post: ${error.message}`);
      throw new BadRequestException('Failed to delete blog post');
    }
  }

  // =============================================
  // LIKES & RATINGS
  // =============================================

  async togglePostLike(userId: string, postId: string): Promise<LikeResponseDto> {
    try {
      // Check if already liked
      const existingLike = await this.db.query_builder()
        .from('blog_likes')
        .select('id')
        .where('post_id', postId)
        .where('user_id', userId)
        .limit(1)
        .get();

      let liked: boolean;

      if (existingLike && existingLike.length > 0) {
        // Unlike
        await this.db.query_builder()
          .from('blog_likes')
          .where('post_id', postId)
          .where('user_id', userId)
          .delete()
          .execute();

        // Decrement count
        const post = await this.getPostById(null, postId);
        await this.db.query_builder()
          .from('blog_posts')
          .where('id', postId)
          .update({ likes_count: Math.max(0, (post.likesCount || 0) - 1) })
          .execute();

        liked = false;
      } else {
        // Like
        await this.db.query_builder()
          .from('blog_likes')
          .insert({
            post_id: postId,
            user_id: userId,
            created_at: new Date().toISOString(),
          })
          .execute();

        // Increment count
        const post = await this.getPostById(null, postId);
        await this.db.query_builder()
          .from('blog_posts')
          .where('id', postId)
          .update({ likes_count: (post.likesCount || 0) + 1 })
          .execute();

        liked = true;
      }

      const updatedPost = await this.getPostById(null, postId);

      return {
        liked,
        likesCount: updatedPost.likesCount || 0,
      };
    } catch (error: any) {
      this.logger.error(`Failed to toggle like: ${error.message}`);
      throw new BadRequestException('Failed to toggle like');
    }
  }

  async ratePost(userId: string, postId: string, rating: number): Promise<RatingResponseDto> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    try {
      // Check if user already rated
      const existingRating = await this.db.query_builder()
        .from('blog_ratings')
        .select('id')
        .where('post_id', postId)
        .where('user_id', userId)
        .limit(1)
        .get();

      if (existingRating && existingRating.length > 0) {
        // Update existing rating
        await this.db.query_builder()
          .from('blog_ratings')
          .where('post_id', postId)
          .where('user_id', userId)
          .update({ rating, created_at: new Date().toISOString() })
          .execute();
      } else {
        // Create new rating
        await this.db.query_builder()
          .from('blog_ratings')
          .insert({
            post_id: postId,
            user_id: userId,
            rating,
            created_at: new Date().toISOString(),
          })
          .execute();
      }

      // Recalculate average
      const allRatings = await this.db.query_builder()
        .from('blog_ratings')
        .select('rating')
        .where('post_id', postId)
        .get();

      const ratingCount = allRatings?.length || 0;
      const avgRating = ratingCount > 0
        ? allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingCount
        : 0;

      // Update post
      await this.db.query_builder()
        .from('blog_posts')
        .where('id', postId)
        .update({
          rating: Math.round(avgRating * 100) / 100,
          rating_count: ratingCount,
        })
        .execute();

      return {
        rating,
        averageRating: Math.round(avgRating * 100) / 100,
        ratingCount,
      };
    } catch (error: any) {
      this.logger.error(`Failed to rate post: ${error.message}`);
      throw new BadRequestException('Failed to rate post');
    }
  }

  // =============================================
  // COMMENTS
  // =============================================

  async getComments(userId: string | null, postId: string, query: CommentQueryDto): Promise<PaginatedCommentsDto> {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    try {
      // Get top-level comments
      const comments = await this.db.query_builder()
        .from('blog_comments')
        .select('*')
        .where('post_id', postId)
        .whereNull('parent_id')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      // Get total count
      const allComments = await this.db.query_builder()
        .from('blog_comments')
        .select('id')
        .where('post_id', postId)
        .whereNull('parent_id')
        .get();

      const total = allComments?.length || 0;

      // Get replies for each comment
      const commentIds = (comments || []).map((c: any) => c.id);
      let repliesMap: Record<string, CommentResponseDto[]> = {};

      if (commentIds.length > 0) {
        const replies = await this.db.query_builder()
          .from('blog_comments')
          .select('*')
          .whereIn('parent_id', commentIds)
          .orderBy('created_at', 'asc')
          .get();

        repliesMap = (replies || []).reduce((acc: any, reply: any) => {
          const parentId = reply.parent_id;
          if (!acc[parentId]) acc[parentId] = [];
          acc[parentId].push(this.mapCommentRow(reply));
          return acc;
        }, {} as Record<string, CommentResponseDto[]>);
      }

      const mappedComments = (comments || []).map((row: any) => ({
        ...this.mapCommentRow(row),
        replies: repliesMap[row.id] || [],
      }));

      return {
        data: mappedComments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error(`Failed to get comments: ${error.message}`);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async createComment(userId: string, postId: string, dto: CreateCommentDto, userContext?: any): Promise<CommentResponseDto> {
    // Get author name from user context
    let authorName = 'Anonymous';
    if (userContext) {
      authorName = userContext.user_metadata?.full_name ||
                   userContext.user_metadata?.name ||
                   userContext.raw_user_meta_data?.full_name ||
                   userContext.raw_user_meta_data?.name ||
                   userContext.name ||
                   userContext.full_name ||
                   userContext.email?.split('@')[0] ||
                   'Anonymous';
    }

    const now = new Date().toISOString();

    try {
      // Note: author_name and likes_count columns may not exist in DB
      // Store author name at start of content with prefix
      const contentWithAuthor = `[author:${authorName}]${dto.content}`;

      const commentData = {
        post_id: postId,
        user_id: userId,
        parent_id: dto.parentCommentId || null,
        content: contentWithAuthor,
        status: 'approved',
        created_at: now,
        updated_at: now,
      };

      const result = await this.db.query_builder()
        .from('blog_comments')
        .insert(commentData)
        .returning('*')
        .execute();

      const comment = result?.data?.[0] || result?.[0] || result;
      // Inject author name for response
      comment._authorName = authorName;

      // Update comment count on post
      const post = await this.getPostById(null, postId);
      await this.db.query_builder()
        .from('blog_posts')
        .where('id', postId)
        .update({ comments_count: (post.commentsCount || 0) + 1 })
        .execute();

      return this.mapCommentRow(comment);
    } catch (error: any) {
      this.logger.error(`Failed to create comment: ${error.message}`);
      throw new BadRequestException('Failed to create comment');
    }
  }

  // =============================================
  // CATEGORIES
  // =============================================

  async getCategories(): Promise<CategoryResponseDto[]> {
    try {
      const categories = await this.db.query_builder()
        .from('blog_categories')
        .select('*')
        .orderBy('name', 'asc')
        .get();

      return (categories || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        createdAt: row.created_at,
      }));
    } catch (error: any) {
      this.logger.error(`Failed to get categories: ${error.message}`);
      return [];
    }
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const slug = this.generateSlug(dto.name);

    try {
      const result = await this.db.query_builder()
        .from('blog_categories')
        .insert({
          name: dto.name,
          slug: slug,
          description: dto.description || null,
          created_at: new Date().toISOString(),
        })
        .returning('*')
        .execute();

      const category = result?.data?.[0] || result?.[0] || result;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdAt: category.created_at,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create category: ${error.message}`);
      throw new BadRequestException('Failed to create category');
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await this.db.query_builder()
        .from('blog_categories')
        .where('id', id)
        .delete()
        .execute();
    } catch (error: any) {
      this.logger.error(`Failed to delete category: ${error.message}`);
      throw new BadRequestException('Failed to delete category');
    }
  }

  // =============================================
  // TAGS & STATS
  // =============================================

  async getPopularTags(): Promise<{ name: string; count: number }[]> {
    try {
      // Get all published posts and count tag occurrences
      const posts = await this.db.query_builder()
        .from('blog_posts')
        .select('tags')
        .where('status', 'published')
        .get();

      const tagCounts: Record<string, number> = {};
      for (const post of posts || []) {
        const tags = post.tags || [];
        for (const tag of tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }

      return Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    } catch (error: any) {
      this.logger.error(`Failed to get popular tags: ${error.message}`);
      return [];
    }
  }

  async getBlogStats(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    totalComments: number;
    totalLikes: number;
    categoriesCount: number;
  }> {
    try {
      const [posts, publishedPosts, comments, likes, categories] = await Promise.all([
        this.db.query_builder().from('blog_posts').select('id').get(),
        this.db.query_builder().from('blog_posts').select('id').where('status', 'published').get(),
        this.db.query_builder().from('blog_comments').select('id').get().catch(() => []),
        this.db.query_builder().from('blog_likes').select('id').get().catch(() => []),
        this.db.query_builder().from('blog_categories').select('id').get(),
      ]);

      return {
        totalPosts: posts?.length || 0,
        publishedPosts: publishedPosts?.length || 0,
        totalComments: comments?.length || 0,
        totalLikes: likes?.length || 0,
        categoriesCount: categories?.length || 0,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get blog stats: ${error.message}`);
      return {
        totalPosts: 0,
        publishedPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        categoriesCount: 0,
      };
    }
  }

  // =============================================
  // IMAGE UPLOAD
  // =============================================

  async uploadImages(files: Express.Multer.File[]): Promise<{ urls: string[]; message: string }> {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const extension = file.mimetype.split('/')[1] || 'jpg';
      const fileName = `blog-${timestamp}-${i}.${extension}`;

      try {
        // Upload to database storage
        const result = await /* TODO: use StorageService */ this.db.uploadFile(
          'blog-images',
          file.buffer,
          fileName,
          {
            contentType: file.mimetype,
            metadata: {
              originalName: file.originalname,
              uploadedAt: new Date().toISOString(),
            },
          }
        );

        // Get the public URL
        if (result && result.url) {
          uploadedUrls.push(result.url);
        } else if (result && result.path) {
          // If URL not directly returned, construct or get public URL
          const publicUrlResult = await /* TODO: use StorageService */ this.db.getPublicUrl('blog-images', fileName);
          if (publicUrlResult?.publicUrl) {
            uploadedUrls.push(publicUrlResult.publicUrl);
          }
        } else {
          this.logger.warn(`Upload result missing URL for file ${fileName}:`, result);
          // Fallback - try to get public URL
          try {
            const publicUrlResult = await /* TODO: use StorageService */ this.db.getPublicUrl('blog-images', fileName);
            if (publicUrlResult?.publicUrl) {
              uploadedUrls.push(publicUrlResult.publicUrl);
            }
          } catch (urlError) {
            this.logger.error(`Failed to get public URL for ${fileName}:`, urlError);
          }
        }
      } catch (error: any) {
        this.logger.error(`Failed to upload image ${file.originalname}:`, error.message);
        // Continue with other files even if one fails
      }
    }

    if (uploadedUrls.length === 0) {
      throw new BadRequestException('Failed to upload any images');
    }

    return {
      urls: uploadedUrls,
      message: `${uploadedUrls.length} image(s) uploaded successfully`,
    };
  }

  // =============================================
  // HELPERS
  // =============================================

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let slug = this.generateSlug(title);
    let suffix = 0;

    while (true) {
      const checkSlug = suffix === 0 ? slug : `${slug}-${suffix}`;

      try {
        let query = this.db.query_builder()
          .from('blog_posts')
          .select('id')
          .where('slug', checkSlug);

        const existing = await query.limit(1).get();

        if (!existing || existing.length === 0) {
          return checkSlug;
        }

        // Check if it's the same post (for updates)
        if (excludeId && existing[0].id === excludeId) {
          return checkSlug;
        }

        suffix++;
      } catch {
        return checkSlug;
      }
    }
  }

  private mapPostRow(row: any): BlogPostResponseDto {
    // Extract category from tags (stored as cat:CategoryName)
    const allTags = row.tags || [];
    const categoryTag = allTags.find((t: string) => t?.startsWith('cat:'));
    const category = categoryTag ? categoryTag.replace('cat:', '') : (row.category || null);
    const tags = allTags.filter((t: string) => !t?.startsWith('cat:'));

    // Extract author and avatar from meta_description (stored as desc||author:Name||avatar:URL)
    const metaDesc = row.meta_description || '';
    const parts = metaDesc.split('||');
    let actualMetaDesc = parts[0] || null;
    let author = row.author || 'Anonymous';
    let authorAvatar = '';

    for (const part of parts) {
      if (part.startsWith('author:')) {
        author = part.replace('author:', '') || 'Anonymous';
      }
      if (part.startsWith('avatar:')) {
        authorAvatar = part.replace('avatar:', '') || '';
      }
    }

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      imageUrls: row.image_urls || [],
      status: row.status,
      category: category,
      tags: tags,
      featured: row.featured,
      metaTitle: row.meta_title,
      metaDescription: actualMetaDesc,
      author: author,
      authorAvatar: authorAvatar,
      rating: parseFloat(row.rating) || 0,
      ratingCount: row.rating_count || 0,
      viewsCount: row.views_count || 0,
      likesCount: row.likes_count || 0,
      commentsCount: row.comments_count || 0,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userHasLiked: row.user_has_liked || false,
      userRating: row.user_rating || null,
    };
  }

  private mapCommentRow(row: any): CommentResponseDto {
    // Extract author name from content (stored as [author:Name]content)
    let content = row.content || '';
    let authorName = row._authorName || row.author_name || 'Anonymous';

    const authorMatch = content.match(/^\[author:([^\]]+)\]/);
    if (authorMatch) {
      authorName = authorMatch[1];
      content = content.replace(/^\[author:[^\]]+\]/, '');
    }

    return {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      parentCommentId: row.parent_id,
      content: content,
      authorName: authorName,
      likesCount: row.likes_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
