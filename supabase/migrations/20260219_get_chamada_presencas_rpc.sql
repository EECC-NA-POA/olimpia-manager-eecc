-- RPC to get presences for a session with athlete names
-- Bypasses RLS on usuarios table for simple name retrieval
create or replace function get_chamada_presencas(p_chamada_id uuid)
returns table (
  atleta_id uuid,
  status text,
  nome_completo text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    cp.atleta_id,
    cp.status::text,
    u.nome_completo
  from chamada_presencas cp
  join usuarios u on cp.atleta_id = u.id
  where cp.chamada_id = p_chamada_id
  order by u.nome_completo;
end;
$$;

-- Grant execute permission
grant execute on function get_chamada_presencas(uuid) to authenticated;
grant execute on function get_chamada_presencas(uuid) to service_role;
