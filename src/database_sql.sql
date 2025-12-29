-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.invite_codes (
  code text NOT NULL,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'used'::text, 'expired'::text])),
  partnership_id uuid,
  target_email text,
  used boolean NOT NULL DEFAULT false,
  CONSTRAINT invite_codes_pkey PRIMARY KEY (code),
  CONSTRAINT invite_codes_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id),
  CONSTRAINT invite_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.invite_codes_backup (
  code text,
  created_by text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  status text,
  partnership_id uuid,
  target_email text,
  used boolean
);
CREATE TABLE public.partnerships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id text NOT NULL,
  user2_id text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'declined'::text])),
  anniversary_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partnerships_pkey PRIMARY KEY (id)
);
CREATE TABLE public.partnerships_backup (
  id uuid,
  user1_id text,
  user2_id text,
  status text,
  anniversary_date date,
  created_at timestamp with time zone
);
CREATE TABLE public.profiles (
  id text NOT NULL,
  display_name text,
  email text,
  photo_url text,
  onboarding_completed boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles_backup (
  id text,
  display_name text,
  email text,
  photo_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
CREATE TABLE public.shared_challenges (
  id text NOT NULL DEFAULT gen_random_uuid(),
  partnership_id uuid NOT NULL,
  title text NOT NULL,
  category text,
  status text DEFAULT 'todo'::text CHECK (status = ANY (ARRAY['todo'::text, 'done'::text])),
  completed_at timestamp with time zone,
  notes text,
  tags ARRAY,
  xp_reward integer DEFAULT 0,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shared_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT shared_challenges_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id)
);
CREATE TABLE public.shared_challenges_backup (
  id text,
  partnership_id uuid,
  title text,
  category text,
  status text,
  completed_at timestamp with time zone,
  notes text,
  tags ARRAY,
  xp_reward integer,
  created_by text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
CREATE TABLE public.shared_pet (
  partnership_id uuid NOT NULL,
  name text DEFAULT 'Your Pet'::text,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  mood text DEFAULT 'happy'::text,
  hunger integer DEFAULT 50,
  energy integer DEFAULT 100,
  equipped_accessory_id text,
  equipped_background_id text,
  last_updated_at timestamp with time zone DEFAULT now(),
  updated_by text,
  CONSTRAINT shared_pet_pkey PRIMARY KEY (partnership_id),
  CONSTRAINT shared_pet_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id),
  CONSTRAINT shared_pet_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.shared_pet_backup (
  partnership_id uuid,
  name text,
  xp integer,
  level integer,
  mood text,
  hunger integer,
  energy integer,
  equipped_accessory_id text,
  equipped_background_id text,
  last_updated_at timestamp with time zone,
  updated_by text
);