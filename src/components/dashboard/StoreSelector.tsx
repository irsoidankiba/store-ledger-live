import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store } from 'lucide-react';
import { useStores } from '@/hooks/useStores';

interface StoreSelectorProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showAll?: boolean;
}

export function StoreSelector({
  value,
  onValueChange,
  placeholder = 'Sélectionner un magasin',
  showAll = true,
}: StoreSelectorProps) {
  const { data: stores, isLoading } = useStores();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full sm:w-[240px]">
        <Store className="h-4 w-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAll && (
          <SelectItem value="all">Tous les magasins</SelectItem>
        )}
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Chargement...
          </SelectItem>
        ) : (
          stores?.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              <span className="font-medium">{store.name}</span>
              <span className="text-muted-foreground ml-2">({store.code})</span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
