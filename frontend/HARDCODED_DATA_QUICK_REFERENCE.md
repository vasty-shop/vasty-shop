# HARDCODED DATA - QUICK REFERENCE GUIDE

## HomePage.tsx - SUMMARY
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/features/home/HomePage.tsx`

### Hardcoded Elements by Location:

| Line Range | Section | Type | What's Hardcoded |
|------------|---------|------|------------------|
| 46-47 | Header | Text | "Fluxez" title, "Your personal style assistant" subtitle |
| 5, 64 | Live Try-On Carousel | Data | mockUsers array from mockData.ts |
| 13-14 | Daily Outfit | Data | mockOutfits[0], temperature = 16 |
| 170 | Last News | Data | mockNews array (3 items) from mockData.ts |
| 90 | Your Stats | Text | Section title "Your stats" |

**Priority**: HIGH - Replace mockData imports with API calls

---

## LandingPage.tsx - DETAILED BREAKDOWN

### 1. HeroSection.tsx
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/HeroSection.tsx`

```
Lines 27-36:    categories[] (8 items - Ladies Tops, Men's Shirt, etc.) - HARDCODED
Lines 38-59:    serviceFeatures[] (4 items - Free Shipping, etc.) - HARDCODED
Lines 175-178:  Hero banner text - "SUNGLASS COLLECTION" - HARDCODED
Lines 234-239:  Trendy Collection card - HARDCODED
Lines 274-278:  Watch Collection card - HARDCODED
```
**API Needed**: CMS endpoint for hero content

### 2. FeaturedProductsCarousel.tsx
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/FeaturedProductsCarousel.tsx`

```
Lines 40-69:    featuredProducts[] (4 items with $20 prices) - HARDCODED
```
**API Already Available**: api.getFeaturedProducts() exists!
**Action**: Update component to call this API instead of using static array

### 3. FlashSaleSection.tsx
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/FlashSaleSection.tsx`

```
Lines 17-54:    FLASH_SALE_PRODUCTS[] (4 products) - HARDCODED
Lines 78-86:    Countdown timer target date - HARDCODED
                (8 days, 17 hours, 44 minutes from now)
```
**API Needed**: Flash sale endpoint with end timestamp

### 4. PromoBanners.tsx
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/PromoBanners.tsx`

```
Lines 59-93:     HorizontalPromoBanners Card 1 (Watch) - HARDCODED
Lines 96-127:    HorizontalPromoBanners Card 2 (Jewelry) - HARDCODED
Lines 130-164:   HorizontalPromoBanners Card 3 (Perfume) - HARDCODED
Lines 182-223:   LargeFeatureBanners - Winter Collection - HARDCODED
Lines 228-277:   LargeFeatureBanners - Fashion Forward - HARDCODED
Lines 280-312:   LargeFeatureBanners - 50% OFF Sale - HARDCODED
Lines 328-383:   CategoryIconsRow[] (9 categories) - HARDCODED
```
**API Needed**: Promotional campaigns/banners endpoint

### 5. BlogSection.tsx
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/BlogSection.tsx`

```
Lines 18-51:     blogPosts[] (4 items, all with same title!) - HARDCODED
```
**API Needed**: Blog posts endpoint
**Issue**: All 4 blog titles are identical - appears to be placeholder data

### 6. BestSellersSection.tsx
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/BestSellersSection.tsx`

```
Lines 26-33:     featuredStore object (BeliBeli Mall) - HARDCODED
Lines 35-144:    stores[] (4 stores with products) - HARDCODED
```
**API Needed**: Best sellers/featured stores endpoint

### 7. CategoryBrowseSection.tsx
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/components/landing/CategoryBrowseSection.tsx`

```
Lines 25-29:     filterTabs[] (ALL, WOMAN, CHILDREN) - HARDCODED
Lines 32-41:     categoryColors[] (8 colors) - HARDCODED fallback
Lines 99-128:    Fallback categories when API fails - HARDCODED
```
**Status**: GOOD! Uses api.getCategories() ✓
**Improvement**: Add color configuration to API response

---

## mockData.ts - DEPRECATED DATA
**File**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/frontend/src/data/mockData.ts`

```
Lines 4-401:      mockProducts[] (30 items) - HARDCODED
Lines 404-478:    mockOutfits[] (6 items) - HARDCODED
Lines 481-512:    mockUsers[] (5 items) - HARDCODED
Lines 515-534:    mockNews[] (3 items) - HARDCODED
```

**Issue**: This file is still imported in HomePage.tsx
**Action**: Either deprecate completely or use only as fallback in API error states

---

## CRITICAL OBSERVATIONS

### What's ALREADY Working (Use as Model):
1. CategoryBrowseSection uses `api.getCategories()` - GOOD PATTERN
2. LandingPage uses `api.getProducts()` and `api.getFeaturedProducts()` - GOOD PATTERN

### What's NOT Working (Fix These):
1. HomePage relies entirely on mockData
2. FeaturedProductsCarousel has hardcoded array (should use getFeaturedProducts API)
3. All promotional banners are hardcoded
4. Flash sale products are hardcoded with static timer
5. Blog section has placeholder data with identical titles
6. "Today's For You" uses duplicate popular products (not personalized)

---

## QUICK MIGRATION CHECKLIST

### For LandingPage Sections:
- [ ] FeaturedProductsCarousel - Replace lines 40-69 with api.getFeaturedProducts() call
- [ ] FlashSaleSection - Create API endpoint, replace lines 17-86
- [ ] PromoBanners - Create CMS API, replace all hardcoded banners
- [ ] BestSellersSection - Create API endpoint, replace store data
- [ ] BlogSection - Create API endpoint, replace blog posts array
- [ ] HeroSection - Create CMS endpoint for hero content and service features

### For HomePage:
- [ ] Remove mockData imports (line 5)
- [ ] Replace mockUsers with API call
- [ ] Replace mockOutfits with API call
- [ ] Replace mockNews with API call
- [ ] Replace static temperature with weather API

### For Data Files:
- [ ] Deprecate mockData.ts OR
- [ ] Keep as fallback only for error states

---

## ESTIMATED EFFORT

| Component | Effort | Priority |
|-----------|--------|----------|
| Fix HomePage | 4 hours | HIGH |
| Fix FeaturedProductsCarousel | 1 hour | HIGH |
| Add Flash Sale API integration | 3 hours | HIGH |
| Add Blog API | 2 hours | MEDIUM |
| Add Promotional Campaigns | 4 hours | MEDIUM |
| Add Personalized Products | 3 hours | MEDIUM |
| Fix Best Sellers Section | 2 hours | MEDIUM |
| Weather API integration | 2 hours | LOW |

**Total Estimated Effort**: ~21 hours

---

## API ENDPOINTS TO CREATE

### HIGH PRIORITY (Required for functionality):
1. `GET /api/flash-sale` - Flash sale products with end timestamp
2. `GET /api/products/personalized` - Personalized product recommendations

### MEDIUM PRIORITY (Business functionality):
3. `GET /api/blog` - Blog posts list
4. `GET /api/campaigns` - Promotional campaigns/banners
5. `GET /api/stores/featured` - Featured/best-selling stores

### LOW PRIORITY (Enhancement):
6. `GET /api/feed/activity` - User activity news feed
7. `GET /api/weather` - Weather data for outfit recommendations
8. `GET /api/content/hero` - CMS content for hero sections

