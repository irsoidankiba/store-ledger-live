import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface DailyRecovery {
  id: string;
  store_id: string;
  date: string;
  expected_amount: number;
  recovered_amount: number;
  expenses: number;
  gap: number;
  observations: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  stores?: {
    name: string;
    code: string;
  };
}

export interface RecoveryInput {
  store_id: string;
  date: string;
  expected_amount: number;
  recovered_amount: number;
  expenses: number;
  observations?: string;
}

export function useRecoveries(storeId?: string, startDate?: string, endDate?: string) {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('daily_recoveries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_recoveries',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recoveries'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['recoveries', storeId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('daily_recoveries')
        .select('*, stores(name, code)')
        .order('date', { ascending: false });
      
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      
      if (endDate) {
        query = query.lte('date', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as DailyRecovery[];
    },
  });
}

export function useCreateRecovery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (recovery: RecoveryInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('daily_recoveries')
        .insert({
          ...recovery,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Recouvrement enregistré' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erreur', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateRecovery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...recovery }: Partial<RecoveryInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('daily_recoveries')
        .update(recovery)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Recouvrement mis à jour' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erreur', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteRecovery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('daily_recoveries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recoveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Recouvrement supprimé' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erreur', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}
