import { useState, useEffect } from 'react';
import { serviceRepository } from '@/repositories/serviceRepository';

export function useServices({ featuredOnly = false } = {}) {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetch = featuredOnly
      ? serviceRepository.getFeatured()
      : serviceRepository.getAll();

    fetch
      .then((rows) => {
        if (cancelled) return;
        setServices((rows || []).map(mapService));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [featuredOnly]);

  return { services, loading, error };
}

function mapService(row) {
  return {
    id:               row.id,
    slug:             row.slug,
    title:            row.title,
    description:      row.short_description,
    fullDescription:  row.full_description,
    icon:             row.icon,
    duration:         row.duration,
    durationMinutes:  row.duration_minutes,
    format:           row.format,
    featured:         row.is_featured,
  };
}
