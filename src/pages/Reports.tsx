import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoreSelector } from '@/components/dashboard/StoreSelector';
import { RecoveryList } from '@/components/recovery/RecoveryList';
import { useRecoveries } from '@/hooks/useRecoveries';
import { useStores } from '@/hooks/useStores';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Reports() {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  const { data: stores } = useStores();

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'last':
        const lastMonth = subMonths(now, 1);
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        };
      case 'last3':
        return {
          start: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      default:
        return { start: undefined, end: undefined };
    }
  };

  const dateRange = getDateRange();
  const storeId = selectedStore === 'all' ? undefined : selectedStore;

  const { data: recoveries, isLoading } = useRecoveries(
    storeId,
    dateRange.start,
    dateRange.end
  );

  // Calculate totals
  const totals = recoveries?.reduce(
    (acc, r) => ({
      expected: acc.expected + Number(r.expected_amount),
      recovered: acc.recovered + Number(r.recovered_amount),
      expenses: acc.expenses + Number(r.expenses),
      gap: acc.gap + Number(r.gap),
    }),
    { expected: 0, recovered: 0, expenses: 0, gap: 0 }
  ) || { expected: 0, recovered: 0, expenses: 0, gap: 0 };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const selectedStoreName = selectedStore === 'all'
    ? 'Tous les magasins'
    : stores?.find((s) => s.id === selectedStore)?.name || 'Magasin';

  const periodLabel = selectedPeriod === 'current'
    ? format(new Date(), 'MMMM yyyy', { locale: fr })
    : selectedPeriod === 'last'
    ? format(subMonths(new Date(), 1), 'MMMM yyyy', { locale: fr })
    : '3 derniers mois';

  const handleExport = () => {
    // Create CSV content
    if (!recoveries || recoveries.length === 0) return;

    const headers = ['Date', 'Magasin', 'Attendu', 'Recouvré', 'Dépenses', 'Écart', 'Observations'];
    const rows = recoveries.map((r) => [
      format(new Date(r.date), 'dd/MM/yyyy'),
      r.stores?.name || '',
      r.expected_amount,
      r.recovered_amount,
      r.expenses,
      r.gap,
      r.observations || '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
      '',
      `Total Attendu;${totals.expected}`,
      `Total Recouvré;${totals.recovered}`,
      `Total Dépenses;${totals.expenses}`,
      `Écart Total;${totals.gap}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_${selectedStoreName.replace(/\s/g, '_')}_${periodLabel.replace(/\s/g, '_')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Rapports
        </h1>
        <p className="page-description">
          Consultez l'historique et exportez les données de recouvrement
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <StoreSelector
          value={selectedStore}
          onValueChange={setSelectedStore}
          showAll={true}
        />
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Mois en cours</SelectItem>
            <SelectItem value="last">Mois précédent</SelectItem>
            <SelectItem value="last3">3 derniers mois</SelectItem>
            <SelectItem value="all">Tout</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!recoveries || recoveries.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Résumé - {selectedStoreName} - {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total attendu</p>
                <p className="text-xl font-bold">{formatCurrency(totals.expected)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total recouvré</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totals.recovered)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total dépenses</p>
                <p className="text-xl font-bold">{formatCurrency(totals.expenses)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Écart total</p>
                <p className={`text-xl font-bold ${totals.gap > 0 ? 'text-destructive' : totals.gap < 0 ? 'text-success' : ''}`}>
                  {totals.gap > 0 ? '-' : totals.gap < 0 ? '+' : ''}{formatCurrency(Math.abs(totals.gap))}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovery List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Détail des recouvrements ({recoveries?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <RecoveryList
              recoveries={recoveries || []}
              showStore={selectedStore === 'all'}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
