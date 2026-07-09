-- Function to increment property views count
create or replace function public.increment_property_views(property_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.properties
  set views_count = views_count + 1
  where id = property_id;
end;
$$;
