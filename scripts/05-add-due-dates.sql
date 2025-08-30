-- Migration script to add due dates back to tasks
-- Add due_date column to tasks table

-- Add due_date column (nullable to allow tasks without due dates)
ALTER TABLE public.tasks 
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE NULL;

-- Create index for better performance when filtering/sorting by due date
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Create index for overdue tasks queries
CREATE INDEX IF NOT EXISTS idx_tasks_overdue ON public.tasks(due_date, completed) 
WHERE due_date IS NOT NULL AND completed = false;
