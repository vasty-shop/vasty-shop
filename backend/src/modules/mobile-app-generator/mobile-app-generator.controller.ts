import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

import { MobileAppGeneratorService } from './mobile-app-generator.service';
import { MobileAppConfig, GenerationOptions, AppType, MobileAppFeatures, NavigationConfig } from './interfaces/types';

// DTOs
class GenerateAppDto {
  shopId: string;
  appName: string;
  appType: AppType;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    textSecondaryColor: string;
    fontFamily: string;
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    designVariant:
      | 'modern'
      | 'minimal'
      | 'glassmorphism'
      | 'neumorphism'
      | 'vibrant'
      | 'elegant';
  };
  features: {
    darkMode: boolean;
    pushNotifications: boolean;
    biometricAuth: boolean;
    socialLogin: boolean;
    guestCheckout: boolean;
    productReviews: boolean;
    wishlist: boolean;
    orderTracking: boolean;
    inAppChat: boolean;
    onboarding: boolean;
  };
  navigation: {
    tabBarStyle: 'default' | 'floating' | 'minimal' | 'elevated';
    drawerEnabled: boolean;
    headerStyle: 'default' | 'transparent' | 'solid';
  };
  splashScreen: {
    backgroundColor: string;
    logoUrl?: string;
    animationType: 'fade' | 'slide' | 'scale' | 'none';
  };
  appIcon?: string;
  apiBaseUrl?: string;
}

class GenerationOptionsDto {
  apiBaseUrl?: string;
  outputFormat?: 'files' | 'zip';
  preview?: boolean;
}

class PreviewCodeDto {
  config: GenerateAppDto;
  files?: string[];
}

@ApiTags('Mobile App Generator')
@Controller('mobile-app-generator')
export class MobileAppGeneratorController {
  constructor(
    private readonly mobileAppGeneratorService: MobileAppGeneratorService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate React Native mobile app code' })
  @ApiResponse({
    status: 200,
    description: 'Mobile app code generated successfully',
  })
  async generateApp(
    @Body() body: { config: GenerateAppDto; options?: GenerationOptionsDto },
  ) {
    const config = this.mapDtoToConfig(body.config);
    const options: GenerationOptions = body.options || {};

    const result = await this.mobileAppGeneratorService.generateMobileApp(
      config,
      options,
    );

    return {
      success: true,
      data: {
        appType: result.appType,
        shopId: result.shopId,
        totalFiles: result.totalFiles,
        generatedAt: result.generatedAt,
        structure: result.structure,
        files: result.files.map((f) => ({
          path: f.path,
          type: f.type,
          size: f.content.length,
        })),
      },
    };
  }

  @Post('generate/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate and download React Native app files' })
  async generateAndDownload(
    @Body() body: { config: GenerateAppDto; options?: GenerationOptionsDto },
  ) {
    const config = this.mapDtoToConfig(body.config);
    const options: GenerationOptions = body.options || {};

    const result = await this.mobileAppGeneratorService.generateMobileApp(
      config,
      options,
    );

    // Return all files with content for client-side download
    return {
      success: true,
      data: {
        appType: result.appType,
        shopId: result.shopId,
        totalFiles: result.totalFiles,
        generatedAt: result.generatedAt,
        files: result.files.map((f) => ({
          path: f.path,
          type: f.type,
          content: f.content,
        })),
      },
    };
  }

  @Post('generate/both')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate both customer and delivery apps' })
  async generateBothApps(
    @Body()
    body: {
      customerConfig: GenerateAppDto;
      deliveryConfig: GenerateAppDto;
      options?: GenerationOptionsDto;
    },
  ) {
    const customerConfig = this.mapDtoToConfig(body.customerConfig);
    const deliveryConfig = this.mapDtoToConfig(body.deliveryConfig);
    const options: GenerationOptions = body.options || {};

    const result = await this.mobileAppGeneratorService.generateAllApps(
      customerConfig,
      deliveryConfig,
      options,
    );

    return {
      success: true,
      data: {
        customer: {
          appType: result.customer.appType,
          totalFiles: result.customer.totalFiles,
          generatedAt: result.customer.generatedAt,
          structure: result.customer.structure,
        },
        delivery: {
          appType: result.delivery.appType,
          totalFiles: result.delivery.totalFiles,
          generatedAt: result.delivery.generatedAt,
          structure: result.delivery.structure,
        },
      },
    };
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview generated code for specific files' })
  async previewCode(@Body() body: PreviewCodeDto) {
    const config = this.mapDtoToConfig(body.config);

    const codeMap = await this.mobileAppGeneratorService.previewGeneratedCode(
      config,
      body.files,
    );

    const preview: Record<string, string> = {};
    codeMap.forEach((content, path) => {
      preview[path] = content;
    });

    return {
      success: true,
      data: {
        totalFiles: Object.keys(preview).length,
        files: preview,
      },
    };
  }

  @Get('file/:path(*)')
  @ApiOperation({ summary: 'Get content of a specific generated file' })
  async getFileContent(
    @Param('path') filePath: string,
    @Query() query: { config: string },
  ) {
    const config = this.mapDtoToConfig(JSON.parse(query.config));

    const codeMap = await this.mobileAppGeneratorService.previewGeneratedCode(
      config,
      [filePath],
    );

    const content = codeMap.get(filePath);

    if (!content) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    return {
      success: true,
      data: {
        path: filePath,
        content,
      },
    };
  }

  @Post('generate/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate and save React Native app to disk' })
  @ApiResponse({
    status: 200,
    description: 'Mobile app generated and saved to disk successfully',
  })
  async generateAndSave(
    @Body() body: { config: GenerateAppDto; options?: GenerationOptionsDto },
  ) {
    const config = this.mapDtoToConfig(body.config);
    const options: GenerationOptions = body.options || {};

    const { outputPath, result } =
      await this.mobileAppGeneratorService.generateAndSaveToDisk(config, options);

    return {
      success: true,
      data: {
        appType: result.appType,
        shopId: result.shopId,
        totalFiles: result.totalFiles,
        generatedAt: result.generatedAt,
        outputPath,
        structure: result.structure,
        files: result.files.map((f) => ({
          path: f.path,
          type: f.type,
        })),
      },
    };
  }

  @Post('generate/save/both')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate and save both customer and delivery apps to disk' })
  async generateAndSaveBoth(
    @Body()
    body: {
      customerConfig: GenerateAppDto;
      deliveryConfig: GenerateAppDto;
      options?: GenerationOptionsDto;
    },
  ) {
    const customerConfig = this.mapDtoToConfig(body.customerConfig);
    const deliveryConfig = this.mapDtoToConfig(body.deliveryConfig);
    const options: GenerationOptions = body.options || {};

    const result = await this.mobileAppGeneratorService.generateAllAppsAndSaveToDisk(
      customerConfig,
      deliveryConfig,
      options,
    );

    return {
      success: true,
      data: {
        customer: {
          appType: result.customer.result.appType,
          totalFiles: result.customer.result.totalFiles,
          generatedAt: result.customer.result.generatedAt,
          outputPath: result.customer.outputPath,
          structure: result.customer.result.structure,
        },
        delivery: {
          appType: result.delivery.result.appType,
          totalFiles: result.delivery.result.totalFiles,
          generatedAt: result.delivery.result.generatedAt,
          outputPath: result.delivery.outputPath,
          structure: result.delivery.result.structure,
        },
      },
    };
  }

  @Get('structure')
  @ApiOperation({ summary: 'Get the structure of generated app' })
  async getAppStructure(@Query() query: { config: string }) {
    const config = this.mapDtoToConfig(JSON.parse(query.config));

    const result = await this.mobileAppGeneratorService.generateMobileApp(
      config,
      { preview: true },
    );

    return {
      success: true,
      data: {
        structure: result.structure,
        totalFiles: result.totalFiles,
        fileList: result.files.map((f) => ({
          path: f.path,
          type: f.type,
        })),
      },
    };
  }

  @Get('download-mobile-folder')
  @ApiOperation({ summary: 'Download the mobile app folder as a ZIP file' })
  @ApiResponse({
    status: 200,
    description: 'Mobile folder downloaded successfully as ZIP',
  })
  async downloadMobileFolder(@Res() res: Response) {
    const mobileFolderPath = path.join(process.cwd(), '..', 'mobile');

    // Check if folder exists
    if (!fs.existsSync(mobileFolderPath)) {
      return res.status(404).json({
        success: false,
        error: 'Mobile folder not found',
      });
    }

    // Set response headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="mobile-app-${Date.now()}.zip"`,
    );

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add the mobile folder to the archive
    archive.directory(mobileFolderPath, 'mobile');

    // Finalize the archive
    await archive.finalize();
  }

  /**
   * Map DTO to internal MobileAppConfig
   */
  private mapDtoToConfig(dto: GenerateAppDto): MobileAppConfig {
    return {
      shopId: dto.shopId,
      appName: dto.appName,
      appType: dto.appType,
      theme: {
        primaryColor: dto.theme.primaryColor,
        secondaryColor: dto.theme.secondaryColor,
        accentColor: dto.theme.accentColor,
        backgroundColor: dto.theme.backgroundColor,
        surfaceColor: dto.theme.surfaceColor,
        textColor: dto.theme.textColor,
        textSecondaryColor: dto.theme.textSecondaryColor,
        fontFamily: dto.theme.fontFamily,
        borderRadius: dto.theme.borderRadius,
        designVariant: dto.theme.designVariant,
      },
      features: {
        darkMode: dto.features.darkMode,
        pushNotifications: dto.features.pushNotifications,
        biometricAuth: dto.features.biometricAuth,
        socialLogin: dto.features.socialLogin,
        guestCheckout: dto.features.guestCheckout,
        productReviews: dto.features.productReviews,
        wishlist: dto.features.wishlist,
        orderTracking: dto.features.orderTracking,
        inAppChat: dto.features.inAppChat,
        onboarding: dto.features.onboarding,
        // Required fields with defaults
        reviews: dto.features.productReviews || false,
        socialShare: false,
        offlineMode: false,
      },
      navigation: {
        type: 'bottom-tabs',
        style: dto.navigation.tabBarStyle === 'floating' ? 'floating' : 'default',
        showLabels: true,
        hapticFeedback: true,
        items: [],
        tabBarStyle: dto.navigation.tabBarStyle,
        drawerEnabled: dto.navigation.drawerEnabled,
        headerStyle: dto.navigation.headerStyle,
      },
      splashScreen: {
        backgroundColor: dto.splashScreen.backgroundColor,
        logoUrl: dto.splashScreen.logoUrl,
        animationType: dto.splashScreen.animationType,
      },
      appIcon: dto.appIcon,
      apiBaseUrl: dto.apiBaseUrl,
    };
  }
}
