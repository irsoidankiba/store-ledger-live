import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoreOwner {
  id: string;
  store_id: string;
  user_id: string;
  created_at: string;
  stores?: {
    name: string;
    code: string;
  };
  profiles?: {
    full_name: string;
  };
}

export interface OwnerProfile {
  user_id: string;
  full_name: string;
  role: string;
}

export function useStoreOwners(storeId?: string) {
  return useQuery({
    queryKey: ['store-owners', storeId],
    queryFn: async () => {
      let query = supabase
        .from('store_owners')
        .select('*, stores(name, code)')
        .order('created_at', { ascending: false });

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(d => d.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        return data.map(item => ({
          ...item,
          profiles: profilesMap.get(item.user_id),
        })) as StoreOwner[];
      }

      return data as StoreOwner[];
    },
  });
}

export function useOwnerProfiles() {
  return useQuery({
    queryKey: ['owner-profiles'],
    queryFn: async () => {
      // Get all users with 'owner' role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'owner');

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) return [];

      // Get their profiles
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      return (profiles || []).map(p => ({
        user_id: p.user_id,
        full_name: p.full_name,
        role: 'owner',
      })) as OwnerProfile[];
    },
  });
}

export function useAssignStoreOwner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storeId, userId }: { storeId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('store_owners')
        .insert({ store_id: storeId, user_id: userId })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ce propriétaire est déjà assigné à ce magasin');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-owners'] });
      toast({ title: 'Propriétaire assigné avec succès' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveStoreOwner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('store_owners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-owners'] });
      toast({ title: 'Assignation supprimée' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
