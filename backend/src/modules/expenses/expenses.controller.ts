import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ExpensesService } from './expenses.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  UpdateExpenseStatusDto,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  SetBudgetDto,
  GetExpensesDto,
  ExpenseReportDto,
} from './dto/expenses.dto';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // ============================================
  // CUSTOM CATEGORIES
  // ============================================

  @Post('categories/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Create custom expense category' })
  createCategory(
    @Param('shopId') shopId: string,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.expensesService.createCategory(shopId, dto);
  }

  @Get('categories/:shopId')
  @ApiOperation({ summary: 'Get expense categories for shop' })
  getCategories(@Param('shopId') shopId: string) {
    return this.expensesService.getCategories(shopId);
  }

  @Put('categories/:shopId/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Update custom expense category' })
  updateCategory(
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    return this.expensesService.updateCategory(id, shopId, dto);
  }

  @Delete('categories/:shopId/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Delete custom expense category' })
  deleteCategory(
    @Param('shopId') shopId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.deleteCategory(id, shopId);
  }

  // ============================================
  // EXPENSES CRUD
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create expense' })
  createExpense(@Req() req: any, @Body() dto: CreateExpenseDto) {
    const userId = req.user.sub || req.user.userId;
    return this.expensesService.createExpense(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get expenses with filters' })
  getExpenses(@Query() query: GetExpensesDto) {
    return this.expensesService.getExpenses(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  getExpense(@Param('id') id: string) {
    return this.expensesService.getExpense(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update expense' })
  updateExpense(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.expensesService.updateExpense(id, userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Update expense status (approve/reject)' })
  updateExpenseStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseStatusDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.expensesService.updateExpenseStatus(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  deleteExpense(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub || req.user.userId;
    return this.expensesService.deleteExpense(id, userId);
  }

  // ============================================
  // BUDGETS
  // ============================================

  @Post('budgets')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Set budget for category' })
  setBudget(@Body() dto: SetBudgetDto) {
    return this.expensesService.setBudget(dto);
  }

  @Get('budgets/:shopId')
  @ApiOperation({ summary: 'Get budget status for shop' })
  @ApiQuery({ name: 'period', required: false, description: 'monthly, quarterly, yearly' })
  getBudgetStatus(
    @Param('shopId') shopId: string,
    @Query('period') period?: string,
  ) {
    return this.expensesService.getBudgetStatus(shopId, period);
  }

  // ============================================
  // REPORTS & ANALYTICS
  // ============================================

  @Get('summary/:shopId')
  @ApiOperation({ summary: 'Get expense summary' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getExpenseSummary(
    @Param('shopId') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.expensesService.getExpenseSummary(shopId, startDate, endDate);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Generate expense report' })
  generateReport(@Body() dto: ExpenseReportDto) {
    return this.expensesService.generateReport(dto);
  }

  @Get('projections/:shopId')
  @ApiOperation({ summary: 'Get expense projections' })
  getProjections(@Param('shopId') shopId: string) {
    return this.expensesService.getExpenseProjections(shopId);
  }

  // ============================================
  // EXPORT
  // ============================================

  @Get('export/:shopId')
  @ApiOperation({ summary: 'Export expenses' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'format', required: false, description: 'json or csv' })
  exportExpenses(
    @Param('shopId') shopId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('format') format?: string,
  ) {
    return this.expensesService.exportExpenses(shopId, startDate, endDate, format);
  }
}
