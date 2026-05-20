import { describe, it, expect } from 'vitest';
import { organizationSchema, therapistSchema, articleSchema, faqSchema, reviewsSchema } from '@/lib/structuredData';

describe('structuredData', () => {
  it('organization schema has required fields', () => {
    expect(organizationSchema['@type']).toBe('MedicalBusiness');
    expect(organizationSchema.name).toBeTruthy();
    expect(organizationSchema.url).toBeTruthy();
  });

  it('therapist schema has correct type', () => {
    expect(therapistSchema['@type']).toBe('Person');
    expect(therapistSchema.name).toBe('Charushri Suhaney');
  });

  it('articleSchema generates correct structure', () => {
    const schema = articleSchema({
      title: 'Test Post',
      slug: 'test-post',
      created_at: '2025-01-01',
    });
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe('Test Post');
    expect(schema.url).toContain('test-post');
  });

  it('faqSchema generates FAQ entries', () => {
    const schema = faqSchema([{ q: 'What is therapy?', a: 'A process of healing.' }]);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0]['@type']).toBe('Question');
  });

  it('reviewsSchema calculates aggregate rating', () => {
    const schema = reviewsSchema([{ rating: 5, content: 'Great!' }, { rating: 4, content: 'Good.' }]);
    expect(schema.aggregateRating.ratingValue).toBe('4.5');
    expect(schema.aggregateRating.reviewCount).toBe(2);
  });
});
