-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create repair status enum
CREATE TYPE public.repair_status AS ENUM (
  'submitted',
  'checking_with_partner',
  'ready_for_pickup',
  'picked_up',
  'reached_repair_partner',
  'repair_in_progress',
  'ready_for_delivery',
  'reached_delivery_partner',
  'confirmation_required',
  'out_for_delivery',
  'payment_received',
  'delivered'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create repair_categories table
CREATE TABLE public.repair_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create repair_items table (sub-categories)
CREATE TABLE public.repair_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.repair_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create repair_partners table
CREATE TABLE public.repair_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  specializations TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create repair_requests table
CREATE TABLE public.repair_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.repair_categories(id) NOT NULL,
  item_id UUID REFERENCES public.repair_items(id) NOT NULL,
  issue_description TEXT NOT NULL,
  images TEXT[],
  pickup_address TEXT NOT NULL,
  pickup_time_slot TEXT NOT NULL,
  current_status repair_status NOT NULL DEFAULT 'submitted',
  assigned_partner_id UUID REFERENCES public.repair_partners(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create repair_status_history table
CREATE TABLE public.repair_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID REFERENCES public.repair_requests(id) ON DELETE CASCADE NOT NULL,
  status repair_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create admin_notes table
CREATE TABLE public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID REFERENCES public.repair_requests(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_request_id UUID REFERENCES public.repair_requests(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'pending',
  remarks TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  received_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  repair_request_id UUID REFERENCES public.repair_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_messages table for public contact form
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_repair_categories_updated_at BEFORE UPDATE ON public.repair_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_repair_items_updated_at BEFORE UPDATE ON public.repair_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_repair_partners_updated_at BEFORE UPDATE ON public.repair_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_repair_requests_updated_at BEFORE UPDATE ON public.repair_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for repair_categories (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.repair_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all categories" ON public.repair_categories FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert categories" ON public.repair_categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.repair_categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.repair_categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for repair_items (public read, admin write)
CREATE POLICY "Anyone can view active items" ON public.repair_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all items" ON public.repair_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert items" ON public.repair_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update items" ON public.repair_items FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete items" ON public.repair_items FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for repair_partners (admin only)
CREATE POLICY "Admins can view all partners" ON public.repair_partners FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert partners" ON public.repair_partners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update partners" ON public.repair_partners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete partners" ON public.repair_partners FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for repair_requests
CREATE POLICY "Users can view own requests" ON public.repair_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own requests" ON public.repair_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON public.repair_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all requests" ON public.repair_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all requests" ON public.repair_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for repair_status_history
CREATE POLICY "Users can view own request history" ON public.repair_status_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.repair_requests WHERE id = repair_request_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all history" ON public.repair_status_history FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert history" ON public.repair_status_history FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_notes (admin only)
CREATE POLICY "Admins can view all notes" ON public.admin_notes FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert notes" ON public.admin_notes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete notes" ON public.admin_notes FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.repair_requests WHERE id = repair_request_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert payments" ON public.payments FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for contact_messages (public insert, admin read)
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Insert default repair categories
INSERT INTO public.repair_categories (name, description, icon) VALUES
  ('Timepieces', 'Clocks and watches repair services', 'clock'),
  ('Lighting Fixtures', 'Lamps and lighting equipment repairs', 'lamp'),
  ('Audio Devices', 'Headphones, speakers, and audio equipment', 'headphones'),
  ('Kitchen Appliances', 'Grinders, mixers, kettles, and more', 'utensils'),
  ('Household Appliances', 'Irons, fans, heaters, and more', 'home'),
  ('Power Tools', 'Electric drills and power equipment', 'wrench'),
  ('Others', 'Other repair services', 'more-horizontal');

-- Insert default repair items
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Clock', 'Wall clocks, table clocks, and decorative clocks' FROM public.repair_categories WHERE name = 'Timepieces';

INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Table Lamp', 'Desk lamps and table lighting fixtures' FROM public.repair_categories WHERE name = 'Lighting Fixtures';

INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Headphones', 'Over-ear and on-ear headphones' FROM public.repair_categories WHERE name = 'Audio Devices';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Earbuds', 'In-ear earphones and wireless earbuds' FROM public.repair_categories WHERE name = 'Audio Devices';

INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Grinder', 'Coffee grinders and spice grinders' FROM public.repair_categories WHERE name = 'Kitchen Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Mixer', 'Hand mixers and stand mixers' FROM public.repair_categories WHERE name = 'Kitchen Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Kettle', 'Electric kettles' FROM public.repair_categories WHERE name = 'Kitchen Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Toaster', 'Bread toasters and toaster ovens' FROM public.repair_categories WHERE name = 'Kitchen Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Juicer', 'Fruit juicers and citrus presses' FROM public.repair_categories WHERE name = 'Kitchen Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Blender', 'Countertop blenders and immersion blenders' FROM public.repair_categories WHERE name = 'Kitchen Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Air Fryer', 'Air fryers and convection cookers' FROM public.repair_categories WHERE name = 'Kitchen Appliances';

INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Iron', 'Steam irons and dry irons' FROM public.repair_categories WHERE name = 'Household Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Table Fan', 'Desk fans and portable fans' FROM public.repair_categories WHERE name = 'Household Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Heater', 'Space heaters and room heaters' FROM public.repair_categories WHERE name = 'Household Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Vacuum Cleaner', 'Upright and handheld vacuum cleaners' FROM public.repair_categories WHERE name = 'Household Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Torch', 'Flashlights and portable torches' FROM public.repair_categories WHERE name = 'Household Appliances';
INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Hair Dryer', 'Hair dryers and styling tools' FROM public.repair_categories WHERE name = 'Household Appliances';

INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Electric Drill', 'Corded and cordless electric drills' FROM public.repair_categories WHERE name = 'Power Tools';

INSERT INTO public.repair_items (category_id, name, description)
SELECT id, 'Other Item', 'Items not listed in other categories' FROM public.repair_categories WHERE name = 'Others';