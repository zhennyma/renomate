-- Auth User Trigger: Auto-create user records when Supabase auth user is created
-- This enables proper email confirmation flow without RLS issues

-- ============================================================================
-- TRIGGER FUNCTION
-- ============================================================================

-- Function to handle new user creation
-- Reads role and full_name from auth.users.raw_user_meta_data
-- Creates record in public.users and appropriate profile table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
  new_user_id UUID;
BEGIN
  -- Extract role and full_name from metadata (passed during signUp)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'consumer');
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Validate role
  IF user_role NOT IN ('consumer', 'supplier', 'admin', 'ops') THEN
    user_role := 'consumer';
  END IF;
  
  -- Insert into public.users
  INSERT INTO public.users (
    auth_provider_id,
    role,
    email,
    full_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id::text,
    user_role,
    NEW.email,
    user_full_name,
    NOW(),
    NOW()
  )
  RETURNING id INTO new_user_id;
  
  -- Create role-specific profile
  IF user_role = 'consumer' THEN
    INSERT INTO public.consumer_profiles (user_id)
    VALUES (new_user_id);
  ELSIF user_role = 'supplier' THEN
    INSERT INTO public.supplier_profiles (
      user_id,
      company_name,
      trade_type,
      status
    ) VALUES (
      new_user_id,
      COALESCE(user_full_name, 'My Company'),
      'general',
      'pending_review'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER
-- ============================================================================

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after a new auth user is inserted
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Ensure the function can be executed
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
