-- Backfill user_name for existing reviews from orders shipping_address
-- This uses the shipping address name from the most recent order by the same user

UPDATE reviews r
SET user_name = COALESCE(
    -- Try to get name from orders shipping_address
    (
        SELECT COALESCE(
            o.shipping_address->>'fullName',
            o.shipping_address->>'full_name',
            CONCAT(
                COALESCE(o.shipping_address->>'firstName', o.shipping_address->>'first_name', ''),
                ' ',
                COALESCE(o.shipping_address->>'lastName', o.shipping_address->>'last_name', '')
            )
        )
        FROM orders o
        WHERE o.user_id = r.user_id
        ORDER BY o.created_at DESC
        LIMIT 1
    ),
    -- Fallback to 'Customer' if no order found
    'Customer'
)
WHERE r.user_name IS NULL;

-- Log the update
SELECT COUNT(*) as updated_reviews FROM reviews WHERE user_name IS NOT NULL AND user_name != 'Customer';
