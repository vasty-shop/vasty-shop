# Legal Pages

Professional Terms & Conditions and Privacy Policy pages for the Fluxez e-commerce platform.

## Pages

### 1. Terms & Conditions (`/terms`)
**File:** `TermsPage.tsx`

Comprehensive terms of service covering all aspects of using the Fluxez platform.

**Sections:**
1. Introduction
2. Acceptance of Terms
3. Use of the Website
   - 3.1 Permitted Use
   - 3.2 Prohibited Activities
4. Account Registration
   - 4.1 Account Creation
   - 4.2 Account Security
5. Product Information & Pricing
   - 5.1 Product Descriptions
   - 5.2 Pricing & Availability
6. Orders & Payment
   - 6.1 Order Acceptance
   - 6.2 Payment Methods
   - 6.3 Payment Security
7. Shipping & Delivery
8. Returns & Refunds
9. Intellectual Property
10. Limitation of Liability
11. Dispute Resolution
    - 11.1 Informal Resolution
    - 11.2 Arbitration
12. Changes to Terms
13. Contact Information

**Word Count:** ~2,000 words

---

### 2. Privacy Policy (`/privacy`)
**File:** `PrivacyPage.tsx`

Detailed privacy policy compliant with GDPR, CCPA, and other privacy regulations.

**Sections:**
1. Introduction
2. Information We Collect
   - 2.1 Personal Information
   - 2.2 Payment Information
   - 2.3 Automatically Collected Information
3. How We Use Your Information
4. Cookies & Tracking Technologies
   - 4.1 Types of Cookies
   - 4.2 Managing Cookies
5. Sharing Your Information
6. Data Security
7. Your Privacy Rights
   - 7.1 GDPR Rights (EU Users)
   - 7.2 CCPA Rights (California Users)
   - 7.3 Exercising Your Rights
8. Children's Privacy
9. International Data Transfers
10. Third-Party Links
11. Data Retention
12. Changes to Privacy Policy
13. Contact Us

**Word Count:** ~2,200 words

**Compliance:** GDPR, CCPA, PCI DSS

---

## Features

### Common Features (Both Pages)

#### 1. Hero Section
- Page title
- Last updated date
- Compliance badges (Privacy Policy)
- Brief description

#### 2. Table of Contents (Sticky Sidebar)
- Desktop: Sticky sidebar on left
- Mobile: Collapsible/scrollable
- Auto-highlights active section based on scroll
- Smooth scroll navigation
- Shows subsections when section is active

#### 3. Content Sections
- Professional typography
- Numbered sections and subsections
- Clear heading hierarchy (H1, H2, H3)
- Easy-to-read body text
- Proper spacing and layout
- List formatting for complex information

#### 4. Navigation
- Breadcrumb navigation
- Header and Footer components
- Back to top button (appears after scrolling)
- Internal section links

#### 5. Responsive Design
- Desktop: Two-column layout (sidebar + content)
- Tablet: Single column with sticky TOC
- Mobile: Stack all content, collapsible TOC
- Print-optimized CSS

#### 6. Interactive Elements
- Scroll-based active section tracking
- Smooth scroll to sections
- Hover states on links and buttons
- Print functionality

### Privacy Policy Specific Features

#### 1. Compliance Badges
- GDPR Compliant
- CCPA Compliant
- SSL Encrypted
- PCI DSS Certified

#### 2. Data Rights Actions
- Download My Data button
- Delete My Account button
- Cookie Settings link
- Contact Privacy Team

#### 3. Sidebar Cards
- Your Rights card with CTA
- Questions card with email link

---

## Design System

### Colors
- **Primary:** `primary-lime` (#84cc16)
- **Text Primary:** `text-primary` (#0f172a)
- **Text Secondary:** `text-secondary` (#64748b)
- **Background:** White, gray-50, gray-100
- **Accent:** Blue tones for compliance badges

### Typography
- **H1:** 4xl-5xl, Bold (Hero title)
- **H2:** 2xl, Bold (Section titles)
- **H3:** xl, Semibold (Subsection titles)
- **Body:** Base, Regular (Content)
- **Small:** sm-xs (Metadata, captions)

### Spacing
- Section spacing: 12 (3rem)
- Paragraph spacing: 4 (1rem)
- List spacing: 2 (0.5rem)

### Components Used
- `Header` - Main navigation
- `Footer` - Site footer
- `BreadcrumbNavigation` - Breadcrumb trail
- Icons from `lucide-react`:
  - `ChevronUp` - Back to top
  - `Mail` - Contact
  - `Shield` - Privacy/Security
  - `Cookie` - Cookie notice
  - `Download` - Download data
  - `Trash2` - Delete account

---

## Routes

Add to `App.tsx`:

```typescript
import { TermsPage } from './features/legal/TermsPage';
import { PrivacyPage } from './features/legal/PrivacyPage';

// In routes:
<Route path="/terms" element={<TermsPage />} />
<Route path="/privacy" element={<PrivacyPage />} />
```

---

## State Management

Both pages use local React state for:
- `activeSection` - Currently visible section (scroll-based)
- `showBackToTop` - Show/hide back to top button

### Scroll Tracking

```typescript
useEffect(() => {
  const handleScroll = () => {
    // Update showBackToTop
    setShowBackToTop(window.scrollY > 500);

    // Update active section
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom >= 150) {
        setActiveSection(section.getAttribute('data-section'));
      }
    });
  };
}, []);
```

---

## Content Structure

### Section Interface

```typescript
interface Section {
  id: string;               // URL hash / scroll target
  title: string;            // Section title
  content: React.ReactNode; // JSX content
  subsections?: {           // Optional subsections
    id: string;
    title: string;
  }[];
}
```

---

## Print Styles

Both pages include print-friendly CSS:
- Removes navigation elements
- Removes sidebar on print
- Optimizes text layout
- Maintains content hierarchy

Print button available at bottom of content.

---

## Accessibility

- Semantic HTML structure
- ARIA labels for navigation
- Keyboard navigation support
- Focus states on interactive elements
- Proper heading hierarchy
- Alt text for icons (via aria-label)

---

## SEO Considerations

- Proper meta tags (add in layout)
- Structured heading hierarchy
- Internal linking
- Breadcrumb navigation
- Last updated dates

---

## Legal Disclaimer

**IMPORTANT:** The content provided in these pages is for demonstration purposes only and does not constitute actual legal advice. Before deploying to production:

1. Have the terms reviewed by a qualified attorney
2. Customize content for your specific business model
3. Ensure compliance with applicable laws in your jurisdiction
4. Update contact information and company details
5. Add your actual privacy practices and data handling procedures
6. Include your specific cookie usage and third-party integrations

---

## Maintenance

### Updating Content

1. Edit section content in the `sections` array
2. Maintain the Section interface structure
3. Update "Last Updated" date in hero section
4. Test scroll navigation after content changes

### Adding Sections

```typescript
{
  id: 'new-section',
  title: '14. New Section',
  content: (
    <>
      <p>Section content...</p>
    </>
  ),
}
```

### Adding Subsections

```typescript
{
  id: 'section-with-subsections',
  title: '5. Section Title',
  subsections: [
    { id: 'subsection-1', title: '5.1 Subsection' },
    { id: 'subsection-2', title: '5.2 Another Subsection' },
  ],
  content: (
    <>
      <h3 id="subsection-1">5.1 Subsection</h3>
      <p>Content...</p>
    </>
  ),
}
```

---

## Contact Information

Both pages reference:
- **Legal:** legal@fluxez.com
- **Privacy:** privacy@fluxez.com
- **Support:** support@fluxez.com
- **Phone:** 1-800-FLUXEZ-1 (1-800-358-9391)

Update these in the Contact sections before production deployment.

---

## References

Legal page structure inspired by industry leaders:
- **Shopify** - Clear section organization
- **Amazon** - Comprehensive coverage
- **Nike** - User-friendly layout
- **Apple** - Professional design

Privacy policy aligned with:
- **GDPR** (General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **PCI DSS** (Payment Card Industry Data Security Standard)
