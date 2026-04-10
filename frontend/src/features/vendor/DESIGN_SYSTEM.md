# Vendor Admin Panel - Design System Guide

## 🎨 Glassmorphism Design Language

The Vendor Admin Panel is built on a premium glassmorphism design system that creates depth, sophistication, and visual interest through layered transparency and blur effects.

## Core Principles

### 1. Layered Transparency
- **Background layers** create depth perception
- **Frosted glass effect** through backdrop blur
- **Progressive opacity** for visual hierarchy
- **Gradient overlays** for subtle color transitions

### 2. Light & Shadow
- **Ambient glow** from gradient backgrounds
- **Soft shadows** with colored tints
- **Edge highlights** using semi-transparent borders
- **Floating effect** with elevation shadows

### 3. Motion & Animation
- **Smooth transitions** (300ms default)
- **Stagger animations** for sequential reveals
- **Hover interactions** with scale and glow
- **Loading states** with shimmer effects

## 🎭 Design Tokens

### Color System

#### Primary Gradients
```css
/* Main Brand Gradient - Purple to Pink */
.gradient-primary {
  background: linear-gradient(135deg, #A855F7 0%, #EC4899 100%);
}

/* Hover State - Deeper saturation */
.gradient-primary-hover {
  background: linear-gradient(135deg, #9333EA 0%, #DB2777 100%);
}

/* Text Gradient */
.text-gradient-primary {
  background: linear-gradient(to right, #A855F7, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### Status Colors
```css
/* Success - Green to Emerald */
.gradient-success {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
}

/* Warning - Yellow to Orange */
.gradient-warning {
  background: linear-gradient(135deg, #FBBF24 0%, #F97316 100%);
}

/* Error - Red to Rose */
.gradient-error {
  background: linear-gradient(135deg, #F87171 0%, #FB7185 100%);
}

/* Info - Blue to Cyan */
.gradient-info {
  background: linear-gradient(135deg, #60A5FA 0%, #06B6D4 100%);
}
```

#### Glass Surface Colors
```css
/* Ultra Light Glass - For overlays */
.glass-ultra-light {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Light Glass - For cards */
.glass-light {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Medium Glass - For active elements */
.glass-medium {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Solid Glass - For containers */
.glass-solid {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

#### Text Colors
```css
/* Primary Text - High contrast */
.text-primary {
  color: rgba(255, 255, 255, 1.0);
}

/* Secondary Text - Medium contrast */
.text-secondary {
  color: rgba(255, 255, 255, 0.8);
}

/* Tertiary Text - Lower contrast */
.text-tertiary {
  color: rgba(255, 255, 255, 0.6);
}

/* Muted Text - Lowest contrast */
.text-muted {
  color: rgba(255, 255, 255, 0.4);
}

/* Disabled Text */
.text-disabled {
  color: rgba(255, 255, 255, 0.3);
}
```

### Typography Scale

```css
/* Display - Hero text */
.text-display {
  font-size: 3.75rem; /* 60px */
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Heading 1 - Page titles */
.text-h1 {
  font-size: 3rem; /* 48px */
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Heading 2 - Section titles */
.text-h2 {
  font-size: 2.25rem; /* 36px */
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Heading 3 - Card titles */
.text-h3 {
  font-size: 1.5rem; /* 24px */
  line-height: 1.33;
  font-weight: 600;
}

/* Heading 4 - Small titles */
.text-h4 {
  font-size: 1.25rem; /* 20px */
  line-height: 1.4;
  font-weight: 600;
}

/* Body Large */
.text-body-lg {
  font-size: 1.125rem; /* 18px */
  line-height: 1.56;
  font-weight: 400;
}

/* Body - Default */
.text-body {
  font-size: 1rem; /* 16px */
  line-height: 1.5;
  font-weight: 400;
}

/* Body Small */
.text-body-sm {
  font-size: 0.875rem; /* 14px */
  line-height: 1.43;
  font-weight: 400;
}

/* Caption */
.text-caption {
  font-size: 0.75rem; /* 12px */
  line-height: 1.33;
  font-weight: 400;
  letter-spacing: 0.02em;
}

/* Overline */
.text-overline {
  font-size: 0.625rem; /* 10px */
  line-height: 1.6;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

### Spacing Scale

```css
/* Based on 4px base unit */
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### Border Radius

```css
/* Subtle - For small elements */
--radius-sm: 0.375rem;  /* 6px */

/* Default - For cards */
--radius-md: 0.5rem;    /* 8px */

/* Medium - For buttons */
--radius-lg: 0.75rem;   /* 12px */

/* Large - For panels */
--radius-xl: 1rem;      /* 16px */

/* Extra Large - For hero cards */
--radius-2xl: 1.5rem;   /* 24px */

/* Full - For circles */
--radius-full: 9999px;
```

### Shadow System

```css
/* Elevation 1 - Subtle lift */
.shadow-1 {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
}

/* Elevation 2 - Card hover */
.shadow-2 {
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.12);
}

/* Elevation 3 - Floating elements */
.shadow-3 {
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.15),
    0 3px 6px rgba(0, 0, 0, 0.10);
}

/* Elevation 4 - Modals */
.shadow-4 {
  box-shadow:
    0 15px 25px rgba(0, 0, 0, 0.15),
    0 5px 10px rgba(0, 0, 0, 0.05);
}

/* Colored Shadows - For branding */
.shadow-purple {
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.3);
}

.shadow-pink {
  box-shadow: 0 8px 32px rgba(236, 72, 153, 0.3);
}

.shadow-cyan {
  box-shadow: 0 8px 32px rgba(6, 182, 212, 0.3);
}

/* Glow Effects */
.glow-purple {
  box-shadow:
    0 0 20px rgba(168, 85, 247, 0.5),
    0 0 40px rgba(168, 85, 247, 0.3),
    inset 0 0 10px rgba(168, 85, 247, 0.1);
}

.glow-pink {
  box-shadow:
    0 0 20px rgba(236, 72, 153, 0.5),
    0 0 40px rgba(236, 72, 153, 0.3),
    inset 0 0 10px rgba(236, 72, 153, 0.1);
}
```

## 🧩 Component Patterns

### Glass Card Pattern

```tsx
// Basic Glass Card
<div className="
  backdrop-blur-md
  bg-white/10
  border border-white/20
  rounded-2xl
  p-6
  shadow-lg shadow-purple-500/20
  hover:bg-white/15
  transition-all duration-300
">
  {/* Content */}
</div>

// Glass Card with Gradient Border
<div className="
  backdrop-blur-md
  bg-white/10
  rounded-2xl
  p-[1px]
  bg-gradient-to-r from-purple-500 to-pink-500
">
  <div className="
    bg-slate-900
    rounded-2xl
    p-6
  ">
    {/* Content */}
  </div>
</div>

// Glass Card with Hover Effect
<div className="
  group
  backdrop-blur-md
  bg-white/10
  border border-white/20
  rounded-2xl
  p-6
  relative
  overflow-hidden
  transition-all duration-300
  hover:scale-105
  hover:shadow-xl hover:shadow-purple-500/30
">
  {/* Gradient overlay on hover */}
  <div className="
    absolute inset-0
    bg-gradient-to-br from-purple-500/10 to-pink-500/10
    opacity-0 group-hover:opacity-100
    transition-opacity duration-300
  " />

  {/* Content */}
  <div className="relative z-10">
    {/* ... */}
  </div>
</div>
```

### Button Patterns

```tsx
// Primary Button - Gradient
<button className="
  px-6 py-3
  bg-gradient-to-r from-purple-500 to-pink-500
  rounded-xl
  font-medium
  text-white
  shadow-lg shadow-purple-500/30
  hover:from-purple-600 hover:to-pink-600
  hover:shadow-xl hover:shadow-purple-500/40
  active:scale-95
  transition-all duration-200
">
  Action
</button>

// Secondary Button - Glass
<button className="
  px-6 py-3
  backdrop-blur-md
  bg-white/10
  border border-white/20
  rounded-xl
  font-medium
  text-white
  hover:bg-white/20
  hover:border-white/30
  active:scale-95
  transition-all duration-200
">
  Action
</button>

// Icon Button - Glass
<button className="
  p-3
  backdrop-blur-md
  bg-white/10
  border border-white/20
  rounded-xl
  text-white/70
  hover:bg-white/20
  hover:text-white
  active:scale-95
  transition-all duration-200
">
  <Icon className="w-5 h-5" />
</button>
```

### Input Patterns

```tsx
// Text Input - Glass
<input
  type="text"
  className="
    w-full
    px-4 py-3
    backdrop-blur-md
    bg-white/5
    border border-white/10
    rounded-xl
    text-white
    placeholder-white/40
    focus:outline-none
    focus:ring-2 focus:ring-purple-500/50
    focus:border-purple-500/50
    transition-all duration-200
  "
  placeholder="Enter text..."
/>

// Search Input - Glass with Icon
<div className="relative">
  <Search className="
    absolute left-4 top-1/2 -translate-y-1/2
    w-5 h-5 text-white/40
  " />
  <input
    type="search"
    className="
      w-full
      pl-12 pr-4 py-3
      backdrop-blur-md
      bg-white/5
      border border-white/10
      rounded-xl
      text-white
      placeholder-white/40
      focus:outline-none
      focus:ring-2 focus:ring-purple-500/50
      transition-all duration-200
    "
    placeholder="Search..."
  />
</div>

// Select - Glass
<select className="
  w-full
  px-4 py-3
  backdrop-blur-md
  bg-white/5
  border border-white/10
  rounded-xl
  text-white
  focus:outline-none
  focus:ring-2 focus:ring-purple-500/50
  transition-all duration-200
">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Badge Patterns

```tsx
// Status Badge
<span className="
  inline-flex items-center space-x-1
  px-3 py-1
  rounded-lg
  text-xs font-medium
  bg-green-400/20
  text-green-400
  border border-green-400/30
">
  <CheckCircle className="w-3 h-3" />
  <span>Active</span>
</span>

// Pill Badge
<span className="
  inline-flex items-center
  px-2 py-0.5
  rounded-full
  text-xs font-semibold
  bg-gradient-to-r from-purple-500 to-pink-500
  text-white
">
  12
</span>

// Gradient Badge
<span className="
  inline-flex items-center
  px-3 py-1
  rounded-lg
  text-xs font-medium
  bg-gradient-to-r from-purple-500/20 to-pink-500/20
  border border-purple-500/30
  text-purple-300
">
  Premium
</span>
```

## 🎬 Animation Patterns

### Entrance Animations

```tsx
// Fade In
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>

// Slide Up
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>

// Scale In
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>

// Stagger Children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Hover Animations

```tsx
// Scale on Hover
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {/* Content */}
</motion.div>

// Lift on Hover
<motion.div
  whileHover={{ y: -5 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>

// Glow on Hover
<motion.div
  whileHover={{
    boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
  }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

### Loading States

```tsx
// Shimmer Effect
<div className="
  animate-pulse
  space-y-4
">
  <div className="h-4 bg-white/10 rounded w-3/4"></div>
  <div className="h-4 bg-white/10 rounded w-1/2"></div>
</div>

// Spinner
<motion.div
  className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }}
/>

// Dots
<div className="flex space-x-2">
  {[0, 1, 2].map((i) => (
    <motion.div
      key={i}
      className="w-2 h-2 bg-purple-500 rounded-full"
      animate={{
        y: [0, -10, 0],
        opacity: [0.3, 1, 0.3]
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.2
      }}
    />
  ))}
</div>
```

## 📐 Layout Patterns

### Grid Layouts

```tsx
// Responsive Product Grid
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-6
">
  {/* Grid items */}
</div>

// Dashboard Stats Grid
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-4
  gap-6
">
  {/* Stat cards */}
</div>

// Sidebar Layout
<div className="
  grid
  grid-cols-1
  lg:grid-cols-[280px_1fr]
  gap-6
">
  {/* Sidebar */}
  {/* Main content */}
</div>
```

### Flex Layouts

```tsx
// Space Between
<div className="
  flex items-center justify-between
  space-x-4
">
  {/* Items */}
</div>

// Centered
<div className="
  flex items-center justify-center
  min-h-screen
">
  {/* Content */}
</div>

// Stack
<div className="
  flex flex-col
  space-y-4
">
  {/* Items */}
</div>
```

## 🎯 Best Practices

### Do's
✅ Use consistent glass effects throughout
✅ Apply gradients for primary actions
✅ Animate state changes smoothly
✅ Maintain proper contrast for accessibility
✅ Use semantic HTML elements
✅ Test on multiple screen sizes
✅ Optimize images and assets
✅ Keep hover effects subtle

### Don'ts
❌ Overuse gradients and effects
❌ Make text too transparent (min 60% opacity)
❌ Create jarring animations
❌ Ignore keyboard navigation
❌ Use color alone to convey information
❌ Create overly complex layouts
❌ Forget loading states
❌ Neglect error handling

---

**This design system ensures consistency, maintainability, and a premium user experience across the entire vendor admin panel.**
