const BASE_URL = 'https://therapyconnect.in';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'TherapyConnect — Charushri Suhaney',
  url: BASE_URL,
  logo: `${BASE_URL}/og-image.png`,
  description: 'Compassionate counselling for loneliness, emotional healing, and psychosomatic wellness in Bengaluru.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'charushri@therapyconnect.in',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.instagram.com/therapyconnect',
    'https://www.linkedin.com/in/charushri-suhaney',
  ],
  medicalSpecialty: 'Psychiatry',
};

export const therapistSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Charushri Suhaney',
  jobTitle: 'Counselling Psychologist & Holistic Healer',
  url: BASE_URL,
  image: `${BASE_URL}/therapist-photo.jpg`,
  worksFor: { '@type': 'Organization', name: 'TherapyConnect' },
  knowsAbout: [
    'Cognitive Behavioral Therapy',
    'Holistic Healing',
    'Psychosomatic Wellness',
    'Grief Counselling',
    'Emotional Healing',
    'Mindfulness',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bengaluru',
    addressCountry: 'IN',
  },
};

export const servicesSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Individual Therapy Session',
    provider: { '@type': 'Person', name: 'Charushri Suhaney' },
    description: 'One-on-one therapy sessions for emotional healing, anxiety, depression, and personal growth.',
    offers: { '@type': 'Offer', price: '1500', priceCurrency: 'INR' },
    areaServed: { '@type': 'City', name: 'Bengaluru' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Couples Therapy',
    provider: { '@type': 'Person', name: 'Charushri Suhaney' },
    description: 'Therapy for couples navigating conflict, communication challenges, and relationship healing.',
    offers: { '@type': 'Offer', price: '2000', priceCurrency: 'INR' },
  },
];

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

export const articleSchema = (post) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt || post.title,
  author: {
    '@type': 'Person',
    name: post.author || 'Charushri Suhaney',
  },
  publisher: {
    '@type': 'Organization',
    name: 'TherapyConnect',
    logo: { '@type': 'ImageObject', url: `${BASE_URL}/og-image.png` },
  },
  datePublished: post.published_at || post.created_at,
  dateModified:  post.updated_at   || post.created_at,
  image: post.cover_image || `${BASE_URL}/og-image.png`,
  url: `${BASE_URL}/blog/${post.slug}`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${post.slug}` },
});

export const reviewsSchema = (testimonials) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'TherapyConnect',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / (testimonials.length || 1)).toFixed(1),
    reviewCount: testimonials.length,
    bestRating: '5',
    worstRating: '1',
  },
  review: testimonials.slice(0, 5).map((t) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: t.client_name || 'Anonymous' },
    reviewBody: t.content,
    reviewRating: { '@type': 'Rating', ratingValue: t.rating || 5 },
  })),
});

export function injectStructuredData(schema) {
  const id = `sd-${Math.random().toString(36).slice(2)}`;
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(Array.isArray(schema) ? schema : [schema]);
  document.head.appendChild(script);
  return () => { const el = document.getElementById(id); if (el) el.remove(); };
}
