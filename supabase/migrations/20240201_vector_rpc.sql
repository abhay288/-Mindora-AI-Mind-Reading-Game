-- Function to match entities by vector similarity

create or replace function match_entities (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    entities.id,
    entities.name,
    1 - (entity_embeddings.embedding <=> query_embedding) as similarity
  from entity_embeddings
  join entities on entities.id = entity_embeddings.entity_id
  where 1 - (entity_embeddings.embedding <=> query_embedding) > match_threshold
  order by entity_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
