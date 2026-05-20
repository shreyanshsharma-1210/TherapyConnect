# User Flows & User Journey Maps
## TherapyConnect - Therapist Booking Platform

---

## 1. User Personas

### Persona 1: Priya - The Anxious Professional
- **Age:** 28
- **Background:** Marketing manager, busy schedule
- **Pain Points:** Anxiety during work, needs flexible scheduling
- **Goal:** Find a therapist, book a session easily
- **Tech Comfort:** High
- **Decision Drivers:** Reviews, credentials, quick booking

### Persona 2: Raj - The Seeking Individual
- **Age:** 35
- **Background:** IT professional, relationship issues
- **Pain Points:** Relationship stress, limited free time
- **Goal:** Get therapy advice, build trust with therapist
- **Tech Comfort:** Medium
- **Decision Drivers:** Therapist expertise, testimonials, clear pricing

### Persona 3: Maya - The Information Gatherer
- **Age:** 42
- **Background:** Homemaker, career transition anxiety
- **Pain Points:** Unsure about therapy, needs reassurance
- **Goal:** Learn about therapy, understand therapist approach
- **Tech Comfort:** Low
- **Decision Drivers:** Clear information, personal connection, easy contact

---

## 2. Complete User Journeys

### Journey 1: Awareness → Decision → Booking

```
┌─────────────────────────────────────────────────────────────────┐
│ DISCOVERY PHASE                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User searches on Google: "therapist in Indore"                  │
│           ↓                                                      │
│ Finds TherapyConnect link in search results                     │
│           ↓                                                      │
│ Lands on Hero Section                                           │
│ - Sees professional image of therapist                          │
│ - Reads tagline: "Helping you navigate anxiety..."              │
│ - Emotions: Slightly reassured, interested                      │
│           ↓                                                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESEARCH PHASE                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User scrolls to About Section                                   │
│ - Reads therapist bio                                           │
│ - Sees credentials and experience (10+ years)                   │
│ - Emotions: Building trust, professional credibility            │
│           ↓                                                      │
│ User explores Services Section                                  │
│ - Sees 6 service cards (Anxiety, Relationships, etc.)           │
│ - Matches own needs with services                               │
│ - Emotions: Aligned, hopeful                                    │
│           ↓                                                      │
│ User reads Testimonials                                         │
│ - 3 client reviews with 5-star ratings                          │
│ - Similar situations mentioned                                  │
│ - Emotions: Reassured by social proof                           │
│           ↓                                                      │
│ User checks Blog Section                                        │
│ - Reads articles about therapy and wellness                     │
│ - Emotions: Impressed by expertise, wants to proceed            │
│           ↓                                                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ DECISION PHASE                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ User scrolls to Pricing Section                                 │
│ - Sees clear pricing for different session types                │
│ - ₹1,200 for 50-min standard session                            │
│ - Emotions: Finds pricing reasonable                            │
│           ↓                                                      │
│ User clicks "Book & Pay" or "Book a Session" button             │
│ - Ready to commit                                               │
│ - Emotions: Decisive, committed                                 │
│           ↓                                                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ CONVERSION PHASE                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Booking Calendar Opens                                          │
│ - User sees available dates (green) and booked dates (gray)     │
│ - Selects a date (e.g., May 15)                                 │
│           ↓                                                      │
│ Time Slot Selection                                             │
│ - User sees available times: 10 AM, 2 PM, 4 PM                  │
│ - Selects preferred time (e.g., 4 PM - after work)              │
│ - Emotions: Convenient, fitting schedule                        │
│           ↓                                                      │
│ Booking Form                                                    │
│ - Name: Priya Sharma                                            │
│ - Email: priya@email.com                                        │
│ - Phone: 98XX XX1234                                            │
│ - Reason: Managing work anxiety                                 │
│ - Form validation runs in real-time                             │
│           ↓                                                      │
│ Confirmation Page                                               │
│ - Shows: "Booking Confirmed!"                                   │
│ - Details: May 15, 2026 at 4:00 PM                              │
│ - Therapist: Charushri                                         │
│ - Session Fee: ₹1,200                                           │
│           ↓                                                      │
│ Payment (Razorpay Test Mode)                                    │
│ - Redirects to payment page                                     │
│ - Test payment success                                          │
│ - Returns to success page                                       │
│           ↓                                                      │
│ Success Email (Simulated)                                       │
│ - Subject: "Your Session is Confirmed!"                         │
│ - Contains booking details & reminders                          │
│ - Emotions: Relief, anticipation, trust in therapist            │
│           ↓                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Journey 2: Information Seeker → Contact

```
┌─────────────────────────────────────────────────────────────────┐
│ DISCOVERY PHASE                                                 │
├─────────────────────────────────────────────────────────────────┤
│ User lands on Hero                                              │
│ Feels slightly overwhelmed, wants to learn more first            │
│ Decision: Browse instead of book immediately                    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ EXPLORATION PHASE                                               │
├─────────────────────────────────────────────────────────────────┤
│ Reads About section carefully                                   │
│ Explores Services section                                       │
│ Studies Testimonials in detail                                  │
│ Reads all 3 Blog articles                                       │
│ Takes mental notes, builds confidence                           │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ ENGAGEMENT PHASE                                                │
├─────────────────────────────────────────────────────────────────┤
│ Still has questions, not ready to book directly                 │
│ Scrolls to Contact Section                                      │
│ Options:                                                        │
│   → Click WhatsApp button: "Chat on WhatsApp"                   │
│   → Fill contact form: Name, Email, Message                     │
│   → Send email directly                                         │
│                                                                  │
│ User chooses: Fill contact form                                 │
│ Message: "Hi, I'd like to understand your therapy approach..."  │
│           ↓                                                      │
│ Form submitted successfully                                     │
│ Receives confirmation message                                   │
│ Emotions: Satisfied, expecting response                         │
│           ↓                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Journey 3: Mobile User - Quick Booking

```
┌─────────────────────────────────────────────────────────────────┐
│ MOBILE LANDING                                                  │
├─────────────────────────────────────────────────────────────────┤
│ User on iPhone, limited time, saw ad online                     │
│ Lands on mobile hero section                                    │
│ Sees: Professional image + "Book a Session" CTA                 │
│ Taps CTA immediately (high intent)                              │
│ Page should load fast (<2s)                                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ QUICK BROWSE                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Scrolls through About (skims text)                              │
│ Glances at Services cards                                       │
│ Quickly reads testimonials (visual, easy to scan)               │
│ Total time: 20-30 seconds                                       │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ FAST BOOKING                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Scrolls to Booking Calendar                                     │
│ Taps an available date (easy touch targets)                     │
│ Selects time slot (visually clear)                              │
│ Fills form with auto-fill enabled:                              │
│   - Name: Auto-filled from browser                              │
│   - Email: Auto-filled                                          │
│   - Phone: Auto-filled                                          │
│   - Reason: Types quickly                                       │
│ Taps "Book Now" button (large, mobile-friendly)                 │
│ Redirected to payment (Razorpay)                                │
│ Completes payment quickly                                       │
│ Gets confirmation popup                                         │
│ Total time: 3-4 minutes                                         │
│ Emotions: Efficient, satisfied                                  │
│           ↓                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Page-by-Page Flow

### 3.1 Hero Section Flow

```
┌──────────────────────────┐
│   User Lands on Page     │
│ (Desktop / Mobile)       │
└────────────┬─────────────┘
             │
             ↓ (Page loads)
┌──────────────────────────────────┐
│ Hero Image (Animated Fade-in)    │
│ + Therapist Name                 │
│ + Tagline (Calming message)      │
│ + "Book a Session" CTA Button    │
│ (Glows on hover)                 │
└────────────┬─────────────────────┘
             │
       ┌─────┴─────┐
       │           │
   Click        Scroll
   Button       Down
       │           │
       ↓           ↓
  ┌────────┐    ┌──────────────┐
  │Booking │    │ About Section│
  │Section │    │ (continues)  │
  └────────┘    └──────────────┘
```

### 3.2 Services Section Flow

```
┌─────────────────────────────────┐
│   Services Section Header        │
│   "What I Offer"                 │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ 6 Service Cards (Grid Layout)    │
│                                  │
│ Card 1        Card 2        Card 3
│ [Icon]        [Icon]        [Icon]
│ Anxiety       Relationship   Career
│ Description   Description    Description
│                                  │
│ Card 4        Card 5        Card 6
│ [Icon]        [Icon]        [Icon]
│ Depression    Family        Trauma
│ Description   Description    Description
└────────────┬────────────────────┘
             │
      ┌──────┴──────┐
      │             │
   Hover        Mouse Leave
   Effect       (Normal state)
      │             │
      ↓             ↓
   Card Lifts    Card Returns
   + Shadow      to Original
   + Color       Position
   Accent
```

### 3.3 Booking Calendar Flow

```
┌──────────────────────────────┐
│ Booking Calendar Section      │
│ "Select Your Session Date"    │
└────────────┬─────────────────┘
             │
             ↓
┌──────────────────────────────┐
│ Calendar View (Month)         │
│                               │
│ Su Mo Tu We Th Fr Sa          │
│                [•]  1  2  3   │
│  4  5  6  7  8  9 10          │
│ 11 12 13 14[15] 16 17         │
│                               │
│ Green = Available             │
│ Gray = Booked                 │
│ Red = Holiday/Unavailable     │
└────────────┬─────────────────┘
             │
        User Clicks
        May 15
             │
             ↓
┌──────────────────────────────┐
│ Time Slot Selection           │
│ May 15, 2026                  │
│                               │
│ [10:00 AM] Available          │
│ [11:00 AM] Booked             │
│ [02:00 PM] Available          │
│ [04:00 PM] Available          │
│                               │
│ User selects 4:00 PM          │
└────────────┬─────────────────┘
             │
             ↓
┌──────────────────────────────┐
│ Booking Details Confirmed     │
│                               │
│ Date: May 15, 2026            │
│ Time: 4:00 PM - 4:50 PM       │
│ Therapist: Charushri         │
│ Session Fee: ₹1,200           │
│                               │
│ [Proceed to Booking Form]     │
└──────────────────────────────┘
```

### 3.4 Booking Form Flow

```
┌─────────────────────────────────┐
│ Booking Form                     │
│ "Complete Your Booking"          │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Form Fields:                     │
│                                  │
│ 1. Full Name *                   │
│    [Input field]                 │
│    Validation: Min 2 chars       │
│    ✓ Valid / ✗ Error             │
│                                  │
│ 2. Email Address *               │
│    [Input field]                 │
│    Validation: Valid email       │
│    ✓ Valid / ✗ Error             │
│                                  │
│ 3. Phone Number *                │
│    [+91] [10-digit input]        │
│    Validation: 10 digits         │
│    ✓ Valid / ✗ Error             │
│                                  │
│ 4. Reason for Therapy *          │
│    [Textarea - min 20 chars]     │
│    Validation: Min 20 chars      │
│    ✓ Valid / ✗ Error             │
│                                  │
│ [All fields filled & valid]      │
│ [Book Now Button ENABLED]        │
│                                  │
└────────────┬────────────────────┘
             │
        User Clicks
        "Book Now"
             │
             ↓
┌─────────────────────────────────┐
│ Confirmation Modal               │
│ "Booking Confirmed!"             │
│                                  │
│ ✓ Appointment Details            │
│   Date: May 15, 2026             │
│   Time: 4:00 PM                  │
│   Fee: ₹1,200                    │
│                                  │
│ [Proceed to Payment]             │
│ [Save as Draft]                  │
│                                  │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Razorpay Payment Gateway         │
│ (Redirect to external page)      │
│                                  │
│ Test payment success             │
│ Order ID: ORD123456              │
│ Amount: ₹1,200                   │
│                                  │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Success Page                     │
│ "Payment Successful!"            │
│                                  │
│ Order confirmed                  │
│ Email sent to: priya@email.com   │
│ Check your inbox for details     │
│                                  │
│ [Download Receipt]               │
│ [Return to Home]                 │
│                                  │
└─────────────────────────────────┘
```

---

## 4. Contact Flow

```
┌──────────────────────────────┐
│  Contact Section             │
│  "Get in Touch"              │
└────────────┬─────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ↓        ↓        ↓
┌────────┐ ┌────────┐ ┌──────────┐
│WhatsApp│ │ Email  │ │Contact   │
│Button  │ │Button  │ │ Form     │
└────────┘ └────────┘ └────┬─────┘
   │         │             │
   ↓         ↓             ↓
Opens     Opens      Form Appears
WhatsApp  Mail App   ┌──────────────┐
App       with       │ Name         │
"Hi Dr." prepended   │ Email        │
text                 │ Message      │
                     │ [Submit]     │
                     └──────┬───────┘
                            │
                     ┌──────┴────────┐
                     │               │
                  Valid          Invalid
                     │               │
                     ↓               ↓
              ┌─────────────┐  ┌──────────┐
              │ Success Msg │  │ Error    │
              │ Form sent   │  │ Show     │
              │ Email notif │  │ errors   │
              └─────────────┘  └──────────┘
```

---

## 5. Scroll Flow (Desktop)

```
VIEWPORT HEIGHT

┌──────────────────────────────┐
│      HERO SECTION            │ ← User lands here
│   (Full viewport height)      │   Hero image + CTA
│      Animated entry           │
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│      ABOUT SECTION           │   Therapist bio,
│   (Sticky nav appears)        │   credentials
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│     SERVICES SECTION         │   6 service cards
│   (Cards animate on scroll)   │   Grid layout
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│   TESTIMONIALS SECTION       │   3 testimonial cards
│   (Carousel or grid)          │   Star ratings
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│      BOOKING SECTION         │   Calendar + form
│   (Most important CTA)        │   Key conversion point
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│      PRICING SECTION         │   Pricing cards
│   (Secondary CTA)            │   "Book & Pay"
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│       BLOG SECTION           │   3 article preview cards
│   (Engagement)               │   "Read More" links
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│      CONTACT SECTION         │   Form + WhatsApp + Email
│   (Final conversion point)    │   Multiple contact options
└──────────────────────────────┘
             ↓
        (User scrolls)
             ↓
┌──────────────────────────────┐
│       FOOTER                 │   Links, copyright
└──────────────────────────────┘
```

---

## 6. Mobile-Specific Flows

### Responsive Adjustments

**Hero Section (Mobile)**
- Full-width image
- Centered text
- Large, touchable CTA button
- Stack layout instead of side-by-side

**Navigation (Mobile)**
- Hamburger menu icon (top-right)
- Sticky mobile nav
- Click hamburger → sidebar menu slides in
- Menu items: About, Services, Testimonials, Booking, Contact

**Forms (Mobile)**
- Full-width input fields
- Large button targets (48px minimum)
- Keyboard appears on input focus
- Mobile number field shows numeric keyboard
- Email field shows email keyboard

**Cards (Mobile)**
- Stack vertically (1 column)
- Services: 1 card per row or 2-column grid
- Testimonials: 1 per view (swipeable carousel option)

---

## 7. Error Handling Flows

### Form Validation Errors

```
User enters invalid email
         │
         ↓
┌───────────────────────────────┐
│ Real-time validation          │
│ Shows error message:          │
│ "Please enter a valid email"  │
│ Error color: Soft red (#E74C3C)
│ Icon: Info/warning symbol     │
└───────────────────────────────┘
         │
         ↓
User corrects email
         │
         ↓
┌───────────────────────────────┐
│ Error disappears              │
│ Green checkmark appears ✓      │
│ Field valid                   │
└───────────────────────────────┘
```

### Booking Unavailability

```
User tries to book already taken slot
         │
         ↓
┌───────────────────────────────┐
│ Slot is grayed out            │
│ Hover shows: "This slot is    │
│ no longer available"          │
│ User cannot select it         │
└───────────────────────────────┘
         │
         ↓
User selects different time
         │
         ↓
Booking proceeds normally
```

---

## 8. Success Criteria for Each Flow

### Hero → About → Services → Booking
- ✓ Hero CTA click rate: >30%
- ✓ Scroll depth to booking section: >70% users
- ✓ Form completion rate: >70%
- ✓ Average time to booking: <4 minutes

### Information Seeker → Contact
- ✓ Contact section reach: >50% users
- ✓ Contact form submission: >20% of visitors
- ✓ WhatsApp clicks: >15%
- ✓ Email copy: >10%

### Mobile Quick Booking
- ✓ Mobile page load: <2 seconds
- ✓ Mobile form fill time: <3 minutes
- ✓ Mobile conversion rate: >12%
- ✓ Mobile bounce rate: <30%

---

## 9. Edge Cases & Alternative Flows

### Edge Case 1: User Wants to Modify Booking
```
After confirmation popup
User clicks "Save as Draft" instead of "Proceed to Payment"
→ Booking saved in localStorage
→ User can edit and resubmit later
→ "Resume Booking" button appears on hero CTA
```

### Edge Case 2: User Closes Payment Page
```
User is on Razorpay page
User closes tab/browser
→ Booking status: "Pending Payment"
→ Email with payment link sent
→ User can retry payment within 24 hours
```

### Edge Case 3: User on Very Slow Network
```
Page loads on 2G connection
→ Images load with blur-up effect
→ Skeleton loaders show content structure
→ Progressive enhancement approach
→ Essential content loads first
```

---

## Summary

This document maps the entire user journey from discovery to conversion, with detailed flows for each major section. Key metrics track success at each stage, and edge cases ensure robust user experience across all scenarios.
