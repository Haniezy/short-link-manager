-- Remove only the obsolete application-owned table, never neon_auth users.
DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    LOCK TABLE public.users IN ACCESS EXCLUSIVE MODE;
    IF EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
      RAISE EXCEPTION 'Legacy public.users is not empty; migrate its data before removal';
    END IF;
    DROP TABLE public.users;
  END IF;
END $$;
