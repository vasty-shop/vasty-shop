import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductVariantDto {
  @ApiPropertyOptional({ example: 'Large' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ example: 'Blue' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'Material' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 'Any custom variant' })
  @IsOptional()
  @IsObject()
  custom?: Record<string, any>;
}

export class AddToCartDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;

  @ApiPropertyOptional({ type: ProductVariantDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductVariantDto)
  variant?: ProductVariantDto;

  @ApiPropertyOptional({ example: 'abc123def456' })
  @IsOptional()
  @IsString()
  sessionId?: string; // For guest users
}
