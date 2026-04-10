import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';

export enum WishlistPrivacy {
  PRIVATE = 'private',
  PUBLIC = 'public',
  SHARED = 'shared',
}

export class CreateWishlistDto {
  @ApiProperty({
    description: 'Wishlist name',
    example: 'Birthday Wishlist',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Wishlist description',
    example: 'Items I want for my birthday',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Wishlist privacy setting',
    enum: WishlistPrivacy,
    default: WishlistPrivacy.PRIVATE,
  })
  @IsEnum(WishlistPrivacy)
  @IsOptional()
  privacy?: WishlistPrivacy;
}
