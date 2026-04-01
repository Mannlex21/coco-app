CREATE TABLE public.product_modifiers (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    modifier_group_id UUID REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, modifier_group_id)
);