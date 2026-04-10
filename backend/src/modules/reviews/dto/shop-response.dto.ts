import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ShopResponseDto {
  @ApiProperty({
    description: 'Shop response to the review',
    example: 'Thank you for your feedback! We are glad you enjoyed our product.',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  responseText: string;
}
