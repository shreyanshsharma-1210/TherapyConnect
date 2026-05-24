import { useState, useEffect, useCallback } from 'react';
import { testimonialService } from '@/services/testimonialService';
import { realtimeManager } from '@/lib/realtimeManager';
import { useInvalidation, keys } from '@/lib/invalidationManager';

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
    verified:     row.is_verified,
    sourceType:   row.source_type,
    serviceTitle: row.service_title,
  };
}

export function useTestimonials({ limit = 20, featuredOnly = false } = {}) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    const fetch = featuredOnly
      ? testimonialService.getFeatured()
      : testimonialService.getAll();

    fetch
      .then((data) => {
        setTestimonials(data);
        setError(null);
      })
      .catch((err) => {
        console.error('[useTestimonials] Failed to load testimonials:', err);
        setError(err.message);
        setTestimonials([]);
      })
      .finally(() => setLoading(false));
  }, [featuredOnly]);

  // Reconnect & cross-tab stale-state recovery
  useInvalidation(keys.TESTIMONIALS, refetch);

  useEffect(() => {
    refetch();

    // Realtime subscription for testimonials (approved only for public)
    const channel = realtimeManager.subscribe('testimonials', {
      filter: 'is_approved=eq.true',
      onInsert: (newTestimonial) => {
        if (featuredOnly && !newTestimonial.is_featured) return;
        const mapped = mapTestimonial(newTestimonial);
        setTestimonials((prev) => [mapped, ...prev].slice(0, limit));
      },
      onUpdate: (updatedTestimonial) => {
        const mapped = mapTestimonial(updatedTestimonial);
        // If testimonial becomes unapproved, remove it
        if (!updatedTestimonial.is_approved || (featuredOnly && !updatedTestimonial.is_featured)) {
          setTestimonials((prev) => prev.filter((t) => t.id !== updatedTestimonial.id));
          return;
        }
        setTestimonials((prev) => {
          const exists = prev.some((t) => t.id === updatedTestimonial.id);
          if (exists) {
            return prev.map((t) => t.id === updatedTestimonial.id ? mapped : t);
          } else {
            return [mapped, ...prev].slice(0, limit);
          }
        });
      },
      onDelete: (deletedTestimonial) => {
        setTestimonials((prev) => prev.filter((t) => t.id !== deletedTestimonial.id));
      },
    });

    return () => {
      realtimeManager.unsubscribe(`realtime:testimonials:is_approved=eq.true`);
    };
  }, [limit, featuredOnly, refetch]);

  return { testimonials, loading, error };
}

