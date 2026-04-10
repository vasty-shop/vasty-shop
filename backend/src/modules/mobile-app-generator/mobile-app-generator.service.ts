import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ReactNativeGeneratorService } from './services/react-native-generator.service';
import { MobileAppConfig, GeneratedAppResult, GenerationOptions } from './interfaces/types';

@Injectable()
export class MobileAppGeneratorService {
  private readonly logger = new Logger(MobileAppGeneratorService.name);

  constructor(
    private readonly reactNativeGenerator: ReactNativeGeneratorService,
  ) {}

  /**
   * Generate complete React Native app code from mobile app configuration
   */
  async generateMobileApp(
    config: MobileAppConfig,
    options: GenerationOptions = {},
  ): Promise<GeneratedAppResult> {
    this.logger.log(`Starting mobile app generation for shop: ${config.shopId}, type: ${config.appType}`);

    try {
      const result = await this.reactNativeGenerator.generate(config, options);

      this.logger.log(`Successfully generated ${result.files.length} files for ${config.appType} app`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to generate mobile app: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate both customer and delivery apps
   */
  async generateAllApps(
    customerConfig: MobileAppConfig,
    deliveryConfig: MobileAppConfig,
    options: GenerationOptions = {},
  ): Promise<{ customer: GeneratedAppResult; delivery: GeneratedAppResult }> {
    this.logger.log(`Generating both customer and delivery apps for shop: ${customerConfig.shopId}`);

    const [customer, delivery] = await Promise.all([
      this.generateMobileApp(customerConfig, options),
      this.generateMobileApp(deliveryConfig, options),
    ]);

    return { customer, delivery };
  }

  /**
   * Preview generated code without writing to disk
   */
  async previewGeneratedCode(
    config: MobileAppConfig,
    fileNames?: string[],
  ): Promise<Map<string, string>> {
    const result = await this.reactNativeGenerator.generate(config, { preview: true });

    const codeMap = new Map<string, string>();

    for (const file of result.files) {
      if (!fileNames || fileNames.includes(file.path)) {
        codeMap.set(file.path, file.content);
      }
    }

    return codeMap;
  }

  /**
   * Generate and save mobile app to disk
   */
  async generateAndSaveToDisk(
    config: MobileAppConfig,
    options: GenerationOptions = {},
  ): Promise<{ outputPath: string; result: GeneratedAppResult }> {
    const result = await this.generateMobileApp(config, options);

    // Determine output directory
    const cwd = process.cwd();
    const appFolderName = `${config.shopId}-${config.appType}-app`;
    const outputDir = options.outputDir || path.join(cwd, 'mobile-app-generated', appFolderName);

    this.logger.log(`\n========== FILE GENERATION ==========`);
    this.logger.log(`📂 Output directory: ${outputDir}`);
    this.logger.log(`📁 Generating ${result.totalFiles} files...`);

    // Create output directory
    fs.mkdirSync(outputDir, { recursive: true });

    // Write all files
    for (const file of result.files) {
      const filePath = path.join(outputDir, file.path);
      const fileDir = path.dirname(filePath);

      // Create directory if it doesn't exist
      fs.mkdirSync(fileDir, { recursive: true });

      // Write file
      fs.writeFileSync(filePath, file.content, 'utf-8');
      this.logger.log(`  ✓ Written: ${file.path}`);
    }

    this.logger.log(`✅ All ${result.totalFiles} files written successfully`);
    this.logger.log(`📁 Output: ${outputDir}`);
    this.logger.log(`==========================================\n`);

    return {
      outputPath: outputDir,
      result,
    };
  }

  /**
   * Generate and save both customer and delivery apps to disk
   */
  async generateAllAppsAndSaveToDisk(
    customerConfig: MobileAppConfig,
    deliveryConfig: MobileAppConfig,
    options: GenerationOptions = {},
  ): Promise<{
    customer: { outputPath: string; result: GeneratedAppResult };
    delivery: { outputPath: string; result: GeneratedAppResult };
  }> {
    this.logger.log(`Generating and saving both apps for shop: ${customerConfig.shopId}`);

    const [customer, delivery] = await Promise.all([
      this.generateAndSaveToDisk(customerConfig, options),
      this.generateAndSaveToDisk(deliveryConfig, options),
    ]);

    return { customer, delivery };
  }
}
