# Project Quick Reference Guide
## TherapyConnect - Therapist Booking Platform

---

## 📋 Document Index

This PRD package includes the following documents:

1. **01_PRD_Therapist_Booking_Website.md** (Main PRD)
   - Executive summary, vision, problem statement
   - Detailed section specifications
   - Design system colors, typography, spacing
   - Functional requirements and success criteria

2. **02_User_Flows_and_Journeys.md**
   - User personas
   - Complete user journey maps
   - Page-by-page flows with diagrams
   - Mobile-specific flows
   - Edge cases and error handling

3. **03_UI_UX_Design_System.md**
   - Design philosophy and principles
   - Complete color system with hex codes
   - Typography with font stack
   - Component specifications (Button, Input, Card, Modal, etc.)
   - Animation guidelines
   - Responsive design breakpoints
   - Accessibility guidelines
   - Icon system
   - Dark mode considerations

4. **04_Technical_Stack_Architecture.md**
   - Technology selection and justification
   - Project structure and folder organization
   - Component architecture
   - State management strategy
   - API integration patterns
   - Form handling with React Hook Form + Zod
   - Payment integration with Razorpay
   - Email integration options
   - Performance optimization targets
   - Security considerations
   - Testing strategy
   - Deployment checklist

5. **05_Implementation_Plan_Phases.md**
   - Detailed phase-by-phase breakdown
   - Week-by-week timeline
   - Task lists for each phase
   - Time estimates for each task
   - Team requirements
   - Success metrics for each phase
   - Risk mitigation strategies
   - Post-MVP roadmap

---

## 🎯 Project Overview

**Project Name:** TherapyConnect  
**Type:** Therapist Online Booking Website  
**Duration:** 8-10 weeks for MVP  
**Team Size:** 2-3 developers  
**Budget:** Free (open-source tools only)  
**Launch Date:** Early July 2026

### Key Features (MVP)
✅ Professional hero section with CTA  
✅ About & credentials section  
✅ Services showcase (6 cards)  
✅ Social proof (testimonials)  
✅ Interactive booking calendar  
✅ Appointment booking form  
✅ Simple pricing display  
✅ Blog preview (3 articles)  
✅ Contact form + WhatsApp integration  
✅ Responsive mobile design  
✅ Payment integration (test mode)  
✅ Email confirmations  

### Not Included (Phase 2+)
❌ User authentication  
❌ Client dashboard  
❌ Real database  
❌ Video consultations  
❌ Admin panel  

---

## 🏗️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | React 18.x |
| Build Tool | Vite 4.x |
| Styling | Tailwind CSS 3.x |
| Forms | React Hook Form + Zod |
| Calendar | React Big Calendar |
| Components | shadcn/ui |
| Icons | Lucide React |
| Animations | Framer Motion |
| State | Context API |
| Storage | localStorage |
| Hosting | Vercel (free) |
| Email | Email.js or Formspree |
| Payments | Razorpay (test mode) |

**Cost:** $0 (all free/open-source)

---

## 📐 Design System Quick Reference

### Colors
```
Primary (Trust):      #0D7C7D (Teal)
Secondary (Warmth):   #F5E6D3 (Cream)
Accent (Action):      #E8726E (Coral)
Text (Dark):          #2D3436 (Slate)
Background:           #F8F9FA (Off-white)
Success:              #27AE60 (Green)
Error:                #E74C3C (Red)
```

### Typography
```
Headings:    Playfair Display (serif, 700 weight)
Body Text:   Plus Jakarta Sans (sans-serif, 400/500/600/700)
Sizes:       H1: 48px | H2: 36px | H3: 24px | Body: 16px
Line Height: 1.2-1.6 depending on context
```

### Spacing (8px base unit)
```
xs: 4px    | sm: 8px   | md: 16px  | lg: 24px
xl: 32px   | xxl: 48px | xxxl: 64px
```

### Components
- **Button:** 48px min height, 8px radius, 6px shadow on hover
- **Input:** 44px min height, 4px radius, teal focus state
- **Card:** 8px radius, Level 1 shadow, hover → Level 2 shadow
- **Modal:** 500px width (mobile: 90vw), 12px radius, Level 3 shadow

---

## 📊 Project Structure

```
therapy-app/
├── src/
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Services.jsx
│   │   ├── Testimonials.jsx
│   │   ├── BookingCalendar.jsx
│   │   ├── BookingForm.jsx
│   │   ├── BookingSection.jsx
│   │   ├── Pricing.jsx
│   │   ├── Blog.jsx
│   │   ├── Contact.jsx
│   │   ├── Navigation.jsx
│   │   ├── Footer.jsx
│   │   └── ui/ (shadcn components)
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Success.jsx
│   ├── hooks/ (custom hooks)
│   ├── context/ (BookingContext)
│   ├── utils/ (validation, formatting, etc.)
│   ├── data/ (mockData.js)
│   └── App.jsx
├── public/ (images, icons)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

---

## 🚀 Quick Start Commands

```bash
# Setup
npm create vite@latest therapy-app -- --template react
cd therapy-app
npm install
cp .env.example .env.local

# Development
npm run dev
# Opens http://localhost:5173

# Build
npm run build

# Preview production build
npm run preview

# Deploy
vercel --prod
```

---

## 📱 Responsive Breakpoints

| Device | Breakpoint | Layout |
|--------|-----------|--------|
| Mobile | <768px | 1 column, hamburger menu |
| Tablet | 768px-1024px | 2 columns, horizontal nav |
| Desktop | >1024px | 3 columns, full nav |

### Critical Breakpoints
```css
@media (max-width: 767px) { /* Mobile */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

---

## 🎬 Key User Flows

### Flow 1: Discover → Book → Pay
```
1. Land on Hero
2. Scroll through About/Services/Testimonials
3. Reach Booking Section
4. Select date → Select time → Fill form
5. Submit → Confirmation popup
6. Click "Pay" → Razorpay modal
7. Complete payment → Success page
```
**Expected completion time:** 4-5 minutes

### Flow 2: Uncertain → Contact
```
1. Land on Hero
2. Read About + Blog articles
3. Build trust
4. Scroll to Contact
5. Send message via form or WhatsApp
6. Receive response from therapist
```
**Expected completion time:** 3-4 minutes

### Flow 3: Mobile Quick Booking
```
1. Click ad → Land on hero (mobile)
2. Tap "Book a Session"
3. Auto-fill name/email
4. Select date (touch-friendly)
5. Select time (pill buttons)
6. Fill form (large inputs, 16px font)
7. Submit → Confirm
8. Tap "Pay" → Complete payment
```
**Expected completion time:** 3-4 minutes

---

## ✅ Definition of Done (Each Phase)

### Phase 1 Done
- [ ] All UI components built and documented
- [ ] Design system matches Figma 100%
- [ ] No TypeScript/ESLint errors
- [ ] Component storybook ready (optional)
- [ ] All tests passing

### Phase 2 Done
- [ ] All 8 sections built and responsive
- [ ] Lighthouse score >90
- [ ] Mobile usability tested
- [ ] Images optimized
- [ ] Cross-browser tested

### Phase 3 Done
- [ ] Booking flow end-to-end
- [ ] All forms validate correctly
- [ ] Data persists in localStorage
- [ ] Confirmation modal shows correct details
- [ ] Zero console errors

### Phase 4 Done
- [ ] Email confirmations sending
- [ ] Payment test mode working
- [ ] Error handling in place
- [ ] User receives email confirmation
- [ ] Therapist receives booking notification

### Phase 5 Done
- [ ] Zero critical bugs
- [ ] Performance optimized
- [ ] Accessibility verified (WCAG AA)
- [ ] User testing feedback incorporated
- [ ] Security audit passed

### Phase 6 Done
- [ ] Deployed to production
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Team trained
- [ ] Launch successful

---

## 📈 Success Metrics

### Business Metrics
- Booking form completion: >70%
- CTA click-through rate: >30%
- Page bounce rate: <40%
- Average session duration: >3 minutes

### Technical Metrics
- Page load time: <2 seconds
- Lighthouse performance: >90
- Mobile usability: >95
- Accessibility score: >95
- Bundle size: <450KB gzipped

### User Experience
- Form error rate: <5%
- Mobile usability issues: 0
- Accessibility violations: 0
- Browser compatibility issues: 0

---

## 🔑 Key Design Decisions

### Why Tailwind + React?
✅ Fast development  
✅ Small bundle size  
✅ No CSS bloat  
✅ Utility-first scalable  

### Why Vite?
✅ 10x faster dev server  
✅ Instant HMR  
✅ Optimized production builds  

### Why Context API?
✅ No external dependencies  
✅ Sufficient for MVP  
✅ Easy to migrate to Redux later  

### Why localStorage?
✅ No backend needed  
✅ Works immediately  
✅ Easy migration path to database  

### Why Vercel?
✅ Free generous tier  
✅ Automatic git deployments  
✅ Serverless functions for backend  
✅ Excellent React support  

---

## 🛡️ Security Checklist

- [ ] HTTPS enforced (Vercel auto)
- [ ] No API keys in frontend code
- [ ] Input validation on all forms
- [ ] XSS protection (React auto-escapes)
- [ ] CSRF tokens for forms (if backend)
- [ ] No sensitive data in localStorage
- [ ] Environment variables not committed
- [ ] Dependencies kept up-to-date
- [ ] Security headers configured
- [ ] Regular security audits planned

---

## 📋 Form Validations

### Booking Form
```
Name:     Min 2 chars, max 50 chars
Email:    Valid email format
Phone:    Exactly 10 digits (India format)
Reason:   Min 10 chars, max 500 chars
Date:     Must be future date
Time:     Must be selected, not booked
```

### Contact Form
```
Name:     Min 2 chars, max 50 chars
Email:    Valid email format
Message:  Min 20 chars, max 1000 chars
```

### All Forms
```
✓ Real-time validation with error messages
✓ Visual error indicators (red border + text)
✓ Success indicators (green checkmark)
✓ Submit button disabled while invalid
✓ Loading state during submission
```

---

## 🎨 Animation Guidelines

### Page Load
- Hero: Fade-in 0.8s ease-out
- Cards: Staggered fade-in, 0.1s delay each
- Images: Blur-up effect on load

### Interactions
- Button hover: Shadow + scale
- Card hover: Lift + shadow
- Input focus: Teal ring + scale
- Link hover: Underline animation

### Scroll
- Parallax background
- Fade-in on scroll
- Stagger animations for lists

### Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] All form validations work
- [ ] Booking flow complete
- [ ] Payment test mode works
- [ ] Email confirmations send
- [ ] Success page displays correctly

### Responsive Testing
- [ ] Mobile: 375px, 768px
- [ ] Tablet: 768px, 1024px
- [ ] Desktop: 1024px, 1440px

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast >4.5:1
- [ ] Focus indicators visible
- [ ] WCAG 2.1 AA compliant

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Performance Testing
- [ ] Lighthouse >90
- [ ] Load time <2s
- [ ] No layout shifts
- [ ] No console errors

---

## 🚨 Common Issues & Solutions

### Issue: Images loading slowly
**Solution:** Compress with WebP, lazy load below fold, CDN

### Issue: Form not validating
**Solution:** Check Zod schema, verify React Hook Form integration

### Issue: Mobile menu not closing
**Solution:** Add click handler to close on link click

### Issue: Email not sending
**Solution:** Check Email.js credentials, verify template ID

### Issue: Payment modal not opening
**Solution:** Verify Razorpay key, check test mode credentials

### Issue: Booking not saving
**Solution:** Check localStorage quota, verify JSON serialization

### Issue: Layout shift when images load
**Solution:** Set image dimensions, use aspect-ratio CSS

### Issue: Slow page load
**Solution:** Run Lighthouse, check bundle size, profile with DevTools

---

## 📞 Support & Resources

### Documentation Links
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- shadcn/ui: https://ui.shadcn.com

### Free Tools
- Figma: https://figma.com (free tier)
- GitHub: https://github.com (free tier)
- Vercel: https://vercel.com (free tier)
- Email.js: https://emailjs.com (free tier)
- Razorpay Test: https://razorpay.com (test mode free)

### Learning Resources
- React Docs: https://react.dev
- Tailwind Course: https://tailwindcss.com/docs
- Web.dev: https://web.dev (performance tips)
- MDN Web Docs: https://mdn.org (reference)

---

## 📞 Contact & Questions

For questions about this PRD:
- Review the detailed documents in order
- Check the specific phase implementation plan
- Refer to the design system for UI details
- Check technical stack document for architecture

---

## 📝 Document Versions

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 2026 | Initial PRD package |
| 1.1 | TBD | Updates after Phase 1 |
| 2.0 | TBD | Phase 2 features |

---

## 🎓 For New Team Members

### Day 1 Onboarding
1. Read this Quick Reference (30 min)
2. Read main PRD (01_PRD) (1 hour)
3. Review design system (03_UI_UX) (1 hour)
4. Setup development environment (1 hour)
5. Do first code commit (small task)

### Week 1 Goals
- [ ] Understand project vision and goals
- [ ] Know the tech stack and why each tool
- [ ] Be able to set up environment independently
- [ ] Make first meaningful code contribution

### Month 1 Goals
- [ ] Complete assigned phase
- [ ] Contribute to architecture decisions
- [ ] Mentor other team members
- [ ] Write documentation updates

---

## ✨ Next Steps

### Immediate (This Week)
1. [ ] Share this PRD package with team
2. [ ] Schedule kickoff meeting
3. [ ] Answer team questions
4. [ ] Begin Phase 0 setup

### Week 2-3
- [ ] Start Phase 1 (Design System)
- [ ] Setup GitHub repo
- [ ] Configure development environment
- [ ] Create component library

### Week 4-5
- [ ] Start Phase 2 (Static Pages)
- [ ] Begin building sections
- [ ] Daily standups
- [ ] Code reviews

### Week 6-10
- [ ] Phases 3-6 execution
- [ ] Testing and optimization
- [ ] Launch preparation
- [ ] Production deployment

---

## 📄 License & Attribution

This PRD package was created as a comprehensive guide for building TherapyConnect - Therapist Online Booking Platform.

**Created:** May 2026  
**Last Updated:** May 2026  
**Version:** 1.0  
**Status:** Ready for Implementation  

---

## 🎯 Final Checklist Before Starting

- [ ] All team members have read the PRD
- [ ] GitHub repository created
- [ ] Development environment setup document reviewed
- [ ] Design files (Figma) accessible to team
- [ ] Tech stack tools installed
- [ ] Project board created (GitHub Projects or Jira)
- [ ] Communication channel established (Slack/Discord)
- [ ] Standup schedule agreed (daily 15 min)
- [ ] Sprint planning scheduled (weekly)
- [ ] Deployment process documented

---

**Ready to build amazing things? Let's go! 🚀**
