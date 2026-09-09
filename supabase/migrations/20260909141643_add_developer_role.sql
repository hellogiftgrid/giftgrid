DO $$
BEGIN
  BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'developer';
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;
