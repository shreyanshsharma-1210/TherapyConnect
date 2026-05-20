import { supabase } from '@/lib/supabase';

export const couponRepository = {
  async getAllCoupons() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createCoupon(payload) {
    const { data, error } = await supabase
      .from('coupons')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCouponStatus(id, status) {
    const { data, error } = await supabase
      .from('coupons')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCoupon(id) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async getStats() {
    const { data, error } = await supabase
      .from('coupons')
      .select('status');

    if (error) throw error;
    
    const stats = {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      reserved: data.filter(c => c.status === 'reserved').length,
      redeemed: data.filter(c => c.status === 'redeemed').length,
      expired: data.filter(c => c.status === 'expired' || c.status === 'cancelled').length,
    };

    return stats;
  }
};
