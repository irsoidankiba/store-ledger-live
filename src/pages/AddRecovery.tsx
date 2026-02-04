import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecoveryForm } from '@/components/recovery/RecoveryForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

export default function AddRecovery() {
  const { isAdmin } = useAuth();

  // Only admins can add recoveries
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <PlusCircle className="h-6 w-6" />
          Saisie de recouvrement
        </h1>
        <p className="page-description">
          Enregistrez les données de recouvrement journalier pour un magasin
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nouveau recouvrement</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour enregistrer un recouvrement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecoveryForm />
        </CardContent>
      </Card>
    </div>
  );
}
