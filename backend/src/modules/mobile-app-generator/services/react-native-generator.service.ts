import { Injectable, Logger } from '@nestjs/common';
import {
  MobileAppConfig,
  GeneratedAppResult,
  GeneratedFile,
  GenerationOptions,
  AppStructure,
} from '../interfaces/types';
import { RNTemplatesService } from './rn-templates.service';
import { RNAuthTemplatesService } from './rn-auth-templates.service';
import { RNCustomerTemplatesService } from './rn-customer-templates.service';
import { RNDeliveryTemplatesService } from './rn-delivery-templates.service';
import { RNComponentsTemplatesService } from './rn-components-templates.service';
import { RNNavigationTemplatesService } from './rn-navigation-templates.service';
import { RNApiClientTemplatesService } from './rn-api-client-templates.service';
import { RNThemeTemplatesService } from './rn-theme-templates.service';
import { RNDocsTemplatesService } from './rn-docs-templates.service';

@Injectable()
export class ReactNativeGeneratorService {
  private readonly logger = new Logger(ReactNativeGeneratorService.name);

  constructor(
    private readonly templates: RNTemplatesService,
    private readonly authTemplates: RNAuthTemplatesService,
    private readonly customerTemplates: RNCustomerTemplatesService,
    private readonly deliveryTemplates: RNDeliveryTemplatesService,
    private readonly componentsTemplates: RNComponentsTemplatesService,
    private readonly navigationTemplates: RNNavigationTemplatesService,
    private readonly apiClientTemplates: RNApiClientTemplatesService,
    private readonly themeTemplates: RNThemeTemplatesService,
    private readonly docsTemplates: RNDocsTemplatesService,
  ) {}

  /**
   * Generate complete React Native app
   */
  async generate(
    config: MobileAppConfig,
    options: GenerationOptions = {},
  ): Promise<GeneratedAppResult> {
    this.logger.log(`Generating React Native ${config.appType} app...`);

    const files: GeneratedFile[] = [];
    const structure: AppStructure = {
      screens: [],
      components: [],
      navigation: [],
      api: [],
      theme: [],
      config: [],
    };

    // 1. Generate config files (package.json, tsconfig, etc.)
    const configFiles = this.generateConfigFiles(config, options);
    files.push(...configFiles);
    structure.config = configFiles.map((f) => f.path);

    // 2. Generate theme system
    const themeFiles = this.themeTemplates.generateThemeFiles(config);
    files.push(...themeFiles);
    structure.theme = themeFiles.map((f) => f.path);

    // 3. Generate API client
    const apiFiles = this.apiClientTemplates.generateApiFiles(config, options);
    files.push(...apiFiles);
    structure.api = apiFiles.map((f) => f.path);

    // 4. Generate common components
    const componentFiles = this.componentsTemplates.generateComponents(config);
    files.push(...componentFiles);
    structure.components = componentFiles.map((f) => f.path);

    // 5. Generate auth screens (shared between customer and delivery)
    const authFiles = this.authTemplates.generateAuthScreens(config);
    files.push(...authFiles);

    // 6. Generate app-specific screens
    if (config.appType === 'customer') {
      const customerFiles = this.customerTemplates.generateCustomerScreens(config);
      files.push(...customerFiles);
      structure.screens = [...authFiles, ...customerFiles].map((f) => f.path);
    } else {
      const deliveryFiles = this.deliveryTemplates.generateDeliveryScreens(config);
      files.push(...deliveryFiles);
      structure.screens = [...authFiles, ...deliveryFiles].map((f) => f.path);
    }

    // 7. Generate navigation
    const navigationFiles = this.navigationTemplates.generateNavigationFiles(config);
    files.push(...navigationFiles);
    structure.navigation = navigationFiles.map((f) => f.path);

    // 8. Generate App.tsx entry point
    const appEntryFile = this.templates.generateAppEntry(config);
    files.push(appEntryFile);

    // 9. Generate index.js
    const indexFile = this.templates.generateIndex(config);
    files.push(indexFile);

    // 10. Generate documentation files (README, publishing guides, etc.)
    const docsFiles = this.docsTemplates.generateDocsFiles(config);
    files.push(...docsFiles);

    this.logger.log(`Generated ${files.length} files for ${config.appType} app`);

    return {
      appType: config.appType,
      shopId: config.shopId,
      files,
      totalFiles: files.length,
      generatedAt: new Date().toISOString(),
      structure,
    };
  }

  /**
   * Generate config files (package.json, tsconfig, babel, metro, etc.)
   */
  private generateConfigFiles(
    config: MobileAppConfig,
    options: GenerationOptions,
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // package.json
    files.push({
      path: 'package.json',
      type: 'config',
      content: this.templates.generatePackageJson(config),
    });

    // tsconfig.json
    files.push({
      path: 'tsconfig.json',
      type: 'config',
      content: this.templates.generateTsConfig(),
    });

    // babel.config.js
    files.push({
      path: 'babel.config.js',
      type: 'config',
      content: this.templates.generateBabelConfig(),
    });

    // metro.config.js
    files.push({
      path: 'metro.config.js',
      type: 'config',
      content: this.templates.generateMetroConfig(),
    });

    // app.json
    files.push({
      path: 'app.json',
      type: 'config',
      content: this.templates.generateAppJson(config),
    });

    // .env
    files.push({
      path: '.env',
      type: 'config',
      content: this.templates.generateEnvFile(config, options),
    });

    // .env.example
    files.push({
      path: '.env.example',
      type: 'config',
      content: this.templates.generateEnvExample(),
    });

    return files;
  }
}
