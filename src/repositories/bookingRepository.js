import { supabase } from '@/lib/supabase';
import { query } from '@/lib/apiError';

export const bookingRepository = {
  async create(payload) {
    return query(
      supabase
        .from('bookings')
        .insert(payload)
        .select()
        .single()
    );
  },

  async getByUser(userId) {
    return query(
      supabase
        .from('bookings')
        .select(`
          *,
          service:services(title, icon, duration_minutes)
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('session_date', { ascending: false })
    );
  },

  async getById(id) {
    return query(
      supabase
        .from('bookings')
        .select(`
          *,
          service:services(title, icon, duration_minutes)
        `)
        .eq('id', id)
        .single()
    );
  },

  async getByRef(ref) {
    return query(
      supabase
        .from('bookings')
        .select('*')
        .eq('booking_ref', ref)
        .single()
    );
  },

  async cancel(id, reason = '') {
    return query(
      supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq('id', id)
        .select()
        .single()
    );
  },

  async updatePayment(id, { paymentStatus, paymentMethod, transactionId }) {
    return query(
      supabase
        .from('bookings')
        .update({
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          transaction_id: transactionId,
        })
        .eq('id', id)
        .select()
        .single()
    );
  },

  async getAll() {
    return query(
      supabase
        .from('bookings')
        .select(`
          *,
          service:services(title, icon, duration_minutes)
        `)
        .is('deleted_at', null)
        .order('session_date', { ascending: false })
    );
  },

  async updateStatus(id, status) {
    return query(
      supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
    );
  },

  async update(id, payload) {
    return query(
      supabase
        .from('bookings')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
    );
  },
};
