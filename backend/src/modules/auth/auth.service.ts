import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { EntityType, ShopEntity } from '../../database/schema';
import { VendorRegisterDto, VendorLoginDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: any) {
    const { email, password, firstName, lastName, phone, role = 'customer' } = registerDto;

    // Create user via database Auth SDK
    const name = `${firstName || ''} ${lastName || ''}`.trim();

    // Store non-role user data in metadata (role is passed directly to database)
    const metadata = {
      phone,
      firstName,
      lastName,
      full_name: name,
    };

    let authResult;
    try {
      // Pass role directly to database (SDK RegisterData supports role field)
      authResult = await this.db.signUp(email, password, name, role, metadata);
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }

    // Use database token directly - we trust database's signature
    const user = authResult.user;
    // Handle multiple token field names from database (token, access_token, accessToken)
    const databaseToken = (authResult as any).token || (authResult as any).access_token || (authResult as any).accessToken;
    const refreshToken = (authResult as any).refreshToken || (authResult as any).refresh_token;

    this.logger.log(`Register - Token extracted: ${!!databaseToken}, RefreshToken: ${!!refreshToken}`);

    return {
      user: this.sanitizeUser(user),
      accessToken: databaseToken,
      refreshToken: refreshToken,
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    // Sign in via database Auth SDK
    let authResult;
    try {
      authResult = await this.db.signIn(email, password);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = authResult.user;

    // Check if user is active (if the field exists)
    if (user.metadata?.is_active === false) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Check if user has any shops (unified login - user can be both customer and vendor)
    let shops: any[] = [];
    try {
      const shopsResult = await this.db.queryEntities(EntityType.SHOP, {
        filters: { owner_id: user.id },
      });
      if (shopsResult.data && shopsResult.data.length > 0) {
        shops = shopsResult.data.map((shop: any) => ({
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          logo: shop.logo,
          status: shop.status,
          isVerified: shop.isVerified || shop.is_verified,
        }));
      }
    } catch (error) {
      this.logger.warn('Failed to fetch user shops during login:', error);
    }

    // Get role directly from user.role (database stores role in auth.users table)
    // Fallback chain: user.role -> shops check -> 'customer'
    let role = user.role || 'customer';

    // If user has shops, they are also a vendor (can have multiple roles)
    if (shops.length > 0 && role === 'customer') {
      role = 'vendor';
    }

    this.logger.log(`Login - Email: ${user.email}, Role: ${role}, HasShops: ${shops.length > 0}`);

    // Use database token directly - we trust database's signature
    // Handle multiple token field names from database (token, access_token, accessToken)
    const databaseToken = (authResult as any).token || (authResult as any).access_token || (authResult as any).accessToken;
    const refreshToken = (authResult as any).refreshToken || (authResult as any).refresh_token;

    this.logger.log(`Login - Token extracted: ${!!databaseToken}, RefreshToken: ${!!refreshToken}`);

    // Include role in user response
    const userResponse = {
      ...this.sanitizeUser(user),
      role, // Add determined role to response
    };

    return {
      user: userResponse,
      accessToken: databaseToken,
      refreshToken: refreshToken,
      shops, // Include shops in response
    };
  }

  async getProfile(userId: string) {
    const user = await this.db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get role directly from user.role (database stores role in auth.users table)
    let role = (user as any).role || 'customer';

    // Check if user has shops
    let shops: any[] = [];
    try {
      const shopsResult = await this.db.queryEntities(EntityType.SHOP, {
        filters: { owner_id: userId },
      });
      shops = shopsResult.data || [];
    } catch (error) {
      // Ignore shop fetch errors
    }

    // If user has shops, they are also a vendor
    if (shops.length > 0 && role === 'customer') {
      role = 'vendor';
    }

    return {
      ...this.sanitizeUser(user),
      role,
      shops: shops.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        logo: shop.logo,
        status: shop.status,
        isVerified: shop.isVerified || shop.is_verified,
      })),
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      // Use database to refresh the token
      const authResult = await this.db.refreshSession(refreshToken);

      const newAccessToken = (authResult as any).token || (authResult as any).access_token || (authResult as any).accessToken;
      const newRefreshToken = (authResult as any).refreshToken || (authResult as any).refresh_token;
      const user = (authResult as any).user;

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: user ? this.sanitizeUser(user) : undefined,
      };
    } catch (error: any) {
      this.logger.error('Token refresh failed:', error?.message || error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string) {
    try {
      // Send password reset email via database auth
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      await this.db.resetPasswordForEmail(email, `${frontendUrl}/reset-password`);
    } catch (error) {
      // Don't reveal if email exists
      console.error('Password reset error:', error);
    }

    // Always return success to avoid email enumeration
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: any) {
    const { token, newPassword } = resetPasswordDto;

    try {
      await this.db.resetPassword({ token, newPassword });
      return { message: 'Password reset successful' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  // DEPRECATED: We now use database tokens directly
  // Keeping for backward compatibility with any remaining local token usage
  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    // Handle nested user object from database (could be user.user or user.data)
    const userData = user?.user || user?.data || user;
    const { password, ...sanitized } = userData;

    // Extract metadata from various possible locations
    const metadata = userData.metadata || userData.user_metadata || userData.raw_user_meta_data || {};

    // Extract email from various sources
    const email = userData.email || user.email || metadata.email || '';

    // Extract name fields from metadata
    const firstName = metadata.firstName || metadata.first_name || '';
    const lastName = metadata.lastName || metadata.last_name || '';

    // Compute name from various sources
    let name = userData.name || metadata.name || '';
    if (!name && (firstName || lastName)) {
      name = `${firstName} ${lastName}`.trim();
    }
    if (!name && email) {
      name = email.split('@')[0];
    }

    return {
      ...sanitized,
      id: userData.id || user.id,
      email: email || 'Unknown',
      name: name || 'User',
      firstName: firstName || name?.split(' ')[0] || '',
      lastName: lastName || name?.split(' ').slice(1).join(' ') || '',
      avatar: metadata.avatar || userData.avatar || null,
      phone: metadata.phone || userData.phone || null,
      metadata,  // Include full metadata for reference
    };
  }

  async validateUser(userId: string): Promise<any> {
    this.logger.log(`[validateUser] Validating user: ${userId}`);
    try {
      const user = await this.db.getUserById(userId) as any;
      // Debug: Log the raw user object structure
      this.logger.debug(`[validateUser] Raw user object: ${JSON.stringify(user, null, 2)}`);

      if (!user) {
        this.logger.warn(`[validateUser] User not found: ${userId}`);
        return null;
      }

      // Handle nested user object from database
      const userData = user?.user || user?.data || user;

      // Extract email from various possible locations (database structure may vary)
      const email = userData.email || user.email;
      const metadata = userData.metadata || userData.user_metadata || {};

      if (metadata.is_active === false) {
        this.logger.warn(`[validateUser] User is inactive: ${userId}`);
        return null;
      }

      this.logger.log(`[validateUser] User found: ${email}`);
      return this.sanitizeUser(user);
    } catch (error) {
      this.logger.error(`[validateUser] Error fetching user ${userId}:`, error?.message || error);
      throw error;
    }
  }

  // Alias for JWT strategy
  async validateUserById(userId: string): Promise<any> {
    return this.validateUser(userId);
  }

  // ============================================
  // VENDOR AUTHENTICATION
  // ============================================

  /**
   * Register a new vendor with auto-shop creation
   */
  async vendorRegister(registerDto: VendorRegisterDto) {
    const { email, password, firstName, lastName, phone, shopName, businessName, businessType, businessEmail, businessPhone, businessAddress } = registerDto;

    // Check if shop name/slug already exists
    const shopSlug = this.generateSlug(shopName);
    const existingShops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { slug: shopSlug },
    });

    if (existingShops.data && existingShops.data.length > 0) {
      throw new ConflictException('A shop with this name already exists. Please choose a different name.');
    }

    // Create vendor user via database Auth SDK
    const name = `${firstName || ''} ${lastName || ''}`.trim();

    // Store non-role user data in metadata (role is passed directly to database)
    const metadata = {
      phone,
      firstName,
      lastName,
      full_name: name,
    };

    let authResult;
    try {
      // Pass 'vendor' role directly to database (not in metadata)
      authResult = await this.db.signUp(email, password, name, 'vendor', metadata);
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }

    const user = authResult.user;

    // Create shop for vendor
    const shopData: Partial<ShopEntity> = {
      ownerId: user.id,
      name: shopName,
      slug: shopSlug,
      businessName,
      businessType: businessType || 'individual',
      businessEmail,
      businessPhone: businessPhone || phone,
      businessAddress: businessAddress || {},
      status: 'pending', // Pending approval
      isVerified: false,
      teamMembers: [],
      settings: {
        currency: 'USD',
        taxRate: 0,
        minOrder: 0,
        shippingMethods: [],
        paymentMethods: [],
      },
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      rating: 0,
      totalReviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const shop = await this.db.createEntity(EntityType.SHOP, shopData);

    // Use database token directly - we trust database's signature
    const databaseToken = (authResult as any).token || (authResult as any).access_token || (authResult as any).accessToken;
    const refreshToken = (authResult as any).refreshToken || (authResult as any).refresh_token;

    return {
      user: this.sanitizeUser(user),
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        status: shop.status,
        isVerified: shop.isVerified,
      },
      accessToken: databaseToken,
      refreshToken: refreshToken,
      message: 'Vendor account created successfully. Your shop is pending approval.',
    };
  }

  /**
   * Vendor login with shop information
   */
  async vendorLogin(loginDto: VendorLoginDto) {
    const { email, password } = loginDto;

    // Sign in via database Auth SDK
    let authResult;
    try {
      authResult = await this.db.signIn(email, password);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = authResult.user;

    // Debug: Log the user object to see what fields are available
    console.log('🔍 Vendor Login - User object:', JSON.stringify(user, null, 2));

    // Check if user is active
    if (user.metadata?.is_active === false) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify user has vendor role
    const userRole = user.metadata?.role || 'customer';
    console.log('🔍 Vendor Login - Detected role:', userRole);

    if (userRole !== 'vendor') {
      throw new UnauthorizedException('This is not a vendor account. Please use customer login or register as a vendor.');
    }

    // Get vendor's shop (use snake_case to match database column)
    const shops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { owner_id: user.id },
    });

    if (!shops.data || shops.data.length === 0) {
      throw new UnauthorizedException('No shop found for this vendor account.');
    }

    const shop = shops.data[0];

    // Use database token directly - we trust database's signature
    const databaseToken = (authResult as any).token || (authResult as any).access_token || (authResult as any).accessToken;
    const refreshToken = (authResult as any).refreshToken || (authResult as any).refresh_token;

    return {
      user: this.sanitizeUser(user),
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        logo: shop.logo,
        status: shop.status,
        isVerified: shop.isVerified,
      },
      accessToken: databaseToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * Get vendor profile with shop information
   */
  async getVendorProfile(userId: string) {
    this.logger.log(`[getVendorProfile] Fetching profile for user: ${userId}`);

    const user = await this.db.getUserById(userId) as any;

    if (!user) {
      this.logger.warn(`[getVendorProfile] User not found: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    // Get vendor's shop - check by owner_id
    this.logger.log(`[getVendorProfile] Querying shops for owner_id: ${userId}`);
    const shops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { owner_id: userId },
    });

    // User is a vendor if they have shops (don't rely on metadata.role)
    if (!shops.data || shops.data.length === 0) {
      this.logger.warn(`[getVendorProfile] No shops found for user: ${userId}`);
      throw new BadRequestException('No shop found for this vendor');
    }

    this.logger.log(`[getVendorProfile] Found ${shops.data.length} shops for user`);
    const shop = shops.data[0];

    return {
      ...this.sanitizeUser(user),
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        logo: shop.logo,
        status: shop.status,
        isVerified: shop.isVerified,
        totalProducts: shop.totalProducts,
        totalOrders: shop.totalOrders,
        totalSales: shop.totalSales,
        rating: shop.rating,
      },
    };
  }

  /**
   * Update vendor profile
   */
  async updateVendorProfile(userId: string, updateDto: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: string;
  }) {
    this.logger.log(`[updateVendorProfile] Updating profile for user: ${userId}`);

    const user = await this.db.getUserById(userId) as any;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify user has shops (is a vendor) - don't rely on metadata.role
    const shops = await this.db.queryEntities(EntityType.SHOP, {
      filters: { owner_id: userId },
    });

    if (!shops.data || shops.data.length === 0) {
      throw new UnauthorizedException('Not a vendor account - no shops found');
    }

    // Handle nested user object from database
    const userData = user?.user || user?.data || user;
    const existingMetadata = userData.metadata || userData.user_metadata || {};
    const userEmail = userData.email || user.email || '';

    // Update user metadata
    const updatedMetadata = {
      ...existingMetadata,
      firstName: updateDto.firstName ?? existingMetadata.firstName,
      lastName: updateDto.lastName ?? existingMetadata.lastName,
      phone: updateDto.phone ?? existingMetadata.phone,
      address: updateDto.address ?? existingMetadata.address,
      bio: updateDto.bio ?? existingMetadata.bio,
      avatar: updateDto.avatar ?? existingMetadata.avatar,
    };

    // Update name field from firstName + lastName
    const name = `${updatedMetadata.firstName || ''} ${updatedMetadata.lastName || ''}`.trim();

    try {
      await this.db.updateUser(userId, {
        name,
        metadata: updatedMetadata,
      });

      return {
        message: 'Profile updated successfully',
        ...updatedMetadata,
        email: userEmail,
      };
    } catch (error) {
      this.logger.error('Failed to update vendor profile:', error);
      throw new BadRequestException('Failed to update profile');
    }
  }

  /**
   * Upload avatar for user
   */
  async uploadAvatar(userId: string, file: Buffer, fileName: string, mimeType: string) {
    this.logger.log(`[uploadAvatar] Uploading avatar for user: ${userId}`);

    const user = await this.db.getUserById(userId) as any;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Handle nested user object from database
    const userData = user?.user || user?.data || user;
    const existingMetadata = userData.metadata || userData.user_metadata || {};

    // Generate unique filename
    const ext = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `avatars/${userId}/${Date.now()}.${ext}`;

    try {
      // Upload to database storage
      const result = await /* TODO: use StorageService */ this.db.uploadFile('avatars', file, uniqueFileName, {
        contentType: mimeType,
      });

      const avatarUrl = result.url || /* TODO: use StorageService */ this.db.getPublicUrl('avatars', uniqueFileName);

      // Update user metadata with new avatar URL
      await this.db.updateUser(userId, {
        metadata: {
          ...existingMetadata,
          avatar: avatarUrl,
        },
      });

      return { url: avatarUrl };
    } catch (error) {
      this.logger.error('Failed to upload avatar:', error);
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    this.logger.log(`[changePassword] Changing password for user: ${userId}`);

    const user = await this.db.getUserById(userId) as any;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Handle nested user object from database
    const userData = user?.user || user?.data || user;
    const userEmail = userData.email || user.email;

    if (!userEmail) {
      this.logger.error('[changePassword] Could not extract user email');
      throw new BadRequestException('User email not found');
    }

    this.logger.log(`[changePassword] Verifying and changing password for email: ${userEmail}`);

    try {
      // Use database's changePassword method which handles auth internally
      await this.db.changeUserPassword(userEmail, currentPassword, newPassword);
      this.logger.log(`[changePassword] Password changed successfully for: ${userEmail}`);
      return { message: 'Password changed successfully' };
    } catch (error: any) {
      this.logger.error('Failed to change password:', error?.message || error);
      if (error?.message?.includes('incorrect') || error?.message?.includes('invalid')) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      throw new BadRequestException('Failed to change password');
    }
  }

  /**
   * Verify vendor has access to a specific shop
   */
  async verifyVendorShopAccess(userId: string, shopId: string): Promise<boolean> {
    const user = await this.db.getEntity("users", userId);

    if (!user || user.role !== 'vendor') {
      return false;
    }

    const shop = await this.db.getEntity(EntityType.SHOP, shopId);

    if (!shop) {
      return false;
    }

    // Check if user is the owner (check both camelCase and snake_case for compatibility)
    const shopOwnerId = shop.owner_id || shop.ownerId;
    if (shopOwnerId === userId) {
      return true;
    }

    // TODO: Check if user is a team member with appropriate permissions
    // For now, only owner has access
    return false;
  }

  /**
   * Generate URL-friendly slug from text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // ============================================
  // STORE CUSTOMER AUTHENTICATION
  // ============================================

  /**
   * Login customer to a specific store
   * Creates a store-scoped JWT token
   */
  async storeCustomerLogin(shopId: string, loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;

    // Verify shop exists
    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new BadRequestException('Store not found');
    }

    // Sign in via database Auth SDK
    let authResult;
    try {
      authResult = await this.db.signIn(email, password);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = authResult.user;

    // Check if user is active
    if (user.metadata?.is_active === false) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Use database token directly - we trust database's signature
    const databaseToken = (authResult as any).token || (authResult as any).access_token || (authResult as any).accessToken;
    const refreshToken = (authResult as any).refreshToken || (authResult as any).refresh_token;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.metadata?.name || user.name || email.split('@')[0],
        phone: user.metadata?.phone,
      },
      accessToken: databaseToken,
      refreshToken: refreshToken,
      expiresIn: 86400, // 24 hours
      shopId,
    };
  }

  /**
   * Register customer for a specific store
   */
  async storeCustomerRegister(shopId: string, registerDto: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) {
    const { email, password, name, phone } = registerDto;

    // Verify shop exists
    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (!shop) {
      throw new BadRequestException('Store not found');
    }

    // Create user via database Auth SDK
    // Store non-role user data in metadata (role is passed directly to database)
    const metadata = {
      phone,
      registeredShops: [shopId], // Track which shops user registered from
    };

    let authResult;
    try {
      // Pass 'customer' role directly to database (not in metadata)
      authResult = await this.db.signUp(email, password, name, 'customer', metadata);
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        // User exists - try to log them in instead
        try {
          return await this.storeCustomerLogin(shopId, { email, password });
        } catch (loginError) {
          throw new ConflictException('User with this email already exists. Please login instead.');
        }
      }
      throw error;
    }

    const user = authResult.user;

    // Use database token directly - we trust database's signature
    const databaseToken = (authResult as any).token || (authResult as any).access_token || (authResult as any).accessToken;
    const refreshToken = (authResult as any).refreshToken || (authResult as any).refresh_token;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: name || email.split('@')[0],
        phone,
      },
      accessToken: databaseToken,
      refreshToken: refreshToken,
      expiresIn: 86400, // 24 hours
      shopId,
    };
  }

  /**
   * Get store customer profile
   */
  async getStoreCustomerProfile(shopId: string, userId: string) {
    const user = await this.db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get orders count for this store
    let ordersCount = 0;
    try {
      const orders = await this.db.queryEntities('orders', {
        filters: {
          user_id: userId,
          shop_id: shopId,
        },
      });
      ordersCount = orders.data?.length || 0;
    } catch (error) {
      // Ignore errors
    }

    return {
      id: user.id,
      email: user.email,
      name: user.metadata?.name || user.name || user.email.split('@')[0],
      phone: user.metadata?.phone,
      shopId,
      ordersCount,
    };
  }

  /**
   * Update store customer profile
   */
  async updateStoreCustomerProfile(
    shopId: string,
    userId: string,
    updateDto: { name?: string; phone?: string },
  ) {
    const user = await this.db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update user metadata
    const updatedMetadata = {
      ...user.metadata,
      name: updateDto.name || user.metadata?.name,
      phone: updateDto.phone || user.metadata?.phone,
    };

    await this.db.updateUser(userId, {
      metadata: updatedMetadata,
    });

    return {
      id: user.id,
      email: user.email,
      name: updateDto.name || user.metadata?.name || user.email.split('@')[0],
      phone: updateDto.phone || user.metadata?.phone,
      shopId,
    };
  }

  /**
   * Update store customer avatar
   */
  async updateStoreCustomerAvatar(
    shopId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const user = await this.db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Upload file to storage
    const uniqueFileName = `${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
    const uploadResult = await /* TODO: use StorageService */ this.db.uploadFile(
      'avatars/customers',
      file.buffer,
      uniqueFileName,
      {
        contentType: file.mimetype,
      },
    );

    const avatarUrl = uploadResult.url || uploadResult.path || uploadResult;

    // Update user metadata with avatar URL
    const updatedMetadata = {
      ...user.metadata,
      avatar: avatarUrl,
      avatarUrl: avatarUrl,
    };

    await this.db.updateUser(userId, {
      metadata: updatedMetadata,
    });

    return {
      avatarUrl,
      avatar: avatarUrl,
      message: 'Avatar updated successfully',
    };
  }

  // ============================================
  // OAUTH METHODS
  // ============================================

  /**
   * Generate GitHub OAuth authorization URL using database SDK
   */
  async getGitHubAuthUrl(frontendUrl: string): Promise<string> {
    try {
      // Ensure the redirect URL includes the callback path
      const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = baseUrl.endsWith('/auth/callback') ? baseUrl : `${baseUrl}/auth/callback`;
      this.logger.log(`Getting GitHub OAuth URL with redirect: ${redirectUrl}`);
      const url = await /* TODO: use AuthService */ this.db.authClient.auth.getOAuthUrl('github', redirectUrl);
      this.logger.log(`GitHub OAuth URL generated successfully`);
      return url;
    } catch (error: any) {
      this.logger.error('Failed to get GitHub OAuth URL:', error?.message || error);
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new BadRequestException(
        error?.message || 'GitHub OAuth is not available. Please configure GitHub OAuth in database dashboard.'
      );
    }
  }

  /**
   * Generate Google OAuth authorization URL using database SDK
   */
  async getGoogleAuthUrl(frontendUrl: string): Promise<string> {
    try {
      // Ensure the redirect URL includes the callback path
      const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = baseUrl.endsWith('/auth/callback') ? baseUrl : `${baseUrl}/auth/callback`;
      this.logger.log(`Getting Google OAuth URL with redirect: ${redirectUrl}`);
      const url = await /* TODO: use AuthService */ this.db.authClient.auth.getOAuthUrl('google', redirectUrl);
      this.logger.log(`Google OAuth URL generated successfully`);
      return url;
    } catch (error: any) {
      this.logger.error('Failed to get Google OAuth URL:', error?.message || error);
      this.logger.error('Full error:', JSON.stringify(error, null, 2));
      throw new BadRequestException(
        error?.message || 'Google OAuth is not available. Please configure Google OAuth in database dashboard.'
      );
    }
  }

  /**
   * Exchange database OAuth token for VastyShop session
   * This is called by frontend after receiving database token from OAuth redirect
   *
   * database's job: Create/authenticate user in database database, return user info
   * VastyShop's job: Return the same database token - we trust database's signature
   */
  async exchangedatabaseToken(databaseToken: string, userId: string, email: string) {
    try {
      this.logger.log(`Processing OAuth token for user: ${email}`);

      // database already created/authenticated the user
      // We trust the database token directly - no need to create our own
      return {
        accessToken: databaseToken,
        user: {
          id: userId,
          email: email,
          name: email.split('@')[0],
          username: email.split('@')[0],
        },
      };
    } catch (error) {
      this.logger.error('Failed to process OAuth token:', error);
      throw new BadRequestException('Token processing failed');
    }
  }
}
