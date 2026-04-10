import { Injectable, Logger, CanActivate, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(SocketAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    try {
      // Check if already authenticated
      if (client.data?.authContext) {
        return true;
      }

      // Extract token from handshake
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn(`No token provided for socket: ${client.id}`);
        client.emit('auth:error', { message: 'Authentication required' });
        return false;
      }

      // Verify JWT token
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret: jwtSecret });

      if (!payload || !payload.userId) {
        this.logger.warn(`Invalid token for socket: ${client.id}`);
        client.emit('auth:error', { message: 'Invalid token' });
        return false;
      }

      // Store auth context in socket data
      const authContext = {
        type: 'jwt' as const,
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
      };

      client.data.authContext = authContext;
      client.data.userId = payload.userId;

      this.logger.debug(`Socket authenticated: ${client.id} (User: ${payload.userId})`);
      return true;
    } catch (error) {
      this.logger.error(`Socket auth guard error: ${error.message}`);
      client.emit('auth:error', { message: 'Authentication failed' });
      return false;
    }
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    // Try to get token from auth header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to get token from query parameters
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (token && typeof token === 'string') {
      return token;
    }

    return null;
  }
}

/**
 * Rate limiting decorator for socket events
 */
export const SocketRateLimit = (maxEvents: number = 100, windowMs: number = 60000) => {
  const eventCounts = new Map<string, { count: number; resetTime: number }>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const client = args.find(arg => arg && arg.id && arg.emit); // Find Socket object

      if (!client) {
        return originalMethod.apply(this, args);
      }

      const now = Date.now();
      const key = `${client.id}:${propertyKey}`;
      const record = eventCounts.get(key);

      if (!record || now > record.resetTime) {
        eventCounts.set(key, { count: 1, resetTime: now + windowMs });
        return originalMethod.apply(this, args);
      }

      if (record.count >= maxEvents) {
        client.emit('rate_limit_exceeded', {
          message: 'Too many events',
          event: propertyKey,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
        return;
      }

      record.count++;
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};
