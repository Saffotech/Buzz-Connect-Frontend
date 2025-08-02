-- ========= WORKSPACES =========
-- Top-level entity for multi-tenancy.
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  -- Extensibility: Settings for the workspace, e.g., timezone, url shorteners.
  settings jsonb
);

-- ========= PROFILES =========
-- Linked 1-to-1 with Nhost auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text
);

-- ========= WORKSPACE_USERS =========
-- Manages user roles within workspaces.
CREATE TABLE IF NOT EXISTS public.workspace_users (
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  -- Role-based access control is critical for team features.
  role text DEFAULT 'member'::text NOT NULL, -- e.g., 'admin', 'editor', 'viewer'
  PRIMARY KEY (workspace_id, user_id)
);

-- ========= SOCIAL ACCOUNTS =========
-- Stores connected social media accounts for a workspace.
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- e.g., 'twitter', 'linkedin', 'instagram_business'
  display_name text NOT NULL, -- e.g., 'BuzzConnect Official'
  platform_user_id text NOT NULL, -- The user ID on the social platform
  -- IMPORTANT: Using Nhost Vault for these tokens.
  encrypted_credentials jsonb NOT NULL,
  last_validated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Add a unique constraint to prevent duplicate connections.
  UNIQUE (workspace_id, platform, platform_user_id)
);

-- ========= MEDIA ASSETS =========
-- A central library for all user-uploaded media.
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  -- Links to the file in Nhost Storage.
  storage_path text NOT NULL,
  file_type text, -- e.g., 'image/jpeg', 'video/mp4'
  file_size_bytes bigint,
  -- Extensibility: For alt text, notes, or other metadata.
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========= TAGS =========
-- For organizing content within a workspace.
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text,
  UNIQUE (workspace_id, name)
);

-- ========= POSTS =========
-- The core entity for all content.
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text,
  status text DEFAULT 'draft'::text NOT NULL, -- 'draft', 'scheduled', 'queued', 'published', 'error', 'needs_approval'
  -- Extensibility: Platform-specific options like Twitter polls or Instagram locations.
  platform_options jsonb,
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  -- Extensibility: For storing retrieved analytics like likes, comments, shares.
  analytics jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone
);

-- ========= POST_DESTINATIONS =========
-- Allows a single post to target multiple social accounts.
CREATE TABLE IF NOT EXISTS public.post_destinations (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  social_account_id uuid REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
  -- Stores the platform-specific ID of the post after publication.
  published_post_id text,
  published_at timestamp with time zone,
  status text NOT NULL, -- e.g., 'scheduled', 'published', 'failed'
  PRIMARY KEY (post_id, social_account_id)
);

-- ========= POST_TAGS =========
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

-- ========= POST_MEDIA =========
-- Links posts to media assets from the library.
CREATE TABLE IF NOT EXISTS public.post_media (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid REFERENCES public.media_assets(id) ON DELETE CASCADE NOT NULL,
  -- Order of media in the post (e.g., for carousels).
  display_order smallint DEFAULT 0,
  PRIMARY KEY (post_id, asset_id)
);
