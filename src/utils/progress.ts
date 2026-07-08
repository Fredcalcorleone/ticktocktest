import { supabase } from '@/utils/supabase';

export const trackLatestProgress = async (moduleName: string, score: number) => {
  const activeUser = typeof window !== 'undefined' ? localStorage.getItem('mindsprint_user') : null;
  if (!activeUser) return { success: false, error: 'No active user token session' };

  const { error } = await supabase
    .from('user_progress')
    .insert([{ username: activeUser, module_name: moduleName, score, status: 'completed' }]);

  return { success: !error, error };
};