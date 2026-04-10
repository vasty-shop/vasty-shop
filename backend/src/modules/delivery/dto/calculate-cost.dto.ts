import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class DeliveryItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class CalculateDeliveryCostDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Delivery address ID',
  })
  @IsNotEmpty()
  @IsString()
  addressId: string;

  @ApiProperty({ type: [DeliveryItemDto], description: 'Items to deliver' })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryItemDto)
  items: DeliveryItemDto[];

  @ApiPropertyOptional({
    example: 'standard',
    description: 'Delivery method',
  })
  @IsOptional()
  @IsString()
  deliveryMethod?: string;
}
