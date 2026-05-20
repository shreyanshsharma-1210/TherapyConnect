# Technical Stack & Architecture
## TherapyConnect - Therapist Booking Platform

**Stack Philosophy:** Modern, lightweight, free/open-source tools. Focus on performance, maintainability, and scalability.

---

## 1. Tech Stack Overview

### Frontend

| Layer | Technology | Version | Why Chosen |
|-------|-----------|---------|-----------|
| **Framework** | React.js | 18.x | Fast, component-based, huge ecosystem |
| **Styling** | Tailwind CSS | 3.x | Utility-first, responsive, small bundle |
| **Bundler** | Vite | 4.x | Lightning-fast builds, ES modules |
| **Forms** | React Hook Form | 7.x | Lightweight, performant form handling |
| **Validation** | Zod | 3.x | TypeScript-native validation |
| **Calendar** | React Big Calendar | Latest | Open-source calendar component |
| **UI Components** | shadcn/ui | Latest | Headless, customizable, beautiful |
| **Icons** | Lucide React | Latest | Lightweight, consistent icons |
| **Animations** | Framer Motion | Latest | Smooth, performant animations |
| **State Management** | Context API | Native | Built-in React, sufficient for MVP |
| **HTTP Client** | Fetch API | Native | No dependencies needed |
| **Storage** | localStorage | Native | Client-side persistence for MVP |

### Backend (Optional for MVP)

| Component | Solution | Purpose |
|-----------|----------|---------|
| **Mock API** | MSW (Mock Service Worker) | Simulate backend endpoints |
| **Forms** | Formspree or Email.js | Send contact/booking emails |
| **Payments** | Razorpay Test Mode | Payment processing (test) |
| **Hosting** | Vercel | Free, fast, automatic deployments |

### DevOps & Tools

| Tool | Purpose |
|------|---------|
| Git + GitHub | Version control |
| Prettier | Code formatting |
| ESLint | Code quality |
| Lighthouse | Performance audits |
| Figma | Design tool |
| VS Code | Development environment |

---

## 2. Project Structure

```
therapy-booking-app/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Testimonials.jsx
│   │   ├── BookingCalendar.jsx
│   │   ├── BookingForm.jsx
│   │   ├── Pricing.jsx
│   │   ├── Blog.jsx
│   │   ├── Contact.jsx
│   │   ├── Navigation.jsx
│   │   ├── Footer.jsx
│   │   └── ui/ (shadcn components)
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Success.jsx
│   │   └── NotFound.jsx
│   ├── hooks/
│   │   ├── useBooking.js
│   │   ├── useScroll.js
│   │   └── useMediaQuery.js
│   ├── context/
│   │   └── BookingContext.jsx
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   ├── constants.js
│   │   └── mockData.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── mocks/
│   │   └── handlers.js (MSW handlers)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── vite.config.js
├── tailwind.config.js
├── package.json
├── README.md
└── ARCHITECTURE.md
```

---

## 3. Technology Justification

### Why React.js?
✅ Component reusability
✅ Large ecosystem
✅ Easy to learn and scale
✅ Great developer experience
✅ Fast rendering with virtual DOM

### Why Tailwind CSS?
✅ No CSS file bloat
✅ Responsive utilities built-in
✅ Design system consistency
✅ Small final bundle size
✅ Easy to customize

### Why Vite?
✅ 10-100x faster cold starts
✅ Instant module replacement (HMR)
✅ Native ES modules
✅ Optimized for modern browsers
✅ Minimal configuration

### Why Vercel for Hosting?
✅ Free tier is generous
✅ Automatic deployments on git push
✅ Serverless functions (future backend)
✅ Built-in analytics
✅ Perfect for React apps

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│               PRESENTATION LAYER                     │
│  (React Components + Tailwind CSS + Framer Motion)  │
└────┬────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                    │
│  (Context API, Custom Hooks, Validation Logic)      │
└────┬────────────────────────────────────────────────┘
     │
┌────▼────────────────────────────────────────────────┐
│               DATA LAYER (CLIENT-SIDE)               │
│  (localStorage, MSW Mock API, Fetch API)            │
└────┬────────────────────────────────────────────────┘
     │
     ├──► localStorage (Booking data persistence)
     ├──► MSW Mock API (Simulated endpoints)
     ├──► Razorpay Test Mode (Payment simulation)
     ├──► Email.js (Email service)
     └──► External APIs (Formspree for forms)
```

---

## 5. Component Architecture

### Component Hierarchy

```
<App />
├── <Navigation />
│   └── <MobileMenu /> (conditional)
├── <Hero />
│   └── <BookingModal /> (conditional)
├── <About />
├── <Services />
│   └── <ServiceCard /> (× 6)
├── <Testimonials />
│   └── <TestimonialCard /> (× 3)
├── <BookingSection />
│   ├── <Calendar />
│   └── <BookingForm />
├── <Pricing />
│   └── <PricingCard /> (× 3)
├── <Blog />
│   └── <BlogCard /> (× 3)
├── <Contact />
│   └── <ContactForm />
└── <Footer />
```

### Smart vs Presentational Components

**Smart Components (with Logic):**
- `BookingSection` - Manages calendar & form state
- `Navigation` - Handles mobile menu toggle
- `ContactForm` - Handles form submission

**Presentational Components (Pure):**
- `Hero` - Just displays content
- `ServiceCard` - Renders service information
- `TestimonialCard` - Displays testimonial
- `BlogCard` - Shows blog preview

---

## 6. State Management Strategy

### Context Structure

```javascript
// BookingContext.jsx
const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: ''
  });
  const [bookings, setBookings] = useState(
    JSON.parse(localStorage.getItem('bookings')) || []
  );

  const addBooking = (booking) => {
    const updated = [...bookings, booking];
    setBookings(updated);
    localStorage.setItem('bookings', JSON.stringify(updated));
  };

  return (
    <BookingContext.Provider value={{
      selectedDate,
      setSelectedDate,
      selectedTime,
      setSelectedTime,
      bookingFormData,
      setBookingFormData,
      bookings,
      addBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};
```

### Local Storage Schema

```javascript
// bookings.json (stored in localStorage)
{
  "bookings": [
    {
      "id": "booking-001",
      "name": "Priya Sharma",
      "email": "priya@email.com",
      "phone": "9812345678",
      "reason": "Anxiety management",
      "date": "2026-05-15",
      "time": "16:00",
      "status": "confirmed",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

---

## 7. API Integration Plan

### MSW (Mock Service Worker) Setup

```javascript
// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Get available slots
  http.get('/api/availability/:date', ({ params }) => {
    return HttpResponse.json({
      date: params.date,
      slots: ['10:00', '14:00', '16:00', '18:00']
    });
  }),

  // Create booking
  http.post('/api/bookings', async ({ request }) => {
    const booking = await request.json();
    return HttpResponse.json(
      { id: 'booking-001', ...booking },
      { status: 201 }
    );
  }),

  // Send email
  http.post('/api/send-email', async ({ request }) => {
    const email = await request.json();
    return HttpResponse.json(
      { success: true, message: 'Email sent' }
    );
  })
];
```

### Future Backend Integration Points

```javascript
// Phase 2: Real API endpoints
const API_BASE = process.env.VITE_API_URL;

// Get therapist profile
export const getTherapistProfile = async () => {
  const res = await fetch(`${API_BASE}/therapist`);
  return res.json();
};

// Get available time slots
export const getAvailability = async (date) => {
  const res = await fetch(`${API_BASE}/availability?date=${date}`);
  return res.json();
};

// Create booking
export const createBooking = async (bookingData) => {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return res.json();
};

// Process payment
export const processPayment = async (paymentData) => {
  const res = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return res.json();
};
```

---

## 8. Form Handling & Validation

### React Hook Form + Zod Pattern

```javascript
// bookingSchema.js
import { z } from 'zod';

export const bookingSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  
  reason: z.string()
    .min(10, 'Please describe your reason (min 10 chars)')
    .max(500, 'Maximum 500 characters'),

  date: z.string()
    .refine(val => new Date(val) > new Date(), 'Date must be in future'),

  time: z.string()
    .min(1, 'Please select a time slot')
});

// BookingForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const BookingForm = () => {
  const { register, handleSubmit, formState: { errors }, watch } = 
    useForm({
      resolver: zodResolver(bookingSchema),
      mode: 'onChange'
    });

  const onSubmit = async (data) => {
    try {
      // Submit form
      await createBooking(data);
      // Show success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Full Name *</label>
        <input
          id="name"
          {...register('name')}
          placeholder="John Doe"
        />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>

      {/* More fields... */}

      <button type="submit">Book Now</button>
    </form>
  );
};
```

---

## 9. Payment Integration

### Razorpay Test Mode

```javascript
// utils/payment.js
import { Razorpay } from 'razorpay';

export const initiatePayment = async (bookingData) => {
  // Step 1: Create order on backend (Phase 2)
  const orderResponse = await fetch('/api/create-order', {
    method: 'POST',
    body: JSON.stringify({
      amount: bookingData.amount * 100, // Convert to paise
      currency: 'INR'
    })
  });

  const order = await orderResponse.json();

  // Step 2: Open Razorpay modal
  const options = {
    key: process.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: 'INR',
    name: 'TherapyConnect',
    description: `Therapy Session - ${bookingData.date}`,
    order_id: order.id,
    handler: async (response) => {
      // Verify payment
      await verifyPayment(response);
      // Show success
    },
    prefill: {
      name: bookingData.name,
      email: bookingData.email,
      contact: bookingData.phone
    },
    theme: {
      color: '#0D7C7D'
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

### Test Mode Credentials
```
Key ID: rzp_test_XXXXXXXXX
Secret: XXXXXXXXXXXXX

Test Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
OTP: 123456 (if prompted)
```

---

## 10. Email Integration

### Option 1: Email.js (Client-side, Free)

```javascript
// src/utils/emailjs.js
import emailjs from '@emailjs/browser';

emailjs.init(process.env.VITE_EMAILJS_PUBLIC_KEY);

export const sendBookingConfirmation = async (bookingData) => {
  return emailjs.send('service_xyz', 'template_xyz', {
    to_email: bookingData.email,
    to_name: bookingData.name,
    therapist_name: 'Charushri Suhaney',
    booking_date: bookingData.date,
    booking_time: bookingData.time,
    booking_id: bookingData.id
  });
};

export const sendContactEmail = async (contactData) => {
  return emailjs.send('service_xyz', 'template_contact', {
    from_email: contactData.email,
    from_name: contactData.name,
    message: contactData.message,
    therapist_email: 'therapist@example.com'
  });
};
```

### Option 2: Formspree (Form endpoints, Free)

```html
<!-- HTML form integration -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <input type="email" name="email" required>
  <input type="text" name="message" required>
  <button type="submit">Send</button>
</form>
```

---

## 11. Performance Optimization

### Bundle Size Targets

```
Lighthouse Scores Target:
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >95

Bundle Size:
- HTML: <50KB
- CSS: <50KB (with Tailwind)
- JS: <150KB (production build)
- Images: <200KB (optimized)
- Total: <450KB (gzipped)
```

### Code Splitting Strategy

```javascript
// src/App.jsx
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Success = lazy(() => import('./pages/Success'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Suspense>
  );
}
```

### Image Optimization

```javascript
// Use responsive images with srcset
<img
  src="hero.jpg"
  srcSet="
    hero-small.jpg 640w,
    hero-medium.jpg 1024w,
    hero-large.jpg 1440w
  "
  alt="Therapist office"
/>

// Or use modern formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Hero image" />
</picture>
```

---

## 12. Security Considerations

### Environment Variables

```
# .env.local (never commit)
VITE_API_URL=https://api.therapyconnect.com
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
VITE_EMAILJS_PUBLIC_KEY=xxx
VITE_EMAILJS_SERVICE_ID=service_xxx
```

### Input Validation

```javascript
// All forms validated with Zod schema
// XSS prevention through React's automatic escaping
// CSRF protection for future backend

// Sanitize HTML if needed
import DOMPurify from 'dompurify';

const cleanHTML = DOMPurify.sanitize(userInput);
```

### Data Privacy

```javascript
// Don't store sensitive data in localStorage
// Never expose API keys in frontend code
// Use HTTPS only in production
// Implement CSP headers on server
```

---

## 13. Development Workflow

### Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/yourname/therapy-booking.git
cd therapy-booking

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### Build & Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to Vercel (one-click if using GitHub)
npm install -g vercel
vercel
```

---

## 14. Testing Strategy

### Unit Testing (Jest + Vitest)

```bash
npm install -D vitest
```

```javascript
// __tests__/validation.test.js
import { describe, it, expect } from 'vitest';
import { bookingSchema } from '@/utils/validation';

describe('Booking Validation', () => {
  it('validates correct booking data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9039705759',
      reason: 'Need anxiety management',
      date: '2026-06-01',
      time: '16:00'
    };
    expect(() => bookingSchema.parse(data)).not.toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => bookingSchema.parse({ email: 'invalid' })).toThrow();
  });
});
```

### E2E Testing (Cypress)

```bash
npm install -D cypress
npx cypress open
```

```javascript
// cypress/e2e/booking.cy.js
describe('Booking Flow', () => {
  it('completes full booking flow', () => {
    cy.visit('/');
    cy.contains('Book a Session').click();
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="email"]').type('john@example.com');
    // ... more steps
    cy.contains('Book Now').click();
    cy.contains('Booking Confirmed!').should('be.visible');
  });
});
```

---

## 15. Monitoring & Analytics

### Google Analytics

```javascript
// src/utils/analytics.js
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');

// Track page views
export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track events
export const trackBookingSubmitted = () => {
  ReactGA.event({
    category: 'booking',
    action: 'form_submitted'
  });
};
```

### Error Tracking (Sentry)

```javascript
// src/main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

---

## 16. Deployment Checklist

- [ ] All environment variables configured
- [ ] Build passes without errors
- [ ] Bundle size analyzed and optimized
- [ ] Lighthouse scores >90
- [ ] All tests passing
- [ ] Accessibility audit passed (a11y)
- [ ] SEO meta tags configured
- [ ] SSL certificate active
- [ ] Analytics tracking working
- [ ] Error monitoring active
- [ ] Backup/disaster recovery plan in place
- [ ] Performance monitoring active

---

## 17. Future Tech Stack Additions

### When to Add
**Phase 2 (Backend):**
- Node.js + Express for API
- PostgreSQL for database
- JWT for authentication
- Redis for caching

**Phase 3 (Advanced Features):**
- WebSockets for real-time notifications
- Video SDK (Jitsi / Twilio) for consultations
- Stripe for payment processing
- SendGrid for email automation

**Phase 4 (Scale):**
- Docker containerization
- Kubernetes orchestration
- GraphQL instead of REST
- ElasticSearch for advanced search

---

## Summary

**This stack is:**
✅ **Free** - No paid dependencies required for MVP
✅ **Fast** - Optimized for performance
✅ **Scalable** - Easy to add backend later
✅ **Maintainable** - Clean, modern code patterns
✅ **Developer-Friendly** - Great DX with Vite + React
✅ **Production-Ready** - Used by thousands of companies

**Time to MVP:** 4-6 weeks with 1-2 developers
