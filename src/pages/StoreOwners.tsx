import { useState } from 'react';
import { Users, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStores } from '@/hooks/useStores';
import { 
  useStoreOwners, 
  useOwnerProfiles, 
  useAssignStoreOwner, 
  useRemoveStoreOwner 
} from '@/hooks/useStoreOwners';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export default function StoreOwners() {
  const { isAdmin } = useAuth();
  const { data: stores, isLoading: storesLoading } = useStores();
  const { data: storeOwners, isLoading: ownersLoading } = useStoreOwners();
  const { data: ownerProfiles, isLoading: profilesLoading } = useOwnerProfiles();
  const assignOwner = useAssignStoreOwner();
  const removeOwner = useRemoveStoreOwner();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');

  const handleAssign = async () => {
    if (!selectedStore || !selectedOwner) return;
    
    await assignOwner.mutateAsync({
      storeId: selectedStore,
      userId: selectedOwner,
    });
    
    setSelectedStore('');
    setSelectedOwner('');
    setIsDialogOpen(false);
  };

  const isLoading = storesLoading || ownersLoading || profilesLoading;

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Accès refusé</h1>
          <p className="page-description">
            Seuls les administrateurs peuvent gérer les assignations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Assignation des propriétaires</h1>
            <p className="page-description">
              Gérez l'accès des propriétaires à leurs magasins
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assigner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assigner un propriétaire</DialogTitle>
                <DialogDescription>
                  Sélectionnez un propriétaire et un magasin pour créer une assignation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Propriétaire</Label>
                  <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un propriétaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerProfiles?.map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!ownerProfiles || ownerProfiles.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      Aucun propriétaire trouvé. Créez d'abord des utilisateurs avec le rôle "owner".
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Magasin</Label>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un magasin" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores?.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} ({store.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleAssign} 
                disabled={!selectedStore || !selectedOwner || assignOwner.isPending}
                className="w-full"
              >
                {assignOwner.isPending ? 'Assignation...' : 'Assigner'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : storeOwners?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune assignation</p>
            <p className="text-muted-foreground text-center">
              Assignez des propriétaires à leurs magasins pour qu'ils puissent voir les données.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stores?.map((store) => {
            const storeAssignments = storeOwners?.filter(so => so.store_id === store.id) || [];
            
            return (
              <Card key={store.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {store.name}
                      <span className="store-badge text-xs">{store.code}</span>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {storeAssignments.length} propriétaire(s)
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {storeAssignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun propriétaire assigné</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {storeAssignments.map((assignment) => (
                        <div 
                          key={assignment.id}
                          className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1"
                        >
                          <span className="text-sm">
                            {assignment.profiles?.full_name || 'Utilisateur inconnu'}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'assignation ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {assignment.profiles?.full_name} n'aura plus accès aux données de {store.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeOwner.mutate(assignment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
