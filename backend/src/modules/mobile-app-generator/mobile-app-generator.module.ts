import { Module } from '@nestjs/common';
import { MobileAppGeneratorService } from './mobile-app-generator.service';
import { MobileAppGeneratorController } from './mobile-app-generator.controller';
import { ReactNativeGeneratorService } from './services/react-native-generator.service';
import { RNTemplatesService } from './services/rn-templates.service';
import { RNAuthTemplatesService } from './services/rn-auth-templates.service';
import { RNCustomerTemplatesService } from './services/rn-customer-templates.service';
import { RNDeliveryTemplatesService } from './services/rn-delivery-templates.service';
import { RNComponentsTemplatesService } from './services/rn-components-templates.service';
import { RNNavigationTemplatesService } from './services/rn-navigation-templates.service';
import { RNApiClientTemplatesService } from './services/rn-api-client-templates.service';
import { RNThemeTemplatesService } from './services/rn-theme-templates.service';
import { RNDocsTemplatesService } from './services/rn-docs-templates.service';

@Module({
  controllers: [MobileAppGeneratorController],
  providers: [
    MobileAppGeneratorService,
    ReactNativeGeneratorService,
    RNTemplatesService,
    RNAuthTemplatesService,
    RNCustomerTemplatesService,
    RNDeliveryTemplatesService,
    RNComponentsTemplatesService,
    RNNavigationTemplatesService,
    RNApiClientTemplatesService,
    RNThemeTemplatesService,
    RNDocsTemplatesService,
  ],
  exports: [MobileAppGeneratorService, ReactNativeGeneratorService],
})
export class MobileAppGeneratorModule {}
