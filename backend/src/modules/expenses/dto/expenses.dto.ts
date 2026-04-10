import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExpenseCategory {
  INVENTORY = 'inventory',
  SHIPPING = 'shipping',
  PACKAGING = 'packaging',
  MARKETING = 'marketing',
  PLATFORM_FEES = 'platform_fees',
  PAYMENT_FEES = 'payment_fees',
  SALARIES = 'salaries',
  RENT = 'rent',
  UTILITIES = 'utilities',
  EQUIPMENT = 'equipment',
  SOFTWARE = 'software',
  TAXES = 'taxes',
  INSURANCE = 'insurance',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// ============================================
// EXPENSE CATEGORY DTOs
// ============================================

export class CreateExpenseCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetLimit?: number;
}

export class UpdateExpenseCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// EXPENSE DTOs
// ============================================

export class CreateExpenseDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiPropertyOptional({ description: 'Custom category ID' })
  @IsOptional()
  @IsString()
  customCategoryId?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Date of expense (ISO format)' })
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ description: 'Multiple receipt/document URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ enum: RecurrenceType, default: RecurrenceType.NONE })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrence?: RecurrenceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Link to order if expense is order-related' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Link to product if expense is product-related' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTaxDeductible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isTaxDeductible?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxAmount?: number;
}

export class UpdateExpenseStatusDto {
  @ApiProperty({ enum: ExpenseStatus })
  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

// ============================================
// BUDGET DTOs
// ============================================

export class SetBudgetDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customCategoryId?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  budgetAmount: number;

  @ApiProperty({ description: 'Budget period: monthly, quarterly, yearly' })
  @IsString()
  period: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  alertThreshold?: number;
}

// ============================================
// QUERY DTOs
// ============================================

export class GetExpensesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customCategoryId?: string;

  @ApiPropertyOptional({ enum: ExpenseStatus })
  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({ default: 'expense_date' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export class ExpenseReportDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Group by: day, week, month, category' })
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEnum(ExpenseCategory, { each: true })
  categories?: ExpenseCategory[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  includeProjections?: boolean;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class ExpenseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  category: string;

  @ApiProperty()
  customCategoryId: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  expenseDate: string;

  @ApiProperty()
  vendorName: string | null;

  @ApiProperty()
  invoiceNumber: string | null;

  @ApiProperty()
  receiptUrl: string | null;

  @ApiProperty()
  attachments: string[] | null;

  @ApiProperty()
  recurrence: string;

  @ApiProperty()
  tags: string[] | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isTaxDeductible: boolean;

  @ApiProperty()
  taxAmount: number | null;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  approvedBy: string | null;

  @ApiProperty()
  createdAt: string;
}

export class ExpenseSummaryResponseDto {
  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  averageExpense: number;

  @ApiProperty()
  expensesByCategory: { category: string; count: number; total: number }[];

  @ApiProperty()
  expensesByStatus: { status: string; count: number; total: number }[];

  @ApiProperty()
  monthlyTrend: { month: string; total: number; count: number }[];

  @ApiProperty()
  topVendors: { vendor: string; total: number; count: number }[];
}

export class BudgetStatusResponseDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  budgetAmount: number;

  @ApiProperty()
  spentAmount: number;

  @ApiProperty()
  remainingAmount: number;

  @ApiProperty()
  percentageUsed: number;

  @ApiProperty()
  isOverBudget: boolean;

  @ApiProperty()
  alertTriggered: boolean;

  @ApiProperty()
  period: string;
}

export class ExpenseProjectionResponseDto {
  @ApiProperty()
  projectedMonthlyTotal: number;

  @ApiProperty()
  projectedYearlyTotal: number;

  @ApiProperty()
  categoryProjections: { category: string; monthly: number; yearly: number }[];

  @ApiProperty()
  trend: string;

  @ApiProperty()
  comparisonToPreviousPeriod: number;
}
