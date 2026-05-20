import { testimonialRepository } from '@/repositories/testimonialRepository';
import { friendlyError }         from '@/lib/apiError';

export const testimonialService = {
  async getAll() {
    try {
      const rows = await testimonialRepository.getApproved();
      return (rows || []).map(mapTestimonial);
    } catch (err) {
      console.error('[testimonialService.getAll]', friendlyError(err));
      return [];
    }
  },

  async getFeatured() {
    try {
      const rows = await testimonialRepository.getFeatured();
      return (rows || []).map(mapTestimonial);
    } catch (err) {
      console.error('[testimonialService.getFeatured]', friendlyError(err));
      return [];
    }
  },
};

function mapTestimonial(row) {
  return {
    id:           row.id,
    name:         row.author_name,
    role:         row.author_role,
    avatar:       row.author_avatar,
    quote:        row.content,
    content:      row.content,
    rating:       row.rating,
    featured:     row.is_featured,
    verified:     row.is_approved,
    serviceTitle: row.service_title,
  };
}
