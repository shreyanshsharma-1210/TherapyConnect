# Visual Diagrams & Reference Guide
## TherapyConnect - Therapist Booking Platform

---

## 1. Application Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │  Hero    │ │  About   │ │Services  │ │Testimon. │ │ Booking││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │ Pricing  │ │  Blog    │ │ Contact  │ │  Footer  │ │  Nav   ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   REACT COMPONENTS LAYER                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Reusable Component Library (UI)                │  │
│  │   ┌─────┐┌──────┐┌─────┐┌──────┐┌─────┐┌──────┐         │  │
│  │   │Btn  ││Input ││Card ││Modal ││Icon ││Alert ││ ...     │  │
│  │   └─────┘└──────┘└─────┘└──────┘└─────┘└──────┘         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│  ┌────────────────┐┌─────────────────┐┌──────────────────┐    │
│  │ BookingContext ││ Custom Hooks    ││ Validation Logic │    │
│  │ - selectedDate ││ - useBooking    ││ - Zod schemas   │    │
│  │ - selectedTime ││ - useScroll     ││ - Form rules     │    │
│  │ - bookings     ││ - useMediaQuery ││                  │    │
│  └────────────────┘└─────────────────┘└──────────────────┘    │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                      DATA LAYER (CLIENT-SIDE)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ localStorage │  │ MSW Mock API  │  │ Fetch API    │         │
│  │ - bookings   │  │ - handlers.js │  │ - email      │         │
│  │ - forms      │  │ - endpoints   │  │ - payment    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Email.js    │  │  Razorpay    │  │  Formspree   │         │
│  │ (Email send) │  │ (Payment)    │  │ (Forms)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Page Layout Diagram (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER/NAVIGATION                          │
│  Logo/Brand              Links              Contact              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                        HERO SECTION                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ "Charushri Suhaney"                                       │  │
│  │ "Helping you navigate anxiety & emotional wellness"     │  │
│  │ [Book a Session Button]                                 │  │
│  │                              [Professional Image]        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     ABOUT SECTION (3 cols)                       │
│  [Image]           [Bio + Credentials]       [Icons/Badges]    │
├─────────────────────────────────────────────────────────────────┤
│                    SERVICES SECTION (3x2 grid)                   │
│  ┌──────┐  ┌──────┐  ┌──────┐                                  │
│  │Card 1│  │Card 2│  │Card 3│                                  │
│  └──────┘  └──────┘  └──────┘                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐                                  │
│  │Card 4│  │Card 5│  │Card 6│                                  │
│  └──────┘  └──────┘  └──────┘                                  │
├─────────────────────────────────────────────────────────────────┤
│                  TESTIMONIALS (1x3 grid)                         │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │   Quote 1     │ │   Quote 2     │ │   Quote 3     │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
├─────────────────────────────────────────────────────────────────┤
│                  BOOKING SECTION (2 cols)                        │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │ Calendar Widget  │          │ Booking Form     │            │
│  │ Select Date      │          │ - Name           │            │
│  │ Select Time      │          │ - Email          │            │
│  │                  │          │ - Phone          │            │
│  │                  │          │ - Reason         │            │
│  │                  │          │ [Book Now]       │            │
│  └──────────────────┘          └──────────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                  PRICING SECTION (1x3 grid)                      │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Plan 1        │ │ Plan 2        │ │ Plan 3        │         │
│  │ ₹500          │ │ ₹1,200        │ │ ₹1,800        │         │
│  │ [Book & Pay]  │ │ [Book & Pay]  │ │ [Book & Pay]  │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
├─────────────────────────────────────────────────────────────────┤
│                   BLOG PREVIEW (1x3 grid)                        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ Article 1     │ │ Article 2     │ │ Article 3     │         │
│  │ [Image]       │ │ [Image]       │ │ [Image]       │         │
│  │ Title         │ │ Title         │ │ Title         │         │
│  │ [Read More]   │ │ [Read More]   │ │ [Read More]   │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
├─────────────────────────────────────────────────────────────────┤
│                  CONTACT SECTION                                 │
│  [WhatsApp] [Email] | Contact Form: Name | Email | Message     │
│                     | [Submit]                                   │
├─────────────────────────────────────────────────────────────────┤
│                     FOOTER                                       │
│  Links | Copyright | Social Media                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Hierarchy Tree

```
<App>
├── <Header/>
│   ├── <Logo/>
│   ├── <Navigation>
│   │   └── <NavLink/> × 5
│   └── <MobileMenu>
│       └── <MobileNavLink/> × 5
│
├── <Main>
│   ├── <Hero>
│   │   ├── <Heading>
│   │   ├── <Tagline>
│   │   ├── <Button/>
│   │   └── <Image/>
│   │
│   ├── <About>
│   │   ├── <Heading>
│   │   ├── <Image/>
│   │   ├── <Bio/>
│   │   ├── <Credentials/>
│   │   └── <Badges/> × 3
│   │
│   ├── <Services>
│   │   ├── <Heading>
│   │   └── <ServiceCard/> × 6
│   │       ├── <Icon/>
│   │       ├── <Title>
│   │       ├── <Description>
│   │       └── <Link/>
│   │
│   ├── <Testimonials>
│   │   ├── <Heading>
│   │   └── <TestimonialCard/> × 3
│   │       ├── <StarRating/>
│   │       ├── <Quote>
│   │       ├── <Author>
│   │       └── <Avatar/>
│   │
│   ├── <BookingSection>
│   │   ├── <Heading>
│   │   ├── <BookingCalendar>
│   │   │   └── <Calendar/> (React Big Calendar)
│   │   ├── <TimeSlotSelector>
│   │   │   └── <TimeSlot/> × 8
│   │   └── <BookingForm>
│   │       ├── <FormField/> × 4
│   │       └── <Button/>
│   │
│   ├── <ConfirmationModal>
│   │   ├── <Title>
│   │   ├── <BookingDetails>
│   │   └── <Button/> × 2
│   │
│   ├── <Pricing>
│   │   ├── <Heading>
│   │   └── <PricingCard/> × 3
│   │       ├── <Title>
│   │       ├── <Price>
│   │       ├── <Features>
│   │       └── <Button/>
│   │
│   ├── <Blog>
│   │   ├── <Heading>
│   │   └── <BlogCard/> × 3
│   │       ├── <Image/>
│   │       ├── <Title>
│   │       ├── <Excerpt>
│   │       ├── <Date>
│   │       └── <Link/>
│   │
│   └── <Contact>
│       ├── <Heading>
│       ├── <Button/> × 2 (WhatsApp, Email)
│       └── <ContactForm>
│           ├── <FormField/> × 3
│           └── <Button/>
│
└── <Footer>
    ├── <Links/>
    ├── <Copyright>
    └── <SocialLinks/> × 3
```

---

## 4. Data Flow Diagram (Booking)

```
User Action: Click "Book Session"
        ↓
    ┌───────────────────────────────────────────┐
    │      Select Date from Calendar            │
    │   (onClick → setSelectedDate)              │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │     Get Booked Slots for Date             │
    │  (getBookedSlots(selectedDate))            │
    │  Returns: ['14:00', '16:00', ...]          │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │    Display Available Time Slots            │
    │   (Filter out booked times)                │
    │   Available: [10:00, 11:00, 15:00, ...]    │
    └────────────┬────────────────────────────────┘
                 ↓
    User Action: Click Time Slot
                 ↓
    ┌───────────────────────────────────────────┐
    │     setSelectedTime(slot)                 │
    │   Update Context                          │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │      Display Booking Form                 │
    │    (conditional render)                   │
    │    - Name, Email, Phone, Reason           │
    └────────────┬────────────────────────────────┘
                 ↓
    User Action: Fill Form & Submit
                 ↓
    ┌───────────────────────────────────────────┐
    │      Form Validation with Zod             │
    │    ✓ Name: 2-50 chars                     │
    │    ✓ Email: valid format                  │
    │    ✓ Phone: 10 digits                     │
    │    ✓ Reason: 10-500 chars                 │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │       Form Valid? → Yes                   │
    │    (No → Show error messages)              │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │     Create Booking Object:                │
    │   {                                       │
    │     name, email, phone, reason,           │
    │     date, time, status: 'confirmed'       │
    │   }                                       │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │   Store in localStorage                   │
    │   + Context state                         │
    │   addBooking(data) → calls localStorage   │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │    Show Confirmation Modal                │
    │    - Booking details                      │
    │    - [Proceed to Payment] [Save as Draft] │
    └────────────┬────────────────────────────────┘
                 ↓
    User Action: Click "Proceed to Payment"
                 ↓
    ┌───────────────────────────────────────────┐
    │   Initiate Razorpay Payment               │
    │   - Amount: ₹1,200                        │
    │   - Session: May 15, 4:00 PM              │
    │   - Name/Email prefilled                  │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │   Payment Complete?                       │
    │   Yes → Success Page                      │
    │   No → Error handling + Retry             │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │    Send Confirmation Email                │
    │   - To client (email address)             │
    │   - To therapist (therapist@email.com)    │
    │   - Email.js or Formspree                 │
    └────────────┬────────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │    Redirect to Success Page               │
    │   - Show booking confirmation             │
    │   - Display booking details               │
    │   - "Return to Home" button               │
    └─────────────────────────────────────────────
```

---

## 5. Mobile Layout Transformation

```
DESKTOP (1024px+)              TABLET (768px-1024px)        MOBILE (<768px)
┌──────────────────────┐      ┌─────────────────┐        ┌───────────────┐
│    HEADER (64px)     │      │  HEADER (56px)  │        │ HEADER (56px) │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│                      │      │                 │        │               │
│   HERO (Full Width)  │      │ HERO (Stack)    │        │  HERO (Stack) │
│  Image | Text Side   │      │ Image on top    │        │ Stacked Vert. │
│  by side             │      │ Text below      │        │ Full Width    │
│                      │      │                 │        │               │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│   ABOUT (3 cols)     │      │  ABOUT (2 cols) │        │ ABOUT (1 col) │
│  Img | Bio | Badges  │      │ Img + Bio       │        │ Stack all     │
│                      │      │ Badges below    │        │               │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│  SERVICES (3 cols)   │      │ SERVICES (2c)   │        │SERVICES (1col)│
│  C1 | C2 | C3        │      │ C1 C2           │        │ C1            │
│  C4 | C5 | C6        │      │ C3 C4           │        │ C2            │
│                      │      │ C5 C6           │        │ C3            │
│                      │      │                 │        │ ...           │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│ TESTIMONIALS (3 col) │      │ TESTIM. (2col)  │        │TESTIM.(1col)  │
│  T1 | T2 | T3        │      │ T1 T2           │        │ T1            │
│                      │      │ T3              │        │ T2            │
│                      │      │                 │        │ T3 (swipeable)│
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│  BOOKING (2 cols)    │      │ BOOKING (Stack) │        │BOOKING(Stack) │
│ Calendar | Form      │      │ Calendar        │        │ Calendar      │
│                      │      │ Time Slots      │        │ Time Slots    │
│                      │      │ Form            │        │ Form          │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│  PRICING (3 cols)    │      │ PRICING (2 col) │        │ PRICING (1col)│
│  P1 | P2 | P3        │      │ P1 P2           │        │ P1            │
│                      │      │ P3              │        │ P2            │
│                      │      │                 │        │ P3            │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│  BLOG (3 cols)       │      │ BLOG (2 col)    │        │ BLOG (1 col)  │
│  B1 | B2 | B3        │      │ B1 B2           │        │ B1            │
│                      │      │ B3              │        │ B2            │
│                      │      │                 │        │ B3            │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│ CONTACT (Form)       │      │ CONTACT (Form)  │        │CONTACT(Form)  │
│ [WhatsApp] [Email]   │      │ Stacked         │        │Stacked        │
├──────────────────────┤      ├─────────────────┤        ├───────────────┤
│  FOOTER              │      │ FOOTER          │        │ FOOTER        │
└──────────────────────┘      └─────────────────┘        └───────────────┘
```

---

## 6. State Management Structure

```
BookingContext
├── State
│   ├── selectedDate: "2026-05-15" or null
│   ├── selectedTime: "16:00" or null
│   ├── bookings: [
│   │   {
│   │     id: "123456",
│   │     name: "Priya Sharma",
│   │     email: "priya@email.com",
│   │     phone: "9039705759",
│   │     reason: "Anxiety management",
│   │     date: "2026-05-15",
│   │     time: "16:00",
│   │     status: "confirmed",
│   │     createdAt: "2026-05-01T10:00:00Z"
│   │   }
│   │ ]
│   └── bookingFormData: {
│       name: "",
│       email: "",
│       phone: "",
│       reason: ""
│     }
│
└── Methods
    ├── setSelectedDate(date)
    ├── setSelectedTime(time)
    ├── setBookingFormData(data)
    ├── addBooking(booking)
    │   └── localStorage.setItem('bookings', JSON.stringify(updated))
    ├── getBookedSlots(date)
    │   └── Returns array of booked times for a date
    └── getBookedDates()
        └── Returns array of all booked dates
```

---

## 7. Form Validation Flow

```
User Types in Input Field
        ↓
┌───────────────────────────────────┐
│ React Hook Form onChange          │
│ Calls real-time validation        │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│ Zod Schema Validation             │
│ name: z.string().min(2).max(50)   │
│ email: z.string().email()         │
│ phone: z.string().regex(/^[0-9]{10}$/)
│ reason: z.string().min(10).max(500)
└────────────┬──────────────────────┘
             ↓
        ┌────┴────┐
        │          │
    Valid       Invalid
        │          │
        ↓          ↓
    ┌────────┐ ┌──────────────────┐
    │ Remove │ │ Set error state  │
    │ error  │ │ Show error msg   │
    │ Enable │ │ Disable submit   │
    │ submit │ │                  │
    └────────┘ └──────────────────┘
        ↓
    Show Green ✓
    Or Red ✗ Icon
```

---

## 8. Responsive Grid Behavior

```
Services Grid Responsiveness:

DESKTOP (1024px+)          TABLET (768px-1024px)      MOBILE (<768px)
3-Column Grid              2-Column Grid              1-Column Grid

Card1  Card2  Card3        Card1  Card2               Card1
Card4  Card5  Card6        Card3  Card4               Card2
                           Card5  Card6               Card3
                                                      Card4
                                                      Card5
                                                      Card6

Width: 33%                 Width: 50%                 Width: 100%
Gap: 24px                  Gap: 16px                  Gap: 16px
Padding: 48px              Padding: 24px              Padding: 16px
```

---

## 9. Color Usage Guide

```
PRIMARY (Teal - #0D7C7D)
├── Main CTA buttons
├── Primary headings (H1, H2)
├── Active navigation links
├── Form focus states
├── Success indicators
└── Hover states

SECONDARY (Cream - #F5E6D3)
├── Accent backgrounds
├── Card hover highlights
├── Testimonial accents
└── Decorative elements

ACCENT (Coral - #E8726E)
├── Secondary CTA buttons
├── Hover button states
├── Attention-grabbing elements
└── Call-to-action variations

TEXT (Dark Slate - #2D3436)
├── Body text
├── Form labels
├── Input text
└── All readable content

BACKGROUND (Off-White - #F8F9FA)
├── Page background
├── Card backgrounds
└── Section backgrounds

SUCCESS (Green - #27AE60)
├── Success messages
├── Confirmed states
├── Valid form fields
└── Checkmark icons

ERROR (Red - #E74C3C)
├── Error messages
├── Invalid form fields
├── Warning states
└── Disabled buttons
```

---

## 10. Mobile-First Responsive Strategy

```
Step 1: Design for Mobile (375px)
    ├── Single column layouts
    ├── Full-width components
    ├── 16px minimum font size
    ├── 48px minimum touch targets
    └── Vertical scrolling primary

Step 2: Tablet Adjustments (768px+)
    ├── 2-column grids possible
    ├── Horizontal layouts
    ├── Increased spacing
    └── Side-by-side sections

Step 3: Desktop Optimization (1024px+)
    ├── 3-column grids
    ├── Complex layouts
    ├── Max-width containers
    └── Optimal information density

Using Tailwind Responsive Prefixes:
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
         ^                ^                 ^
      Mobile            Tablet           Desktop
```

---

## 11. Animation Timing Reference

```
Quick Interactions (User Feedback)
├── Button hover: 150ms (subtle, instant)
├── Input focus: 200ms (smooth)
└── Icon transitions: 300ms (snappy)

Page Load Animations
├── Hero fade-in: 800ms (welcoming)
├── Staggered cards: 600ms (each, 100ms stagger)
└── Section reveals: 600-800ms (gradual)

Scroll-Based Animations
├── Fade-in on scroll: 600ms (smooth entry)
├── Parallax: Continuous (linked to scroll)
└── Stagger on scroll: 100-200ms between items

Easing Functions
├── Ease-out: for entering animations
├── Ease-in: for exiting animations
├── Cubic-bezier(0.4, 0, 0.2, 1): standard smooth
└── Linear: for continuous animations
```

---

## 12. Component Sizing Reference

```
Heights:
├── Navigation: 64px (desktop), 56px (mobile)
├── Hero: 60-70vh (viewport height)
├── Section: auto (based on content)
├── Card: min 300px
├── Button: 48px (touch-friendly)
├── Input: 44px minimum
└── Icon: 16px, 24px, 48px, 64px

Widths:
├── Container: 1200px max
├── Sidebar: 280px mobile, 320px desktop
├── Modal: 500px, (90vw on mobile)
├── Hero Image: 50% on desktop, 100% on mobile
└── Card: flexible, grid-based

Spacing:
├── Section padding: 64px (desktop), 24px (mobile)
├── Card padding: 24px-32px
├── Component gap: 16-24px
├── Text margin: varies by size
└── Line height: 1.2-1.6
```

---

## 13. Performance Budget

```
Lighthouse Targets:
├── Performance: >90
├── Accessibility: >95
├── Best Practices: >95
└── SEO: >95

Bundle Size Targets:
├── HTML: <50KB
├── CSS: <50KB (Tailwind)
├── JavaScript: <150KB (gzipped)
├── Images: <200KB (optimized)
└── Fonts: <50KB
    └── Total: <450KB (gzipped)

Load Time Targets:
├── First Contentful Paint (FCP): <1.5s
├── Largest Contentful Paint (LCP): <2.5s
├── Cumulative Layout Shift (CLS): <0.1
├── Time to Interactive (TTI): <3.5s
└── Total Page Load: <2 seconds

Network Targets:
├── Connection: 4G (assumed)
├── Requests: <50
├── Cache: browser + CDN
└── Compression: gzip + Brotli
```

---

## 14. Accessibility Checklist

```
Color Contrast
├── Normal text: 4.5:1 ratio minimum (AAA)
├── Large text (18px+): 3:1 minimum
├── Interactive elements: 3:1 minimum
└── Check with WebAIM Contrast Checker

Keyboard Navigation
├── Tab order logical: top-left → bottom-right
├── All buttons/links reachable with Tab
├── Focus visible on every interactive element
├── Escape key closes modals/menus
└── Enter key activates buttons/links

Screen Reader Support
├── Alt text on all images (meaningful descriptions)
├── Form labels associated with inputs
├── ARIA labels for icons without text
├── Semantic HTML (button, nav, main, etc.)
└── Skip navigation link at top

Mobile Accessibility
├── Touch targets: 48px minimum
├── Readable text: 16px minimum
├── No text smaller than 12px
├── Sufficient spacing between targets
└── Readable without horizontal scroll

WCAG 2.1 Level AA Compliance
├── Use Axe DevTools for automated testing
├── Manual keyboard testing
├── Screen reader testing (NVDA, VoiceOver)
├── Color contrast verification
└── ARIA implementations correct
```

---

## 15. Testing Checklist

```
Pre-Launch Testing Checklist:

Functional Tests
  ☐ Form validation: valid + invalid inputs
  ☐ Booking flow: calendar → time → form → confirm
  ☐ Payment: test transaction processing
  ☐ Email: confirmation emails received
  ☐ localStorage: data persists on page reload
  ☐ Modal: opens, closes, shows correct data
  ☐ Navigation: all links work, no broken links

Responsive Design Tests
  ☐ Mobile (375px): full functionality
  ☐ Tablet (768px): layout proper
  ☐ Desktop (1024px): optimal display
  ☐ Images: responsive, not distorted
  ☐ Text: readable on all sizes
  ☐ Touch targets: 48px+ on mobile

Performance Tests
  ☐ Lighthouse: >90 on all metrics
  ☐ Load time: <2s on 4G connection
  ☐ Images: optimized (WebP, compressed)
  ☐ Bundle: <450KB gzipped
  ☐ No console errors/warnings
  ☐ No layout shift (CLS <0.1)

Cross-Browser Tests
  ☐ Chrome (latest)
  ☐ Firefox (latest)
  ☐ Safari (latest)
  ☐ Edge (latest)
  ☐ Mobile Safari (iOS)
  ☐ Chrome Mobile (Android)

Accessibility Tests
  ☐ Axe DevTools: 0 violations
  ☐ Keyboard: tab navigation works
  ☐ Screen reader: content readable
  ☐ Color contrast: 4.5:1 minimum
  ☐ Focus indicators: visible on all inputs
  ☐ Form labels: properly associated

Security Tests
  ☐ No API keys exposed
  ☐ HTTPS enforced
  ☐ Input sanitization working
  ☐ No sensitive data in localStorage
  ☐ CSP headers configured
  ☐ XSS protection active

User Testing
  ☐ 5+ users test booking flow
  ☐ Measure task completion time
  ☐ Collect feedback on clarity
  ☐ Test edge cases
  ☐ Verify emotional response
```

---

## Summary

These diagrams and references provide a visual understanding of:
✅ Application architecture
✅ Component structure
✅ Data flows
✅ Responsive design approach
✅ State management
✅ Form validation
✅ Performance targets
✅ Accessibility requirements
✅ Testing checklist

Use these as reference guides throughout the implementation process!

