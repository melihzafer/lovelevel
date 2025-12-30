-- Unlock ALL items for the current partnership
-- Partnership ID from logs: 96ee328f-c30b-4f78-9492-17639c407ff2

INSERT INTO public.partnership_items (partnership_id, item_id, purchased_at)
SELECT 
  '96ee328f-c30b-4f78-9492-17639c407ff2', -- Your Partnership ID
  id,
  NOW()
FROM public.items
ON CONFLICT (partnership_id, item_id) DO NOTHING;
