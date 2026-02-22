/**
 * Supabase RLS (Row Level Security) Policies
 * 
 * These policies ensure users can only access their own data
 * Run these SQL commands in Supabase SQL Editor if needed
 */

// Profiles table - Allow users to read public profiles
export const PROFILES_RLS_POLICIES = `
-- Allow users to read profiles (needed for task creation)
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);
`;

// Tasks table - Allow users to only access their own tasks
export const TASKS_RLS_POLICIES = `
-- Allow users to read their own tasks
CREATE POLICY "Allow users to read own tasks"
ON public.tasks
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own tasks
CREATE POLICY "Allow users to insert own tasks"
ON public.tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own tasks
CREATE POLICY "Allow users to update own tasks"
ON public.tasks
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own tasks
CREATE POLICY "Allow users to delete own tasks"
ON public.tasks
FOR DELETE
USING (auth.uid() = user_id);
`;

// Squad and Squad Messages tables
export const SQUAD_RLS_POLICIES = `
-- Allow users to read squads they are members of
CREATE POLICY "Allow squad members to read squad"
ON public.squads
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM squad_members WHERE squad_id = squads.id
  ) OR created_by = auth.uid()
);

-- Allow users to read messages from their squads
CREATE POLICY "Allow squad members to read messages"
ON public.squad_messages
FOR SELECT
USING (
  squad_id IN (
    SELECT id FROM squads 
    WHERE auth.uid() IN (
      SELECT user_id FROM squad_members WHERE squad_id = squads.id
    ) OR created_by = auth.uid()
  )
);

-- Allow users to insert messages to their squads
CREATE POLICY "Allow squad members to insert messages"
ON public.squad_messages
FOR INSERT
WITH CHECK (
  squad_id IN (
    SELECT id FROM squads 
    WHERE auth.uid() IN (
      SELECT user_id FROM squad_members WHERE squad_id = squads.id
    ) OR created_by = auth.uid()
  ) AND sender_id = auth.uid()
);
`;

/**
 * Common Supabase Query Patterns for Safe Data Fetching
 */

// ✅ CORRECT: Tasks with user info
export const SAFE_QUERY_TASKS = async (supabase) => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    console.log('User not authenticated');
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      subject,
      priority,
      due_date,
      due_time,
      estimated_time_mins,
      status,
      xp_reward,
      show_on_quest_board,
      created_at,
      updated_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
};

// ✅ CORRECT: Squad messages with sender info
export const SAFE_QUERY_SQUAD_MESSAGES = async (supabase, squadId) => {
  const { data, error } = await supabase
    .from('squad_messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      squad_id,
      profiles ( full_name, avatar_url )
    `)
    .eq('squad_id', squadId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching squad messages:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
};

// ✅ CORRECT: Safe data validation before saving
export const validateTaskData = (task) => {
  const errors = [];

  if (!task?.title?.trim()) errors.push('Title is required');
  if (!task?.subject?.trim()) errors.push('Subject is required');
  if (task?.estimated_time_mins) {
    if (!Number.isInteger(task.estimated_time_mins) || task.estimated_time_mins < 0) {
      errors.push('Estimated time must be a positive integer (minutes)');
    }
  }
  if (!['Low', 'Medium', 'High', 'Urgent'].includes(task?.priority)) {
    errors.push('Invalid priority');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ✅ CORRECT: Safe null/undefined handling
export const safeValue = (value, defaultValue = '') => {
  return (value === null || value === undefined) ? defaultValue : value;
};

// ✅ CORRECT: Safe string comparison
export const safeIncludes = (str, search) => {
  return (str || '')
    .toString()
    .toLowerCase()
    .includes((search || '').toString().toLowerCase());
};

// ✅ CORRECT: Safe object access in arrays
export const safeFilterArray = (arr = [], filterFn) => {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item) => {
    try {
      return filterFn(item);
    } catch (err) {
      console.warn('Filter error on item:', item, err);
      return false;
    }
  });
};

export default {
  PROFILES_RLS_POLICIES,
  TASKS_RLS_POLICIES,
  SQUAD_RLS_POLICIES,
  SAFE_QUERY_TASKS,
  SAFE_QUERY_SQUAD_MESSAGES,
  validateTaskData,
  safeValue,
  safeIncludes,
  safeFilterArray,
};
