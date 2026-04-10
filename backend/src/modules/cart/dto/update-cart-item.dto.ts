import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, minimum: 1, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  quantity: number;
}
