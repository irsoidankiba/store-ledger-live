-- Table pour associer les propriétaires à leurs magasins
CREATE TABLE public.store_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Enable RLS
ALTER TABLE public.store_owners ENABLE ROW LEVEL SECURITY;

-- Admins peuvent gérer les assignations
CREATE POLICY "Admins can manage store owners"
ON public.store_owners
FOR ALL
USING (public.is_admin(auth.uid()));

-- Les propriétaires peuvent voir leurs assignations
CREATE POLICY "Owners can view their assignments"
ON public.store_owners
FOR SELECT
USING (auth.uid() = user_id);

-- Fonction pour vérifier si un utilisateur peut accéder à un magasin
CREATE OR REPLACE FUNCTION public.can_access_store(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin(_user_id) 
    OR EXISTS (
      SELECT 1 FROM public.store_owners 
      WHERE user_id = _user_id AND store_id = _store_id
    )
$$;

-- Mettre à jour la politique de lecture des magasins pour les propriétaires
DROP POLICY IF EXISTS "Authenticated users can view stores" ON public.stores;

CREATE POLICY "Users can view accessible stores"
ON public.stores
FOR SELECT
USING (
  public.is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.store_owners 
    WHERE store_owners.user_id = auth.uid() 
    AND store_owners.store_id = stores.id
  )
);

-- Mettre à jour la politique de lecture des recouvrements
DROP POLICY IF EXISTS "Authenticated users can view recoveries" ON public.daily_recoveries;

CREATE POLICY "Users can view accessible recoveries"
ON public.daily_recoveries
FOR SELECT
USING (
  public.is_admin(auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.store_owners 
    WHERE store_owners.user_id = auth.uid() 
    AND store_owners.store_id = daily_recoveries.store_id
  )
);