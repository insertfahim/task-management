-- Migration script to add priority system back to tasks
-- Add priority column to tasks table

-- Add priority column with enum-like constraint
ALTER TABLE public.tasks 
ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium' 
CHECK (priority IN ('low', 'medium', 'high'));

-- Create index for better performance when filtering by priority
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- Update existing tasks to have medium priority by default
UPDATE public.tasks SET priority = 'medium' WHERE priority IS NULL;
