# Global Settings Page - Component Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GLOBAL SETTINGS                             │
│              Configure platform-wide settings and preferences       │
│                                                       [Cancel] [Save]│
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┐         │
│  │General│Commis │ Shops │Payment│Notif. │Maint. │  API  │ ◄ Tabs  │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┘         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [Icon] Tab Title                                           │   │
│  │          Tab description                                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                             │   │
│  │  Tab Content (Form Fields, Toggles, etc.)                  │   │
│  │                                                             │   │
│  │  • Input fields with validation                            │   │
│  │  • Toggle switches                                          │   │
│  │  • File uploads                                             │   │
│  │  • Checkboxes/Selection lists                              │   │
│  │  • Information boxes                                        │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                              [Save All Changes]     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tab Breakdown

### 1️⃣ General Settings
```
┌────────────────────────────────────────────────┐
│ [Settings Icon] General Settings               │
│ Configure basic platform information           │
├────────────────────────────────────────────────┤
│                                                │
│ Platform Name *          Support Email *       │
│ [FluxEZ Shop      ]     [support@...    ]     │
│                                                │
│ Platform Logo                                  │
│ ┌─────┐                                        │
│ │     │ [x]                                    │
│ │ IMG │    [Upload Logo]                       │
│ └─────┘    Recommended: 200x200px, max 5MB    │
│                                                │
│ Default Currency *       Default Language *    │
│ [USD ▼           ]      [English ▼       ]    │
│                                                │
└────────────────────────────────────────────────┘
```

### 2️⃣ Commission Settings
```
┌────────────────────────────────────────────────┐
│ [$ Icon] Commission Settings                   │
│ Configure platform commission and pricing      │
├────────────────────────────────────────────────┤
│                                                │
│ Platform Commission (%)  Min Order   Free Ship │
│ [10        %]           [$5.00  ]   [$50.00 ] │
│ Commission per sale     Required     For free  │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ ℹ️ Commission Information                  │ │
│ │ Platform commission will be deducted...    │ │
│ └────────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### 3️⃣ Shop Settings
```
┌────────────────────────────────────────────────┐
│ [Store Icon] Shop Settings                     │
│ Configure shop approval and verification       │
├────────────────────────────────────────────────┤
│                                                │
│ ⚡ Auto-approve New Shops            [ON/OFF] │
│                                                │
│ Required Documents for Verification            │
│ ☑ Business License      ☑ Tax ID / EIN        │
│ ☑ Bank Account          ☐ Identity Proof      │
│ ☐ Address Proof                                │
│                                                │
│ 📦 Maximum Products Per Shop                   │
│ [1000                                       ]  │
│                                                │
└────────────────────────────────────────────────┘
```

### 4️⃣ Payment Settings
```
┌────────────────────────────────────────────────┐
│ [Card Icon] Payment Settings                   │
│ Enable and configure payment methods           │
├────────────────────────────────────────────────┤
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ 💳 Stripe                [Active ✓] [ON]  │ │
│ │    Credit card and digital wallets         │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ 💰 PayPal               [Inactive] [OFF]  │ │
│ │    PayPal digital payments                 │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ 🛍️ Cash on Delivery      [Active ✓] [ON]  │ │
│ │    Pay with cash upon delivery             │ │
│ └────────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### 5️⃣ Notification Settings
```
┌────────────────────────────────────────────────┐
│ [Bell Icon] Notification Settings              │
│ Configure notification channels                │
├────────────────────────────────────────────────┤
│                                                │
│ 📧 Email Notifications                  [ON]  │
│    Send notifications via email                │
│                                                │
│ 🔔 Push Notifications                   [ON]  │
│    Browser push notifications                  │
│                                                │
│ 📱 SMS Notifications                   [OFF]  │
│    Send notifications via SMS                  │
│                                                │
└────────────────────────────────────────────────┘
```

### 6️⃣ Maintenance Mode
```
┌────────────────────────────────────────────────┐
│ [Warning Icon] Maintenance Mode                │
│ Configure platform maintenance settings        │
├────────────────────────────────────────────────┤
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ ⚠️ Warning: Maintenance Mode               │ │
│ │ Enabling will make platform unavailable... │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ⚠️ Enable Maintenance Mode            [OFF]  │
│                                                │
│ Maintenance Message                            │
│ ┌────────────────────────────────────────────┐ │
│ │ We are currently performing scheduled      │ │
│ │ maintenance. Please check back soon.       │ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### 7️⃣ API Integration
```
┌────────────────────────────────────────────────┐
│ [Globe Icon] API Integration                   │
│ Configure API access and webhooks              │
├────────────────────────────────────────────────┤
│                                                │
│ API Version              Rate Limit (per min)  │
│ [v1 (read-only) ]       [60                 ]  │
│                                                │
│ Webhook URL                                    │
│ [https://your-domain.com/webhook           ]   │
│                                                │
│ API Key                                        │
│ [••••••••••••••••           (read-only)   ]   │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ 🛡️ API Security                            │ │
│ │ Keep your API key secure...                │ │
│ └────────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

## Component Hierarchy

```
GlobalSettingsPage
├── Header
│   ├── Title
│   ├── Description
│   └── Action Buttons (Cancel / Save) [conditional]
│
├── Tabs Navigation
│   └── Tab Buttons (7 tabs)
│
├── Tab Content Container
│   ├── Tab Header
│   │   ├── Icon
│   │   ├── Title
│   │   └── Description
│   │
│   └── Tab Content
│       ├── Form Fields
│       │   ├── Text Inputs
│       │   ├── Select Dropdowns
│       │   ├── Number Inputs
│       │   ├── Textareas
│       │   └── File Upload
│       │
│       ├── Toggle Switches
│       ├── Checkboxes
│       ├── Information Boxes
│       └── Status Indicators
│
└── Bottom Save Button [conditional]
```

## State Flow

```
┌────────────┐
│ Component  │
│  Mount     │
└─────┬──────┘
      │
      ├── Load Settings (API Call)
      │   └── Populate Form State
      │
      ├── User Edits Form
      │   ├── Set hasUnsavedChanges = true
      │   ├── Real-time Validation
      │   └── Show Save/Cancel Buttons
      │
      ├── User Clicks Save
      │   ├── Validate Form (Zod)
      │   ├── Send to API
      │   ├── Show Success Toast
      │   └── Set hasUnsavedChanges = false
      │
      └── User Clicks Cancel
          ├── Reload Settings
          └── Set hasUnsavedChanges = false
```

## Validation Flow

```
User Input
    ↓
Real-time Validation
    ↓
Clear Errors on Valid
    ↓
On Save Click
    ↓
Zod Schema Validation
    ↓
    ├── Valid ──→ API Call ──→ Success
    │
    └── Invalid ──→ Show Errors ──→ Prevent Save
```

## API Integration Pattern

```typescript
// Load
useEffect(() => {
  loadSettings()
}, [])

loadSettings() {
  api.get('/admin/settings')
    → setGeneralSettings()
    → setCommissionSettings()
    → etc.
}

// Save
handleSave() {
  validateForm()
    → api.patch('/admin/settings', data)
    → toast.success()
    → loadSettings()
}

// Upload
handleLogoUpload(file) {
  FormData
    → api.post('/admin/settings/logo', formData)
    → Update logo URL
    → Set unsaved changes
}
```

## Responsive Behavior

```
Mobile (< 768px)
├── Tabs: 2 columns
├── Form: 1 column
└── Stacked buttons

Tablet (768px - 1024px)
├── Tabs: 4 columns
├── Form: 2 columns
└── Inline buttons

Desktop (> 1024px)
├── Tabs: 7 columns
├── Form: 2-3 columns
└── Inline buttons
```

## Animation Timeline

```
Page Load
  0ms   → Fade in container (opacity: 0 → 1)
  
Tab Switch
  0ms   → Instant content change (no animation)
  
Save Button
  0ms   → Slide up from bottom (y: 20 → 0)
  
Form Interactions
  0ms   → Instant feedback
  300ms → Smooth color transitions
```

---

This structure ensures a consistent, maintainable, and user-friendly admin settings interface.
