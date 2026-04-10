# User Moderation Page - Integration Checklist

## Quick Start Integration Guide

This document provides step-by-step instructions for integrating the User Moderation page into your admin panel.

---

## Prerequisites

### ✅ Already Completed
- [x] Component created at `src/features/admin/pages/UserModerationPage.tsx`
- [x] API methods added to `src/lib/api.ts`
- [x] Export configured in `src/features/admin/pages/index.ts`
- [x] TypeScript types defined
- [x] UI components available (ConfirmDialog, etc.)

### ⚠️ Requires Backend Implementation
- [ ] Admin user management API endpoints
- [ ] Database tables for users
- [ ] Authentication middleware for admin routes
- [ ] Role-based access control (RBAC)

---

## Integration Steps

### Step 1: Add Route to Router

**File**: `src/App.tsx` or your admin routes file

```typescript
import { UserModerationPage } from './features/admin/pages';

// Inside your Routes component
<Route path="/admin/users" element={<UserModerationPage />} />
```

**Alternative with lazy loading**:
```typescript
const UserModerationPage = lazy(() =>
  import('./features/admin/pages').then(m => ({ default: m.UserModerationPage }))
);

<Route
  path="/admin/users"
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <UserModerationPage />
    </Suspense>
  }
/>
```

### Step 2: Add to Admin Navigation Menu

**File**: `src/features/admin/components/AdminSidebar.tsx` (or similar)

```typescript
import { Users } from 'lucide-react';

// Add to navigation items
const navigationItems = [
  // ... other items
  {
    name: 'User Moderation',
    path: '/admin/users',
    icon: Users,
  },
  // ... other items
];

// In your menu rendering
<NavLink
  to="/admin/users"
  className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10"
>
  <Users className="w-5 h-5" />
  <span>User Moderation</span>
</NavLink>
```

### Step 3: Add Route Protection

**File**: Your route protection wrapper

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<Route
  path="/admin/users"
  element={
    <ProtectedRoute requireAdmin>
      <UserModerationPage />
    </ProtectedRoute>
  }
/>
```

**Or with role checking**:
```typescript
<Route
  path="/admin/users"
  element={
    <RequireRole role="admin">
      <UserModerationPage />
    </RequireRole>
  }
/>
```

---

## Backend API Implementation

### Required Endpoints

#### 1. List Users
```typescript
GET /admin/users

Query Parameters:
  - page: number          (default: 1)
  - limit: number         (default: 15)
  - sortBy: string        (options: 'createdAt', 'name', 'email')
  - sortOrder: string     (options: 'asc', 'desc')
  - role?: string         (options: 'customer', 'vendor', 'admin')
  - status?: string       (options: 'active', 'suspended', 'banned')
  - search?: string       (search in name and email)

Response:
{
  data: [
    {
      id: string,
      email: string,
      name: string,
      role: 'customer' | 'vendor' | 'admin',
      is_active: boolean,
      status: 'active' | 'suspended' | 'banned',
      phone?: string,
      createdAt: string,
      lastLoginAt?: string,
      totalOrders?: number,
      totalSpent?: number,
      reviewsCount?: number,
      shopsCount?: number
    }
  ],
  totalPages: number,
  stats?: {
    totalUsers: number,
    activeUsers: number,
    customers: number,
    vendors: number,
    admins: number,
    suspendedUsers: number
  }
}
```

#### 2. Get User Details
```typescript
GET /admin/users/:id

Response:
{
  id: string,
  email: string,
  name: string,
  role: string,
  status: string,
  // ... all user fields
}
```

#### 3. Get User Orders
```typescript
GET /admin/users/:id/orders

Response:
{
  data: [
    {
      id: string,
      orderNumber: string,
      total: number,
      status: string,
      createdAt: string
    }
  ]
}
```

#### 4. Get User Shops (Vendors)
```typescript
GET /admin/users/:id/shops

Response:
{
  data: [
    {
      id: string,
      name: string,
      slug: string,
      status: string
    }
  ]
}
```

#### 5. Update User Role
```typescript
PATCH /admin/users/:id/role

Body:
{
  role: 'customer' | 'vendor' | 'admin'
}

Response:
{
  message: string,
  user: User
}
```

#### 6. Update User Status
```typescript
PATCH /admin/users/:id/status

Body:
{
  status: 'active' | 'suspended' | 'banned'
}

Response:
{
  message: string,
  user: User
}
```

#### 7. Delete User
```typescript
DELETE /admin/users/:id

Response:
{
  message: string
}

Note: Should be soft delete (set is_deleted = true)
```

#### 8. Bulk Actions
```typescript
POST /admin/users/bulk-action

Body:
{
  userIds: string[],
  action: 'suspend' | 'activate' | 'delete'
}

Response:
{
  message: string,
  affectedCount: number
}
```

#### 9. Export Users
```typescript
GET /admin/users/export

Query Parameters:
  - role?: string
  - status?: string
  - search?: string

Response: CSV file (Content-Type: text/csv)
```

### Backend Implementation Example (NestJS)

```typescript
// admin-users.controller.ts
import { Controller, Get, Patch, Delete, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';

@Controller('admin/users')
@UseGuards(AdminGuard)
export class AdminUsersController {

  @Get()
  async listUsers(@Query() query: ListUsersDto) {
    // Implementation
  }

  @Get(':id')
  async getUserDetails(@Param('id') id: string) {
    // Implementation
  }

  @Get(':id/orders')
  async getUserOrders(@Param('id') id: string) {
    // Implementation
  }

  @Get(':id/shops')
  async getUserShops(@Param('id') id: string) {
    // Implementation
  }

  @Patch(':id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    // Implementation
  }

  @Patch(':id/status')
  async updateUserStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    // Implementation
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    // Implementation (soft delete)
  }

  @Post('bulk-action')
  async bulkAction(@Body() body: BulkActionDto) {
    // Implementation
  }

  @Get('export')
  async exportUsers(@Query() query: ExportUsersDto) {
    // Implementation
  }
}
```

---

## Database Schema

### Users Table (if not exists)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'vendor', 'admin'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'banned'
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Audit Log Table (recommended)

```sql
CREATE TABLE user_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  admin_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'role_change', 'suspend', 'activate', 'delete'
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON user_audit_logs(user_id);
CREATE INDEX idx_audit_admin ON user_audit_logs(admin_id);
```

---

## Security Considerations

### 1. Authentication
```typescript
// Verify JWT token
// Verify user is logged in
// Check token expiration
```

### 2. Authorization
```typescript
// Check if user has 'admin' role
// Verify admin permissions
// Prevent self-modification (optional)
```

### 3. Input Validation
```typescript
// Validate all input parameters
// Sanitize search queries
// Prevent SQL injection
// Validate role values
// Validate status values
```

### 4. Rate Limiting
```typescript
// Limit API calls per user
// Prevent abuse of bulk actions
// Throttle export operations
```

### 5. Audit Logging
```typescript
// Log all user modifications
// Track who made changes
// Store before/after values
// Include timestamp and reason
```

---

## Testing Checklist

### Frontend Testing

#### Unit Tests
- [ ] Component renders without errors
- [ ] State management works correctly
- [ ] Helper functions return expected values
- [ ] Event handlers trigger correctly

#### Integration Tests
- [ ] API calls are made with correct parameters
- [ ] Response data is processed correctly
- [ ] Error handling works as expected
- [ ] Toast notifications appear

#### E2E Tests
- [ ] User can search and filter
- [ ] Pagination works correctly
- [ ] Details modal opens and closes
- [ ] Role change confirmation works
- [ ] Suspend/activate confirmation works
- [ ] Delete confirmation works
- [ ] Bulk actions execute properly
- [ ] Export downloads CSV file

### Backend Testing

#### Unit Tests
- [ ] Controller methods return correct data
- [ ] Service methods handle edge cases
- [ ] Validation works correctly

#### Integration Tests
- [ ] Database queries return expected results
- [ ] Transactions roll back on error
- [ ] Soft delete preserves data

#### E2E Tests
- [ ] Complete user management flow works
- [ ] Authentication/authorization enforced
- [ ] Rate limiting prevents abuse

---

## Environment Configuration

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api/v1
```

### Backend (.env)
```bash
# Admin settings
ADMIN_ROLE_NAME=admin
RATE_LIMIT_ADMIN_USERS=100
RATE_LIMIT_WINDOW_ADMIN_USERS=60000

# Export settings
MAX_EXPORT_ROWS=10000
EXPORT_TIMEOUT=30000
```

---

## Deployment Checklist

### Pre-deployment
- [ ] Backend API endpoints tested
- [ ] Frontend component tested
- [ ] Integration tested
- [ ] Security reviewed
- [ ] Performance optimized
- [ ] Error handling verified
- [ ] Documentation updated

### Deployment
- [ ] Backend deployed first
- [ ] Database migrations run
- [ ] Frontend deployed
- [ ] Environment variables configured
- [ ] Admin users notified

### Post-deployment
- [ ] Smoke tests passed
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback

---

## Monitoring & Maintenance

### Metrics to Track
- API response times
- Error rates
- User modification frequency
- Bulk action usage
- Export operation performance

### Logs to Monitor
- Authentication failures
- Authorization denials
- Failed user modifications
- Bulk action executions
- Export operations

### Alerts to Configure
- High error rate
- Slow API responses
- Unusual bulk action volume
- Failed critical operations

---

## Troubleshooting Guide

### Issue: Users not loading
**Symptoms**: Empty list, loading forever
**Possible causes**:
- Backend API not responding
- Authentication token expired
- CORS issues
- Network connectivity

**Solutions**:
1. Check browser console for errors
2. Verify API endpoint URL
3. Check authentication token
4. Test API endpoint directly

### Issue: Search not working
**Symptoms**: No results for valid search
**Possible causes**:
- Backend search not implemented
- Case sensitivity issues
- Special characters not handled

**Solutions**:
1. Verify backend search implementation
2. Check search parameter format
3. Test with simple queries first

### Issue: Actions failing
**Symptoms**: Error toasts, no changes
**Possible causes**:
- Insufficient permissions
- Backend validation errors
- Network issues

**Solutions**:
1. Check browser console
2. Verify user has admin role
3. Check backend logs
4. Test API endpoint directly

### Issue: Export not downloading
**Symptoms**: Click export, nothing happens
**Possible causes**:
- Backend export not implemented
- Browser blocking download
- CORS issues

**Solutions**:
1. Check browser console
2. Verify blob response type
3. Check browser download settings
4. Test API endpoint directly

---

## Support Resources

### Documentation
- Component README: `USER_MODERATION_README.md`
- UI Guide: `USER_MODERATION_UI_GUIDE.md`
- This Integration Guide: `USER_MODERATION_INTEGRATION.md`

### Code Examples
- API methods: `src/lib/api.ts`
- Component code: `src/features/admin/pages/UserModerationPage.tsx`
- Types: `src/lib/api.ts` (User interface)

### Getting Help
1. Review documentation
2. Check browser console
3. Review backend logs
4. Test API endpoints directly
5. Contact development team

---

## Next Steps

After completing integration:

1. **Test thoroughly** in development environment
2. **Review security** with security team
3. **Performance test** with large datasets
4. **Get feedback** from admin users
5. **Monitor** in production
6. **Iterate** based on feedback

---

## Checklist Summary

### Setup Phase
- [ ] Review all documentation
- [ ] Verify prerequisites
- [ ] Set up development environment

### Development Phase
- [ ] Implement backend API endpoints
- [ ] Test API endpoints
- [ ] Integrate frontend component
- [ ] Add route to router
- [ ] Add to navigation menu
- [ ] Add route protection

### Testing Phase
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Security review complete
- [ ] Performance acceptable

### Deployment Phase
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment configured
- [ ] Smoke tests passed

### Post-Deployment Phase
- [ ] Monitoring configured
- [ ] Logs reviewed
- [ ] Users notified
- [ ] Documentation updated

---

**Integration Guide Version**: 1.0.0
**Created**: December 9, 2025
**Last Updated**: December 9, 2025
**Status**: Ready for Implementation
