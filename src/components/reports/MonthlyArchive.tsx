import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, ChevronRight, Calendar, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StoreData {
  storeName: string;
  storeCode: string;
  totalExpected: number;
  totalRecovered: number;
  totalExpenses: number;
  count: number;
}

interface MonthlyData {
  month: string;
  totalExpected: number;
  totalRecovered: number;
  totalExpenses: number;
  count: number;
  stores: Map<string, StoreData>;
}

interface MonthlyArchiveProps {
  recoveries: Array<{
    date: string;
    expected_amount: number;
    recovered_amount: number;
    expenses: number;
    stores?: { name: string; code: string } | null;
  }> | undefined;
  isLoading: boolean;
  onMonthSelect: (month: string) => void;
  selectedMonth: string | null;
  showStoreBreakdown?: boolean;
}

export function MonthlyArchive({ 
  recoveries, 
  isLoading, 
  onMonthSelect,
  selectedMonth,
  showStoreBreakdown = true
}: MonthlyArchiveProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (!recoveries || recoveries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Aucun historique disponible</p>
      </div>
    );
  }

  // Group recoveries by month and store
  const monthlyData: Map<string, MonthlyData> = new Map();

  recoveries.forEach((r) => {
    const date = parseISO(r.date);
    const monthKey = format(date, 'yyyy-MM');
    const storeName = r.stores?.name || 'Inconnu';
    const storeCode = r.stores?.code || '???';

    const existing = monthlyData.get(monthKey) || {
      month: monthKey,
      totalExpected: 0,
      totalRecovered: 0,
      totalExpenses: 0,
      count: 0,
      stores: new Map<string, StoreData>(),
    };

    existing.totalExpected += Number(r.expected_amount);
    existing.totalRecovered += Number(r.recovered_amount);
    existing.totalExpenses += Number(r.expenses);
    existing.count += 1;

    // Store breakdown
    const storeData = existing.stores.get(storeName) || {
      storeName,
      storeCode,
      totalExpected: 0,
      totalRecovered: 0,
      totalExpenses: 0,
      count: 0,
    };
    storeData.totalExpected += Number(r.expected_amount);
    storeData.totalRecovered += Number(r.recovered_amount);
    storeData.totalExpenses += Number(r.expenses);
    storeData.count += 1;
    existing.stores.set(storeName, storeData);

    monthlyData.set(monthKey, existing);
  });

  // Sort by month descending
  const sortedMonths = Array.from(monthlyData.values()).sort((a, b) => 
    b.month.localeCompare(a.month)
  );

  return (
    <div className="space-y-2">
      {sortedMonths.map((data) => {
        const isSelected = selectedMonth === data.month;
        const monthDate = parseISO(`${data.month}-01`);
        const recoveryRate = data.totalExpected > 0 
          ? (data.totalRecovered / data.totalExpected) * 100 
          : 0;
        const storesList = Array.from(data.stores.values());

        return (
          <Card 
            key={data.month}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onMonthSelect(data.month)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSelected ? (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-semibold capitalize">
                      {format(monthDate, 'MMMM yyyy', { locale: fr })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data.count} entrée{data.count > 1 ? 's' : ''} • {storesList.length} magasin{storesList.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">
                    {formatCurrency(data.totalRecovered)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    sur {formatCurrency(data.totalExpected)}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {/* Global summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total attendu</p>
                      <p className="font-semibold">{formatCurrency(data.totalExpected)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total recouvré</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(data.totalRecovered)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total dépenses</p>
                      <p className="font-semibold">{formatCurrency(data.totalExpenses)}</p>
                    </div>
                  </div>

                  {/* Recovery rate */}
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taux de recouvrement global</span>
                      <span className={cn(
                        "font-medium",
                        recoveryRate >= 100 ? "text-success" : 
                        recoveryRate >= 80 ? "text-warning" : "text-destructive"
                      )}>
                        {recoveryRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          recoveryRate >= 100 ? "bg-success" : 
                          recoveryRate >= 80 ? "bg-warning" : "bg-destructive"
                        )}
                        style={{ width: `${Math.min(recoveryRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Store breakdown */}
                  {showStoreBreakdown && storesList.length > 0 && (
                    <div className="pt-3 border-t">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Détail par magasin
                      </h4>
                      <div className="space-y-2">
                        {storesList.map((store) => {
                          const storeRate = store.totalExpected > 0 
                            ? (store.totalRecovered / store.totalExpected) * 100 
                            : 0;
                          return (
                            <div 
                              key={store.storeName}
                              className="bg-muted/50 rounded-lg p-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{store.storeName}</span>
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {store.storeCode}
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-sm font-medium",
                                  storeRate >= 100 ? "text-success" : 
                                  storeRate >= 80 ? "text-warning" : "text-destructive"
                                )}>
                                  {storeRate.toFixed(0)}%
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Attendu</span>
                                  <p className="font-medium">{formatCurrency(store.totalExpected)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Recouvré</span>
                                  <p className="font-medium text-success">{formatCurrency(store.totalRecovered)}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Dépenses</span>
                                  <p className="font-medium">{formatCurrency(store.totalExpenses)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
