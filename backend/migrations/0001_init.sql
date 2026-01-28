create extension if not exists "uuid-ossp";

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  sku text not null,
  type text not null,          -- datasheet/manual/cert/other
  title text not null,
  version text not null,
  status text not null default 'draft', -- draft/approved/archived
  file_key text not null,
  file_name text not null,
  mime_type text not null,
  file_size bigint not null,
  checksum text not null,
  expire_date timestamptz null,
  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_docs_sku on documents(sku);
create index if not exists idx_docs_type on documents(type);
