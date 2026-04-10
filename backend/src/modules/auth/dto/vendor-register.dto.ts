import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VendorRegisterDto {
  @ApiProperty({ example: 'vendor@example.com', description: 'Vendor email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Account password' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John', description: 'Owner first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Owner last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+1234567890', description: 'Owner phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'My Awesome Shop', description: 'Shop display name' })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty({ example: 'Awesome Enterprises LLC', description: 'Legal business name' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'individual', description: 'Business type (individual, llc, corporation)' })
  @IsString()
  @IsOptional()
  businessType?: string;

  @ApiProperty({ example: 'business@shop.com', description: 'Business contact email' })
  @IsEmail()
  @IsNotEmpty()
  businessEmail: string;

  @ApiProperty({ example: '+1234567890', description: 'Business phone' })
  @IsString()
  @IsOptional()
  businessPhone?: string;

  @ApiProperty({
    example: {
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    description: 'Business address'
  })
  @IsOptional()
  businessAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
