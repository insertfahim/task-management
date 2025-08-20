-- Migration script to simplify existing task management database
-- Remove priority and due_date columns from tasks table

-- First, drop the check constraint on priority if it exists
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;

-- Remove the priority and due_date columns
ALTER TABLE public.tasks DROP COLUMN IF EXISTS priority;
ALTER TABLE public.tasks DROP COLUMN IF EXISTS due_date;
