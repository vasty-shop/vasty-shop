import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ProductImportService } from './product-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('product-import')
@Controller('products/import')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required)',
  required: true,
})
export class ProductImportController {
  constructor(private readonly importService: ProductImportService) {}

  @Get('template')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Download CSV import template with expected columns' })
  @ApiResponse({ status: 200, description: 'CSV template file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTemplate(@Res() res: Response) {
    const csv = this.importService.getTemplate();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="product-import-template.csv"',
    });
    res.send(csv);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiQuery({
    name: 'dryRun',
    required: false,
    type: Boolean,
    description: 'Validate without inserting',
  })
  @ApiOperation({
    summary: 'Import products from CSV or JSON file',
    description:
      'Upload a CSV or JSON file to bulk-import products. ' +
      'Use ?dryRun=true to validate without inserting. ' +
      'Files with >100 rows are processed asynchronously and return a job ID.',
  })
  @ApiResponse({
    status: 201,
    description: 'Import completed or async job created',
  })
  @ApiResponse({ status: 400, description: 'Bad request / validation errors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async importProducts(
    @UploadedFile() file: Express.Multer.File,
    @Query('dryRun') dryRun: boolean,
    @Request() req: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException(
        'Shop ID is required. Please provide x-shop-id header.',
      );
    }

    const userId = req.user?.userId || req.user?.id;
    return this.importService.importProducts(file, userId, shopId, !!dryRun);
  }

  @Get(':jobId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'jobId', description: 'Import job ID' })
  @ApiOperation({ summary: 'Check status of an async import job' })
  @ApiResponse({ status: 200, description: 'Job status returned' })
  @ApiResponse({ status: 400, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getJobStatus(@Param('jobId') jobId: string, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.importService.getJobStatus(jobId, userId);
  }
}
