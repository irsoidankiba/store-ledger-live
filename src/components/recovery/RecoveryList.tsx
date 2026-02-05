import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DailyRecovery, useDeleteRecovery } from '@/hooks/useRecoveries';
import { RecoveryForm } from './RecoveryForm';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/format';

interface RecoveryListProps {
  recoveries: DailyRecovery[];
  showStore?: boolean;
}

export function RecoveryList({ recoveries, showStore = true }: RecoveryListProps) {
  const { isAdmin } = useAuth();
  const deleteRecovery = useDeleteRecovery();
  const [editingRecovery, setEditingRecovery] = useState<DailyRecovery | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingRecovery, setViewingRecovery] = useState<DailyRecovery | null>(null);

  const handleDelete = async () => {
    if (deletingId) {
      await deleteRecovery.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  if (recoveries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucun recouvrement enregistré
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {recoveries.map((recovery) => (
          <div
            key={recovery.id}
            className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow animate-fade-in"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">
                    {format(parseISO(recovery.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                  {showStore && recovery.stores && (
                    <span className="store-badge">{recovery.stores.code}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Attendu: </span>
                    <span className="font-medium">{formatCurrency(recovery.expected_amount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recouvré: </span>
                    <span className="font-medium">{formatCurrency(recovery.recovered_amount)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Dépenses: </span>
                    <span className="font-medium">{formatCurrency(recovery.expenses)}</span>
                  </div>
                </div>

                {recovery.observations && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {recovery.observations}
                  </p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewingRecovery(recovery)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => setEditingRecovery(recovery)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingId(recovery.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRecovery} onOpenChange={() => setEditingRecovery(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le recouvrement</DialogTitle>
            <DialogDescription>
              Modifiez les informations du recouvrement ci-dessous.
            </DialogDescription>
          </DialogHeader>
          {editingRecovery && (
            <RecoveryForm
              existingRecovery={editingRecovery}
              onSuccess={() => setEditingRecovery(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingRecovery} onOpenChange={() => setViewingRecovery(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du recouvrement</DialogTitle>
          </DialogHeader>
          {viewingRecovery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(parseISO(viewingRecovery.date), 'PPP', { locale: fr })}
                  </p>
                </div>
                {viewingRecovery.stores && (
                  <div>
                    <p className="text-sm text-muted-foreground">Magasin</p>
                    <p className="font-medium">{viewingRecovery.stores.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Montant attendu</p>
                  <p className="font-medium">{formatCurrency(viewingRecovery.expected_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant recouvré</p>
                  <p className="font-medium">{formatCurrency(viewingRecovery.recovered_amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Dépenses</p>
                  <p className="font-medium">{formatCurrency(viewingRecovery.expenses)}</p>
                </div>
              </div>
              {viewingRecovery.observations && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observations</p>
                  <p className="text-sm">{viewingRecovery.observations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce recouvrement ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
