import { Controller, Post, Body, Get, Put, UseGuards, Request, Param, Res, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VendorRegisterDto, VendorLoginDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out' })
  async logout() {
    // Logout doesn't require auth - it's idempotent
    // Frontend will clear tokens regardless of this response
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: any) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() resetPasswordDto: any) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // ============================================
  // OAUTH ENDPOINTS
  // ============================================

  private getFrontendUrl(req: any): string {
    return req.query.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  @Get('oauth/github')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Initiate GitHub OAuth flow via database' })
  @ApiQuery({ name: 'frontendUrl', required: false, description: 'Frontend URL for redirect after auth' })
  async githubOAuth(@Request() req, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl(req);
    const authUrl = await this.authService.getGitHubAuthUrl(frontendUrl);
    return res.redirect(authUrl);
  }

  @Get('oauth/google')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({ summary: 'Initiate Google OAuth flow via database' })
  @ApiQuery({ name: 'frontendUrl', required: false, description: 'Frontend URL for redirect after auth' })
  async googleOAuth(@Request() req, @Res() res: Response) {
    const frontendUrl = this.getFrontendUrl(req);
    const authUrl = await this.authService.getGoogleAuthUrl(frontendUrl);
    return res.redirect(authUrl);
  }

  @Post('oauth/exchange')
  @ApiOperation({ summary: 'Exchange database token for databaseShop JWT' })
  @ApiResponse({ status: 200, description: 'Token exchanged successfully' })
  @ApiResponse({ status: 400, description: 'Token exchange failed' })
  async exchangeOAuthToken(@Body() dto: { databaseToken: string; userId: string; email: string }) {
    return await this.authService.exchangedatabaseToken(dto.databaseToken, dto.userId, dto.email);
  }

  // NOTE: OAuth callback is handled by database backend
  // GitHub/Google redirects to: http://localhost:3000/api/v1/tenant-auth/social/{provider}/callback
  // database backend exchanges code for tokens and redirects to databaseShop frontend with tokens
  // databaseShop frontend receives tokens and exchanges them for databaseShop JWT

  // ============================================
  // VENDOR AUTHENTICATION ENDPOINTS
  // ============================================

  @Post('vendor/register')
  @ApiOperation({ summary: 'Register a new vendor with shop creation' })
  @ApiResponse({ status: 201, description: 'Vendor and shop created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email or shop name already exists' })
  async vendorRegister(@Body() registerDto: VendorRegisterDto) {
    return this.authService.vendorRegister(registerDto);
  }

  @Post('vendor/login')
  @ApiOperation({ summary: 'Login vendor user' })
  @ApiResponse({ status: 200, description: 'Vendor successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or not a vendor account' })
  async vendorLogin(@Body() loginDto: VendorLoginDto) {
    return this.authService.vendorLogin(loginDto);
  }

  @Get('vendor/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current vendor profile with shop information' })
  @ApiResponse({ status: 200, description: 'Vendor profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized or not a vendor' })
  async getVendorProfile(@Request() req) {
    return this.authService.getVendorProfile(req.user.userId);
  }

  @Put('vendor/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update vendor profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateVendorProfile(@Request() req, @Body() updateDto: any) {
    return this.authService.updateVendorProfile(req.user.userId, updateDto);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.authService.uploadAvatar(
      req.user.userId,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or incorrect current password' })
  async changePassword(@Request() req, @Body() changePasswordDto: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get('vendor/verify-shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify vendor has access to a specific shop' })
  @ApiResponse({ status: 200, description: 'Access verification result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyShopAccess(@Request() req, @Param('shopId') shopId: string) {
    const hasAccess = await this.authService.verifyVendorShopAccess(req.user.userId, shopId);
    return { hasAccess, shopId };
  }

  // ============================================
  // STORE CUSTOMER AUTHENTICATION ENDPOINTS
  // ============================================

  @Post('store/:shopId/login')
  @ApiOperation({ summary: 'Login customer to a specific store' })
  @ApiResponse({ status: 200, description: 'Customer successfully logged in to store' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async storeLogin(@Param('shopId') shopId: string, @Body() loginDto: any) {
    return this.authService.storeCustomerLogin(shopId, loginDto);
  }

  @Post('store/:shopId/register')
  @ApiOperation({ summary: 'Register customer for a specific store' })
  @ApiResponse({ status: 201, description: 'Customer successfully registered for store' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async storeRegister(@Param('shopId') shopId: string, @Body() registerDto: any) {
    return this.authService.storeCustomerRegister(shopId, registerDto);
  }

  @Get('store/:shopId/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get store customer profile' })
  @ApiResponse({ status: 200, description: 'Customer profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStoreCustomerProfile(@Param('shopId') shopId: string, @Request() req) {
    return this.authService.getStoreCustomerProfile(shopId, req.user.userId);
  }

  @Put('store/:shopId/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update store customer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateStoreCustomerProfile(
    @Param('shopId') shopId: string,
    @Request() req,
    @Body() updateDto: { name?: string; phone?: string },
  ) {
    return this.authService.updateStoreCustomerProfile(shopId, req.user.userId, updateDto);
  }

  @Post('store/:shopId/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload store customer avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadStoreCustomerAvatar(
    @Param('shopId') shopId: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.updateStoreCustomerAvatar(shopId, req.user.userId, file);
  }
}
