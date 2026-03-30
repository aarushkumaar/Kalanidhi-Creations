-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pieces table
CREATE TABLE public.pieces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create testimonials table
CREATE TABLE public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_name TEXT NOT NULL,
    designation TEXT,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create enquiries table
CREATE TABLE public.enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    piece_id UUID REFERENCES public.pieces(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, pieces, and published testimonials
CREATE POLICY "Public profiles are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public pieces are viewable by everyone" ON public.pieces FOR SELECT USING (true);
CREATE POLICY "Published testimonials are viewable by everyone" ON public.testimonials FOR SELECT USING (is_published = true);

-- Public can insert enquiries
CREATE POLICY "Anyone can submit an enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);

-- Admin full access requires an authorized user (using Supabase Auth)
-- (We assume admins will be authenticated and have a valid session)
CREATE POLICY "Admins have full access to categories" ON public.categories USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to pieces" ON public.pieces USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to testimonials" ON public.testimonials USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to enquiries" ON public.enquiries USING (auth.role() = 'authenticated');
