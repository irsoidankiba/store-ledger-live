import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export interface DashboardStats {
  todayRecovered: number;
  todayExpected: number;
  todayGap: number;
  todayExpenses: number;
  monthRecovered: number;
  monthExpected: number;
  monthGap: number;
  monthExpenses: number;
  storeStats: {
    storeId: string;
    storeName: string;
    storeCode: string;
    todayRecovered: number;
    todayExpected: number;
    todayGap: number;
    monthRecovered: number;
    monthExpected: number;
    monthGap: number;
  }[];
}

export function useDashboardStats(storeId?: string) {
  return useQuery({
    queryKey: ['dashboard-stats', storeId],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

      // Get today's stats
      let todayQuery = supabase
        .from('daily_recoveries')
        .select('expected_amount, recovered_amount, expenses, gap')
        .eq('date', todayStr);
      
      if (storeId) {
        todayQuery = todayQuery.eq('store_id', storeId);
      }

      const { data: todayData } = await todayQuery;

      // Get month stats
      let monthQuery = supabase
        .from('daily_recoveries')
        .select('expected_amount, recovered_amount, expenses, gap')
        .gte('date', monthStart)
        .lte('date', monthEnd);
      
      if (storeId) {
        monthQuery = monthQuery.eq('store_id', storeId);
      }

      const { data: monthData } = await monthQuery;

      // Get stats by store
      const { data: storeStatsData } = await supabase
        .from('daily_recoveries')
        .select(`
          store_id,
          date,
          expected_amount,
          recovered_amount,
          gap,
          stores(name, code)
        `)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      // Aggregate stats
      const todayRecovered = todayData?.reduce((sum, r) => sum + Number(r.recovered_amount), 0) || 0;
      const todayExpected = todayData?.reduce((sum, r) => sum + Number(r.expected_amount), 0) || 0;
      const todayGap = todayData?.reduce((sum, r) => sum + Number(r.gap), 0) || 0;
      const todayExpenses = todayData?.reduce((sum, r) => sum + Number(r.expenses), 0) || 0;

      const monthRecovered = monthData?.reduce((sum, r) => sum + Number(r.recovered_amount), 0) || 0;
      const monthExpected = monthData?.reduce((sum, r) => sum + Number(r.expected_amount), 0) || 0;
      const monthGap = monthData?.reduce((sum, r) => sum + Number(r.gap), 0) || 0;
      const monthExpenses = monthData?.reduce((sum, r) => sum + Number(r.expenses), 0) || 0;

      // Group by store
      const storeMap = new Map<string, {
        storeId: string;
        storeName: string;
        storeCode: string;
        todayRecovered: number;
        todayExpected: number;
        todayGap: number;
        monthRecovered: number;
        monthExpected: number;
        monthGap: number;
      }>();

      storeStatsData?.forEach((record) => {
        const store = record.stores as { name: string; code: string } | null;
        if (!store) return;

        const existing = storeMap.get(record.store_id) || {
          storeId: record.store_id,
          storeName: store.name,
          storeCode: store.code,
          todayRecovered: 0,
          todayExpected: 0,
          todayGap: 0,
          monthRecovered: 0,
          monthExpected: 0,
          monthGap: 0,
        };

        existing.monthRecovered += Number(record.recovered_amount);
        existing.monthExpected += Number(record.expected_amount);
        existing.monthGap += Number(record.gap);

        if (record.date === todayStr) {
          existing.todayRecovered += Number(record.recovered_amount);
          existing.todayExpected += Number(record.expected_amount);
          existing.todayGap += Number(record.gap);
        }

        storeMap.set(record.store_id, existing);
      });

      return {
        todayRecovered,
        todayExpected,
        todayGap,
        todayExpenses,
        monthRecovered,
        monthExpected,
        monthGap,
        monthExpenses,
        storeStats: Array.from(storeMap.values()),
      };
    },
  });
}
