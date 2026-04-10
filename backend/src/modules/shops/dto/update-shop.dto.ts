import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateShopDto } from './create-shop.dto';

export class UpdateShopDto extends PartialType(CreateShopDto) {
  // All properties from CreateShopDto are now optional
  // This allows partial updates of shop information
}
