ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS profiles_stream_idx
	ON public.profiles (stream);
