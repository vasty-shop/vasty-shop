import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  UpdateExpenseStatusDto,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  SetBudgetDto,
  GetExpensesDto,
  ExpenseReportDto,
  ExpenseStatus,
  ExpenseCategory,
  RecurrenceType,
} from './dto/expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // CUSTOM EXPENSE CATEGORIES
  // ============================================

  async createCategory(shopId: string, dto: CreateExpenseCategoryDto) {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('expense_categories')
      .insert({
        shop_id: shopId,
        name: dto.name,
        description: dto.description || null,
        icon: dto.icon || null,
        color: dto.color || null,
        parent_id: dto.parentId || null,
        budget_limit: dto.budgetLimit || null,
        is_active: true,
      })
      .returning('*')
      .execute();

    return {
      data: this.transformCategory(result[0]),
      message: 'Expense category created successfully',
    };
  }

  async getCategories(shopId: string) {
    const categories = await /* TODO: replace client call */ this.db.client.query
      .from('expense_categories')
      .select('*')
      .where('shop_id', shopId)
      .where('is_active', true)
      .orderBy('name', 'ASC')
      .get();

    // Include built-in categories
    const builtInCategories = Object.values(ExpenseCategory).map(cat => ({
      id: cat,
      name: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      isBuiltIn: true,
    }));

    return {
      data: {
        builtIn: builtInCategories,
        custom: categories.map((c: any) => this.transformCategory(c)),
      },
    };
  }

  async updateCategory(id: string, shopId: string, dto: UpdateExpenseCategoryDto) {
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.budgetLimit !== undefined) updateData.budget_limit = dto.budgetLimit;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('expense_categories')
      .where('id', id)
      .where('shop_id', shopId)
      .update(updateData)
      .returning('*')
      .execute() as unknown as any[];

    if (!result.length) {
      throw new NotFoundException('Category not found');
    }

    return {
      data: this.transformCategory(result[0]),
      message: 'Category updated successfully',
    };
  }

  async deleteCategory(id: string, shopId: string) {
    // Check if category has expenses
    const expenses = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('id')
      .where('custom_category_id', id)
      .limit(1)
      .get();

    if (expenses.length) {
      throw new BadRequestException('Cannot delete category with existing expenses');
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('expense_categories')
      .where('id', id)
      .where('shop_id', shopId)
      .delete()
      .execute();

    return { message: 'Category deleted successfully' };
  }

  // ============================================
  // EXPENSE CRUD
  // ============================================

  async createExpense(userId: string, dto: CreateExpenseDto) {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .insert({
        shop_id: dto.shopId,
        title: dto.title,
        description: dto.description || null,
        category: dto.category,
        custom_category_id: dto.customCategoryId || null,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        expense_date: dto.expenseDate,
        vendor_name: dto.vendorName || null,
        vendor_id: dto.vendorId || null,
        invoice_number: dto.invoiceNumber || null,
        receipt_url: dto.receiptUrl || null,
        attachments: dto.attachments ? JSON.stringify(dto.attachments) : null,
        recurrence: dto.recurrence || RecurrenceType.NONE,
        recurrence_end_date: dto.recurrenceEndDate || null,
        tags: dto.tags ? JSON.stringify(dto.tags) : null,
        notes: dto.notes || null,
        order_id: dto.orderId || null,
        product_id: dto.productId || null,
        is_tax_deductible: dto.isTaxDeductible || false,
        tax_amount: dto.taxAmount || null,
        status: ExpenseStatus.PENDING,
        created_by: userId,
      })
      .returning('*')
      .execute();

    // Check budget alerts
    await this.checkBudgetAlert(dto.shopId, dto.category, dto.customCategoryId);

    return {
      data: this.transformExpense(result[0]),
      message: 'Expense created successfully',
    };
  }

  async getExpenses(query: GetExpensesDto) {
    let builder = /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('*');

    if (query.shopId) {
      builder = builder.where('shop_id', query.shopId);
    }

    if (query.category) {
      builder = builder.where('category', query.category);
    }

    if (query.customCategoryId) {
      builder = builder.where('custom_category_id', query.customCategoryId);
    }

    if (query.status) {
      builder = builder.where('status', query.status);
    }

    if (query.startDate) {
      builder = builder.where('expense_date', '>=', query.startDate);
    }

    if (query.endDate) {
      builder = builder.where('expense_date', '<=', query.endDate);
    }

    if (query.minAmount !== undefined) {
      builder = builder.where('amount', '>=', query.minAmount);
    }

    if (query.maxAmount !== undefined) {
      builder = builder.where('amount', '<=', query.maxAmount);
    }

    if (query.vendorName) {
      builder = builder.where('vendor_name', 'ILIKE', `%${query.vendorName}%`);
    }

    if (query.search) {
      builder = builder.where('title', 'ILIKE', `%${query.search}%`);
    }

    const sortBy = query.sortBy || 'expense_date';
    const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const expenses = await builder
      .orderBy(sortBy, sortOrder as 'ASC' | 'DESC')
      .limit(query.limit || 50)
      .offset(query.offset || 0)
      .get();

    return {
      data: expenses.map((e: any) => this.transformExpense(e)),
      total: expenses.length,
    };
  }

  async getExpense(id: string) {
    const expenses = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('*')
      .where('id', id)
      .get();

    if (!expenses.length) {
      throw new NotFoundException('Expense not found');
    }

    return { data: this.transformExpense(expenses[0]) };
  }

  async updateExpense(id: string, userId: string, dto: UpdateExpenseDto) {
    // Check ownership
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('created_by', 'status')
      .where('id', id)
      .get();

    if (!existing.length) {
      throw new NotFoundException('Expense not found');
    }

    if (existing[0].status === ExpenseStatus.APPROVED || existing[0].status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot edit approved or paid expenses');
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.customCategoryId !== undefined) updateData.custom_category_id = dto.customCategoryId;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.expenseDate !== undefined) updateData.expense_date = dto.expenseDate;
    if (dto.vendorName !== undefined) updateData.vendor_name = dto.vendorName;
    if (dto.invoiceNumber !== undefined) updateData.invoice_number = dto.invoiceNumber;
    if (dto.receiptUrl !== undefined) updateData.receipt_url = dto.receiptUrl;
    if (dto.attachments !== undefined) updateData.attachments = JSON.stringify(dto.attachments);
    if (dto.tags !== undefined) updateData.tags = JSON.stringify(dto.tags);
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.isTaxDeductible !== undefined) updateData.is_tax_deductible = dto.isTaxDeductible;
    if (dto.taxAmount !== undefined) updateData.tax_amount = dto.taxAmount;

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return {
      data: this.transformExpense(result[0]),
      message: 'Expense updated successfully',
    };
  }

  async updateExpenseStatus(id: string, userId: string, dto: UpdateExpenseStatusDto) {
    const updateData: Record<string, any> = {
      status: dto.status,
      updated_at: new Date().toISOString(),
    };

    if (dto.status === ExpenseStatus.APPROVED) {
      updateData.approved_by = userId;
      updateData.approved_at = new Date().toISOString();
    }

    if (dto.status === ExpenseStatus.REJECTED) {
      updateData.rejection_reason = dto.rejectionReason || null;
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute() as unknown as any[];

    if (!result.length) {
      throw new NotFoundException('Expense not found');
    }

    return {
      data: this.transformExpense(result[0]),
      message: `Expense ${dto.status}`,
    };
  }

  async deleteExpense(id: string, userId: string) {
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('status')
      .where('id', id)
      .get();

    if (!existing.length) {
      throw new NotFoundException('Expense not found');
    }

    if (existing[0].status === ExpenseStatus.PAID) {
      throw new BadRequestException('Cannot delete paid expenses');
    }

    await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .where('id', id)
      .delete()
      .execute();

    return { message: 'Expense deleted successfully' };
  }

  // ============================================
  // BUDGET MANAGEMENT
  // ============================================

  async setBudget(dto: SetBudgetDto) {
    const budgetKey = dto.customCategoryId
      ? `${dto.shopId}_custom_${dto.customCategoryId}_${dto.period}`
      : `${dto.shopId}_${dto.category}_${dto.period}`;

    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('expense_budgets')
      .select('id')
      .where('budget_key', budgetKey)
      .get();

    if (existing.length) {
      await /* TODO: replace client call */ this.db.client.query
        .from('expense_budgets')
        .where('budget_key', budgetKey)
        .update({
          budget_amount: dto.budgetAmount,
          alert_threshold: dto.alertThreshold || 80,
          updated_at: new Date().toISOString(),
        })
        .execute();
    } else {
      await /* TODO: replace client call */ this.db.client.query
        .from('expense_budgets')
        .insert({
          budget_key: budgetKey,
          shop_id: dto.shopId,
          category: dto.category,
          custom_category_id: dto.customCategoryId || null,
          budget_amount: dto.budgetAmount,
          period: dto.period,
          alert_threshold: dto.alertThreshold || 80,
        })
        .execute();
    }

    return {
      message: 'Budget set successfully',
      data: {
        category: dto.customCategoryId || dto.category,
        budgetAmount: dto.budgetAmount,
        period: dto.period,
      },
    };
  }

  async getBudgetStatus(shopId: string, period: string = 'monthly') {
    const budgets = await /* TODO: replace client call */ this.db.client.query
      .from('expense_budgets')
      .select('*')
      .where('shop_id', shopId)
      .where('period', period)
      .get();

    const results = await Promise.all(
      budgets.map(async (budget: any) => {
        const { startDate, endDate } = this.getPeriodDates(period);

        let expenseBuilder = /* TODO: replace client call */ this.db.client.query
          .from('expenses')
          .select('amount')
          .where('shop_id', shopId)
          .where('expense_date', '>=', startDate)
          .where('expense_date', '<=', endDate)
          .where('status', '!=', ExpenseStatus.REJECTED)
          .where('status', '!=', ExpenseStatus.CANCELLED);

        if (budget.custom_category_id) {
          expenseBuilder = expenseBuilder.where('custom_category_id', budget.custom_category_id);
        } else {
          expenseBuilder = expenseBuilder.where('category', budget.category);
        }

        const expenses = await expenseBuilder.get();
        const spentAmount = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        const percentageUsed = (spentAmount / budget.budget_amount) * 100;

        return {
          category: budget.custom_category_id || budget.category,
          budgetAmount: budget.budget_amount,
          spentAmount: Math.round(spentAmount * 100) / 100,
          remainingAmount: Math.round((budget.budget_amount - spentAmount) * 100) / 100,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          isOverBudget: spentAmount > budget.budget_amount,
          alertTriggered: percentageUsed >= budget.alert_threshold,
          period,
        };
      })
    );

    return { data: results };
  }

  private async checkBudgetAlert(shopId: string, category: string, customCategoryId?: string) {
    // Implementation for sending alerts when budget threshold is reached
    // This would integrate with notifications module
  }

  private getPeriodDates(period: string): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  // ============================================
  // REPORTS & ANALYTICS
  // ============================================

  async getExpenseSummary(shopId: string, startDate: string, endDate: string) {
    const expenses = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('*')
      .where('shop_id', shopId)
      .where('expense_date', '>=', startDate)
      .where('expense_date', '<=', endDate)
      .where('status', '!=', ExpenseStatus.REJECTED)
      .where('status', '!=', ExpenseStatus.CANCELLED)
      .get();

    const totalAmount = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // Group by category
    const byCategory = expenses.reduce((acc: Record<string, { count: number; total: number }>, e: any) => {
      const cat = e.category;
      if (!acc[cat]) acc[cat] = { count: 0, total: 0 };
      acc[cat].count++;
      acc[cat].total += e.amount;
      return acc;
    }, {});

    // Group by status
    const byStatus = expenses.reduce((acc: Record<string, { count: number; total: number }>, e: any) => {
      const status = e.status;
      if (!acc[status]) acc[status] = { count: 0, total: 0 };
      acc[status].count++;
      acc[status].total += e.amount;
      return acc;
    }, {});

    // Monthly trend
    const monthlyTrend = expenses.reduce((acc: Record<string, { total: number; count: number }>, e: any) => {
      const month = e.expense_date.substring(0, 7);
      if (!acc[month]) acc[month] = { total: 0, count: 0 };
      acc[month].total += e.amount;
      acc[month].count++;
      return acc;
    }, {});

    // Top vendors
    const vendorTotals = expenses.reduce((acc: Record<string, { total: number; count: number }>, e: any) => {
      if (e.vendor_name) {
        if (!acc[e.vendor_name]) acc[e.vendor_name] = { total: 0, count: 0 };
        acc[e.vendor_name].total += e.amount;
        acc[e.vendor_name].count++;
      }
      return acc;
    }, {});

    return {
      data: {
        totalExpenses: expenses.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        averageExpense: expenses.length
          ? Math.round((totalAmount / expenses.length) * 100) / 100
          : 0,
        expensesByCategory: Object.entries(byCategory).map(([category, data]: [string, any]) => ({
          category,
          count: data.count,
          total: Math.round(data.total * 100) / 100,
        })),
        expensesByStatus: Object.entries(byStatus).map(([status, data]: [string, any]) => ({
          status,
          count: data.count,
          total: Math.round(data.total * 100) / 100,
        })),
        monthlyTrend: Object.entries(monthlyTrend)
          .map(([month, data]: [string, any]) => ({
            month,
            total: Math.round(data.total * 100) / 100,
            count: data.count,
          }))
          .sort((a, b) => a.month.localeCompare(b.month)),
        topVendors: Object.entries(vendorTotals)
          .map(([vendor, data]: [string, any]) => ({
            vendor,
            total: Math.round(data.total * 100) / 100,
            count: data.count,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10),
      },
    };
  }

  async generateReport(dto: ExpenseReportDto) {
    const expenses = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('*')
      .where('shop_id', dto.shopId)
      .where('expense_date', '>=', dto.startDate)
      .where('expense_date', '<=', dto.endDate)
      .where('status', '!=', ExpenseStatus.REJECTED)
      .orderBy('expense_date', 'ASC')
      .get();

    // Filter by categories if specified
    const filteredExpenses = dto.categories?.length
      ? expenses.filter((e: any) => dto.categories!.includes(e.category))
      : expenses;

    // Group data based on groupBy parameter
    let groupedData: any = {};

    if (dto.groupBy === 'category') {
      groupedData = this.groupByCategory(filteredExpenses);
    } else if (dto.groupBy === 'month') {
      groupedData = this.groupByMonth(filteredExpenses);
    } else if (dto.groupBy === 'week') {
      groupedData = this.groupByWeek(filteredExpenses);
    } else {
      groupedData = this.groupByDay(filteredExpenses);
    }

    // Calculate projections if requested
    let projections = null;
    if (dto.includeProjections) {
      projections = await this.calculateProjections(dto.shopId, filteredExpenses);
    }

    return {
      data: {
        period: { startDate: dto.startDate, endDate: dto.endDate },
        totalExpenses: filteredExpenses.length,
        totalAmount: filteredExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        groupedData,
        projections,
        expenses: filteredExpenses.map((e: any) => this.transformExpense(e)),
      },
    };
  }

  async getExpenseProjections(shopId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenses = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('*')
      .where('shop_id', shopId)
      .where('expense_date', '>=', sixMonthsAgo.toISOString().split('T')[0])
      .where('status', '!=', ExpenseStatus.REJECTED)
      .get();

    return {
      data: await this.calculateProjections(shopId, expenses),
    };
  }

  private async calculateProjections(shopId: string, expenses: any[]) {
    const monthlyTotals: Record<string, number> = {};

    expenses.forEach((e: any) => {
      const month = e.expense_date.substring(0, 7);
      if (!monthlyTotals[month]) monthlyTotals[month] = 0;
      monthlyTotals[month] += e.amount;
    });

    const months = Object.keys(monthlyTotals).sort();
    const values = months.map(m => monthlyTotals[m]);

    const avgMonthly = values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;

    // Calculate trend
    let trend = 'stable';
    if (values.length >= 2) {
      const lastTwo = values.slice(-2);
      const change = ((lastTwo[1] - lastTwo[0]) / lastTwo[0]) * 100;
      if (change > 10) trend = 'increasing';
      else if (change < -10) trend = 'decreasing';
    }

    // Group by category for projections
    const categoryTotals: Record<string, number[]> = {};
    expenses.forEach((e: any) => {
      if (!categoryTotals[e.category]) categoryTotals[e.category] = [];
      categoryTotals[e.category].push(e.amount);
    });

    const categoryProjections = Object.entries(categoryTotals).map(([category, amounts]) => ({
      category,
      monthly: Math.round((amounts.reduce((a, b) => a + b, 0) / months.length) * 100) / 100,
      yearly: Math.round((amounts.reduce((a, b) => a + b, 0) / months.length) * 12 * 100) / 100,
    }));

    return {
      projectedMonthlyTotal: Math.round(avgMonthly * 100) / 100,
      projectedYearlyTotal: Math.round(avgMonthly * 12 * 100) / 100,
      categoryProjections,
      trend,
      comparisonToPreviousPeriod: values.length >= 2
        ? Math.round(((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100 * 100) / 100
        : 0,
    };
  }

  private groupByCategory(expenses: any[]) {
    return expenses.reduce((acc: Record<string, any[]>, e: any) => {
      if (!acc[e.category]) acc[e.category] = [];
      acc[e.category].push(this.transformExpense(e));
      return acc;
    }, {});
  }

  private groupByMonth(expenses: any[]) {
    return expenses.reduce((acc: Record<string, any[]>, e: any) => {
      const month = e.expense_date.substring(0, 7);
      if (!acc[month]) acc[month] = [];
      acc[month].push(this.transformExpense(e));
      return acc;
    }, {});
  }

  private groupByWeek(expenses: any[]) {
    return expenses.reduce((acc: Record<string, any[]>, e: any) => {
      const date = new Date(e.expense_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const week = weekStart.toISOString().split('T')[0];
      if (!acc[week]) acc[week] = [];
      acc[week].push(this.transformExpense(e));
      return acc;
    }, {});
  }

  private groupByDay(expenses: any[]) {
    return expenses.reduce((acc: Record<string, any[]>, e: any) => {
      const day = e.expense_date.split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(this.transformExpense(e));
      return acc;
    }, {});
  }

  // ============================================
  // EXPORT
  // ============================================

  async exportExpenses(shopId: string, startDate: string, endDate: string, format: string = 'json') {
    const expenses = await /* TODO: replace client call */ this.db.client.query
      .from('expenses')
      .select('*')
      .where('shop_id', shopId)
      .where('expense_date', '>=', startDate)
      .where('expense_date', '<=', endDate)
      .orderBy('expense_date', 'ASC')
      .get();

    const data = expenses.map((e: any) => this.transformExpense(e));

    if (format === 'csv') {
      const headers = [
        'ID', 'Title', 'Description', 'Category', 'Amount', 'Currency',
        'Expense Date', 'Vendor', 'Invoice Number', 'Status', 'Tax Deductible', 'Tax Amount'
      ];
      const rows = data.map((e: any) => [
        e.id, e.title, e.description || '', e.category, e.amount, e.currency,
        e.expenseDate, e.vendorName || '', e.invoiceNumber || '', e.status,
        e.isTaxDeductible ? 'Yes' : 'No', e.taxAmount || 0
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return { data: csv, contentType: 'text/csv' };
    }

    return { data, contentType: 'application/json' };
  }

  // ============================================
  // HELPERS
  // ============================================

  private transformExpense(expense: any) {
    return {
      id: expense.id,
      shopId: expense.shop_id,
      title: expense.title,
      description: expense.description,
      category: expense.category,
      customCategoryId: expense.custom_category_id,
      amount: expense.amount,
      currency: expense.currency,
      expenseDate: expense.expense_date,
      vendorName: expense.vendor_name,
      vendorId: expense.vendor_id,
      invoiceNumber: expense.invoice_number,
      receiptUrl: expense.receipt_url,
      attachments: expense.attachments
        ? (typeof expense.attachments === 'string' ? JSON.parse(expense.attachments) : expense.attachments)
        : null,
      recurrence: expense.recurrence,
      recurrenceEndDate: expense.recurrence_end_date,
      tags: expense.tags
        ? (typeof expense.tags === 'string' ? JSON.parse(expense.tags) : expense.tags)
        : null,
      notes: expense.notes,
      orderId: expense.order_id,
      productId: expense.product_id,
      isTaxDeductible: expense.is_tax_deductible,
      taxAmount: expense.tax_amount,
      status: expense.status,
      createdBy: expense.created_by,
      approvedBy: expense.approved_by,
      approvedAt: expense.approved_at,
      rejectionReason: expense.rejection_reason,
      createdAt: expense.created_at,
      updatedAt: expense.updated_at,
    };
  }

  private transformCategory(category: any) {
    return {
      id: category.id,
      shopId: category.shop_id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      parentId: category.parent_id,
      budgetLimit: category.budget_limit,
      isActive: category.is_active,
      isBuiltIn: false,
      createdAt: category.created_at,
    };
  }
}
