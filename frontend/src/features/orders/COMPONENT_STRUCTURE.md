# Track Order Page - Component Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER                                │
│  Logo    [Search Bar]    Track Order  Cart  Profile         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BREADCRUMB                                │
│  Home > Track Order                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  HERO SECTION (Gradient)                     │
│                                                              │
│              Track Your Order                                │
│   Enter your order number or tracking ID                    │
│                                                              │
│   ┌──────────────────────────────────────────┐             │
│   │ 🔍 Enter order number...         [Track]│             │
│   └──────────────────────────────────────────┘             │
│                                                              │
│   Example: Order #FL-2024-12345                             │
└─────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════╗
║           ORDER TRACKING DISPLAY (After Search)             ║
╠═════════════════════════════════════════════════════════════╣

┌─────────────────────────────────────────────────────────────┐
│                  PROGRESS TIMELINE                           │
│                                                              │
│   ●──────●──────●──────○──────○                             │
│   ✓      ✓      ⚡              (Desktop: Horizontal)       │
│  Order  Process Shipped  Delivery  Delivered                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────────────┬─────────────────────────┐
│     MAIN CONTENT (2/3)            │   SIDEBAR (1/3)         │
├───────────────────────────────────┼─────────────────────────┤
│  ┌─ ORDER DETAILS CARD ─────────┐│ ┌─ SHIPPING ADDRESS ──┐ │
│  │ Order #FL-2024-12345     🔔  ││ │ 📍 John Doe         │ │
│  │                              ││ │    123 Main St      │ │
│  │ 📅 Order Date    🕐 Est. Del ││ │    New York, NY     │ │
│  │ Feb 13, 2025     Feb 16, 2025││ │    [Map Placeholder]│ │
│  │                              ││ └─────────────────────┘ │
│  │ 🚚 Carrier       📦 Tracking ││                         │
│  │ FedEx            123456789   ││ ┌─ QUICK ACTIONS ─────┐ │
│  │                      [Copy]  ││ │ 📥 Download Label   │ │
│  │                [Track >]     ││ │ ⚠️  Report Issue    │ │
│  └──────────────────────────────┘│ │ 🔗 Track on Carrier │ │
│                                   │ └─────────────────────┘ │
│  ┌─ ITEMS IN ORDER ─────────────┐│                         │
│  │ Items (2)                    ││ ┌─ CONTACT SUPPORT ──┐ │
│  │                              ││ │ Need help?          │ │
│  │ [img] Premium Wool Overcoat  ││ │                     │ │
│  │       Size: L  Qty: 1        ││ │ [Contact Service]   │ │
│  │       $299.99                ││ │ 📞 Call  📧 Email   │ │
│  │                              ││ │ ❓ Visit FAQ        │ │
│  │ [img] Leather Oxford Shoes   ││ └─────────────────────┘ │
│  │       Size: 10  Qty: 1       ││                         │
│  │       $149.99                ││                         │
│  │                              ││                         │
│  │ Order Total: $449.98         ││                         │
│  └──────────────────────────────┘│                         │
│                                   │                         │
│  ┌─ DELIVERY UPDATES ───────────┐│                         │
│  │ ● Feb 15, 2:30 PM            ││                         │
│  │ │ Out for delivery           ││                         │
│  │ │ 📍 New York, NY            ││                         │
│  │ │                            ││                         │
│  │ ● Feb 15, 9:00 AM            ││                         │
│  │ │ Arrived at facility        ││                         │
│  │ │ 📍 NY Distribution Center  ││                         │
│  │ │                            ││                         │
│  │ ● Feb 14, 6:45 PM            ││                         │
│  │ │ In transit                 ││                         │
│  │ │ 📍 Philadelphia, PA        ││                         │
│  │ │                            ││                         │
│  │ ● Feb 14, 2:00 PM            ││                         │
│  │ │ Shipped from warehouse     ││                         │
│  │ │ 📍 Baltimore, MD           ││                         │
│  │ │                            ││                         │
│  │ ○ Feb 13, 3:15 PM            ││                         │
│  │   Order placed               ││                         │
│  │   📍 Online                  ││                         │
│  └──────────────────────────────┘│                         │
└───────────────────────────────────┴─────────────────────────┘

╚═════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│         HELP SECTION (When No Order Displayed)               │
│                                                              │
│           How to Track Your Order                            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ 🔍       │  │ 🚚       │  │ 🔔       │                 │
│  │ Enter    │  │ View     │  │ Get      │                 │
│  │ Details  │  │ Status   │  │ Updates  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│              Frequently Asked Questions                      │
│  ❓ Where can I find my order number?              >        │
│  ❓ How long does shipping take?                   >        │
│  ❓ Can I change my shipping address?              >        │
│  ❓ Need more help? Contact Support                >        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        FOOTER                                │
│  About  Contact  FAQ  Track Order  Privacy  Terms           │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
TrackOrderPage
│
├── Header (imported)
│
├── BreadcrumbNavigation
│   └── items: [{ label: 'Track Order' }]
│
├── Hero Section (section)
│   ├── Decorative Elements (absolute divs)
│   ├── Container
│   │   ├── Heading (motion.div)
│   │   ├── Description (p)
│   │   └── Search Form (motion.form)
│   │       ├── Category Dropdown
│   │       ├── Search Input
│   │       └── Search Button
│   │           └── Loading State
│   └── Example Text (p)
│
├── Order Tracking Display (AnimatePresence > motion.div)
│   │   [Conditional: only shown when orderData exists]
│   │
│   ├── Progress Timeline Card
│   │   ├── Desktop Timeline (hidden md:block)
│   │   │   ├── Progress Line (animated)
│   │   │   └── Stages (map)
│   │   │       ├── Icon Circle
│   │   │       ├── Label
│   │   │       └── Checkmark (conditional)
│   │   │
│   │   └── Mobile Timeline (md:hidden)
│   │       └── Stages (vertical stack)
│   │
│   └── Main Content Grid (3 columns)
│       │
│       ├── Left Column (lg:col-span-2)
│       │   │
│       │   ├── Order Details Card
│       │   │   ├── Header Section
│       │   │   │   ├── Order Number
│       │   │   │   └── Action Buttons
│       │   │   │       ├── Share Button
│       │   │   │       └── Notification Toggle
│       │   │   │
│       │   │   └── Details Grid (2 columns)
│       │   │       ├── Order Date
│       │   │       ├── Estimated Delivery
│       │   │       ├── Carrier Info
│       │   │       └── Tracking Number
│       │   │           ├── Number Display
│       │   │           ├── Copy Button
│       │   │           └── Carrier Link
│       │   │
│       │   ├── Items Card
│       │   │   ├── Header
│       │   │   ├── Item List (map)
│       │   │   │   └── Item Card
│       │   │   │       ├── Image
│       │   │   │       └── Details
│       │   │   │           ├── Name
│       │   │   │           ├── Variants
│       │   │   │           └── Price
│       │   │   │
│       │   │   └── Order Total
│       │   │
│       │   └── Delivery Updates Card
│       │       └── Timeline (map)
│       │           └── Update Item
│       │               ├── Timeline Dot
│       │               ├── Timeline Line
│       │               └── Update Content
│       │                   ├── Status
│       │                   ├── Timestamp
│       │                   ├── Location
│       │                   └── Description
│       │
│       └── Right Column (sidebar)
│           │
│           ├── Shipping Address Card
│           │   ├── Icon Header
│           │   ├── Address Lines
│           │   └── Map Placeholder
│           │
│           ├── Quick Actions Card
│           │   ├── Download Label Button
│           │   ├── Report Issue Button
│           │   └── Track on Carrier Button
│           │
│           └── Contact Support Card
│               ├── Header
│               ├── Description
│               └── Action Buttons
│                   ├── Contact Service (primary)
│                   ├── Call & Email (grid)
│                   └── FAQ Link
│
├── Help Section (conditional: shown when !orderData)
│   ├── How to Track Section
│   │   └── 3 Cards (grid)
│   │       ├── Step 1: Enter Details
│   │       ├── Step 2: View Status
│   │       └── Step 3: Get Notifications
│   │
│   └── FAQ Card
│       └── Quick Links (4 items)
│
└── Footer (imported)
```

## State Flow

```
Initial State:
searchQuery: ''
isSearching: false
orderData: null
notificationsEnabled: false
copied: false

User enters search query
  ↓
searchQuery: 'FL-2024-12345'
  ↓
User clicks "Track Order"
  ↓
handleSearch() triggered
  ↓
isSearching: true
(shows loading spinner)
  ↓
Simulate API call (1.5s delay)
  ↓
orderData: { ...MOCK_ORDER_DATA }
isSearching: false
  ↓
Display order tracking UI
(AnimatePresence triggers animations)
  ↓
User interacts with features:

1. Copy Tracking Number
   copied: true → (2s) → copied: false

2. Toggle Notifications
   notificationsEnabled: !notificationsEnabled

3. Share Tracking
   Uses Web Share API or clipboard
```

## Responsive Behavior

```
Mobile (< 768px):
┌─────────────┐
│   Header    │
├─────────────┤
│   Search    │
├─────────────┤
│  Timeline   │
│  (vertical) │
├─────────────┤
│   Details   │
├─────────────┤
│   Items     │
├─────────────┤
│  Updates    │
├─────────────┤
│  Address    │
├─────────────┤
│  Actions    │
├─────────────┤
│  Support    │
└─────────────┘

Tablet (768-1023px):
┌─────────────────────┐
│      Header         │
├─────────────────────┤
│      Search         │
├─────────────────────┤
│  Timeline (horiz)   │
├─────────────────────┤
│  Details  │ Address │
├───────────┼─────────┤
│   Items   │ Actions │
├───────────┼─────────┤
│  Updates  │ Support │
└─────────────────────┘

Desktop (≥ 1024px):
┌───────────────────────────────┐
│          Header               │
├───────────────────────────────┤
│          Search               │
├───────────────────────────────┤
│     Timeline (horizontal)     │
├─────────────────┬─────────────┤
│    Details      │   Address   │
├─────────────────┤             │
│     Items       ├─────────────┤
├─────────────────┤   Actions   │
│    Updates      ├─────────────┤
│                 │   Support   │
└─────────────────┴─────────────┘
```

## Animation Sequence

```
Page Load:
  Hero (0.6s fade in + slide up)
    ↓ delay 0.2s
  Search bar (0.6s fade in + slide up)

Search Results Appear:
  Container (0.5s fade in + slide down)
    ↓ stagger 0.1s per stage
  Timeline stages (each 0.5s scale + fade)
    ↓ delay 0.3s
  Progress line (1s width animation)
    ↓
  Cards appear (0.5s fade + slide)
    ↓ stagger 0.1s per update
  Timeline updates (each 0.5s slide from left)

Interactions:
  Button hover (0.3s all)
  Copy icon → checkmark (instant)
  Notification bell color (0.3s)
  Current stage pulse (continuous)
```

## Icon Reference

```
Package     ■ Orders, shipments
Truck       ■ Shipping, delivery
CheckCircle ■ Completed stages
Search      ■ Search functionality
MapPin      ■ Locations, addresses
Calendar    ■ Dates
Clock       ■ Time, estimates
ExternalLink■ External links
Mail        ■ Email contact
MessageSquare■ Support chat
Phone       ■ Phone contact
Download    ■ PDF downloads
Share2      ■ Share functionality
AlertTriangle■ Issues, warnings
Bell/BellOff■ Notifications
Copy/Check  ■ Clipboard actions
HelpCircle  ■ Help, FAQ
ChevronRight■ Navigation arrows
```

## Color Coding

```
Status Colors:
✓ Completed:    #22c55e (green)
⚡ Current:      #84cc16 (lime) + pulse
○ Upcoming:     #e5e7eb (gray)

Action Colors:
Primary:        #84cc16 (lime)
Hover:          #65a30d (lime-dark)
Success:        #22c55e (green)
Error:          #ef4444 (red)
Warning:        #f59e0b (amber)

Text Colors:
Primary:        #0f172a (slate-950)
Secondary:      #64748b (slate-500)
Muted:          #94a3b8 (slate-400)

Background:
White:          #ffffff
Gray-50:        #f9fafb
Gray-100:       #f3f4f6
```

## Grid System

```
Container:      max-w-7xl mx-auto px-4
Spacing:        gap-6 (24px)
Padding:        p-6 (24px)
Radius:         rounded-2xl (16px)

Grid Breakpoints:
Mobile:    grid-cols-1
Tablet:    md:grid-cols-2
Desktop:   lg:grid-cols-3
           lg:col-span-2 (main content)
```

---

**This visual guide helps developers understand the complete structure and layout of the Track Order Page.**
