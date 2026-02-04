import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { StoreSelector } from '@/components/dashboard/StoreSelector';
import { useCreateRecovery, useUpdateRecovery, DailyRecovery } from '@/hooks/useRecoveries';
import { cn } from '@/lib/utils';
import { fr } from 'date-fns/locale';

const recoverySchema = z.object({
  store_id: z.string().min(1, 'Sélectionnez un magasin'),
  date: z.date({ required_error: 'Sélectionnez une date' }),
  expected_amount: z.coerce.number().min(0, 'Montant invalide'),
  recovered_amount: z.coerce.number().min(0, 'Montant invalide'),
  expenses: z.coerce.number().min(0, 'Montant invalide'),
  observations: z.string().optional(),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

interface RecoveryFormProps {
  existingRecovery?: DailyRecovery;
  onSuccess?: () => void;
}

export function RecoveryForm({ existingRecovery, onSuccess }: RecoveryFormProps) {
  const createRecovery = useCreateRecovery();
  const updateRecovery = useUpdateRecovery();
  const isEditing = !!existingRecovery;

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: existingRecovery
      ? {
          store_id: existingRecovery.store_id,
          date: new Date(existingRecovery.date),
          expected_amount: existingRecovery.expected_amount,
          recovered_amount: existingRecovery.recovered_amount,
          expenses: existingRecovery.expenses,
          observations: existingRecovery.observations || '',
        }
      : {
          store_id: '',
          date: new Date(),
          expected_amount: 0,
          recovered_amount: 0,
          expenses: 0,
          observations: '',
        },
  });

  const onSubmit = async (values: RecoveryFormValues) => {
    const payload = {
      store_id: values.store_id,
      date: format(values.date, 'yyyy-MM-dd'),
      expected_amount: values.expected_amount,
      recovered_amount: values.recovered_amount,
      expenses: values.expenses,
      observations: values.observations,
    };

    if (isEditing) {
      await updateRecovery.mutateAsync({ id: existingRecovery.id, ...payload });
    } else {
      await createRecovery.mutateAsync(payload);
    }

    if (onSuccess) {
      onSuccess();
    } else {
      form.reset();
    }
  };

  const isSubmitting = createRecovery.isPending || updateRecovery.isPending;

  const expectedAmount = form.watch('expected_amount') || 0;
  const recoveredAmount = form.watch('recovered_amount') || 0;
  const gap = expectedAmount - recoveredAmount;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="store_id"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Magasin *</FormLabel>
                <FormControl>
                  <StoreSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Sélectionner un magasin"
                    showAll={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('2020-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expected_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant attendu (FCFA) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recovered_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant recouvré (FCFA) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expenses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dépenses (FCFA)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col justify-end">
            <p className="text-sm text-muted-foreground mb-1">Écart calculé</p>
            <p className={cn(
              'text-2xl font-bold',
              gap > 0 ? 'text-destructive' : gap < 0 ? 'text-success' : 'text-foreground'
            )}>
              {gap > 0 ? '-' : gap < 0 ? '+' : ''}
              {new Intl.NumberFormat('fr-FR').format(Math.abs(gap))} FCFA
            </p>
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Observations</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notes ou commentaires..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Mise à jour...' : 'Enregistrement...'}
            </>
          ) : (
            isEditing ? 'Mettre à jour' : 'Enregistrer le recouvrement'
          )}
        </Button>
      </form>
    </Form>
  );
}
