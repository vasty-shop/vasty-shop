import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './modules/database/database.module';
import { StorageModule } from './modules/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShopsModule } from './modules/shops/shops.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { OffersModule } from './modules/offers/offers.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { TaxModule } from './modules/tax/tax.module';
import { CalculationModule } from './modules/calculation/calculation.module';
import { CmsModule } from './modules/cms/cms.module';
import { ContactModule } from './modules/contact/contact.module';
import { ExportModule } from './modules/export/export.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RefundModule } from './modules/refund/refund.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
// Phase 2 Modules
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { BillingModule } from './modules/billing/billing.module';
import { CashbackModule } from './modules/cashback/cashback.module';
import { ReferralModule } from './modules/referral/referral.module';
import { EmailTemplateModule } from './modules/email-templates/email-template.module';
// Phase 3 Modules
import { I18nModule } from './modules/i18n/i18n.module';
import { SmsModule } from './modules/sms/sms.module';
import { ZonesModule } from './modules/zones/zones.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { DisbursementModule } from './modules/disbursement/disbursement.module';
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module';
// Phase 4 Modules
import { SurgePricingModule } from './modules/surge-pricing/surge-pricing.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AIModule } from './modules/ai/ai.module';
// Phase 5 Modules
import { DeliveryManModule } from './modules/delivery-man/delivery-man.module';
import { ParcelModule } from './modules/parcel/parcel.module';
import { ChatModule } from './modules/chat/chat.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { POSModule } from './modules/pos/pos.module';
import { BannersModule } from './modules/banners/banners.module';
// Phase 6 Modules
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { BarcodeModule } from './modules/barcode/barcode.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { FlashSalesModule } from './modules/flash-sales/flash-sales.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { AdminModule } from './modules/admin/admin.module';
// Mobile App Generator
import { MobileAppGeneratorModule } from './modules/mobile-app-generator/mobile-app-generator.module';
// Blog Module
import { BlogModule } from './modules/blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    StorageModule,
    AuthModule,
    RealtimeModule,
    ShopsModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    CampaignsModule,
    OffersModule,
    DeliveryModule,
    PaymentModule,
    WishlistModule,
    ReviewsModule,
    NotificationsModule,
    CurrencyModule,
    TaxModule,
    CalculationModule,
    CmsModule,
    ContactModule,
    ExportModule,
    WalletModule,
    RefundModule,
    LoyaltyModule,
    // Phase 2 Modules
    SubscriptionModule,
    BillingModule,
    CashbackModule,
    ReferralModule,
    EmailTemplateModule,
    // Phase 3 Modules
    I18nModule,
    SmsModule,
    ZonesModule,
    ScheduleModule,
    DisbursementModule,
    GiftCardsModule,
    // Phase 4 Modules
    SurgePricingModule,
    ExpensesModule,
    AIModule,
    // Phase 5 Modules
    DeliveryManModule,
    ParcelModule,
    ChatModule,
    CouponsModule,
    POSModule,
    BannersModule,
    // Phase 6 Modules
    AnalyticsModule,
    RentalsModule,
    BarcodeModule,
    AttributesModule,
    FlashSalesModule,
    RecommendationsModule,
    // Admin Module
    AdminModule,
    // Mobile App Generator
    MobileAppGeneratorModule,
    // Blog Module
    BlogModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
