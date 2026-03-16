-- Have You Heard? — Database Schema
-- Run this in the Supabase SQL Editor to set up your project.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
create table categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  status_verb text not null,
  image_source text,
  is_default boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ITEMS
-- ─────────────────────────────────────────
create table items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  title text not null,
  status text not null default 'Backlog',
  priority int default 2,
  source text,
  image_url text,
  notes text,
  rating int check (rating >= 1 and rating <= 10),
  date_added date default current_date,
  date_engaged date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- TAGS
-- ─────────────────────────────────────────
create table tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create table item_tags (
  item_id uuid references items(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at
  before update on items
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table categories enable row level security;
alter table items enable row level security;
alter table tags enable row level security;
alter table item_tags enable row level security;

create policy "Users manage own categories"
  on categories for all using (auth.uid() = user_id);

create policy "Users manage own items"
  on items for all using (auth.uid() = user_id);

create policy "Users manage own tags"
  on tags for all using (auth.uid() = user_id);

create policy "Users manage own item_tags"
  on item_tags for all
  using (
    exists (
      select 1 from items
      where items.id = item_tags.item_id
      and items.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- SEED DEFAULT CATEGORIES ON SIGN-UP
-- ─────────────────────────────────────────
create or replace function seed_default_categories()
returns trigger as $$
begin
  insert into categories (user_id, name, icon, color, status_verb, image_source, is_default, sort_order)
  values
    (new.id, 'Shows & Movies', '🎬', '#6366f1', 'Watched',   'tmdb',        true, 1),
    (new.id, 'Books',          '📚', '#f59e0b', 'Read',      'openlibrary', true, 2),
    (new.id, 'Video Games',    '🎮', '#10b981', 'Played',    'rawg',        true, 3),
    (new.id, 'Board Games',    '🎲', '#ef4444', 'Played',    'bgg',         true, 4),
    (new.id, 'Places to Eat',  '🍽️', '#f97316', 'Tried',     'places',      true, 5),
    (new.id, 'Stuff to Buy',   '🛍️', '#8b5cf6', 'Purchased', 'ai',          true, 6);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function seed_default_categories();

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index items_user_id_idx on items(user_id);
create index items_category_id_idx on items(category_id);
create index items_status_idx on items(status);
create index item_tags_item_id_idx on item_tags(item_id);
create index item_tags_tag_id_idx on item_tags(tag_id);
