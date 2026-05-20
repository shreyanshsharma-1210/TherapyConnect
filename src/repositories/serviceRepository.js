import { supabase } from '@/lib/supabase';
import { query } from '@/lib/apiError';

export const serviceRepository = {
  async getAll() {
    return query(
      supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('display_order', { ascending: true })
    );
  },

  async getBySlug(slug) {
    return query(
      supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
    );
  },

  async getFeatured() {
    return query(
      supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .is('deleted_at', null)
        .order('display_order', { ascending: true })
    );
  },
};
