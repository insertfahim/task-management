-- Insert default categories for new users
-- This will be handled by a trigger when a user signs up

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Insert default categories
  INSERT INTO public.categories (name, color, user_id) VALUES
    ('Personal', '#3B82F6', NEW.id),
    ('Work', '#10B981', NEW.id),
    ('Shopping', '#F59E0B', NEW.id),
    ('Health', '#EF4444', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
