# User Moderation Page - Documentation

## Overview

The User Moderation Page is a comprehensive admin interface for managing user accounts in the Fluxez Shop platform. It provides full CRUD operations, role management, account status control, and detailed user analytics.

**Location**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/features/admin/pages/UserModerationPage.tsx`

## Features

### 1. User List Management
- **Paginated table view** showing all users
- **Search functionality** by name or email
- **Filter options**:
  - By role (customer, vendor, admin)
  - By status (active, suspended, banned)
- **Sorting options**:
  - By creation date
  - By name
  - By email
- **Bulk selection** with checkbox support

### 2. User Statistics Dashboard
Displays real-time statistics:
- Total users count
- Active users count
- Customers count
- Vendors count
- Admins count
- Suspended users count

### 3. User Actions

#### Individual Actions
- **View Details**: Opens detailed modal with user information
- **Change Role**: Toggle between customer and vendor roles
- **Suspend/Activate**: Control user account access
- **Delete User**: Soft delete user account

#### Bulk Actions
- **Bulk Suspend**: Suspend multiple users at once
- **Bulk Activate**: Activate multiple suspended users
- **Bulk Delete**: Delete multiple users at once

### 4. User Details Modal

Shows comprehensive user information:

#### Profile Information
- Avatar/initial display
- Full name and email
- Current role and status badges
- Join date and last login

#### Activity Statistics
- Total orders count
- Total amount spent
- Reviews written
- Shops owned (for vendors)

#### Contact Information
- Email address
- Phone number (if available)
- Account creation date
- Last login timestamp

#### Related Data
- **Recent Orders**: Last 5 orders with status
- **User Shops**: List of shops for vendor accounts

#### Quick Actions
- Change user role
- Suspend/Activate account
- Delete user

### 5. Export Functionality
- Export user list to CSV
- Filtered export (applies current filters)
- Includes all visible user data

## API Integration

### Endpoints Used

#### List Users
```typescript
GET /admin/users
Parameters:
  - page: number
  - limit: number
  - sortBy: 'createdAt' | 'name' | 'email'
  - sortOrder: 'asc' | 'desc'
  - role?: 'customer' | 'vendor' | 'admin'
  - status?: 'active' | 'suspended' | 'banned'
  - search?: string

Response: {
  data: User[],
  totalPages: number,
  stats?: UserStats
}
```

#### Get User Orders
```typescript
GET /admin/users/:id/orders
Response: {
  data: OrderSummary[]
}
```

#### Get User Shops
```typescript
GET /admin/users/:id/shops
Response: {
  data: ShopSummary[]
}
```

#### Update User Role
```typescript
PATCH /admin/users/:id/role
Body: { role: string }
```

#### Update User Status
```typescript
PATCH /admin/users/:id/status
Body: { status: string }
```

#### Delete User
```typescript
DELETE /admin/users/:id
```

#### Bulk Actions
```typescript
POST /admin/users/bulk-action
Body: {
  userIds: string[],
  action: 'suspend' | 'activate' | 'delete'
}
```

#### Export Users
```typescript
GET /admin/users/export
Parameters:
  - role?: string
  - status?: string
  - search?: string
ResponseType: blob
```

## Component Structure

### State Management

#### Filters & Pagination
```typescript
searchQuery: string          // Search input
selectedRole: string        // Role filter
selectedStatus: string      // Status filter
page: number               // Current page
limit: number              // Items per page
sortBy: string            // Sort field
sortOrder: 'asc' | 'desc' // Sort direction
```

#### Data State
```typescript
users: UserWithDetails[]   // User list
stats: UserStats          // Dashboard statistics
totalPages: number        // Total pages for pagination
isLoading: boolean       // Loading state
error: string | null     // Error message
```

#### Modal State
```typescript
showDetailsModal: boolean           // Details modal visibility
selectedUser: UserWithDetails | null // Selected user
userOrders: OrderSummary[]         // User's orders
userShops: ShopSummary[]          // User's shops (vendors)
loadingDetails: boolean           // Details loading state
```

#### Bulk Actions
```typescript
selectedUserIds: Set<string>  // Selected users for bulk actions
```

#### Confirmation Dialog
```typescript
confirmDialog: {
  isOpen: boolean,
  title: string,
  message: string,
  onConfirm: () => void,
  variant: 'danger' | 'warning' | 'info'
}
```

### Key Functions

#### Data Fetching
- `fetchUsers()`: Loads users with current filters
- `handleViewDetails(user)`: Loads detailed user information

#### User Actions
- `handleChangeRole(userId, currentRole)`: Changes user role
- `handleSuspendUser(userId, isSuspended)`: Suspends/activates user
- `handleDeleteUser(userId, userName)`: Deletes user account

#### Bulk Operations
- `handleBulkAction(action)`: Performs bulk action on selected users
- `handleSelectAll()`: Selects/deselects all users
- `handleToggleUser(userId)`: Toggles individual user selection

#### Export
- `handleExportUsers()`: Exports user list to CSV

### Helper Functions
- `calculateStats(usersData)`: Calculates statistics from user data
- `getStatusColor(user)`: Returns Tailwind classes for status badge
- `getRoleColor(role)`: Returns Tailwind classes for role badge
- `getRoleIcon(role)`: Returns appropriate icon for role

## UI Components

### External Dependencies
- `framer-motion`: Animations and transitions
- `lucide-react`: Icons
- `sonner`: Toast notifications
- `ConfirmDialog`: Confirmation dialogs for dangerous actions

### Styling
- Dark theme with glassmorphism effects
- Gradient accents (purple-pink)
- Responsive design (mobile-friendly)
- Tailwind CSS utility classes

### Color Coding

#### Status Colors
- **Active**: Green (`text-green-400 bg-green-400/20`)
- **Suspended**: Yellow (`text-yellow-400 bg-yellow-400/20`)
- **Banned**: Red (`text-red-400 bg-red-400/20`)
- **Inactive**: Gray (`text-gray-400 bg-gray-400/20`)

#### Role Colors
- **Admin**: Purple (`text-purple-400 bg-purple-400/20`)
- **Vendor**: Blue (`text-blue-400 bg-blue-400/20`)
- **Customer**: Cyan (`text-cyan-400 bg-cyan-400/20`)

## Usage Example

### Importing the Component
```typescript
import { UserModerationPage } from '@/features/admin/pages';
```

### Routing Setup
```typescript
<Route path="/admin/users" element={<UserModerationPage />} />
```

### Required Permissions
- Admin role required
- Must have user management permissions

## Security Considerations

1. **Confirmation Dialogs**: All destructive actions (delete, suspend, bulk operations) require explicit confirmation
2. **Role Restrictions**: Only admins can access this page
3. **Soft Delete**: User deletion is soft delete (preserves data)
4. **Audit Trail**: All actions should be logged on the backend

## Best Practices

### When to Use
- Admin panel user management
- User account moderation
- Customer support operations
- Platform governance

### Performance Tips
1. Pagination limits dataset size
2. Debounce search input for API calls
3. Lazy load user details (only on modal open)
4. Use bulk actions for multiple operations

### Accessibility
- Keyboard navigation supported
- Clear visual feedback for actions
- Status indicators with color + text
- Confirmation dialogs prevent accidents

## Error Handling

### Error States
1. **Network Errors**: Display error message with retry button
2. **Empty States**: Show helpful message based on filters
3. **Loading States**: Spinner animation during data fetch
4. **Action Failures**: Toast notification with error details

### User Feedback
- **Success**: Green toast notification
- **Error**: Red toast notification with specific message
- **Loading**: Inline spinners for actions
- **Confirmation**: Modal dialogs before destructive actions

## Future Enhancements

### Planned Features
1. **Advanced Filters**:
   - Date range (join date, last login)
   - Order count range
   - Total spent range

2. **User Activity Timeline**:
   - Complete activity history
   - Login history
   - Action logs

3. **Bulk Import/Export**:
   - Import users from CSV
   - Custom export templates

4. **User Communication**:
   - Send email to user
   - In-app messaging
   - Notification center

5. **Advanced Analytics**:
   - User cohorts
   - Churn analysis
   - Growth metrics

## Testing

### Test Scenarios

1. **User List Loading**:
   - Empty state
   - Error state
   - Paginated results
   - Filtered results

2. **Search and Filter**:
   - Search by name
   - Search by email
   - Filter by role
   - Filter by status
   - Combined filters

3. **User Actions**:
   - View user details
   - Change user role
   - Suspend/activate user
   - Delete user
   - Cancel actions

4. **Bulk Operations**:
   - Select all users
   - Select individual users
   - Bulk suspend
   - Bulk delete

5. **Export**:
   - Export all users
   - Export filtered users
   - Download CSV file

## Troubleshooting

### Common Issues

#### Users Not Loading
- Check API endpoint availability
- Verify authentication token
- Check browser console for errors
- Verify admin permissions

#### Search Not Working
- Check if backend supports search parameter
- Verify search query format
- Check for special character handling

#### Actions Failing
- Verify user permissions
- Check backend API status
- Review error messages in console
- Ensure proper request format

#### Export Not Downloading
- Check browser download settings
- Verify CSV generation on backend
- Check for CORS issues
- Ensure blob response type

## Related Files

- **API Module**: `/src/lib/api.ts` (admin user methods)
- **Types**: `/src/lib/api.ts` (User interface)
- **ConfirmDialog**: `/src/components/ui/ConfirmDialog.tsx`
- **Router**: `/src/App.tsx` (admin routes)

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint responses
3. Check browser console for errors
4. Review backend logs for API issues

---

**Version**: 1.0.0
**Last Updated**: December 2025
**Maintained By**: InfoInlet Development Team
