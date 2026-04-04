CREATE TABLE IF NOT EXISTS public.product_cross_sell_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    origin_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, 
    position INT DEFAULT 0, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);