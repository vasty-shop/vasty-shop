import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { WishlistPrivacy } from './create-wishlist.dto';

export class UpdateWishlistDto {
  @ApiPropertyOptional({
    description: 'Wishlist name',
    example: 'Birthday Wishlist 2024',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Wishlist description',
    example: 'Updated items I want for my birthday',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Wishlist privacy setting',
    enum: WishlistPrivacy,
  })
  @IsEnum(WishlistPrivacy)
  @IsOptional()
  privacy?: WishlistPrivacy;
}
