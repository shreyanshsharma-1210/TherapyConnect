import { useState, useEffect, useCallback } from 'react';
import { blogService }         from '@/services/blogService';
import { realtimeManager }     from '@/lib/realtimeManager';
import { useInvalidation, keys } from '@/lib/invalidationManager';

const mapRaw = (row) => ({
  id:          row.id,
  slug:        row.slug,
  title:       row.title,
  excerpt:     row.excerpt,
  content:     row.content,
  coverImage:  row.cover_image_url,
  category:    row.category,
  tags:        row.tags || [],
  author:      row.author_name,
  readTime:    row.read_time,
  featured:    row.is_featured,
  publishedAt: row.published_at,
  date:        row.published_at,
  views:       row.views,
});

export function useBlogPosts({ limit = 20, category = null, featuredOnly = false } = {}) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    const fetch = featuredOnly
      ? blogService.getFeatured()
      : blogService.getPosts({ limit, category });

    fetch
      .then((data) => { setPosts(data); setError(null); })
      .catch((err) => { setError(err.message); setPosts([]); })
      .finally(() => setLoading(false));
  }, [limit, category, featuredOnly]);

  // Reconnect & cross-tab stale-state recovery
  useInvalidation(keys.BLOGS, refetch);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fetch = featuredOnly
      ? blogService.getFeatured()
      : blogService.getPosts({ limit, category });

    fetch
      .then((data) => { if (!cancelled) setPosts(data); setError(null); })
      .catch((err) => { if (!cancelled) setError(err.message); setPosts([]); })
      .finally(()  => { if (!cancelled) setLoading(false);     });

    // Realtime subscription for blog posts (published only)
    const channel = realtimeManager.subscribe('blog_posts', {
      filter: 'status=eq.published',
      onInsert: (newPost) => {
        const mapped = mapRaw(newPost);
        if (category && mapped.category !== category) return;
        if (featuredOnly && !mapped.featured) return;
        setPosts((prev) => [mapped, ...prev].slice(0, limit));
      },
      onUpdate: (updatedPost) => {
        // If status changed away from published, remove it
        if (updatedPost.status !== 'published' || updatedPost.deleted_at) {
          setPosts((prev) => prev.filter((p) => p.id !== updatedPost.id));
          return;
        }
        const mapped = mapRaw(updatedPost);
        if (category && mapped.category !== category) {
          setPosts((prev) => prev.filter((p) => p.id !== mapped.id));
          return;
        }
        if (featuredOnly && !mapped.featured) {
          setPosts((prev) => prev.filter((p) => p.id !== mapped.id));
          return;
        }
        setPosts((prev) => prev.map((p) => p.id === mapped.id ? mapped : p));
      },
      onDelete: (deletedPost) => {
        setPosts((prev) => prev.filter((p) => p.id !== deletedPost.id));
      },
    });

    return () => {
      cancelled = true;
      realtimeManager.unsubscribe(`realtime:blog_posts:status=eq.published`);
    };
  }, [limit, category, featuredOnly]);

  return { posts, loading, error };
}

export function useBlogPost(slug) {
  const [post,    setPost]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);

    blogService.getPost(slug)
      .then((data) => { if (!cancelled) setPost(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(()  => { if (!cancelled) setLoading(false);     });

    return () => { cancelled = true; };
  }, [slug]);

  return { post, loading, error };
}
