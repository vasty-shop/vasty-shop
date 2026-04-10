import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Stripe Price ID' })
  @IsString()
  priceId: string;

  @ApiPropertyOptional({ description: 'Trial period in days' })
  @IsNumber()
  @IsOptional()
  trialPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Success URL' })
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'Cancel URL' })
  @IsString()
  @IsOptional()
  cancelUrl?: string;
}

export class CancelSubscriptionDto {
  @ApiProperty({ description: 'Cancel at period end' })
  @IsBoolean()
  cancelAtPeriodEnd: boolean;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class SubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  plan: string;

  @ApiPropertyOptional()
  interval?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  currentPeriodStart: string;

  @ApiPropertyOptional()
  currentPeriodEnd?: string;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;

  @ApiPropertyOptional()
  stripeCustomerId?: string;

  @ApiPropertyOptional()
  stripeSubscriptionId?: string;

  @ApiPropertyOptional()
  trialEnd?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  stripePriceId?: string;

  @ApiPropertyOptional()
  stripePriceIdYearly?: string;

  @ApiProperty()
  interval: string;

  @ApiProperty()
  price: number;

  @ApiPropertyOptional()
  yearlyPrice?: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiPropertyOptional()
  isPopular?: boolean;
}

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  invoiceUrl?: string;

  @ApiPropertyOptional()
  receiptUrl?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  currency: string;
}

export class PaymentMethodResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiProperty()
  last4: string;

  @ApiPropertyOptional()
  expiryMonth?: number;

  @ApiPropertyOptional()
  expiryYear?: number;

  @ApiProperty()
  isDefault: boolean;
}

export class CheckoutSessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  url: string;
}

export class SetupSessionResponseDto {
  @ApiProperty()
  url: string;
}
