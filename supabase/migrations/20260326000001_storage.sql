-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('kalanidhi-pieces', 'kalanidhi-pieces', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('kalanidhi-assets', 'kalanidhi-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public reading
CREATE POLICY "Public pieces are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'kalanidhi-pieces');

CREATE POLICY "Public assets are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'kalanidhi-assets');

-- Policies for authenticated admins (Insert/Update/Delete)
CREATE POLICY "Authenticated users can upload to pieces" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'kalanidhi-pieces');

CREATE POLICY "Authenticated users can update pieces" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'kalanidhi-pieces');

CREATE POLICY "Authenticated users can delete pieces" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'kalanidhi-pieces');

CREATE POLICY "Authenticated users can upload to assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'kalanidhi-assets');

CREATE POLICY "Authenticated users can update assets" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'kalanidhi-assets');

CREATE POLICY "Authenticated users can delete assets" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'kalanidhi-assets');
