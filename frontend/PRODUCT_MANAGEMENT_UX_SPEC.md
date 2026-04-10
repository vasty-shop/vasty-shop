# E-Commerce Product Management Interface - UX Specification

## Executive Summary

This document provides comprehensive UX guidelines for building a robust e-commerce product management interface based on best practices from leading platforms (Shopify, WooCommerce, Amazon Seller Central, Etsy) and industry research.

**Key Findings:**
- **Single-page with accordions** outperforms horizontal tabs for complex forms
- **Inline validation** with adaptive error messages significantly improves user experience
- **Drag-and-drop image management** with visual handles is essential
- **Search-based category selection** works best for large catalogs (300+ items)
- **Draft-to-published workflow** with scheduled publishing is standard
- **Quick edit capabilities** reduce friction for frequent updates

---

## 1. Product Form Structure

### 1.1 Recommended Layout: Single-Page with Vertical Sections

**Why Not Tabs?**
Research from Baymard Institute shows horizontal tabs consistently underperform:
- Users overlook tabs and only focus on the currently open section
- Limited space forces ambiguous labels
- Lack of descriptive cues reduces discoverability

**Recommended Pattern:**
```
┌─────────────────────────────────────┐
│  Product Name & Status              │ <- Always visible header
├─────────────────────────────────────┤
│  ▼ Basic Information       [Open]   │
│     └─ Fields visible               │
├─────────────────────────────────────┤
│  ▶ Images & Media         [Closed]  │
├─────────────────────────────────────┤
│  ▶ Pricing & Inventory    [Closed]  │
├─────────────────────────────────────┤
│  ▶ Categories & Tags      [Closed]  │
├─────────────────────────────────────┤
│  ▶ Variants & Options     [Closed]  │
├─────────────────────────────────────┤
│  ▶ Shipping & Delivery    [Closed]  │
├─────────────────────────────────────┤
│  ▶ SEO & Metadata         [Closed]  │
├─────────────────────────────────────┤
│  ▶ Campaigns & Promotions [Closed]  │
└─────────────────────────────────────┘
```

**Benefits:**
- All sections visible at once (better overview)
- Vertically collapsed sections expand in place
- Users can quickly scan section headers
- Mobile-friendly (no horizontal space constraints)
- Supports sticky navigation for quick jumping

### 1.2 Sticky Action Bar

**Fixed Header Components:**
```
┌──────────────────────────────────────────────────────┐
│ [← Back] Product Name                    [Save Draft]│
│                                      [Save & Publish]│
└──────────────────────────────────────────────────────┘
```

**Features:**
- Always visible save options
- Product name editable inline
- Status indicator badge
- Quick actions (duplicate, delete)
- Auto-save indicator

---

## 2. Field Organization & Groupings

### Section 1: Basic Information (Always Open by Default)

**Fields:**
```yaml
Product Name: *
  - Type: Text input
  - Max: 120 characters
  - Required: Yes
  - Validation: Real-time character count
  - Hint: "Clear, descriptive name helps customers find your product"

SKU/Product Code:
  - Type: Text input
  - Optional
  - Auto-generate option available
  - Unique validation

Brand:
  - Type: Autocomplete
  - Can create new inline
  - Optional

Description:
  - Type: Rich text editor
  - Min: 50 characters recommended
  - Max: 5000 characters
  - Features: Bold, italic, lists, links
  - Hint: "Include key features, materials, and use cases"

Short Description:
  - Type: Textarea
  - Max: 160 characters
  - Used for: Product cards, meta descriptions
```

### Section 2: Images & Media

**Image Upload Area:**
```
┌────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  IMG 1   │  │  IMG 2   │  │  IMG 3   │ │
│  │ PRIMARY  │  │   [×]    │  │   [×]    │ │
│  │   [⋮⋮]   │  │   [⋮⋮]   │  │   [⋮⋮]   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │  Drag & drop images here           │   │
│  │  or click to browse                │   │
│  │  Max 10 images • 5MB per file      │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

**Features:**
- **Drag & drop multiple upload** with visual feedback
- **Reorder by dragging** (⋮⋮ handle icon)
- **Primary image badge** on first image
- **Delete button** on hover (confirmation required)
- **Image preview on hover** (zoom overlay)
- **Optimization hints**: Recommended dimensions, file size warnings
- **Alt text field** per image (accessibility + SEO)
- **Progress indicators** during upload

**Validation:**
- Supported formats: JPG, PNG, WebP, AVIF
- Min dimensions: 800x800px
- Max file size: 5MB
- Max images: 10

**Error States:**
- File too large: "Image exceeds 5MB. Please compress or resize."
- Wrong format: "Only JPG, PNG, and WebP images are supported."
- Upload failed: "Upload failed. Please check your connection and try again."

### Section 3: Pricing & Inventory

**Layout:**
```
┌─────────────────────────────────────────┐
│ Pricing                                 │
├─────────────────────────────────────────┤
│ Regular Price: *     [ $___.____ ]      │
│ Sale Price:          [ $___.____ ]      │
│   └─ You save: $X.XX (Y%)               │
│                                         │
│ Compare-at Price:    [ $___.____ ]      │
│   (Optional MSRP/RRP for reference)     │
├─────────────────────────────────────────┤
│ Inventory                               │
├─────────────────────────────────────────┤
│ □ Track inventory                       │
│                                         │
│ Stock Quantity: *    [ ______ ] units   │
│ Low stock alert:     [ ______ ] units   │
│                                         │
│ Inventory Status:                       │
│   ○ In Stock                            │
│   ○ Out of Stock                        │
│   ○ Made to Order                       │
│   ○ Pre-order                           │
└─────────────────────────────────────────┘
```

**Validation:**
- Price must be > 0
- Sale price must be < Regular price
- Stock quantity must be ≥ 0
- Real-time savings calculation
- Visual indicators for low stock

**Smart Features:**
- **Bulk pricing calculator**: Apply discounts across variants
- **Cost tracking**: Input cost price to see profit margins
- **Tax class selector**: Default, reduced, zero-rated

### Section 4: Categories & Tags

**Category Selection Pattern (Hybrid Approach):**

For < 100 categories:
```
┌────────────────────────────────────┐
│ Search categories...          [×]  │
└────────────────────────────────────┘

  Selected: Electronics > Smartphones

┌────────────────────────────────────┐
│ ▼ Electronics               [×]    │
│   ├─ □ Computers                   │
│   ├─ ☑ Smartphones                 │
│   ├─ □ Tablets                     │
│   └─ ▶ Accessories                 │
│ ▶ Fashion                          │
│ ▶ Home & Garden                    │
└────────────────────────────────────┘
```

For 300+ categories:
```
┌────────────────────────────────────┐
│ Search categories...               │
└────────────────────────────────────┘

  Popular Categories:
  • Electronics    • Fashion    • Sports

  Recently Used:
  • Smartphones    • Laptops

  Selected (2):
  × Electronics > Smartphones
  × Accessories > Phone Cases
```

**Features:**
- **Autocomplete search** (primary method for large catalogs)
- **Tree view with expand/collapse** (for browsing)
- **Multiple category support** (optional)
- **Create new category inline** (admin permission required)
- **Breadcrumb navigation** for selected categories
- **Recently used categories** quick access

**Tags:**
```
┌────────────────────────────────────┐
│ Add tags...                    [+] │
└────────────────────────────────────┘

Popular tags: #bestseller #new #sale

Selected tags:
  × waterproof  × wireless  × portable
```

- **Autocomplete from existing**
- **Create new on-the-fly**
- **Tag suggestions** based on category/product name
- **Max 10 tags** recommended

### Section 5: Variants & Options

**When to Use:**
- Products with size/color/material variations
- Single SKU vs. variant-based tracking

**Pattern 1: Simple Variants**
```
Variant Options:

Size:  □ XS  □ S  □ M  □ L  □ XL  □ XXL

Color: □ Black  □ White  □ Red  □ Blue
       + Add custom color

┌─────────────────────────────────────────┐
│ Variant Grid (Auto-generated):         │
├─────────┬───────┬────────┬──────────────┤
│ Size    │ Color │ Price  │ Stock        │
├─────────┼───────┼────────┼──────────────┤
│ S       │ Black │ $29.99 │ [___] units  │
│ S       │ White │ $29.99 │ [___] units  │
│ M       │ Black │ $29.99 │ [___] units  │
│ M       │ White │ $29.99 │ [___] units  │
└─────────┴───────┴────────┴──────────────┘

[✓] Same price for all variants
[ ] Different prices per variant
```

**Pattern 2: Complex Variants (Advanced)**
- Variant-specific images
- Individual SKUs per variant
- Separate inventory tracking
- Weight/dimensions per variant

**UX Guidelines:**
- Show color swatches for aesthetic attributes
- Minimum 7mm × 7mm touch targets
- Disable unavailable combinations
- Bulk edit options for all variants

### Section 6: Shipping & Delivery

```
┌─────────────────────────────────────┐
│ □ Physical product (requires ship)  │
│ □ Digital product (downloadable)    │
├─────────────────────────────────────┤
│ Weight:     [ ___.__ ] kg           │
│                                     │
│ Dimensions:                         │
│   Length:   [ ____ ] cm             │
│   Width:    [ ____ ] cm             │
│   Height:   [ ____ ] cm             │
│                                     │
│ Shipping Class:                     │
│   ○ Standard                        │
│   ○ Express                         │
│   ○ Freight (oversized)             │
│   ○ Free shipping                   │
└─────────────────────────────────────┘
```

### Section 7: SEO & Metadata

```
┌─────────────────────────────────────┐
│ SEO Title:                          │
│ [_______________________________]   │
│ 60/60 characters (optimal)          │
│                                     │
│ URL Slug:                           │
│ yoursite.com/products/[_________]   │
│                                     │
│ Meta Description:                   │
│ [_______________________________]   │
│ [_______________________________]   │
│ 155/160 characters                  │
│                                     │
│ Focus Keyword:                      │
│ [_______________]                   │
│                                     │
│ Open Graph Image:                   │
│ [Upload] (Defaults to first image)  │
└─────────────────────────────────────┘
```

**Auto-generation Options:**
- Generate SEO title from product name
- Auto-create slug from name (lowercase, hyphens)
- Extract keywords from description

**Real-time Feedback:**
- Character count indicators
- SEO score preview
- Keyword density check
- Readability suggestions

### Section 8: Campaigns & Promotions

```
┌─────────────────────────────────────┐
│ Active Campaigns:                   │
│   × Summer Sale 2024               │
│   × New Arrival Spotlight          │
│                                     │
│ [+ Add to Campaign]                 │
├─────────────────────────────────────┤
│ Bulk Discounts:                     │
│                                     │
│ Buy [ 3 ] or more, get [ 10 ]% off │
│ Buy [ 5 ] or more, get [ 20 ]% off │
│                                     │
│ [+ Add tier]                        │
├─────────────────────────────────────┤
│ Featured Product:                   │
│ □ Feature on homepage               │
│ □ Show in "Trending" section        │
└─────────────────────────────────────┘
```

---

## 3. Status Management & Workflow

### 3.1 Product Status States

```
┌────────────────────────────────────┐
│ Status:  [v Draft ▼]               │
│                                    │
│   • Draft        (Private)         │
│   • Scheduled    (Auto-publish)    │
│   • Published    (Live)            │
│   • Archived     (Hidden)          │
└────────────────────────────────────┘
```

**State Transitions:**
```
Draft ──────────────► Published
  │                      │
  │                      ▼
  └──────► Scheduled ───► Published
                          │
                          ▼
                      Archived
```

### 3.2 Scheduled Publishing

```
┌────────────────────────────────────┐
│ Status: Scheduled                  │
│                                    │
│ Publish on:                        │
│   Date: [2024-07-15]               │
│   Time: [09:00] AM                 │
│                                    │
│ Timezone: America/New_York         │
│                                    │
│ □ Notify subscribers via email     │
└────────────────────────────────────┘
```

**Features:**
- Date/time picker with timezone
- Optional email notifications
- Preview scheduled products
- Bulk schedule multiple products

### 3.3 Visibility Rules

**Draft:**
- Only visible to admins/vendors
- Can preview with special link
- Not indexed by search engines

**Scheduled:**
- Countdown indicator in admin
- Automatic status change at specified time
- Optional promotional email trigger

**Published:**
- Live on storefront
- Indexed by search
- Appears in relevant categories

**Archived:**
- Hidden from storefront
- Preserves SEO history
- Can be restored

---

## 4. Image Management Best Practices

### 4.1 Upload Interface

**Drag Zone Design:**
```
┌───────────────────────────────────┐
│   ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│   │                            │  │
│   │    📁 Drop images here     │  │
│   │         or                 │  │
│   │    [Browse Files]          │  │
│   │                            │  │
│   │  Accepted: JPG, PNG, WebP  │  │
│   │  Max 5MB • Up to 10 files  │  │
│   └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
└───────────────────────────────────┘
```

**Visual States:**
- **Idle**: Dotted border, muted colors
- **Drag over**: Solid border, highlighted background
- **Uploading**: Progress bar per file
- **Success**: Green checkmark, thumbnail preview
- **Error**: Red indicator, error message

### 4.2 Image Grid Layout

```
┌─────────────────────────────────────────┐
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ ⋮⋮      │ │ ⋮⋮      │ │ ⋮⋮      │    │
│ │ [img]   │ │ [img]   │ │ [img]   │    │
│ │ PRIMARY │ │    ×    │ │    ×    │    │
│ │         │ │         │ │         │    │
│ │ Alt: __ │ │ Alt: __ │ │ Alt: __ │    │
│ └─────────┘ └─────────┘ └─────────┘    │
└─────────────────────────────────────────┘
```

**Per-Image Actions:**
- **Drag handle** (⋮⋮): Reorder images
- **Delete** (×): Remove image (with confirmation)
- **Set as primary**: Badge on first image
- **Alt text field**: Accessibility & SEO
- **Zoom preview**: Click to enlarge
- **Edit**: Crop, rotate, adjust (optional)

### 4.3 Reordering Interaction

**Drag-and-Drop Behavior:**
1. **Hover**: Cursor changes to grab hand
2. **Grab**: Visual lift effect (shadow, scale)
3. **Drag**: Other images shift to show drop position
4. **Drop**: Smooth transition (100ms) to new position
5. **Confirmation**: "Image order updated" toast

**Keyboard Alternative:**
- Tab to image
- Arrow keys to select position
- Enter to confirm

### 4.4 Upload Progress

```
┌─────────────────────────────────────┐
│ Uploading 3 files...                │
├─────────────────────────────────────┤
│ ✓ product-01.jpg     (Complete)     │
│ ▰▰▰▰▰▰▰▱▱▱ 75%      product-02.jpg │
│ ⏸ Queued             product-03.jpg │
└─────────────────────────────────────┘
```

**Features:**
- Individual progress per file
- Ability to cancel uploads
- Retry failed uploads
- Bulk upload limit enforcement

---

## 5. Validation & Error Handling

### 5.1 Validation Timing

**Field-Level Validation:**
```
Real-time (as user types):
  - Character limits
  - Format validation (email, URL)
  - Unique values (SKU)

On blur (field exit):
  - Required field check
  - Cross-field validation (sale < regular price)
  - Remote validation (API checks)

On submit:
  - Final comprehensive validation
  - Server-side confirmation
```

### 5.2 Error Message Patterns

**Generic vs. Specific:**

❌ **Bad:** "Invalid input"
✅ **Good:** "Price must be a number greater than 0"

❌ **Bad:** "Error"
✅ **Good:** "Sale price ($35) must be less than regular price ($30)"

**Error Message Anatomy:**
```
┌─────────────────────────────────────┐
│ Product Name: *                     │
│ [________________________]          │
│ ⚠ Product name is required          │
│   and must be at least 3 characters │
└─────────────────────────────────────┘
```

**Components:**
- **Icon**: ⚠ for warning, 🔴 for error
- **Color**: Red text, red border
- **Position**: Directly below field
- **Content**: What's wrong + how to fix

### 5.3 Inline Validation Examples

**Price Fields:**
```javascript
Regular Price: [   25.99   ]
Sale Price:    [   35.00   ] ⚠ Sale price must be lower than regular price

✓ Correct:
Regular Price: [   35.00   ]
Sale Price:    [   25.99   ] ✓ You save $9.01 (26%)
```

**Stock Quantity:**
```
Stock: [  -5  ] ⚠ Stock cannot be negative
Stock: [   0  ] ⚠ Product will show as "Out of Stock"
Stock: [  15  ] ⚠ Low stock (below minimum of 20)
Stock: [ 100  ] ✓ Well stocked
```

**Image Upload:**
```
[large-image.png - 12MB]
⚠ File size exceeds 5MB limit
  Try compressing: https://tinypng.com

[product.bmp]
⚠ BMP format not supported
  Accepted formats: JPG, PNG, WebP
```

### 5.4 Form-Level Validation

**Pre-Submit Validation:**
```
┌────────────────────────────────────┐
│ Unable to publish product          │
│                                    │
│ Please fix the following errors:   │
│                                    │
│ • Product name is required         │
│ • At least one image is required   │
│ • Regular price must be set        │
│ • Select at least one category     │
│                                    │
│ [Review Errors]                    │
└────────────────────────────────────┘
```

**Features:**
- List of all errors
- Clickable links to jump to error fields
- Highlighted error sections
- Prevent form submission until resolved

### 5.5 Success States

**Positive Reinforcement:**
```
✓ Product name looks great! (green indicator)
✓ SEO title is optimal length (60 chars)
✓ All images uploaded successfully
```

**Progressive Enhancement:**
- Green checkmarks for completed sections
- Progress indicator (5/8 sections complete)
- Completion percentage

---

## 6. User Interaction Patterns

### 6.1 Auto-Save Functionality

```
┌────────────────────────────────────┐
│ Product Details    ● Saving...     │
│                    ✓ Saved 2s ago  │
└────────────────────────────────────┘
```

**Behavior:**
- Auto-save every 30 seconds
- Save on field blur for critical fields
- Visual indicator of save state
- Conflict resolution for concurrent edits

**States:**
- **Idle**: No indicator
- **Typing**: Waiting... (debounced)
- **Saving**: Spinner + "Saving..."
- **Saved**: Checkmark + timestamp
- **Error**: Warning + "Retry" button

### 6.2 Keyboard Shortcuts

```
Ctrl/Cmd + S     → Save draft
Ctrl/Cmd + Enter → Publish
Ctrl/Cmd + D     → Duplicate product
Escape           → Close modal/cancel edit
Tab              → Navigate fields
```

**Discoverability:**
- Keyboard shortcuts hint on hover
- Help modal (? icon) listing all shortcuts

### 6.3 Bulk Edit Operations

**Selection Pattern:**
```
☑ Select All (147 products)

Selected: 12 products

[Change Status ▼] [Apply Discount] [Add to Campaign] [Delete]
```

**Bulk Actions:**
1. **Status change**: Draft → Published (all at once)
2. **Price adjustment**: +10% or -$5.00
3. **Category assignment**: Add to multiple categories
4. **Tag addition**: Bulk tag products
5. **Campaign association**: Add to promotional campaign

**Confirmation:**
```
┌────────────────────────────────────┐
│ Apply 15% discount to 12 products? │
│                                    │
│ This will update:                  │
│ • Regular prices                   │
│ • Active sale prices (if any)      │
│                                    │
│ [Cancel]  [Apply Discount]         │
└────────────────────────────────────┘
```

### 6.4 Quick Edit (Inline Editing)

**From Product List:**
```
┌────────────────────────────────────────┐
│ Product Name         Price    Stock    │
├────────────────────────────────────────┤
│ Widget Pro          [$29.99]  [150]    │
│   (click to edit)      ↑       ↑       │
│                     editable editable  │
└────────────────────────────────────────┘
```

**Interaction:**
1. Click field → Becomes editable input
2. Edit value → Save automatically on blur
3. Show success indicator
4. Revert on Escape

**Allowed Fields:**
- Price
- Stock quantity
- Status
- Featured flag

### 6.5 Product Preview

**Preview Button:**
```
[👁 Preview] → Opens in new tab (draft mode)
```

**Features:**
- Shows product as it will appear to customers
- Works for draft products (private URL)
- Different device previews (desktop, tablet, mobile)
- Shareable preview link with expiration

---

## 7. Advanced Features

### 7.1 Product Duplication

**Use Case:** Create similar products quickly

**Workflow:**
1. Click "Duplicate" on existing product
2. Opens new product form with copied data
3. Auto-appends " (Copy)" to name
4. Clears: SKU, images (optional)
5. Sets status to Draft

**Options:**
```
┌────────────────────────────────────┐
│ Duplicate Product                  │
│                                    │
│ ☑ Copy images                      │
│ ☑ Copy variants                    │
│ ☑ Copy categories                  │
│ ☐ Copy campaign assignments        │
│                                    │
│ [Cancel]  [Create Duplicate]       │
└────────────────────────────────────┘
```

### 7.2 Import/Export

**Bulk Import:**
```
[📤 Import Products]

Supported formats: CSV, XLSX

Download template:
  [Standard Template]
  [Variant Template]

┌─────────────────────────────────────┐
│ Drop CSV file or browse             │
└─────────────────────────────────────┘

[Preview Import] → Shows data mapping

Column Mapping:
  CSV Column      →  Field
  "product_name"  →  Product Name
  "price"         →  Regular Price
  "qty"           →  Stock Quantity
```

**Export Options:**
```
[📥 Export Products]

Format:     [v CSV ▼]
Include:    ☑ All fields
            ☐ Basic info only
            ☑ Variants
            ☑ Images (URLs)

Filter by:  Status: [Published]
            Category: [All]

[Generate Export]
```

### 7.3 Product Relations

**Related Products:**
```
┌────────────────────────────────────┐
│ Related Products                   │
│                                    │
│ Search products...           [+]   │
│                                    │
│ Selected (3):                      │
│   × Widget Pro                     │
│   × Widget Lite                    │
│   × Widget Accessories             │
└────────────────────────────────────┘
```

**Cross-sells / Upsells:**
- Similar autocomplete interface
- Drag to reorder recommendations
- Preview how they appear on product page

### 7.4 Inventory Alerts

**Low Stock Notifications:**
```
┌────────────────────────────────────┐
│ ⚠ Low Stock Alert                  │
│                                    │
│ Widget Pro is running low:         │
│   Current: 5 units                 │
│   Minimum: 20 units                │
│                                    │
│ [Order More] [Update Threshold]    │
└────────────────────────────────────┘
```

**Email Alerts:**
- Notify when stock falls below threshold
- Daily digest of low-stock products
- Integration with suppliers for reordering

---

## 8. Mobile Considerations

### 8.1 Responsive Breakpoints

```
Mobile:    < 640px  → Stacked layout, full-width inputs
Tablet:    640-1024px → 2-column grid where appropriate
Desktop:   > 1024px → Full multi-column layout
```

### 8.2 Mobile-Specific Patterns

**Touch-Friendly:**
- Minimum 44px × 44px tap targets
- Larger form inputs (48px height)
- Sticky save button at bottom
- Collapsible sections (all closed by default)

**Image Upload:**
- Camera access on mobile
- Photo library integration
- Compressed uploads (optimize on device)

**Gestures:**
- Swipe to delete images
- Pinch to zoom image preview
- Pull to refresh product list

---

## 9. Performance & Optimization

### 9.1 Form Load Time

**Targets:**
- Initial render: < 1 second
- Lazy load: Non-critical sections
- Progressive enhancement: Load images last

### 9.2 Image Optimization

**Automatic Processing:**
- Resize to max dimensions (2048px)
- Compress quality (85% JPEG)
- Generate thumbnails
- WebP conversion
- Lazy loading

### 9.3 Debouncing & Throttling

**Search/Autocomplete:**
- Debounce: 300ms delay
- Min characters: 2

**Auto-save:**
- Debounce: 2 seconds after last keystroke
- Throttle: Max once per 30 seconds

---

## 10. Accessibility (WCAG 2.1 AA)

### 10.1 Keyboard Navigation

- All actions accessible via keyboard
- Logical tab order
- Focus indicators (2px outline)
- Skip links for long forms

### 10.2 Screen Reader Support

```html
<label for="product-name">
  Product Name <span aria-label="required">*</span>
</label>
<input
  id="product-name"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="name-hint name-error"
/>
<div id="name-hint">Enter a clear, descriptive name</div>
<div id="name-error" role="alert"><!-- Error message --></div>
```

### 10.3 Color & Contrast

- Minimum 4.5:1 contrast ratio
- Don't rely on color alone (use icons + text)
- Error states: Red + icon + text
- Success states: Green + checkmark + text

### 10.4 Form Labels

- All inputs have visible labels
- Placeholder text supplements (not replaces) labels
- Required indicators (* or "required")
- Help text associated with aria-describedby

---

## 11. Implementation Checklist

### Phase 1: Core Product Form
- [ ] Single-page layout with accordions
- [ ] Basic information section
- [ ] Pricing & inventory fields
- [ ] Simple category selector
- [ ] Required field validation
- [ ] Draft/publish status toggle

### Phase 2: Image Management
- [ ] Drag-and-drop upload
- [ ] Multiple image support
- [ ] Image reordering (drag handles)
- [ ] Delete with confirmation
- [ ] Primary image selection
- [ ] Alt text fields

### Phase 3: Advanced Fields
- [ ] Variant management
- [ ] SEO metadata section
- [ ] Shipping details
- [ ] Tags autocomplete
- [ ] Scheduled publishing

### Phase 4: Bulk Operations
- [ ] Multi-select products
- [ ] Bulk status change
- [ ] Bulk pricing updates
- [ ] Quick edit inline
- [ ] Import/export CSV

### Phase 5: Integrations
- [ ] Campaign assignment
- [ ] Related products
- [ ] Discount rules
- [ ] Inventory alerts
- [ ] Auto-save functionality

---

## 12. Testing Scenarios

### 12.1 User Acceptance Testing

**Scenario 1: Create Simple Product**
1. Navigate to Products → Add New
2. Enter product name, price, stock
3. Upload 3 images
4. Select category
5. Click "Publish"
6. Verify product appears on storefront

**Scenario 2: Variant Product**
1. Enable variants (Size, Color)
2. Generate variant grid
3. Set individual prices/stock
4. Upload images per variant
5. Verify all variants display correctly

**Scenario 3: Bulk Edit**
1. Select 10 products
2. Apply 20% discount
3. Change status to "Sale"
4. Verify all updates applied

**Scenario 4: Import Products**
1. Download CSV template
2. Fill with 50 products
3. Upload and map columns
4. Preview import
5. Confirm and import
6. Verify all products created

### 12.2 Edge Cases

- **Long product names**: Truncation, responsive wrapping
- **Special characters**: UTF-8 support, emoji
- **Large images**: Upload timeout, compression
- **Slow connection**: Progress indicators, retry logic
- **Concurrent edits**: Conflict resolution
- **Incomplete data**: Graceful degradation

---

## 13. References & Resources

### Industry Research Sources
- **Baymard Institute**: Form validation, tab usability studies
- **Nielsen Norman Group**: E-commerce UX guidelines
- **Shopify Admin**: Best-in-class product management
- **WooCommerce**: WordPress integration patterns
- **Amazon Seller Central**: Large-scale product listing

### Design Systems
- Material Design 3 (forms, validation)
- Shopify Polaris (e-commerce components)
- Carbon Design (enterprise patterns)

### Technical Standards
- WCAG 2.1 Level AA (accessibility)
- Schema.org Product markup
- Open Graph Protocol (social sharing)

---

## Appendix A: Sample Product Type Templates

### A.1 Physical Product
Required: Name, Price, Stock, Images, Category, Shipping weight
Optional: Variants, Related products, SEO

### A.2 Digital Product
Required: Name, Price, Download file
Not needed: Shipping, Stock (unlimited)
Optional: License key generation

### A.3 Service/Booking
Required: Name, Price, Duration, Availability calendar
Optional: Staff assignment, Location

### A.4 Subscription Product
Required: Name, Billing cycle, Price
Optional: Trial period, Setup fee

---

## Appendix B: Error Message Library

```yaml
product_name_required: "Product name is required"
product_name_too_short: "Product name must be at least 3 characters"
product_name_too_long: "Product name cannot exceed 120 characters"

price_invalid: "Please enter a valid price (e.g., 29.99)"
price_negative: "Price must be greater than 0"
sale_price_higher: "Sale price ($X) must be less than regular price ($Y)"

stock_negative: "Stock quantity cannot be negative"
stock_low: "Stock is below minimum threshold of X units"

sku_duplicate: "This SKU is already in use. SKUs must be unique."

image_format_invalid: "Only JPG, PNG, and WebP images are supported"
image_too_large: "Image exceeds 5MB. Please compress or resize."
image_dimensions_small: "Image must be at least 800x800 pixels"

category_required: "Please select at least one category"

slug_invalid: "URL slug can only contain lowercase letters, numbers, and hyphens"
slug_duplicate: "This URL slug is already in use"

variant_missing_options: "Please add at least one option value for each variant type"

seo_title_long: "SEO title exceeds recommended 60 characters"
meta_description_long: "Meta description exceeds recommended 160 characters"
```

---

## Document Version

**Version:** 1.0
**Date:** October 31, 2025
**Author:** UX Research Team
**Status:** Final Specification

**Change Log:**
- v1.0 (2025-10-31): Initial comprehensive specification based on industry research

---

*This document should be reviewed quarterly and updated based on user feedback and emerging UX patterns in e-commerce.*
