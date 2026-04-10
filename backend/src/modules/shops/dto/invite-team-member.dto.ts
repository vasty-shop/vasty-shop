import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class InviteTeamMemberDto {
  @ApiProperty({
    example: 'teammember@example.com',
    description: 'Email address of the team member to invite'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'manager',
    enum: ['admin', 'manager', 'staff'],
    description: 'Role to assign to the team member'
  })
  @IsNotEmpty()
  @IsEnum(['admin', 'manager', 'staff'])
  role: 'admin' | 'manager' | 'staff';

  @ApiPropertyOptional({
    example: ['manage_products', 'manage_orders'],
    description: 'Specific permissions for this team member'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateTeamMemberRoleDto {
  @ApiProperty({
    example: 'manager',
    enum: ['admin', 'manager', 'staff'],
    description: 'New role for the team member'
  })
  @IsNotEmpty()
  @IsEnum(['admin', 'manager', 'staff'])
  role: 'admin' | 'manager' | 'staff';

  @ApiPropertyOptional({
    example: ['manage_products', 'manage_orders', 'view_analytics'],
    description: 'Updated permissions for this team member'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateShopStatusDto {
  @ApiProperty({
    example: 'active',
    enum: ['pending', 'active', 'suspended', 'closed'],
    description: 'New status for the shop'
  })
  @IsNotEmpty()
  @IsEnum(['pending', 'active', 'suspended', 'closed'])
  status: 'pending' | 'active' | 'suspended' | 'closed';

  @ApiPropertyOptional({
    example: 'Shop verified after document review',
    description: 'Reason for status change'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class QueryShopsDto {
  @ApiPropertyOptional({
    example: 'active',
    enum: ['pending', 'active', 'suspended', 'closed'],
    description: 'Filter by shop status'
  })
  @IsOptional()
  @IsEnum(['pending', 'active', 'suspended', 'closed'])
  status?: 'pending' | 'active' | 'suspended' | 'closed';

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by verification status'
  })
  @IsOptional()
  is_verified?: boolean;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by category ID'
  })
  @IsOptional()
  @IsUUID()
  category?: string;

  @ApiPropertyOptional({
    example: 'electronics',
    description: 'Search shops by name'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 20,
    description: 'Number of results to return'
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of results to skip'
  })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    example: 'created_at',
    enum: ['created_at', 'name', 'total_sales', 'rating'],
    description: 'Sort by field'
  })
  @IsOptional()
  @IsEnum(['created_at', 'name', 'total_sales', 'rating'])
  sort_by?: 'created_at' | 'name' | 'total_sales' | 'rating';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: 'Sort order'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';
}
