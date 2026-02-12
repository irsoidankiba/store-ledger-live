import { useState } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Download, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoreSelector } from '@/components/dashboard/StoreSelector';
import { RecoveryList } from '@/components/recovery/RecoveryList';
import { useRecoveries } from '@/hooks/useRecoveries';
import { useAllRecoveries } from '@/hooks/useAllRecoveries';
import { useStores } from '@/hooks/useStores';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';
import { MonthlyArchive } from '@/components/reports/MonthlyArchive';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Reports() {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const { data: stores } = useStores();
  const storeId = selectedStore === 'all' ? undefined : selectedStore;

  // Fetch all recoveries for archive view
  const { data: allRecoveries, isLoading: isLoadingAll } = useAllRecoveries({ 
    storeId 
  });

  // Calculate date range based on selected month
  const getDateRange = () => {
    if (!selectedMonth) return { start: undefined, end: undefined };
    
    const monthDate = parseISO(`${selectedMonth}-01`);
    return {
      start: format(startOfMonth(monthDate), 'yyyy-MM-dd'),
      end: format(endOfMonth(monthDate), 'yyyy-MM-dd'),
    };
  };

  const dateRange = getDateRange();

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
    }),
    { expected: 0, recovered: 0, expenses: 0 }
  ) || { expected: 0, recovered: 0, expenses: 0 };

  const selectedStoreName = selectedStore === 'all'
    ? 'Tous les magasins'
    : stores?.find((s) => s.id === selectedStore)?.name || 'Magasin';

  const periodLabel = selectedMonth
    ? format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: fr })
    : 'Sélectionnez un mois';

  const handleExport = () => {
    if (!recoveries || recoveries.length === 0) return;

    const headers = ['Date', 'Magasin', 'Attendu', 'Recouvré', 'Dépenses', 'Observations'];
    const rows = recoveries.map((r) => [
      format(new Date(r.date), 'dd/MM/yyyy'),
      r.stores?.name || '',
      r.expected_amount,
      r.recovered_amount,
      r.expenses,
      r.observations || '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
      '',
      `Total Attendu;${totals.expected}`,
      `Total Recouvré;${totals.recovered}`,
      `Total Dépenses;${totals.expenses}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_${selectedStoreName.replace(/\s/g, '_')}_${periodLabel.replace(/\s/g, '_')}.csv`;
    link.click();
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(selectedMonth === month ? null : month);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Rapports
        </h1>
        <p className="page-description">
          Historique mensuel et export des données de recouvrement
        </p>
      </div>

      {/* Store Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <StoreSelector
          value={selectedStore}
          onValueChange={(value) => {
            setSelectedStore(value);
            setSelectedMonth(null);
          }}
          showAll={true}
        />
      </div>

      <Tabs defaultValue="archive" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Historique mensuel
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Détails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-lg font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                Classeur - {selectedStoreName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyArchive
                recoveries={allRecoveries}
                isLoading={isLoadingAll}
                onMonthSelect={handleMonthSelect}
                selectedMonth={selectedMonth}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedMonth ? (
            <>
              {/* Summary */}
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-sm sm:text-lg font-medium capitalize">
                    Résumé - {selectedStoreName} - {periodLabel}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={!recoveries || recoveries.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-24" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex justify-between sm:block p-2 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg">
                        <p className="text-xs sm:text-sm text-muted-foreground">Total attendu</p>
                        <p className="text-sm sm:text-xl font-bold">{formatCurrency(totals.expected)}</p>
                      </div>
                      <div className="flex justify-between sm:block p-2 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg">
                        <p className="text-xs sm:text-sm text-muted-foreground">Total recouvré</p>
                        <p className="text-sm sm:text-xl font-bold text-success">{formatCurrency(totals.recovered)}</p>
                      </div>
                      <div className="flex justify-between sm:block p-2 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg">
                        <p className="text-xs sm:text-sm text-muted-foreground">Total dépenses</p>
                        <p className="text-sm sm:text-xl font-bold">{formatCurrency(totals.expenses)}</p>
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
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Sélectionnez un mois</p>
                <p className="text-sm">
                  Cliquez sur un mois dans l'onglet "Historique mensuel" pour voir les détails
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
