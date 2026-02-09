import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AllRecoveriesOptions {
  storeId?: string;
}

export function useAllRecoveries(options: AllRecoveriesOptions = {}) {
  const { storeId } = options;

  return useQuery({
    queryKey: ['all-recoveries', storeId],
    queryFn: async () => {
      let query = supabase
        .from('daily_recoveries')
        .select('date, expected_amount, recovered_amount, expenses, stores(name, code)')
        .order('date', { ascending: false });
      
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}
