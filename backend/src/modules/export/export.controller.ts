import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import {
  ExportType,
  ExportRequestDto,
  ImportRequestDto,
  ImportResultDto,
  ExportTemplateDto,
} from './dto/export.dto';

@ApiTags('Export/Import')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export data to CSV or JSON' })
  @ApiResponse({ status: 200, description: 'Export file downloaded' })
  async exportData(
    @Body() dto: ExportRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const { data, filename, contentType } = await this.exportService.exportData(dto, userId);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(data);
  }

  @Get('template/:type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download import template CSV' })
  @ApiResponse({ status: 200, description: 'Template CSV file downloaded' })
  async getImportTemplate(
    @Param('type') type: ExportType,
    @Res() res: Response,
  ) {
    const { data, filename } = await this.exportService.getImportTemplate(type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(data);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import data from CSV file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file to import',
        },
        type: {
          type: 'string',
          enum: Object.values(ExportType),
          description: 'Type of data to import',
        },
        shopId: {
          type: 'string',
          description: 'Shop ID for vendor imports (optional)',
        },
        updateExisting: {
          type: 'boolean',
          description: 'Whether to update existing records',
          default: false,
        },
        skipErrors: {
          type: 'boolean',
          description: 'Whether to skip errors and continue',
          default: true,
        },
      },
      required: ['file', 'type'],
    },
  })
  @ApiResponse({ status: 200, description: 'Import result', type: ImportResultDto })
  async importData(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(csv|text\/csv|text\/plain)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('type') type: ExportType,
    @Body('shopId') shopId?: string,
    @Body('updateExisting') updateExisting?: string,
    @Body('skipErrors') skipErrors?: string,
    @Req() req?: any,
  ): Promise<ImportResultDto> {
    const userId = req?.user?.sub || req?.user?.userId;
    const csvContent = file.buffer.toString('utf-8');

    const dto: ImportRequestDto = {
      type,
      shopId,
      updateExisting: updateExisting === 'true',
      skipErrors: skipErrors !== 'false', // Default true
    };

    return this.exportService.importData(dto, csvContent, userId);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get available export types' })
  @ApiResponse({ status: 200, description: 'List of export types' })
  getExportTypes() {
    return {
      types: Object.values(ExportType).map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      })),
    };
  }
}
