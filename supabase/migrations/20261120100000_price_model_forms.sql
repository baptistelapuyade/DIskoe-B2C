-- Price forms (Figma EVT-04f to 04i): range, from-price, donation and minimum
-- donation next to free, fixed and unknown.
--
-- A new enum value cannot be used in the same transaction that adds it, so
-- the values are added here and used in 20261120100100_event_price_forms.sql.

alter type public.price_model add value if not exists 'range';
alter type public.price_model add value if not exists 'from_price';
alter type public.price_model add value if not exists 'donation';
alter type public.price_model add value if not exists 'min_donation';
