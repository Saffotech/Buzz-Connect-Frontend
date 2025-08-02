-- Drop tables in reverse order to handle foreign key dependencies

DROP TABLE IF EXISTS public.post_media;
DROP TABLE IF EXISTS public.post_tags;
DROP TABLE IF EXISTS public.post_destinations;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.tags;
DROP TABLE IF EXISTS public.media_assets;
DROP TABLE IF EXISTS public.social_accounts;
DROP TABLE IF EXISTS public.workspace_users;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.workspaces;
