import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  shopId?: string;  // For vendor tokens
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    // Use secretOrKeyProvider to handle both local JWT and database tokens
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use secretOrKeyProvider to dynamically determine the secret
      secretOrKeyProvider: (request: any, rawJwtToken: string, done: Function) => {
        try {
          // Decode the token without verification to check issuer
          const decoded = jwt.decode(rawJwtToken) as any;

          // Check if it's a database token (has 'iss' claim or specific structure)
          const isdatabaseToken = decoded?.iss?.includes('database') ||
                                decoded?.aud?.includes('database') ||
                                (decoded?.sub && decoded?.email && !decoded?.iat_local);

          if (isdatabaseToken) {
            // For database tokens, we'll validate via SDK in the validate method
            // Use a passthrough secret - actual validation happens in validate()
            const databaseSecret = configService.get<string>('vasty_JWT_SECRET') ||
                                 configService.get<string>('DATABASE_SERVICE_KEY');
            done(null, databaseSecret);
          } else {
            // Use local JWT secret for locally issued tokens
            done(null, configService.get<string>('JWT_SECRET'));
          }
        } catch (error) {
          // Fallback to local JWT secret
          done(null, configService.get<string>('JWT_SECRET'));
        }
      },
    });
  }

  async validate(payload: JwtPayload) {
    // Payload structure: { sub: userId, email: userEmail, role: userRole, shopId?: shopId }
    console.log('[JwtStrategy] Validating payload:', { sub: payload.sub, email: payload.email, role: payload.role });

    try {
      const user = await this.authService.validateUserById(payload.sub);

      if (!user) {
        console.error('[JwtStrategy] User not found for ID:', payload.sub);
        throw new UnauthorizedException('User not found');
      }

      console.log('[JwtStrategy] User validated successfully:', { id: payload.sub, email: payload.email });

      // Return user object that will be attached to request.user
      // IMPORTANT: Put explicit properties AFTER spread to prevent overwriting
      return {
        ...user,
        userId: payload.sub,  // Add userId for backward compatibility
        id: payload.sub,
        sub: payload.sub,
        email: payload.email,
        role: user.role || payload.role || 'user',
        shopId: payload.shopId,  // Include shopId for vendor tokens
      };
    } catch (error) {
      console.error('[JwtStrategy] Validation error:', error?.message || error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
