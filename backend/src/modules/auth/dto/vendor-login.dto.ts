import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VendorLoginDto {
  @ApiProperty({ example: 'vendor@example.com', description: 'Vendor email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
