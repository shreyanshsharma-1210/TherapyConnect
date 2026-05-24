import { supabase } from '@/lib/supabase';
import { query }     from '@/lib/apiError';

export const adminRepository = {
  // ── Bookings ────────────────────────────────────────────────
  async getAllBookings({ status = null, search = '', page = 0, pageSize = 20 } = {}) {
    let q = supabase
      .from('bookings')
      .select('*, profile:profiles(full_name, email, avatar_url)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (status) q = q.eq('status', status);
    if (search) q = q.or(`client_name.ilike.%${search}%,client_email.ilike.%${search}%,booking_ref.ilike.%${search}%`);

    const { data, error, count } = await q;
    if (error) throw error;
    return { data, count };
  },

  async updateBookingStatus(id, status) {
    const res = await query(
      supabase.from('bookings').update({ status }).eq('id', id).select().single()
    );
    
    // Trigger Google Calendar sync hook
    const eventType = status === 'cancelled' ? 'delete' : 'create';
    supabase.functions.invoke('google-calendar-sync', {
      body: { action: 'outbound-sync', bookingId: id, eventType }
    }).catch((e) => console.warn('[updateBookingStatus] Google Calendar sync failed (non-fatal):', e));

    return res;
  },

  // ── Blog Posts ──────────────────────────────────────────────
  async getAllBlogPosts() {
    return query(
      supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, content, category, tags, author_name, read_time, cover_image_url, status, is_featured, published_at, views, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
    );
  },

  async getBlogPost(id) {
    return query(
      supabase.from('blog_posts').select('*').eq('id', id).single()
    );
  },

  async upsertBlogPost(data) {
    if (data.id) {
      return query(
        supabase.from('blog_posts').update(data).eq('id', data.id).select().single()
      );
    }
    return query(
      supabase.from('blog_posts').insert(data).select().single()
    );
  },

  async deleteBlogPost(id) {
    return query(
      supabase.from('blog_posts').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    );
  },

  async uploadBlogImage(file) {
    const ext  = file.name.split('.').pop();
    const path = `blog-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('blog-images').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl;
  },

  // ── Testimonials ────────────────────────────────────────────
  async getAllTestimonials() {
    const { data, error } = await supabase
      .rpc('get_testimonials_with_bookings');
    if (error) throw error;
    return (data || [])
      .filter(t => t.deleted_at === null)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || new Date(b.created_at) - new Date(a.created_at));
  },

  async upsertTestimonial(data) {
    if (data.id) {
      return query(
        supabase.from('testimonials').update(data).eq('id', data.id).select().single()
      );
    }
    return query(
      supabase.from('testimonials').insert(data).select().single()
    );
  },

  async deleteTestimonial(id) {
    return query(
      supabase.from('testimonials').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    );
  },

  // ── Availability ────────────────────────────────────────────
  async getAvailabilityRange(start, end) {
    return query(
      supabase
        .from('therapist_availability')
        .select('*')
        .gte('available_date', start)
        .lte('available_date', end)
        .order('available_date')
    );
  },

  async upsertAvailability(date, level, maxSlots = 8) {
    return query(
      supabase
        .from('therapist_availability')
        .upsert({ available_date: date, level, max_slots: maxSlots }, { onConflict: 'available_date' })
        .select()
        .single()
    );
  },

  // ── Therapist Profile ────────────────────────────────────────
  async getProfile() {
    const rows = await query(
      supabase.from('therapist_profile').select('*').limit(1)
    );
    return rows?.[0] ?? null;
  },

  async updateProfile(id, data) {
    return query(
      supabase.from('therapist_profile').update(data).eq('id', id).select().single()
    );
  },

  async uploadProfileImage(file) {
    const ext  = file.name.split('.').pop();
    const path = `therapist-avatar.${ext}`;
    const { error } = await supabase.storage
      .from('therapist-assets')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('therapist-assets').getPublicUrl(path).data.publicUrl;
  },

  // ── Dashboard Stats ──────────────────────────────────────────
  async getStats() {
    const [bookings, revenue, blogs, testimonials] = await Promise.all([
      supabase.from('bookings').select('status', { count: 'exact', head: false }).is('deleted_at', null),
      supabase.from('payments').select('amount_inr').eq('status', 'paid'),
      supabase.from('blog_posts').select('status', { count: 'exact', head: false }).is('deleted_at', null),
      supabase.from('testimonials').select('is_approved', { count: 'exact', head: false }).is('deleted_at', null),
    ]);

    const totalRevenue = (revenue.data || []).reduce((s, p) => s + (p.amount_inr || 0), 0);
    const bookingsByStatus = (bookings.data || []).reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBookings:    bookings.count || 0,
      confirmedBookings: bookingsByStatus.confirmed || 0,
      completedBookings: bookingsByStatus.completed || 0,
      pendingBookings:   (bookingsByStatus.pending || 0),
      totalRevenue,
      totalBlogs:       blogs.count || 0,
      publishedBlogs:   (blogs.data || []).filter(b => b.status === 'published').length,
      totalTestimonials: testimonials.count || 0,
      pendingTestimonials: (testimonials.data || []).filter(t => !t.is_approved).length,
    };
  },
};
