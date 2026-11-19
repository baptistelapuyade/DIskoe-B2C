-- Welle 1, Block 2a: the square crop of the profile image is shown publicly
--
-- The owner picks the visible square of the profile image (ORG-05e). The
-- rectangle is stored in media_uses.crop as fractions of the original, so the
-- original file stays untouched: {"x": 0.1, "y": 0.0, "w": 0.8, "h": 0.6},
-- where x and y are the left and top edge and w and h the size, each as a
-- fraction of the image width and height. A square in pixels means
-- w * width = h * height. The application applies it when it shows the image.
--
-- Public pages need to read the crop, so it joins the columns anon may read
-- from media_uses and the public profile view. It describes a rectangle
-- only; it does not make any file public.

grant select (crop) on public.media_uses to anon;

create or replace view public.public_profiles with (security_invoker = true) as
select p.id,
       p.slug,
       r.name,
       r.short_intro,
       r.official_url,
       r.public_contact,
       mu.public_object_path as profile_image_path,
       r.confirmed_at as published_at,
       r.instagram_handle,
       r.extra_links,
       mu.crop as profile_image_crop
  from public.profiles p
  join public.profile_revisions r on r.id = p.published_revision_id
  join public.media_uses mu
    on mu.id = r.profile_image_use_id
   and mu.confirmed_at is not null
   and mu.public_object_path is not null
 where p.publication_state = 'published'
   and p.first_approved_revision_id is not null;
