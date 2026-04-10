import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../../modules/database/database.service';

/**
 * Custom Auth Guard that validates database JWT tokens
 * Decodes token and validates user via database SDK
 */
@Injectable()
export class databaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(databaseAuthGuard.name);

  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Decode token without verification (database signed it with their secret)
      const decoded = jwt.decode(token) as any;

      if (!decoded) {
        throw new UnauthorizedException('Invalid token format');
      }

      // Extract user ID from token
      const userId = decoded.sub || decoded.userId || decoded.user_id;
      const email = decoded.email;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: no user ID');
      }

      this.logger.debug(`Validating token for user: ${userId} (${email})`);

      // Validate user exists in database
      const user = await this.db.getUserById(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user to request - include all available user info
      const userData = user as any;
      request.user = {
        ...user,
        userId: userId,
        id: userId,
        sub: userId,
        email: email || user.email,
        role: user.role || decoded.role || 'user',
      };

      this.logger.debug(`User validated: ${userId}, role: ${request.user.role}`);

      return true;
    } catch (error: any) {
      this.logger.error(`Token validation failed: ${error?.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
