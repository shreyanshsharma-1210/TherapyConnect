import { supabase } from '@/lib/supabase';
import { query } from '@/lib/apiError';

export const blogRepository = {
  async getPublished({ limit = 20, category = null } = {}) {
    let q = supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image_url, category, tags, author_name, read_time, is_featured, published_at, views')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category) q = q.eq('category', category);
    return query(q);
  },

  async getFeatured() {
    return query(
      supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, cover_image_url, category, tags, author_name, read_time, published_at')
        .eq('status', 'published')
        .eq('is_featured', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .limit(3)
    );
  },

  async getBySlug(slug) {
    return query(
      supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
    );
  },

  async incrementView(slug) {
    await supabase.rpc('increment_blog_view', { post_slug: slug });
  },

  async getCategories() {
    return query(
      supabase
        .from('blog_posts')
        .select('category')
        .eq('status', 'published')
        .is('deleted_at', null)
    );
  },
};
