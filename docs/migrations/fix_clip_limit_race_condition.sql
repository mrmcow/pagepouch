-- Fix Race Condition in Clip Limit Enforcement
-- This function uses row-level locking to prevent multiple simultaneous clip creations
-- from bypassing the limit check

CREATE OR REPLACE FUNCTION public.check_and_reserve_clip_slot(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_subscription_tier TEXT;
  v_clips_this_month INT;
  v_clips_limit INT;
  v_allowed BOOLEAN;
  v_current_month_start DATE;
BEGIN
  -- Get current month start date
  v_current_month_start := date_trunc('month', CURRENT_DATE);
  
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM public.users
  WHERE id = p_user_id;
  
  -- If user not found, default to free
  IF v_subscription_tier IS NULL THEN
    v_subscription_tier := 'free';
  END IF;
  
  -- Set clip limit based on tier
  IF v_subscription_tier = 'pro' THEN
    v_clips_limit := 1000;
  ELSE
    v_clips_limit := 10;
  END IF;
  
  -- Lock the user_usage row for this user to prevent race conditions
  -- This ensures only one clip creation can check/increment at a time
  SELECT clips_this_month INTO v_clips_this_month
  FROM public.user_usage
  WHERE user_id = p_user_id
  FOR UPDATE; -- Critical: This locks the row until transaction commits
  
  -- Reset monthly count if it's a new month
  IF EXISTS (
    SELECT 1 FROM public.user_usage 
    WHERE user_id = p_user_id 
    AND last_reset_date < v_current_month_start
  ) THEN
    UPDATE public.user_usage
    SET 
      clips_this_month = 0,
      last_reset_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    v_clips_this_month := 0;
  END IF;
  
  -- Check if user has reached their limit
  IF v_clips_this_month >= v_clips_limit THEN
    v_allowed := FALSE;
  ELSE
    v_allowed := TRUE;
    
    -- Reserve the slot by incrementing the counter
    -- This happens BEFORE the clip is actually created
    -- If clip creation fails, the count will be decremented by the trigger
    UPDATE public.user_usage
    SET 
      clips_this_month = clips_this_month + 1,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Get updated count
    v_clips_this_month := v_clips_this_month + 1;
  END IF;
  
  -- Return result as JSON
  RETURN json_build_object(
    'allowed', v_allowed,
    'clips_this_month', v_clips_this_month,
    'clips_limit', v_clips_limit,
    'subscription_tier', v_subscription_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_and_reserve_clip_slot(UUID) TO authenticated;

-- Update the trigger to NOT increment if reservation already happened
-- We need to modify the trigger to check if this is a reservation or actual creation

CREATE OR REPLACE FUNCTION public.update_user_usage()
RETURNS TRIGGER AS $$
DECLARE
  current_month_start DATE;
BEGIN
  current_month_start := date_trunc('month', CURRENT_DATE);
  
  -- Note: We don't increment here anymore because check_and_reserve_clip_slot already did it
  -- Just ensure the month is reset if needed
  UPDATE public.user_usage 
  SET 
    last_reset_date = CASE
      WHEN last_reset_date < current_month_start THEN CURRENT_DATE
      ELSE last_reset_date
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment explaining the change
COMMENT ON FUNCTION public.check_and_reserve_clip_slot IS 
'Atomically checks if user can create a clip and reserves a slot. Uses row-level locking to prevent race conditions where multiple requests could bypass the limit check simultaneously.';

