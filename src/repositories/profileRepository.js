import { supabase } from '@/lib/supabase';
import { query } from '@/lib/apiError';

export const profileRepository = {
  async getById(id) {
    return query(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
    );
  },

  async upsert(id, data) {
    return query(
      supabase
        .from('profiles')
        .upsert({ id, ...data }, { onConflict: 'id' })
        .select()
        .single()
    );
  },

  async update(id, updates) {
    return query(
      supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  },

  async uploadAvatar(userId, file) {
    const ext  = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },
};
