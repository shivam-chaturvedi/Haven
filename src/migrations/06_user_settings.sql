CREATE TABLE public.user_settings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    private_account BOOLEAN NOT NULL DEFAULT false,
    show_activity_status BOOLEAN NOT NULL DEFAULT true,
    allow_tagging BOOLEAN NOT NULL DEFAULT true,
    strict_content_filter BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings."
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings."
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings."
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

INSERT INTO public.user_settings (user_id)
SELECT id
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_create_settings ON public.profiles;

CREATE TRIGGER on_profile_created_create_settings
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.create_default_user_settings();

CREATE OR REPLACE FUNCTION public.touch_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_settings_updated ON public.user_settings;

CREATE TRIGGER on_user_settings_updated
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE PROCEDURE public.touch_user_settings_updated_at();
