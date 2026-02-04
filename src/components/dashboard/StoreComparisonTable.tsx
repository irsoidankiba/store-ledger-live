import { cn } from '@/lib/utils';

interface StoreStats {
  storeId: string;
  storeName: string;
  storeCode: string;
  todayRecovered: number;
  todayExpected: number;
  todayGap: number;
  monthRecovered: number;
  monthExpected: number;
  monthGap: number;
}

interface StoreComparisonTableProps {
  stores: StoreStats[];
  onStoreClick?: (storeId: string) => void;
}

export function StoreComparisonTable({ stores, onStoreClick }: StoreComparisonTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (stores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun magasin avec des données ce mois-ci
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Magasin</th>
            <th className="text-right">Aujourd'hui</th>
            <th className="text-right">Écart J</th>
            <th className="text-right">Mois</th>
            <th className="text-right">Écart M</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr
              key={store.storeId}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onStoreClick?.(store.storeId)}
            >
              <td>
                <div>
                  <span className="font-medium">{store.storeName}</span>
                  <span className="store-badge ml-2">{store.storeCode}</span>
                </div>
              </td>
              <td className="text-right font-medium">
                {formatCurrency(store.todayRecovered)}
              </td>
              <td className={cn(
                'text-right',
                store.todayGap > 0 ? 'amount-negative' : store.todayGap < 0 ? 'amount-positive' : 'amount-neutral'
              )}>
                {store.todayGap > 0 ? '-' : store.todayGap < 0 ? '+' : ''}
                {formatCurrency(Math.abs(store.todayGap))}
              </td>
              <td className="text-right font-medium">
                {formatCurrency(store.monthRecovered)}
              </td>
              <td className={cn(
                'text-right',
                store.monthGap > 0 ? 'amount-negative' : store.monthGap < 0 ? 'amount-positive' : 'amount-neutral'
              )}>
                {store.monthGap > 0 ? '-' : store.monthGap < 0 ? '+' : ''}
                {formatCurrency(Math.abs(store.monthGap))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
