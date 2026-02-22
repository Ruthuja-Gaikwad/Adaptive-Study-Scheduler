-- =====================================================
-- Cognitive Intelligence Dashboard (CID)
-- Supabase Database Schema Setup
-- =====================================================
-- This file contains all SQL migrations needed to set up
-- the database tables for the CID system.
--
-- Run these migrations in your Supabase SQL editor:
-- 1. Go to Supabase Dashboard
-- 2. Select your project
-- 3. Open "SQL Editor"
-- 4. Create new query
-- 5. Copy and paste each section below
-- 6. Click "Run"
-- =====================================================

-- =====================================================
-- 1. COGNITIVE INDEX TABLE
-- =====================================================
-- Tracks CSI scores and cognitive metrics
CREATE TABLE public.cognitive_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  csi_score INTEGER CHECK (csi_score >= 0 AND csi_score <= 100),
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  retention_avg DECIMAL CHECK (retention_avg >= 0 AND retention_avg <= 100),
  burnout_inverse INTEGER CHECK (burnout_inverse >= 0 AND burnout_inverse <= 100),
  performance_trend INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX cognitive_index_user_id_idx ON public.cognitive_index(user_id);
CREATE INDEX cognitive_index_updated_at_idx ON public.cognitive_index(updated_at);

-- Enable RLS
ALTER TABLE public.cognitive_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cognitive index"
  ON public.cognitive_index FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own cognitive index"
  ON public.cognitive_index FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cognitive index"
  ON public.cognitive_index FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 2. BURNOUT METRICS TABLE
-- =====================================================
-- Tracks burnout levels and recovery metrics
CREATE TABLE public.burnout_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  burnout_score INTEGER CHECK (burnout_score >= 0 AND burnout_score <= 100),
  sleep_deficit DECIMAL, -- in hours (negative = less sleep, positive = more sleep)
  consecutive_study_days INTEGER CHECK (consecutive_study_days >= 0),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high')),
  recovery_mode_active BOOLEAN DEFAULT FALSE,
  last_break_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX burnout_metrics_user_id_idx ON public.burnout_metrics(user_id);
CREATE INDEX burnout_metrics_risk_level_idx ON public.burnout_metrics(risk_level);
CREATE INDEX burnout_metrics_updated_at_idx ON public.burnout_metrics(updated_at);

-- Enable RLS
ALTER TABLE public.burnout_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own burnout metrics"
  ON public.burnout_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own burnout metrics"
  ON public.burnout_metrics FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own burnout metrics"
  ON public.burnout_metrics FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 3. USER STATS TABLE
-- =====================================================
-- Tracks user progress metrics and performance
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp INTEGER CHECK (xp >= 0) DEFAULT 0,
  level INTEGER GENERATED ALWAYS AS (FLOOR(xp / 1000) + 1) STORED,
  streak INTEGER CHECK (streak >= 0) DEFAULT 0,
  accuracy DECIMAL CHECK (accuracy >= 0 AND accuracy <= 100),
  avg_deep_work_duration INTEGER, -- in minutes
  task_switch_rate DECIMAL, -- switches per hour
  daily_focus_score INTEGER CHECK (daily_focus_score >= 0 AND daily_focus_score <= 100),
  total_tests_completed INTEGER DEFAULT 0,
  total_study_hours DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX user_stats_user_id_idx ON public.user_stats(user_id);
CREATE INDEX user_stats_level_idx ON public.user_stats(level);
CREATE INDEX user_stats_updated_at_idx ON public.user_stats(updated_at);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 4. MEMORY TRACKING TABLE
-- =====================================================
-- Tracks retention levels for each subject/topic
CREATE TABLE public.memory_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  retention_percentage INTEGER CHECK (retention_percentage >= 0 AND retention_percentage <= 100),
  next_revision_date DATE,
  times_revised INTEGER DEFAULT 0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX memory_tracking_user_id_idx ON public.memory_tracking(user_id);
CREATE INDEX memory_tracking_subject_idx ON public.memory_tracking(subject);
CREATE INDEX memory_tracking_retention_idx ON public.memory_tracking(retention_percentage);
CREATE INDEX memory_tracking_next_revision_idx ON public.memory_tracking(next_revision_date);

-- Enable RLS
ALTER TABLE public.memory_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memory tracking"
  ON public.memory_tracking FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memory records"
  ON public.memory_tracking FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own memory records"
  ON public.memory_tracking FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 5. INTERVENTION LOGS TABLE
-- =====================================================
-- Tracks system interventions and user responses
CREATE TABLE public.intervention_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intervention_type VARCHAR(50) NOT NULL, -- 'memory-risk', 'focus-alert', 'sleep-warning', etc.
  subject VARCHAR(100),
  topic VARCHAR(100),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')),
  message TEXT,
  action_taken VARCHAR(50), -- 'recall-started', 'scheduled', 'ignored', 'dismissed'
  user_response_time INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX intervention_logs_user_id_idx ON public.intervention_logs(user_id);
CREATE INDEX intervention_logs_type_idx ON public.intervention_logs(intervention_type);
CREATE INDEX intervention_logs_severity_idx ON public.intervention_logs(severity);
CREATE INDEX intervention_logs_created_at_idx ON public.intervention_logs(created_at);

-- Enable RLS
ALTER TABLE public.intervention_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intervention logs"
  ON public.intervention_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own intervention logs"
  ON public.intervention_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 6. COGNITIVE TIMELINE EVENTS TABLE
-- =====================================================
-- Tracks cognitive events for the timeline
CREATE TABLE public.cognitive_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'study', 'warning', 'suggestion', 'achievement', 'break'
  event_label VARCHAR(100) NOT NULL,
  event_subject VARCHAR(100),
  event_metadata JSONB, -- flexible field for extra data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX timeline_events_user_id_idx ON public.cognitive_timeline_events(user_id);
CREATE INDEX timeline_events_type_idx ON public.cognitive_timeline_events(event_type);
CREATE INDEX timeline_events_created_at_idx ON public.cognitive_timeline_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.cognitive_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timeline events"
  ON public.cognitive_timeline_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own timeline events"
  ON public.cognitive_timeline_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 7. SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to add sample data to your tables
-- Replace 'YOUR_USER_ID' with an actual user ID from auth.users

/*
-- Insert sample cognitive index
INSERT INTO public.cognitive_index (user_id, csi_score, focus_score, retention_avg, burnout_inverse, performance_trend)
VALUES ('YOUR_USER_ID'::UUID, 82, 78, 84, 70, 8);

-- Insert sample burnout metrics
INSERT INTO public.burnout_metrics (user_id, burnout_score, sleep_deficit, consecutive_study_days, risk_level)
VALUES ('YOUR_USER_ID'::UUID, 30, -1.5, 5, 'low');

-- Insert sample user stats
INSERT INTO public.user_stats (user_id, xp, accuracy, avg_deep_work_duration, task_switch_rate, daily_focus_score)
VALUES ('YOUR_USER_ID'::UUID, 7234, 85, 45, 12, 78);

-- Insert sample memory tracking
INSERT INTO public.memory_tracking (user_id, subject, topic, retention_percentage, next_revision_date)
VALUES 
  ('YOUR_USER_ID'::UUID, 'Economics', 'Inflation', 32, CURRENT_DATE + INTERVAL '1 day'),
  ('YOUR_USER_ID'::UUID, 'Economics', 'Supply-Demand', 78, CURRENT_DATE + INTERVAL '5 days'),
  ('YOUR_USER_ID'::UUID, 'Polity', 'Constitution', 88, CURRENT_DATE + INTERVAL '7 days');
*/

-- =====================================================
-- VIEWS (Optional - for analytics)
-- =====================================================

-- View for recent cognitive events
CREATE OR REPLACE VIEW public.recent_cognitive_events AS
SELECT 
  user_id,
  event_type,
  event_label,
  event_subject,
  created_at,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as event_rank
FROM public.cognitive_timeline_events
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- View for memory review needed
CREATE OR REPLACE VIEW public.memory_needs_review AS
SELECT 
  user_id,
  subject,
  topic,
  retention_percentage,
  next_revision_date,
  CASE 
    WHEN retention_percentage < 40 THEN 'critical'
    WHEN retention_percentage < 60 THEN 'urgent'
    WHEN retention_percentage < 80 THEN 'soon'
    ELSE 'stable'
  END as priority
FROM public.memory_tracking
WHERE next_revision_date <= CURRENT_DATE;

-- =====================================================
-- TRIGGERS (Optional - for automations)
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all main tables
CREATE TRIGGER cognitive_index_update_timestamp
  BEFORE UPDATE ON public.cognitive_index
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER burnout_metrics_update_timestamp
  BEFORE UPDATE ON public.burnout_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER user_stats_update_timestamp
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER memory_tracking_update_timestamp
  BEFORE UPDATE ON public.memory_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- COMPLETION NOTES
-- =====================================================
-- 
-- ✅ All tables created with:
--   - Proper indexes for performance
--   - Row Level Security (RLS) enabled
--   - Constraints for data integrity
--   - Timestamps for tracking
--
-- Next steps:
-- 1. Enable real-time for tables in Supabase console
-- 2. Add test data using sample data section
-- 3. Verify RLS policies in Supabase console
-- 4. Test subscriptions using the CID dashboard
--
-- =====================================================
