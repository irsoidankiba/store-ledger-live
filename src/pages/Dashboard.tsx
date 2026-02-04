import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Wallet, TrendingDown, Receipt, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StoreSelector } from '@/components/dashboard/StoreSelector';
import { StoreComparisonTable } from '@/components/dashboard/StoreComparisonTable';
import { RecoveryChart } from '@/components/dashboard/RecoveryChart';
import { RecoveryList } from '@/components/recovery/RecoveryList';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useRecoveries } from '@/hooks/useRecoveries';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const navigate = useNavigate();
  
  const storeId = selectedStore === 'all' ? undefined : selectedStore;
  const { data: stats, isLoading: statsLoading } = useDashboardStats(storeId);
  const { data: recoveries, isLoading: recoveriesLoading } = useRecoveries(storeId);

  const handleStoreClick = (storeId: string) => {
    navigate(`/stores/${storeId}`);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Tableau de bord</h1>
            <p className="page-description">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <StoreSelector
            value={selectedStore}
            onValueChange={setSelectedStore}
            showAll={true}
          />
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Recouvré aujourd'hui"
            value={stats?.todayRecovered || 0}
            icon={<Wallet className="h-5 w-5" />}
            subtitle={`sur ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(stats?.todayExpected || 0)} attendu`}
          />
          <StatsCard
            title="Écart du jour"
            value={Math.abs(stats?.todayGap || 0)}
            icon={<TrendingDown className="h-5 w-5" />}
            trend={stats?.todayGap === 0 ? 'neutral' : stats?.todayGap && stats.todayGap > 0 ? 'down' : 'up'}
            trendValue={stats?.todayGap && stats.todayGap > 0 ? 'Déficit' : stats?.todayGap && stats.todayGap < 0 ? 'Excédent' : 'Équilibre'}
          />
          <StatsCard
            title="Dépenses du jour"
            value={stats?.todayExpenses || 0}
            icon={<Receipt className="h-5 w-5" />}
          />
          <StatsCard
            title="Écart cumulé (mois)"
            value={Math.abs(stats?.monthGap || 0)}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend={stats?.monthGap === 0 ? 'neutral' : stats?.monthGap && stats.monthGap > 0 ? 'down' : 'up'}
            trendValue={stats?.monthGap && stats.monthGap > 0 ? 'Déficit' : stats?.monthGap && stats.monthGap < 0 ? 'Excédent' : 'Équilibre'}
          />
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Évolution des 14 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recoveriesLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <RecoveryChart data={recoveries || []} />
          )}
        </CardContent>
      </Card>

      {/* Store Comparison (only when viewing all stores) */}
      {selectedStore === 'all' && stats?.storeStats && stats.storeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Comparaison par magasin</CardTitle>
          </CardHeader>
          <CardContent>
            <StoreComparisonTable
              stores={stats.storeStats}
              onStoreClick={handleStoreClick}
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Recoveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Derniers recouvrements</CardTitle>
        </CardHeader>
        <CardContent>
          {recoveriesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <RecoveryList
              recoveries={(recoveries || []).slice(0, 5)}
              showStore={selectedStore === 'all'}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
