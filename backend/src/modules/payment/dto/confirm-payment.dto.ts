import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Transaction ID from createPaymentIntent',
  })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({
    example: 'pi_1234567890abcdef',
    description: 'Stripe payment intent ID',
  })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;
}
