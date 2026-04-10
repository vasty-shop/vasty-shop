import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GlobalRolesGuard, GlobalRoles } from './guards/global-roles.guard';
import { BlogService } from './blog.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateCommentDto,
  CreateCategoryDto,
  BlogQueryDto,
  CommentQueryDto,
  BlogPostResponseDto,
  CommentResponseDto,
  PaginatedBlogPostsDto,
  PaginatedCommentsDto,
  CategoryResponseDto,
  LikeResponseDto,
  RatingResponseDto,
} from './dto';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // =============================================
  // PUBLIC ENDPOINTS
  // =============================================

  @Get('posts')
  @ApiOperation({ summary: 'Get all published blog posts' })
  @ApiResponse({ status: 200, description: 'List of published blog posts' })
  async getPosts(@Query() query: BlogQueryDto): Promise<PaginatedBlogPostsDto> {
    return this.blogService.getPosts(null, query);
  }

  @Get('posts/slug/:slug')
  @ApiOperation({ summary: 'Get blog post by slug' })
  @ApiResponse({ status: 200, description: 'Blog post details' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getPostBySlug(@Param('slug') slug: string): Promise<BlogPostResponseDto> {
    return this.blogService.getPostBySlug(null, slug);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get blog post by ID' })
  @ApiResponse({ status: 200, description: 'Blog post details' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getPostById(@Param('id') id: string): Promise<BlogPostResponseDto> {
    return this.blogService.getPostById(null, id);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get comments for a blog post' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async getComments(
    @Param('id') postId: string,
    @Query() query: CommentQueryDto,
  ): Promise<PaginatedCommentsDto> {
    return this.blogService.getComments(null, postId, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all blog categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.blogService.getCategories();
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiResponse({ status: 200, description: 'List of popular tags with counts' })
  async getPopularTags(): Promise<{ name: string; count: number }[]> {
    return this.blogService.getPopularTags();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get blog statistics' })
  @ApiResponse({ status: 200, description: 'Blog statistics' })
  async getBlogStats() {
    return this.blogService.getBlogStats();
  }

  // =============================================
  // AUTHENTICATED ENDPOINTS
  // =============================================

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle like on a blog post' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  async togglePostLike(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<LikeResponseDto> {
    const userId = req.user.userId || req.user.sub;
    return this.blogService.togglePostLike(userId, id);
  }

  @Post('posts/:id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rate a blog post (1-5 stars)' })
  @ApiResponse({ status: 200, description: 'Post rated successfully' })
  async ratePost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { rating: number },
  ): Promise<RatingResponseDto> {
    const userId = req.user.userId || req.user.sub;
    return this.blogService.ratePost(userId, id, body.rating);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a comment to a blog post' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  async createComment(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const userId = req.user.userId || req.user.sub;
    return this.blogService.createComment(userId, postId, dto, req.user);
  }

  // =============================================
  // BLOGGER ROLE ENDPOINTS
  // =============================================

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get current user's blog posts" })
  @ApiResponse({ status: 200, description: 'List of user blog posts' })
  async getMyPosts(
    @Request() req: any,
    @Query() query: BlogQueryDto,
  ): Promise<PaginatedBlogPostsDto> {
    const userId = req.user.userId || req.user.sub;
    return this.blogService.getMyPosts(userId, query);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully' })
  async createPost(
    @Request() req: any,
    @Body() dto: CreateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    const userId = req.user.userId || req.user.sub;
    return this.blogService.createPost(userId, dto, req.user);
  }

  @Put('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update blog post by ID' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your post' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async updatePost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    const userId = req.user.userId || req.user.sub;
    return this.blogService.updatePost(userId, id, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete blog post by ID' })
  @ApiResponse({ status: 204, description: 'Blog post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your post' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async deletePost(@Request() req: any, @Param('id') id: string): Promise<void> {
    const userId = req.user.userId || req.user.sub;
    return this.blogService.deletePost(userId, id);
  }

  @Post('images/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload images for blog posts' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Images uploaded successfully' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async uploadImages(
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ urls: string[]; message: string }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Upload to database storage
    return this.blogService.uploadImages(files);
  }

  // =============================================
  // ADMIN ENDPOINTS
  // =============================================

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.blogService.createCategory(dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, GlobalRolesGuard)
  @GlobalRoles('admin', 'owner')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete blog category' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.blogService.deleteCategory(id);
  }
}
