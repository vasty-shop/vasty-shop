import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DigitalProductsController } from './digital-products.controller';
import { DigitalProductsService } from './digital-products.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit for digital products
      },
    }),
  ],
  controllers: [DigitalProductsController],
  providers: [DigitalProductsService],
  exports: [DigitalProductsService],
})
export class DigitalProductsModule {}
