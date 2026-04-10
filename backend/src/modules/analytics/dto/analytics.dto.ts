import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsNumber, IsBoolean } from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum ReportType {
  TRANSACTION = 'transaction',
  ORDER = 'order',
  ITEM = 'item',
  STORE = 'store',
  CUSTOMER = 'customer',
  DELIVERY = 'delivery',
  EXPENSE = 'expense',
  TAX = 'tax',
  REVENUE = 'revenue',
  PERFORMANCE = 'performance',
}

export enum ReportPeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
}

export enum MetricType {
  COUNT = 'count',
  SUM = 'sum',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
  PERCENTAGE = 'percentage',
}

export enum ComparisonType {
  PREVIOUS_PERIOD = 'previous_period',
  SAME_PERIOD_LAST_YEAR = 'same_period_last_year',
  CUSTOM = 'custom',
}

// ============================================
// REPORT FILTER DTOs
// ============================================

export class ReportFilterDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  deliveryManId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  orderStatus?: string;

  @IsOptional()
  @IsBoolean()
  includeComparison?: boolean;

  @IsOptional()
  @IsEnum(ComparisonType)
  comparisonType?: ComparisonType;

  @IsOptional()
  @IsString()
  groupBy?: string; // day, week, month, year, shop, category, etc.

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

// ============================================
// DASHBOARD DTOs
// ============================================

export class DashboardOverviewDto {
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;
}

export class DashboardWidgetDto {
  @IsString()
  widgetId: string;

  @IsString()
  widgetType: string;

  @IsOptional()
  @IsEnum(ChartType)
  chartType?: ChartType;

  @IsOptional()
  @IsEnum(MetricType)
  metricType?: MetricType;

  @IsOptional()
  config?: Record<string, any>;
}

export class SaveDashboardLayoutDto {
  @IsArray()
  widgets: DashboardWidgetDto[];

  @IsOptional()
  @IsString()
  layoutName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ============================================
// TRANSACTION REPORT DTOs
// ============================================

export class TransactionReportDto extends ReportFilterDto {
  @IsOptional()
  @IsString()
  transactionType?: string; // order, refund, withdrawal, wallet, etc.

  @IsOptional()
  @IsString()
  transactionStatus?: string;
}

// ============================================
// ORDER REPORT DTOs
// ============================================

export class OrderReportDto extends ReportFilterDto {
  @IsOptional()
  @IsArray()
  orderStatuses?: string[];

  @IsOptional()
  @IsBoolean()
  includeItems?: boolean;

  @IsOptional()
  @IsBoolean()
  includeTax?: boolean;

  @IsOptional()
  @IsBoolean()
  includeDelivery?: boolean;
}

// ============================================
// ITEM/PRODUCT REPORT DTOs
// ============================================

export class ItemReportDto extends ReportFilterDto {
  @IsOptional()
  @IsString()
  sortBy?: string; // sales, revenue, quantity, views, etc.

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @IsOptional()
  @IsNumber()
  stockThreshold?: number;
}

// ============================================
// STORE REPORT DTOs
// ============================================

export class StoreReportDto extends ReportFilterDto {
  @IsOptional()
  @IsString()
  sortBy?: string; // revenue, orders, rating, products, etc.

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @IsOptional()
  @IsString()
  storeType?: string;
}

// ============================================
// CUSTOMER REPORT DTOs
// ============================================

export class CustomerReportDto extends ReportFilterDto {
  @IsOptional()
  @IsString()
  sortBy?: string; // orders, spent, lastOrder, etc.

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  customerSegment?: string; // new, returning, vip, inactive, etc.

  @IsOptional()
  @IsNumber()
  minOrders?: number;

  @IsOptional()
  @IsNumber()
  minSpent?: number;
}

// ============================================
// DELIVERY REPORT DTOs
// ============================================

export class DeliveryReportDto extends ReportFilterDto {
  @IsOptional()
  @IsString()
  deliveryStatus?: string;

  @IsOptional()
  @IsBoolean()
  includeEarnings?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRatings?: boolean;
}

// ============================================
// EXPENSE REPORT DTOs
// ============================================

export class ExpenseReportDto extends ReportFilterDto {
  @IsOptional()
  @IsString()
  expenseCategory?: string;

  @IsOptional()
  @IsString()
  expenseType?: string;
}

// ============================================
// TAX REPORT DTOs
// ============================================

export class TaxReportDto extends ReportFilterDto {
  @IsOptional()
  @IsString()
  taxType?: string; // product, order, category, service, etc.

  @IsOptional()
  @IsBoolean()
  includeVAT?: boolean;

  @IsOptional()
  @IsBoolean()
  separateByTaxRate?: boolean;
}

// ============================================
// REVENUE REPORT DTOs
// ============================================

export class RevenueReportDto extends ReportFilterDto {
  @IsOptional()
  @IsBoolean()
  includeRefunds?: boolean;

  @IsOptional()
  @IsBoolean()
  includeFees?: boolean;

  @IsOptional()
  @IsBoolean()
  includeCommissions?: boolean;

  @IsOptional()
  @IsBoolean()
  netOnly?: boolean;
}

// ============================================
// PERFORMANCE REPORT DTOs
// ============================================

export class PerformanceReportDto extends ReportFilterDto {
  @IsOptional()
  @IsArray()
  metrics?: string[]; // conversion_rate, avg_order_value, etc.

  @IsOptional()
  @IsBoolean()
  includeGoals?: boolean;
}

// ============================================
// EXPORT DTOs
// ============================================

export class ExportReportDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsArray()
  columns?: string[]; // Specific columns to include

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  filters?: Record<string, any>;
}

// ============================================
// SCHEDULED REPORT DTOs
// ============================================

export class CreateScheduledReportDto {
  @IsString()
  name: string;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsString()
  schedule: string; // Cron expression or 'daily', 'weekly', 'monthly'

  @IsArray()
  recipients: string[]; // Email addresses

  @IsOptional()
  filters?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateScheduledReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsArray()
  recipients?: string[];

  @IsOptional()
  filters?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// CUSTOM REPORT DTOs
// ============================================

export class CreateCustomReportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  tables: string[]; // Tables to query

  @IsArray()
  columns: CustomReportColumnDto[];

  @IsOptional()
  @IsArray()
  filters?: CustomReportFilterDto[];

  @IsOptional()
  @IsArray()
  groupBy?: string[];

  @IsOptional()
  @IsArray()
  orderBy?: CustomReportOrderDto[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CustomReportColumnDto {
  @IsString()
  table: string;

  @IsString()
  column: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsEnum(MetricType)
  aggregation?: MetricType;
}

export class CustomReportFilterDto {
  @IsString()
  column: string;

  @IsString()
  operator: string; // =, !=, >, <, >=, <=, LIKE, IN, BETWEEN, etc.

  value: any;
}

export class CustomReportOrderDto {
  @IsString()
  column: string;

  @IsString()
  direction: 'asc' | 'desc';
}

// ============================================
// GOAL/KPI DTOs
// ============================================

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsString()
  metric: string; // revenue, orders, customers, etc.

  @IsNumber()
  targetValue: number;

  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsBoolean()
  notifyOnCompletion?: boolean;

  @IsOptional()
  @IsNumber()
  warningThreshold?: number; // Percentage to trigger warning
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsBoolean()
  notifyOnCompletion?: boolean;

  @IsOptional()
  @IsNumber()
  warningThreshold?: number;
}

// ============================================
// ALERT DTOs
// ============================================

export class CreateAlertDto {
  @IsString()
  name: string;

  @IsString()
  metric: string;

  @IsString()
  condition: string; // above, below, equals, changes_by

  @IsNumber()
  threshold: number;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsArray()
  notificationChannels: string[]; // email, sms, push, webhook

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  cooldownMinutes?: number; // Minimum time between alerts
}

export class UpdateAlertDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  threshold?: number;

  @IsOptional()
  @IsArray()
  notificationChannels?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  cooldownMinutes?: number;
}

// ============================================
// COMPARISON DTOs
// ============================================

export class ComparePeriodsDto {
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsDateString()
  period1Start: string;

  @IsDateString()
  period1End: string;

  @IsDateString()
  period2Start: string;

  @IsDateString()
  period2End: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsArray()
  metrics?: string[];
}

export class CompareShopsDto {
  @IsArray()
  shopIds: string[];

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  metrics?: string[];
}

// ============================================
// COHORT ANALYSIS DTOs
// ============================================

export class CohortAnalysisDto {
  @IsString()
  cohortType: string; // signup_date, first_order_date, etc.

  @IsString()
  metric: string; // retention, revenue, orders, etc.

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  granularity?: string; // day, week, month
}

// ============================================
// FUNNEL ANALYSIS DTOs
// ============================================

export class FunnelAnalysisDto {
  @IsArray()
  steps: string[]; // e.g., ['view_product', 'add_to_cart', 'checkout', 'purchase']

  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  segmentBy?: string; // device, source, etc.
}
