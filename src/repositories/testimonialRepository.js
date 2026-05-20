import { supabase } from '@/lib/supabase';
import { query } from '@/lib/apiError';

export const testimonialRepository = {
  async getApproved() {
    return query(
      supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .eq('is_visible', true)
        .is('deleted_at', null)
        .order('display_order', { ascending: true })
    );
  },

  async getFeatured() {
    return query(
      supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .eq('is_visible', true)
        .eq('is_featured', true)
        .is('deleted_at', null)
        .order('display_order', { ascending: true })
    );
  },
};
