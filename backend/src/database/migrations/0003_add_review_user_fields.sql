-- Migration: Add user_name and user_avatar columns to reviews table
-- Purpose: Store customer name and avatar directly in reviews for reliable display

-- Add user_name column
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) NULL;

-- Add user_avatar column
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS user_avatar VARCHAR(500) NULL;

-- Add comments
COMMENT ON COLUMN public.reviews.user_name IS 'Cached display name of the reviewer at time of review creation';
COMMENT ON COLUMN public.reviews.user_avatar IS 'Cached avatar URL of the reviewer at time of review creation';
