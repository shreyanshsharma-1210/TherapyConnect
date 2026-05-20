# UI/UX Design System & Component Specifications
## TherapyConnect - Therapist Booking Platform

---

## 1. Design Philosophy

**Core Principles:**
1. **Trust & Credibility** - Professional, polished, minimal
2. **Calm & Reassurance** - Soft colors, ample whitespace, gentle animations
3. **Accessibility** - Clear hierarchy, readable fonts, high contrast
4. **Mobile-First** - Works perfectly on all screen sizes
5. **Minimal Friction** - Clear CTAs, simple forms, quick actions

**Design Approach:** Clean minimalism with warm touches, inspired by healthcare and wellness design standards.

---

## 2. Color System

### Primary Colors

| Color | Hex Code | Usage | Psychology |
|-------|----------|-------|------------|
| **Trust Teal** | #0D7C7D | Primary CTA, headers, links | Calming, professional, trustworthy |
| **Warm Cream** | #F5E6D3 | Accent backgrounds, cards | Warm, welcoming, soft |
| **Action Coral** | #E8726E | Hover states, secondary CTA | Action-oriented, visible |
| **Text Dark** | #2D3436 | Body text, headers | High contrast, readable |

### Secondary Colors

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Off-White** | #F8F9FA | Main background, card backgrounds |
| **Light Gray** | #E8EAED | Borders, dividers, disabled states |
| **Soft Green** | #27AE60 | Success messages, confirmation |
| **Soft Red** | #E74C3C | Errors, danger states |
| **Soft Yellow** | #F39C12 | Warnings, info messages |
| **Medium Gray** | #95A5A6 | Secondary text, placeholders |

### Dark Mode Option (Future)
- Background: #1A1A1A
- Text: #FFFFFF
- Accent: #4DB8D4

---

## 3. Typography System

### Font Stack

```css
/* Display Font - Playfair Display */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap');

/* Body Font - Plus Jakarta Sans */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

/* Monospace - JetBrains Mono (optional) */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

### Type Scale

| Component | Font | Weight | Size | Line Height | Letter Spacing | Usage |
|-----------|------|--------|------|------------|----------------|-------|
| **H1 - Hero Title** | Playfair Display | 700 | 48px | 1.2 | -0.5px | Therapist name in hero |
| **H2 - Section Header** | Playfair Display | 700 | 36px | 1.3 | -0.3px | Section titles |
| **H3 - Card Title** | Plus Jakarta Sans | 700 | 24px | 1.4 | 0px | Card headers |
| **H4 - Subheading** | Plus Jakarta Sans | 600 | 20px | 1.5 | 0px | Minor headings |
| **Body - Large** | Plus Jakarta Sans | 400 | 18px | 1.6 | 0px | Hero tagline |
| **Body - Regular** | Plus Jakarta Sans | 400 | 16px | 1.6 | 0px | Main body text |
| **Body - Small** | Plus Jakarta Sans | 400 | 14px | 1.5 | 0px | Secondary text |
| **Label** | Plus Jakarta Sans | 500 | 12px | 1.4 | 0.5px | Form labels, badges |
| **Button Text** | Plus Jakarta Sans | 600 | 16px | 1.5 | 0px | Button labels |

### Text Examples

```
H1: "Charushri Suhaney"
H2: "About Me" / "Services I Offer" / "Book Your Session"
H3: "Anxiety Counseling"
Body: "Welcome to my practice. I specialize in helping individuals..."
Label: "Full Name *"
Button: "Book a Session"
```

---

## 4. Spacing System

### Base Unit: 8px

All spacing follows a base unit of 8px. This creates harmony and consistency.

| Size | Value | Usage |
|------|-------|-------|
| **xs** | 4px | Tight spacing, icon spacing |
| **sm** | 8px | Component internal padding |
| **md** | 16px | Standard padding, section spacing |
| **lg** | 24px | Card spacing, medium gaps |
| **xl** | 32px | Section spacing |
| **xxl** | 48px | Large section spacing |
| **xxxl** | 64px | Hero section spacing |

### Layout Grid

- Desktop: 12-column grid, 1200px max width, 24px gutter
- Tablet: 8-column grid, 768px max width, 16px gutter
- Mobile: 4-column grid, 100% width, 16px gutter, safe area padding

---

## 5. Border & Radius System

| Component | Border Radius | Border |
|-----------|---------------|--------|
| Buttons | 8px | None (default) |
| Form Inputs | 4px | 1px solid #E8EAED |
| Cards | 8px | None, shadow only |
| Modal | 12px | None, shadow only |
| Badges | 16px | None |
| Avatars | 50% | None |
| Images | 4px | None |

---

## 6. Shadow System

Shadows create depth and hierarchy. Three levels:

### Level 1 - Subtle (Cards at rest)
```css
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
```
Usage: Cards, light elevation

### Level 2 - Medium (Cards on hover)
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
```
Usage: Hover states, active cards, modals

### Level 3 - Heavy (Dropdown, elevated modals)
```css
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.16);
```
Usage: Dropdowns, top-level modals, hero elements

---

## 7. Component Specifications

### 7.1 Buttons

#### Primary Button (CTA)
```
Design:
- Background: Trust Teal (#0D7C7D)
- Text: White (#FFFFFF)
- Padding: 16px 32px
- Border Radius: 8px
- Font: Plus Jakarta Sans, 600, 16px
- Min Height: 48px (touch-friendly)

Hover:
- Background: Darken teal by 10%
- Shadow: Level 2

Active:
- Background: Darken teal by 15%
- Shadow: Level 1

Disabled:
- Background: Light Gray (#E8EAED)
- Text: Medium Gray (#95A5A6)
- Cursor: not-allowed
```

#### Secondary Button
```
Design:
- Background: Transparent
- Border: 2px solid Trust Teal (#0D7C7D)
- Text: Trust Teal
- Padding: 14px 30px
- Border Radius: 8px

Hover:
- Background: Warm Cream (#F5E6D3)
- Border: 2px solid Trust Teal
```

#### Ghost Button (Less prominent)
```
Design:
- Background: Transparent
- Text: Trust Teal
- Underline: Subtle
- No border

Hover:
- Background: rgba(13, 124, 125, 0.05)
- Underline: Bold
```

### 7.2 Form Inputs

#### Text Input / Email / Phone

```
Design:
- Background: White (#FFFFFF)
- Border: 1px solid #E8EAED
- Border Radius: 4px
- Padding: 12px 16px
- Font: Plus Jakarta Sans, 400, 16px
- Min Height: 44px (mobile-friendly)
- Placeholder color: #95A5A6

Focus:
- Border: 2px solid Trust Teal (#0D7C7D)
- Box Shadow: 0 0 0 3px rgba(13, 124, 125, 0.1)
- Outline: None

Error:
- Border: 1px solid Soft Red (#E74C3C)
- Background: rgba(231, 76, 60, 0.02)

Success:
- Border: 1px solid Soft Green (#27AE60)
- Icon: Green checkmark
```

#### Textarea
```
Same as input, but:
- Min Height: 120px
- Resize: Vertical only
- Row height: 24px
```

#### Calendar Input
```
Design:
- Popup calendar with month navigation
- Grid layout (7 columns = days of week)
- Current date: Teal background
- Available dates: White background
- Booked dates: Light gray, disabled
- Hover: Light warm cream background
- Selected: Teal background with white text
```

#### Time Slot Selection
```
Design:
- Pill-shaped buttons
- Available: White bg, teal text, teal border
- Booked: Gray bg, gray text, disabled
- Selected: Teal bg, white text
- Hover (if available): Light teal bg
```

### 7.3 Cards

#### Service Card
```
Design:
- Background: White (#FFFFFF)
- Border Radius: 8px
- Padding: 24px
- Shadow: Level 1
- Min Height: 300px

Content:
- Icon: 64x64px, teal color
- Title: H3, 24px, teal
- Description: Body Regular, 16px, dark text
- Optional: "Learn More" link (ghost button)

Hover:
- Shadow: Level 2
- Transform: translateY(-4px)
- Icon: Slightly enlarge or add accent color
- Transition: smooth 300ms ease-out
```

#### Testimonial Card
```
Design:
- Background: White (#FFFFFF)
- Border Radius: 8px
- Padding: 24px
- Shadow: Level 1
- Border-Left: 4px solid Warm Cream (#F5E6D3)

Content:
- Star Rating: 5 stars, teal
- Quote: Body Regular, 16px, italic
- Author Name: Label, bold
- Author Role: Small text, gray

Avatar (optional):
- 48x48px circle
- Border: 2px solid Warm Cream
```

#### Blog Card
```
Design:
- Background: White (#FFFFFF)
- Border Radius: 8px
- Shadow: Level 1
- Overflow: hidden

Content:
- Featured Image: Full width, 200px height
- Padding: 20px

Text Section:
- Title: H3, 20px
- Excerpt: Body Small, 14px, gray text
- Date: Label, gray
- "Read More": Ghost button link

Hover:
- Shadow: Level 2
- Image: Slight zoom (105%)
```

#### Pricing Card
```
Design:
- Background: Warm Cream (#F5E6D3)
- Border Radius: 8px
- Padding: 28px
- Shadow: Level 1

Content:
- Session Type: H3
- Price: Playfair Display, 48px, teal
- Duration: Small text, gray
- Inclusions: 3-4 bullet points
- CTA Button: Primary button, full width

Highlight (for featured plan):
- Border: 2px solid Teal
- Shadow: Level 2
- Badge: "Most Popular" (top corner)
```

### 7.4 Navigation

#### Sticky Header / Navigation Bar

```
Design:
- Background: White with blur effect
- Height: 64px (desktop), 56px (mobile)
- Shadow: Level 1 (when scrolled)
- Position: Sticky top

Content:
- Logo/Branding (left)
- Nav links (center/right, desktop only)
- Mobile menu icon (hamburger)

Links:
- Color: Dark text
- Hover: Teal color
- Active: Teal with underline
- Font: Plus Jakarta Sans, 500, 16px
```

#### Mobile Menu (Hamburger)

```
Design:
- Icon: 24x24px hamburger, dark color
- On click: Sidebar slides in from right
- Overlay: Semi-transparent dark (rgba(0,0,0,0.5))

Sidebar:
- Width: 280px (90vw max on small phones)
- Background: White
- Safe area padding
- Close button (X icon)
- Menu items: Full width, 16px padding
- Dividers between items
```

### 7.5 Forms

#### Contact Form / Booking Form

```
Layout:
- Single column (mobile)
- Max width: 500px
- Spacing between fields: 20px

Field Structure:
- Label: Plus Jakarta Sans, 500, 14px
- Required asterisk: Red color
- Input: As specified above
- Helper text (optional): Small, gray, below input
- Error message: Small, red, below input

Submit Button:
- Full width on mobile
- Center-aligned on desktop
- Primary button style
- Loading state: Spinner inside button
- Disabled state when validating

Success State:
- Modal/Alert appears
- Checkmark icon
- Confirmation message
- Next action button
```

### 7.6 Modal / Dialog

```
Design:
- Overlay: rgba(0, 0, 0, 0.5)
- Modal: 500px width (mobile: 90vw)
- Border Radius: 12px
- Shadow: Level 3
- Padding: 32px

Close Button:
- Top right corner
- X icon
- Circle background on hover
- Keyboard: ESC key closes

Content:
- Title: H2
- Body: Body Regular
- Actions: Primary + Secondary buttons
- Bottom alignment for buttons
```

### 7.7 Alerts / Messages

#### Success Alert
```
Design:
- Background: rgba(39, 174, 96, 0.1)
- Border-Left: 4px solid Soft Green (#27AE60)
- Padding: 16px
- Icon: Green checkmark
- Text: Soft Green color

Example: "Booking confirmed! Check your email for details."
```

#### Error Alert
```
Design:
- Background: rgba(231, 76, 60, 0.1)
- Border-Left: 4px solid Soft Red (#E74C3C)
- Padding: 16px
- Icon: Red error icon
- Text: Soft Red color

Example: "Please check your email address and try again."
```

#### Info Alert
```
Design:
- Background: rgba(13, 124, 125, 0.1)
- Border-Left: 4px solid Trust Teal (#0D7C7D)
- Padding: 16px
- Icon: Info icon
- Text: Teal color
```

---

## 8. Animation & Micro-interactions

### Page Load Animations

```css
/* Hero section fade-in */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero {
  animation: fadeInUp 0.8s ease-out;
}

/* Staggered card animations */
.service-card {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.service-card:nth-child(1) { animation-delay: 0.1s; }
.service-card:nth-child(2) { animation-delay: 0.2s; }
.service-card:nth-child(3) { animation-delay: 0.3s; }
/* ... etc */
```

### Hover Animations

```css
/* Card hover lift */
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.16);
  transform: translateY(-8px);
}

/* Button hover pulse */
.button:hover {
  box-shadow: 0 4px 12px rgba(13, 124, 125, 0.3);
}

/* Link underline animation */
a {
  position: relative;
  text-decoration: none;
  color: #0D7C7D;
}

a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #0D7C7D;
  transition: width 0.3s ease;
}

a:hover::after {
  width: 100%;
}
```

### Scroll Animations

```css
/* Fade-in on scroll */
.fade-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
}

.fade-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Parallax hero image */
.hero-bg {
  background-position: center;
  background-attachment: fixed;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 9. Responsive Design Breakpoints

```css
/* Mobile First Approach */

/* Mobile: 320px - 767px */
@media (max-width: 767px) {
  /* Single column layout */
  /* Larger touch targets */
  /* Simplified navigation */
  /* Stacked cards */
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 2-column grid for cards */
  /* Horizontal nav */
  /* Medium spacing */
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  /* 3-column grid for services */
  /* Full navigation bar */
  /* Max width containers */
  /* Advanced layouts */
}
```

### Specific Responsive Changes

**Hero Section:**
- Mobile: 100vw width, 60vh height, stacked layout
- Tablet: 90vw width, 70vh height
- Desktop: Full container, side-by-side image + text

**Services Grid:**
- Mobile: 1 column (full width)
- Tablet: 2 columns
- Desktop: 3 columns

**Booking Calendar:**
- Mobile: Single month view, large touch targets
- Tablet: Month view with better spacing
- Desktop: Month + Year navigation, smooth interactions

**Forms:**
- Mobile: Full width, large inputs (44px min height), 16px font (prevents zoom)
- Tablet: Constrained width, better spacing
- Desktop: Max-width container, optimal readability

---

## 10. Accessibility Guidelines

### Color Contrast
- Normal text: 4.5:1 minimum (AAA)
- Large text (18px+): 3:1 minimum
- Use ColorContrast.io to verify

### Focus States
```css
/* Visible focus indicators */
button:focus,
input:focus,
a:focus {
  outline: 2px solid #0D7C7D;
  outline-offset: 2px;
}
```

### Alt Text
- Hero image: "Charushri Suhaney, licensed therapist with 10+ years of experience"
- Service icons: "Icon representing anxiety counseling"
- Testimonial avatars: "Profile photo of client named Priya M."
- Decorative elements: Empty alt text (`alt=""`)

### Semantic HTML
```html
<nav> - Navigation sections
<header> - Header/hero
<main> - Main content
<article> - Blog articles
<section> - Content sections
<button> - Clickable actions
<label> - Form field labels
```

### Form Accessibility
```html
<label for="email">Email Address *</label>
<input id="email" type="email" aria-label="Email Address" required>

<span id="email-error" class="error" role="alert">
  Please enter a valid email
</span>
```

---

## 11. Icon System

### Icon Sources
- Primary: Feather Icons (lightweight, consistent)
- Fallback: Material Design Icons

### Icon Sizes
- Small (16px): Inline, labels
- Medium (24px): Navigation, buttons
- Large (48px): Service cards, heroes
- XL (64px): Hero section accents

### Icon Colors
- Primary action: Trust Teal (#0D7C7D)
- Neutral: Dark text (#2D3436)
- Success: Soft Green (#27AE60)
- Error: Soft Red (#E74C3C)

---

## 12. Visual Hierarchy

### Priority Levels

**P1 - Critical (Hero CTA)**
- Largest, most visible
- Primary color
- First thing user sees after hero image

**P2 - Important (Services, Booking)**
- Section headers
- Secondary buttons
- Clear visual separation

**P3 - Supporting (Blog, Contact)**
- Tertiary information
- Ghost buttons
- Smaller sizing

**P4 - Background (Footer)**
- Minimal visual weight
- Light color
- Supporting information only

---

## 13. Dark Mode Considerations (Future)

```css
@media (prefers-color-scheme: dark) {
  --bg-primary: #1A1A1A;
  --bg-secondary: #242424;
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --accent: #4DB8D4;
}
```

---

## 14. Loading States

### Skeleton Loaders
```
Service Card Skeleton:
┌─────────────────────┐
│ [Gray block - icon] │
│ [Gray bar - title]  │
│ [Gray bar - desc]   │
│ [Gray bar - desc]   │
└─────────────────────┘

Appears while content loads (prevents CLS)
```

### Loading Indicators
```
Spinner: Rotating teal circle
Position: Center of button or form
Color: Trust Teal (#0D7C7D)
Duration: 0.8s spin cycle
```

---

## 15. Print Styles

```css
@media print {
  header, nav, footer, .no-print {
    display: none;
  }
  
  body {
    background: white;
    color: black;
  }
  
  .booking-confirmation {
    page-break-after: always;
  }
}
```

---

## Summary

This design system ensures:
- ✓ Consistent visual language
- ✓ Accessible to all users
- ✓ Fast and performant
- ✓ Delightful micro-interactions
- ✓ Professional and calming aesthetics
- ✓ Mobile-first approach
- ✓ Easy to maintain and extend
