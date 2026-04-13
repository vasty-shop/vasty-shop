import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductImportController } from './product-import.controller';
import { ProductImportService } from './product-import.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit for import files
      },
    }),
  ],
  controllers: [ProductImportController],
  providers: [ProductImportService],
  exports: [ProductImportService],
})
export class ProductImportModule {}
