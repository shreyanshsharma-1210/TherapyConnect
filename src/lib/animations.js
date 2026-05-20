/* ============================================================
   TherapyConnect – Framer Motion Animation Presets
   ============================================================ */

// ── Transition Presets ──────────────────────────────────────
export const transitions = {
  smooth:  { duration: 0.6, ease: [0.25, 1, 0.5, 1] }, // Calmer, smoother ease-out
  snappy:  { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
  slow:    { duration: 1.0, ease: [0.25, 1, 0.5, 1] },
  spring:  { type: 'spring', stiffness: 200, damping: 35 }, // Softer spring
  springMedium: { type: 'spring', stiffness: 150, damping: 30 },
};

// ── Fade Up ─────────────────────────────────────────────────
export const fadeUp = {
  hidden:  { opacity: 0, y: 16 }, // Subtler movement
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
};

// ── Fade In ─────────────────────────────────────────────────
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.smooth },
};

// ── Fade Down ───────────────────────────────────────────────
export const fadeDown = {
  hidden:  { opacity: 0, y: -16 }, // Subtler movement
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
};

// ── Slide In from Left ──────────────────────────────────────
export const slideInLeft = {
  hidden:  { opacity: 0, x: -24 }, // Subtler movement
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
};

// ── Slide In from Right ─────────────────────────────────────
export const slideInRight = {
  hidden:  { opacity: 0, x: 24 }, // Subtler movement
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
};

// ── Scale In ────────────────────────────────────────────────
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.96 }, // Less scale difference
  visible: { opacity: 1, scale: 1, transition: transitions.spring },
};

// ── Stagger Container ───────────────────────────────────────
export const staggerContainer = (staggerChildren = 0.07, delayChildren = 0) => ({
  hidden:  {},
  visible: {
    transition: { staggerChildren, delayChildren, when: 'beforeChildren' },
  },
});

// ── Stagger Item (use as child inside staggerContainer) ─────
export const staggerItem = {
  hidden:  { opacity: 0, y: 12 }, // Subtler movement
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
};

// ── Card Hover ──────────────────────────────────────────────
export const cardHover = {
  rest:  { y: 0 },
  hover: {
    y: -4, // Subtler lift
    transition: transitions.smooth,
  },
};

// ── Button Hover Scale ──────────────────────────────────────
export const buttonHover = {
  rest:  { scale: 1 },
  hover: { scale: 1.01, transition: transitions.snappy }, // Very subtle scale
  tap:   { scale: 0.98 },
};

// ── Page Transition ─────────────────────────────────────────
export const pageTransition = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } },
  exit:    { opacity: 0, y: -3, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

// ── Smooth Reveal (scroll-triggered, use with whileInView) ──
export const smoothReveal = {
  initial:     { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-50px' },
  transition:  transitions.smooth,
};

// ── Navbar Slide ────────────────────────────────────────────
export const navbarSlide = {
  hidden:  { y: -80, opacity: 0 },
  visible: { y: 0,   opacity: 1, transition: transitions.smooth },
};

// ── Mobile Drawer ───────────────────────────────────────────
export const drawerSlide = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0,      opacity: 1, transition: transitions.smooth },
  exit:    { x: '100%', opacity: 0, transition: transitions.snappy },
};

// ── Overlay Fade ────────────────────────────────────────────
export const overlayFade = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};
