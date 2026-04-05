CREATE TABLE IF NOT EXISTS public.product_cross_sell_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.product_cross_sell_groups(id) ON DELETE CASCADE NOT NULL,
    suggested_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    override_price DECIMAL(10, 2), 
    position INT DEFAULT 0, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);