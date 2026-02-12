import { formatCurrency } from '@/lib/format';

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
  if (stores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun magasin avec des données ce mois-ci
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="data-table text-xs sm:text-sm">
        <thead>
          <tr>
            <th>Magasin</th>
            <th className="text-right">Att. J</th>
            <th className="text-right">Rec. J</th>
            <th className="text-right">Att. M</th>
            <th className="text-right">Rec. M</th>
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
              <td className="text-right">
                {formatCurrency(store.todayExpected)}
              </td>
              <td className="text-right font-medium">
                {formatCurrency(store.todayRecovered)}
              </td>
              <td className="text-right">
                {formatCurrency(store.monthExpected)}
              </td>
              <td className="text-right font-medium">
                {formatCurrency(store.monthRecovered)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
