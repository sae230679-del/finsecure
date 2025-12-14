# SecureLex.ru Design Guidelines

## Design Approach

**Selected System: Material Design 3** with professional enterprise customization
- **Rationale**: Information-dense compliance platform requiring clear hierarchy, data visualization, and trustworthy professional aesthetic
- **Key Principles**: Clarity, efficiency, credibility, data accessibility

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN) - clean, highly legible for dashboards and data
- Monospace: JetBrains Mono - for URLs, code snippets, technical data

**Hierarchy:**
- Hero Headlines: text-5xl font-bold (48px)
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-semibold (18px)
- Body Text: text-base (16px)
- Secondary/Meta: text-sm (14px)
- Small Print: text-xs (12px)

**Line Heights:** leading-tight for headlines, leading-relaxed for body content

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (within components): p-2, p-4, gap-2
- Component spacing: p-6, p-8, gap-4, gap-6
- Section spacing: py-12, py-16, py-20
- Generous container spacing: px-4 (mobile), px-8 (tablet), px-12 (desktop)

**Grid System:**
- Dashboards: 12-column grid (grid-cols-12) with sidebar + main content
- Cards/Data: 2-3 columns on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Forms: Single column max-w-2xl for optimal readability

**Container Widths:**
- Marketing pages: max-w-7xl
- Dashboards: Full-width with max-w-screen-2xl
- Content/Forms: max-w-4xl
- Narrow content: max-w-2xl

## Component Library

### Navigation
- **Top Navigation Bar:** Sticky header with logo, main nav, user profile dropdown
- **Sidebar (Dashboards):** Fixed left sidebar (w-64) with role-based menu items, collapsible on mobile
- **Breadcrumbs:** For deep dashboard navigation

### Forms & Inputs
- **Text Inputs:** Outlined style with floating labels, clear focus states
- **URL Input:** Full-width with prepended "https://" indicator, validation feedback below
- **Dropdown Package Selector:** Large, prominent select with custom styling showing package details dynamically
- **Buttons:** 
  - Primary CTA: Elevated style, rounded-lg, px-8 py-3
  - Secondary: Outlined style
  - Text buttons for tertiary actions
  - Size variants: sm (px-4 py-2), md (px-6 py-3), lg (px-8 py-4)

### Data Display
- **Dashboard Cards:** Elevated cards (shadow-md) with rounded-xl, p-6 spacing
  - Stat cards: Grid layout showing key metrics with large numbers and icons
  - List cards: Audit history, payment history with table-like rows
- **Progress Bar:** Custom semaphore component
  - Horizontal bar showing completion percentage
  - Traffic light indicators (green/yellow/red zones) below bar
  - Status badges and real-time updates
  - Criteria checklist with checkmarks/warnings
- **Tables:** Striped rows, sticky headers for long lists, sort indicators
- **Reports:** 
  - Brief Report: Card-based layout with sections for each criterion
  - Full Report CTA: Prominent upgrade card

### Audit Package Cards
Dynamic display updating based on dropdown selection:
- Price (large, bold) with currency
- Criteria count with icon
- Duration estimate
- Bulleted feature list (2-column on larger screens)
- Package description paragraph

### Status Indicators
- **Badges:** Rounded-full px-3 py-1 with icons
  - Success/Complete: Checkmark icon
  - In Progress: Loading spinner
  - Error/Critical: Warning icon
  - Pending: Clock icon

## Page-Specific Layouts

### Landing Page
**Structure:** 6-8 sections, no forced viewport heights
- **Hero:** 80vh, centered content, form on right (desktop) or below (mobile), subtle gradient background
- **Package Selector Preview:** 2-column layout (selector left, details right)
- **Features Grid:** 3-column on desktop, icons with descriptions
- **How It Works:** Numbered steps in horizontal timeline (desktop) or vertical (mobile)
- **Pricing Table:** Comparison grid for all 9 packages
- **Trust Indicators:** Logo grid of compliance standards, testimonials if available
- **FAQ:** Accordion component
- **Footer:** 4-column layout with links, contact info, theme toggle

### User Dashboard
**Layout:** Sidebar + main content area
- **Stats Row:** 3-4 stat cards across top showing total audits, spending, active checks
- **Quick Audit Form:** Prominent card with URL input + package dropdown
- **Recent Audits Table:** Sortable, filterable list with action buttons
- **Account Info:** Sidebar widget or separate tab

### Admin Dashboard  
**Layout:** Similar to User but with admin-specific content
- **Revenue Stats:** Prominent financial metrics
- **Paid Audits Only:** Table with re-audit and view actions
- **Package Management:** Editable price cards in grid
- **Activity Log:** Timeline view of admin actions

### SuperAdmin Dashboard
**Layout:** Most comprehensive view
- **System Health:** Status indicators for all services at top
- **Full Audit Access:** Advanced filtering (paid/unpaid/all)
- **User Management:** Searchable table with role editing
- **Theme Manager:** Visual theme selector with live preview
- **Site Settings:** Form for site name and other system settings

### Auth Pages
**Layout:** Centered card on subtle background
- Single-column form, max-w-md
- Logo at top
- Toggle between login/register
- Social proof or trust badge below

## Responsive Behavior

**Breakpoints:**
- Mobile: < 640px (single column, stacked navigation)
- Tablet: 640px - 1024px (2 columns where appropriate, hamburger menu)
- Desktop: > 1024px (full multi-column layouts, persistent sidebar)

**Dashboard Adaptations:**
- Mobile: Bottom navigation bar, collapsible sidebar as drawer
- Desktop: Fixed sidebar, top navigation bar

## Images

**Hero Section:** Large background image or illustration (1920x1080) showing:
- Abstract representation of website security/compliance (shield, checkmark, certificate icons in modern style)
- Or: Professional office/workspace scene with laptop showing dashboard
- Overlay: Semi-transparent gradient for text legibility
- Placement: Full-width behind hero content

**Dashboard Empty States:** Illustrations for:
- No audits yet (friendly illustration encouraging first audit)
- All audits complete (success/celebration illustration)

**Icon Set:** Heroicons (via CDN) throughout for consistency

## Accessibility

- Focus indicators: 2px ring with offset
- Form labels always visible (no placeholder-only inputs)
- ARIA labels for icon-only buttons
- Keyboard navigation for all interactive elements
- High contrast ratios maintained
- Skip navigation links

## Animation Principles

**Minimal, purposeful motion:**
- Page transitions: Subtle fade-in (200ms)
- Card hover: Gentle lift (shadow-lg transition)
- Button interactions: Scale down slightly on press
- Loading states: Smooth spinner or skeleton screens
- NO scroll-triggered animations
- NO parallax effects