# Supabase Error Debugging Guide

## 🚨 HTTP 400 - Bad Request Errors

### What It Means
Your request is malformed or invalid. Supabase is rejecting it before processing.

### Common Causes

#### 1. ❌ Wrong Column Selection Format
**Problem:**
```javascript
// WRONG - Manual REST URL with quotes
/rest/v1/tasks?columns="user_id","title","description"
```

**Solution:**
```javascript
// CORRECT - Use Supabase client
const { data, error } = await supabase
  .from('tasks')
  .select('user_id,title,description');

// OR with line breaks (easier to read)
const { data, error } = await supabase
  .from('tasks')
  .select(`
    user_id,
    title,
    description,
    subject
  `);
```

#### 2. ❌ Wrong Foreign Key in Joins
**Problem:**
```javascript
// WRONG - May use incorrect foreign key name
.select('*, profiles!squad_messages_sender_id_fkey(full_name)')
```

**Solution:**
```javascript
// CORRECT - Let Supabase infer the relationship
const { data, error } = await supabase
  .from('squad_messages')
  .select(`
    id,
    content,
    sender_id,
    profiles (full_name, avatar_url)
  `)
  .eq('squad_id', squadId);

// If that fails, check your table relationships:
// 1. Go to Supabase Console → Table Editor
// 2. Click on table → Relationships
// 3. Note exact foreign key name
// 4. Use it: .select('*, profiles!your_fk_name(full_name)')
```

#### 3. ❌ RLS (Row Level Security) Blocking Access
**Problem:**
```
Error: 400 Bad Request {details: "..."}
```
This usually means RLS policy denied access.

**Solution - Check RLS Policies:**
```sql
-- In Supabase SQL Editor, check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- If enabled, check policies
SELECT * FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'squad_messages';
```

**Add Missing RLS Policies:**
```sql
-- Allow authenticated users to read squad messages
CREATE POLICY "Allow squad members to read messages"
ON squad_messages
FOR SELECT
USING (
  squad_id IN (
    SELECT id FROM squads
    WHERE auth.uid() IN (
      SELECT user_id FROM squad_members WHERE squad_id = squads.id
    )
  )
);

-- Allow users to read profiles (for joins)
CREATE POLICY "Allow read profiles"
ON profiles
FOR SELECT
USING (true);
```

#### 4. ❌ Non-existent Column
**Problem:**
```javascript
.select('user_id,non_existent_column,title')
```

**Solution:**
```javascript
// Check Supabase table schema
// Go to: Supabase Console → API Docs → Tables
// Verify column names match exactly

const { data, error } = await supabase
  .from('tasks')
  .select('user_id,title,description') // Only real columns
```

#### 5. ❌ Null/Undefined in Filters
**Problem:**
```javascript
const priority = undefined;
.eq('priority', priority)  // ❌ Will fail
```

**Solution:**
```javascript
const priority = undefined;
if (priority) {
  query = query.eq('priority', priority);
}
// OR
const priority = formData?.priority || 'Medium';
query = query.eq('priority', priority);
```

---

## 🐛 React + Supabase 400 Error Chain

### The Problem
```
1. Supabase returns 400 (bad request)
2. Data doesn't load: data = undefined
3. React tries: task.title.toLowerCase()
4. CRASH: "Cannot read properties of undefined"
```

### The Fix
```javascript
// ❌ UNSAFE - Will crash
const filteredTasks = tasks.filter(task => 
  task.title.toLowerCase().includes(search)
);

// ✅ SAFE - Won't crash
const filteredTasks = tasks?.filter(task => {
  const title = task?.title || '';
  return title.toLowerCase().includes(search.toLowerCase());
});
```

---

## ✅ Debugging Checklist

- [ ] Check Supabase Console for error details
- [ ] Verify table and column names exist
- [ ] Ensure RLS policies are created
- [ ] Check that foreign keys match table names
- [ ] Use safe optional chaining (`?.`)
- [ ] Log errors to console: `console.error('Error:', error)`
- [ ] Check network tab in DevTools for full error response
- [ ] Verify user is authenticated before queries

---

## 📋 Common Status Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 400 | Bad Request | Check query format, RLS, column names |
| 401 | Unauthorized | User not authenticated |
| 403 | Forbidden | RLS policy blocking access |
| 404 | Not Found | Table/column doesn't exist |
| 409 | Conflict | Duplicate key, constraint violation |
| 500 | Server Error | Supabase issue, try again later |

---

## 🔗 Useful Resources

- [Supabase REST API Docs](https://supabase.com/docs/reference/api/rest-api)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript/select)
