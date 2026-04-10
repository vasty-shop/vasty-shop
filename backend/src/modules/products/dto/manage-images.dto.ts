import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for uploading a new product image
 */
export class UploadImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL' })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({ example: 'Product front view', description: 'Image alt text for accessibility' })
  @IsNotEmpty()
  @IsString()
  alt: string;

  @ApiPropertyOptional({ example: false, description: 'Set as primary image' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

/**
 * DTO for reordering product images
 */
export class ReorderImagesDto {
  @ApiProperty({
    example: ['img-1', 'img-3', 'img-2'],
    description: 'Array of image IDs in desired order',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  imageIds: string[];
}

/**
 * DTO for updating image metadata
 */
export class UpdateImageDto {
  @ApiPropertyOptional({ example: 'Updated alt text', description: 'New alt text' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ example: true, description: 'Set as primary image' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

/**
 * DTO for bulk image upload
 */
export class BulkUploadImagesDto {
  @ApiProperty({
    type: [UploadImageDto],
    description: 'Array of images to upload',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadImageDto)
  images: UploadImageDto[];
}
