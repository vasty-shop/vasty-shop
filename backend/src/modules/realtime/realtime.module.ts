import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationGateway } from './gateways/notification.gateway';
import { RealtimeService } from './realtime.service';
import { SocketAuthGuard } from './guards/socket-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'database-shop-secret-2024',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    NotificationGateway,
    RealtimeService,
    SocketAuthGuard,
  ],
  exports: [RealtimeService, NotificationGateway],
})
export class RealtimeModule {}
