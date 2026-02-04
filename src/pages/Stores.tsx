import { useState } from 'react';
import { Plus, Store as StoreIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStores, useCreateStore } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export default function Stores() {
  const { data: stores, isLoading } = useStores();
  const createStore = useCreateStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', code: '', address: '' });

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStore.mutateAsync(newStore);
    setNewStore({ name: '', code: '', address: '' });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Magasins</h1>
            <p className="page-description">Gérez vos magasins et consultez leurs performances</p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un magasin</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau magasin pour suivre ses recouvrements.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateStore} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du magasin *</Label>
                    <Input
                      id="name"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      placeholder="Ex: Magasin Centre-Ville"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code unique *</Label>
                    <Input
                      id="code"
                      value={newStore.code}
                      onChange={(e) => setNewStore({ ...newStore, code: e.target.value.toUpperCase() })}
                      placeholder="Ex: MCV01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={newStore.address}
                      onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                      placeholder="Ex: 123 Rue Principale"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createStore.isPending}>
                    {createStore.isPending ? 'Création...' : 'Créer le magasin'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : stores?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StoreIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucun magasin</p>
            <p className="text-muted-foreground text-center mb-4">
              {isAdmin
                ? 'Créez votre premier magasin pour commencer.'
                : "Aucun magasin n'a encore été créé."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores?.map((store) => (
            <Card
              key={store.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/stores/${store.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  <span className="store-badge">{store.code}</span>
                </div>
              </CardHeader>
              <CardContent>
                {store.address && (
                  <p className="text-sm text-muted-foreground">{store.address}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
