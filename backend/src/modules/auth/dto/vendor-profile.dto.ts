import { ApiProperty } from '@nestjs/swagger';

export class VendorProfileDto {
  @ApiProperty({ description: 'Vendor user ID' })
  id: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiProperty({ description: 'User role (vendor)' })
  role: string;

  @ApiProperty({ description: 'Associated shop information' })
  shop: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    status: string;
    isVerified: boolean;
  };

  @ApiProperty({ description: 'Account creation date' })
  createdAt: string;
}
