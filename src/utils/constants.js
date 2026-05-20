export const APP_NAME    = 'TherapyConnect';
export const APP_TAGLINE = 'Your journey to healing begins with a single conversation.';

export const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM',
];

export const SESSION_TYPES = {
  IN_PERSON:  'In-Person',
  VIDEO_CALL: 'Video Call',
  PHONE:      'Phone Call',
};

export const BOOKING_STATUS = {
  CONFIRMED:  'confirmed',
  CANCELLED:  'cancelled',
  PENDING:    'pending',
  COMPLETED:  'completed',
};

export const NAV_LINKS = [
  { label: 'Home',         to: '/'               },
  { label: 'About',        to: '/#about'         },
  { label: 'Services',     to: '/#services'      },
  { label: 'Testimonials', to: '/#testimonials'  },
  { label: 'Pricing',      to: '/#pricing'       },
  { label: 'Blog',         to: '/#blog'          },
  { label: 'Contact',      to: '/#contact'       },
];
