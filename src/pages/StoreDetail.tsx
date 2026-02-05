import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecoveryChart } from '@/components/dashboard/RecoveryChart';
import { RecoveryList } from '@/components/recovery/RecoveryList';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecoveries } from '@/hooks/useRecoveries';
import { useStores } from '@/hooks/useStores';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoreDetail() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  
  const { data: stores } = useStores();
  const { data: stats, isLoading: statsLoading } = useDashboardStats(storeId);
  const { data: recoveries, isLoading: recoveriesLoading } = useRecoveries(storeId);

  const store = stores?.find((s) => s.id === storeId);

  if (!store && !statsLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">Magasin non trouvé</p>
        <Button onClick={() => navigate('/stores')} className="mt-4">
          Retour aux magasins
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/stores')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">{store?.name || 'Chargement...'}</h1>
            {store && <span className="store-badge">{store.code}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard
            title="Attendu aujourd'hui"
            value={stats?.todayExpected || 0}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="Recouvré aujourd'hui"
            value={stats?.todayRecovered || 0}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatsCard
            title="Dépenses du jour"
            value={stats?.todayExpenses || 0}
            icon={<Receipt className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Évolution des recouvrements</CardTitle>
        </CardHeader>
        <CardContent>
          {recoveriesLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <RecoveryChart data={recoveries || []} />
          )}
        </CardContent>
      </Card>

      {/* Recovery History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Historique des recouvrements</CardTitle>
        </CardHeader>
        <CardContent>
          {recoveriesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <RecoveryList recoveries={recoveries || []} showStore={false} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
