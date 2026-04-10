import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly db: DatabaseService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public (skip auth)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.error('JWT Guard: No token found in request headers');
      throw new UnauthorizedException('Token not found');
    }

    try {
      // Decode database JWT without verification using jsonwebtoken directly
      // We trust database's signature - just extract the payload
      const payload = jwt.decode(token) as any;

      if (!payload) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new UnauthorizedException('Token expired');
      }

      // Extract user ID from token
      const userId = payload.userId || payload.sub || payload.user_id;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: no user ID');
      }

      // Fetch user from database to get role directly from user.role field
      let userRole = payload.role || 'user';
      try {
        const databaseResult = await this.db.getUserById(userId);
        // getUserById returns {success: true, user: {...}}
        const databaseUser = databaseResult?.user || databaseResult;
        if (databaseUser) {
          // Get role directly from user.role (database stores role in auth.users table)
          userRole = databaseUser.role || payload.role || 'user';
          console.log('JWT Guard: Fetched user from vasty, role:', userRole);
        }
      } catch (fetchError) {
        console.warn('JWT Guard: Could not fetch user from vasty, using token role:', userRole);
      }

      // Map to standard format expected by VastyShop
      // Include all available user info for name/avatar extraction
      request.user = {
        sub: userId,
        userId: userId,
        id: userId,
        email: payload.email,
        role: userRole,
        projectId: payload.projectId,
        appId: payload.appId,
        name: payload.name || payload.full_name || payload.user_metadata?.full_name || payload.user_metadata?.name,
        full_name: payload.full_name || payload.name || payload.user_metadata?.full_name || payload.user_metadata?.name,
        username: payload.username,
        shopId: payload.shopId,
        avatar_url: payload.avatar_url || payload.picture || payload.user_metadata?.avatar_url,
        user_metadata: payload.user_metadata,
      };

      console.log('JWT Guard: User authenticated:', request.user.email, 'role:', request.user.role);
      return true;
    } catch (error: any) {
      console.error('JWT Guard: Token validation failed:', error?.message);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

/**
 * Optional JWT Auth Guard
 * Allows requests to proceed even without authentication
 * If token is present and valid, user will be attached to request
 * If token is missing or invalid, request proceeds with no user
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly db: DatabaseService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // No token - allow request but with no user
      return true;
    }

    try {
      // Decode database JWT without verification using jsonwebtoken directly
      const payload = jwt.decode(token) as any;

      if (payload && (!payload.exp || payload.exp * 1000 >= Date.now())) {
        const userId = payload.userId || payload.sub || payload.user_id;

        // Fetch user from database to get role directly from user.role field
        let userRole = payload.role || 'user';
        try {
          const databaseResult = await this.db.getUserById(userId);
          // getUserById returns {success: true, user: {...}}
          const databaseUser = databaseResult?.user || databaseResult;
          if (databaseUser) {
            // Get role directly from user.role (database stores role in auth.users table)
            userRole = databaseUser.role || payload.role || 'user';
          }
        } catch {
          // Use token role if can't fetch from database
        }

        request.user = {
          sub: userId,
          userId: userId,
          id: userId,
          email: payload.email,
          role: userRole,
          projectId: payload.projectId,
          appId: payload.appId,
          name: payload.name,
          username: payload.username,
          shopId: payload.shopId,
        };
      }
    } catch (error) {
      // Ignore errors - proceed without user
      console.log('OptionalJwtAuthGuard: Token decode failed, proceeding without user');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  handleRequest(err: any, user: any) {
    // Don't throw error if no user - just return null
    return user || null;
  }
}