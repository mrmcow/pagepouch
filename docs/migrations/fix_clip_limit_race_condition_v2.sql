-- Fix Race Condition in Clip Limit Enforcement (Simpler Approach)
-- This uses database constraints to enforce limits at the database level
-- Even if multiple requests bypass the application check, the database will reject them

-- Step 1: Add a function to check clip limit on insert
CREATE OR REPLACE FUNCTION public.enforce_clip_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_tier TEXT;
  v_clips_limit INT;
  v_clips_this_month INT;
  v_current_month_start DATE;
BEGIN
  v_current_month_start := date_trunc('month', CURRENT_DATE);
  
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM public.users
  WHERE id = NEW.user_id;
  
  -- Default to free if not set
  IF v_subscription_tier IS NULL THEN
    v_subscription_tier := 'free';
  END IF;
  
  -- Set limit based on tier
  IF v_subscription_tier = 'pro' THEN
    v_clips_limit := 1000;
  ELSE
    v_clips_limit := 50; -- free tier
  END IF;
  
  -- Get current count (with row lock to prevent race conditions)
  SELECT clips_this_month INTO v_clips_this_month
  FROM public.user_usage
  WHERE user_id = NEW.user_id
  FOR UPDATE; -- Lock the row until transaction completes
  
  -- Reset if new month
  IF EXISTS (
    SELECT 1 FROM public.user_usage
    WHERE user_id = NEW.user_id
    AND last_reset_date < v_current_month_start
  ) THEN
    v_clips_this_month := 0;
  END IF;
  
  -- Enforce the limit
  IF v_clips_this_month >= v_clips_limit THEN
    RAISE EXCEPTION 'Clip limit reached. You have reached your monthly limit of % clips. Upgrade to Pro for more clips.', v_clips_limit
      USING ERRCODE = '23514'; -- check_violation error code
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger that runs BEFORE insert to enforce limit
DROP TRIGGER IF EXISTS enforce_clip_limit_trigger ON public.clips;
CREATE TRIGGER enforce_clip_limit_trigger
  BEFORE INSERT ON public.clips
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_clip_limit();

-- Step 3: Keep the existing update_user_usage trigger (it increments the counter)
-- This runs AFTER insert, so it only increments if the clip was successfully created

-- Comment
COMMENT ON FUNCTION public.enforce_clip_limit IS 
'Enforces clip limits at the database level using row-level locking. This prevents race conditions where multiple simultaneous requests could bypass application-level checks. Raises an exception if limit is reached.';

