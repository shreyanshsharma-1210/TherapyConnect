import { useState, useEffect } from 'react';
import { testimonialService } from '@/services/testimonialService';
import { realtimeManager } from '@/lib/realtimeManager';

export function useTestimonials({ limit = 20, featuredOnly = false } = {}) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    // Realtime subscription for testimonials (approved only for public)
    const channel = realtimeManager.subscribe('testimonials', {
      filter: 'is_approved=eq.true',
      onInsert: (newTestimonial) => {
        if (featuredOnly && !newTestimonial.is_featured) return;
        setTestimonials((prev) => [newTestimonial, ...prev].slice(0, limit));
      },
      onUpdate: (updatedTestimonial) => {
        // If testimonial becomes unapproved, remove it
        if (!updatedTestimonial.is_approved) {
          setTestimonials((prev) => prev.filter((t) => t.id !== updatedTestimonial.id));
          return;
        }
        if (featuredOnly && !updatedTestimonial.is_featured) {
          setTestimonials((prev) => prev.filter((t) => t.id !== updatedTestimonial.id));
          return;
        }
        setTestimonials((prev) => prev.map((t) => t.id === updatedTestimonial.id ? updatedTestimonial : t));
      },
      onDelete: (deletedTestimonial) => {
        setTestimonials((prev) => prev.filter((t) => t.id !== deletedTestimonial.id));
      },
    });

    return () => {
      realtimeManager.unsubscribe(`realtime:testimonials:is_approved=eq.true`);
    };
  }, [limit, featuredOnly]);

  return { testimonials, loading, error };
}
