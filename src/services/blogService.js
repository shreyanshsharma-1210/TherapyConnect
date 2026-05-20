import { blogRepository } from '@/repositories/blogRepository';
import { friendlyError }  from '@/lib/apiError';

export const blogService = {
  async getPosts({ limit = 20, category = null } = {}) {
    try {
      const rows = await blogRepository.getPublished({ limit, category });
      return (rows || []).map(mapPost);
    } catch (err) {
      console.error('[blogService.getPosts]', friendlyError(err));
      return [];
    }
  },

  async getFeatured() {
    try {
      const rows = await blogRepository.getFeatured();
      return (rows || []).map(mapPost);
    } catch (err) {
      console.error('[blogService.getFeatured]', friendlyError(err));
      return [];
    }
  },

  async getPost(slug) {
    try {
      const row = await blogRepository.getBySlug(slug);
      if (row) {
        await blogRepository.incrementView(slug).catch(() => {});
        return mapPost(row);
      }
      return null;
    } catch (err) {
      console.error('[blogService.getPost]', friendlyError(err));
      return null;
    }
  },
};

function mapPost(row) {
  return {
    id:           row.id,
    slug:         row.slug,
    title:        row.title,
    excerpt:      row.excerpt,
    content:      row.content,
    coverImage:   row.cover_image_url,
    category:     row.category,
    tags:         row.tags || [],
    author:       row.author_name,
    readTime:     row.read_time,
    featured:     row.is_featured,
    publishedAt:  row.published_at,
    date:         row.published_at,
    views:        row.views,
  };
}
