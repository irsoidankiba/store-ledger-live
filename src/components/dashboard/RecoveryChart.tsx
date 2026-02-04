import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DailyRecovery } from '@/hooks/useRecoveries';

interface RecoveryChartProps {
  data: DailyRecovery[];
}

export function RecoveryChart({ data }: RecoveryChartProps) {
  const chartData = data
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) // Last 14 days
    .map((item) => ({
      date: format(parseISO(item.date), 'dd MMM', { locale: fr }),
      expected: Number(item.expected_amount),
      recovered: Number(item.recovered_amount),
      gap: Number(item.gap),
    }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      notation: 'compact',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(222 83% 25%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(222 83% 25%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="recoveredGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(168 84% 32%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(168 84% 32%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(215 16% 47%)', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(215 16% 47%)', fontSize: 12 }}
          tickFormatter={formatCurrency}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(0 0% 100%)',
            border: '1px solid hsl(214 32% 91%)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'expected' ? 'Attendu' : name === 'recovered' ? 'Recouvré' : 'Écart',
          ]}
        />
        <Area
          type="monotone"
          dataKey="expected"
          stroke="hsl(222 83% 25%)"
          strokeWidth={2}
          fill="url(#expectedGradient)"
          name="expected"
        />
        <Area
          type="monotone"
          dataKey="recovered"
          stroke="hsl(168 84% 32%)"
          strokeWidth={2}
          fill="url(#recoveredGradient)"
          name="recovered"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
