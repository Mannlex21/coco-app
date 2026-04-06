drop table if exists public.order_items cascade;

CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    price_at_order DECIMAL(10, 2) NOT NULL, -- Precio congelado al momento de la compra
    selected_modifiers JSONB DEFAULT '[]' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);