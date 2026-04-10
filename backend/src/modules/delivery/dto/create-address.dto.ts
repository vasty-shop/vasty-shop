import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsEmail,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name for delivery' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+1234567890', description: 'Contact phone number' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '123 Main Street', description: 'Address line 1' })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apt 4B', description: 'Address line 2' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'New York', description: 'City' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY', description: 'State or province' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: '10001', description: 'Postal/ZIP code' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'United States', description: 'Country' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({
    example: 'home',
    enum: ['home', 'office', 'other'],
    description: 'Address type',
  })
  @IsOptional()
  @IsEnum(['home', 'office', 'other'])
  addressType?: string;

  @ApiPropertyOptional({ example: false, description: 'Set as default address' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: 40.7128, description: 'Latitude for map' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -74.006, description: 'Longitude for map' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Ring bell twice, leave at door',
    description: 'Special delivery instructions',
  })
  @IsOptional()
  @IsString()
  deliveryInstructions?: string;
}
