-- ════════════════════════════════════════════════════════════════════
-- Qumt'asim · Sistema de gestión — esquema inicial
--
-- Módulos: usuarios y roles, carta (platos y categorías), menú del día
-- por servicio (desayuno, almuerzo, cena), promociones, mesas y reservas,
-- solicitudes de convenio y convenios.
--
-- La página web lee el menú publicado y las promociones activas con la
-- clave pública (rol `anon`) y solo puede INSERTAR reservas y solicitudes.
-- ════════════════════════════════════════════════════════════════════

-- ─── Tipos ──────────────────────────────────────────────────────────
create type public.app_role as enum ('admin', 'staff');
create type public.meal_service as enum ('desayuno', 'almuerzo', 'cena');
create type public.reservation_status as enum ('pendiente', 'confirmada', 'sentada', 'completada', 'cancelada', 'no_asistio');
create type public.reservation_source as enum ('web', 'telefono', 'whatsapp', 'local');
create type public.request_plan as enum ('semanal', 'mensual', 'evento');
create type public.request_status as enum ('nueva', 'contactada', 'aprobada', 'rechazada');
create type public.agreement_period as enum ('semanal', 'mensual');
create type public.agreement_status as enum ('activo', 'pausado', 'finalizado');

-- ─── Utilidades ─────────────────────────────────────────────────────

-- Fecha actual en la zona horaria del restaurante
create function public.today_la_paz()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'America/La_Paz')::date
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─── Usuarios y roles ───────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'staff',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Personal con acceso al sistema. Se crea automáticamente al registrar un usuario en Supabase Auth.';

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- `security definer` para leer profiles sin recursión en sus propias políticas
create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()))
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;

-- ─── Carta: categorías y platos ─────────────────────────────────────

-- Categorías por servicio. Ej. almuerzo: "Almuerzo ejecutivo", "Saludables", "Platos extras".
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  service public.meal_service not null,
  name text not null check (char_length(name) between 2 and 60),
  description text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (service, name)
);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  tags text[] not null default '{}',
  featured boolean not null default false,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dishes_tags_valid check (tags <@ array['popular', 'picante', 'vegetariano', 'para-compartir', 'de-la-casa']::text[])
);

create index dishes_active_name_idx on public.dishes (active, name);

-- ─── Menú del día ───────────────────────────────────────────────────

-- Un menú por fecha y servicio. Solo los publicados se ven en la web.
create table public.daily_menus (
  id uuid primary key default gen_random_uuid(),
  menu_date date not null,
  service public.meal_service not null,
  published boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (menu_date, service)
);

-- Categorías que el restaurante habilita ESE día, con precio de combo opcional
-- (ej. "Almuerzo ejecutivo · Bs 35 · incluye sopa, segundo y refresco").
create table public.daily_menu_sections (
  id uuid primary key default gen_random_uuid(),
  daily_menu_id uuid not null references public.daily_menus (id) on delete cascade,
  category_id uuid not null references public.menu_categories (id) on delete restrict,
  price numeric(10, 2) check (price >= 0),
  note text,
  position integer not null default 0,
  unique (daily_menu_id, category_id)
);

create index daily_menu_sections_category_idx on public.daily_menu_sections (category_id);

-- Platos de cada categoría del día. `price` nulo = precio del combo o del plato.
create table public.daily_menu_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.daily_menu_sections (id) on delete cascade,
  dish_id uuid not null references public.dishes (id) on delete restrict,
  price numeric(10, 2) check (price >= 0),
  sold_out boolean not null default false,
  position integer not null default 0,
  unique (section_id, dish_id)
);

create index daily_menu_items_dish_idx on public.daily_menu_items (dish_id);

-- ─── Promociones ────────────────────────────────────────────────────
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 80),
  kicker text not null default '',
  description text not null default '',
  price numeric(10, 2) check (price >= 0),
  price_label text,
  -- 0 = domingo … 6 = sábado. Nulo = todos los días.
  days smallint[],
  time_label text,
  includes text[] not null default '{}',
  terms text,
  highlight boolean not null default false,
  active boolean not null default true,
  starts_on date,
  ends_on date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_price_present check (price is not null or price_label is not null),
  constraint promotions_days_valid check (days is null or days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  constraint promotions_dates_valid check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

-- ─── Mesas y reservas ───────────────────────────────────────────────
create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  label text not null unique check (char_length(label) between 1 and 20),
  capacity integer not null check (capacity between 1 and 50),
  zone text,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  email text check (email is null or char_length(email) <= 254),
  reservation_date date not null,
  reservation_time time not null,
  party_size integer not null check (party_size between 1 and 60),
  table_id uuid references public.restaurant_tables (id) on delete set null,
  status public.reservation_status not null default 'pendiente',
  source public.reservation_source not null default 'web',
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reservations_date_time_idx on public.reservations (reservation_date, reservation_time);
create index reservations_table_idx on public.reservations (table_id);
create index reservations_status_idx on public.reservations (status);

-- ─── Convenios ──────────────────────────────────────────────────────

-- Solicitudes que llegan desde la página web
create table public.agreement_requests (
  id uuid primary key default gen_random_uuid(),
  company text not null check (char_length(company) between 2 and 120),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 6 and 30),
  service text not null check (service in ('almuerzos', 'catering', 'coffee-break', 'convenios', 'otro')),
  plan public.request_plan not null default 'mensual',
  people integer not null check (people between 1 and 10000),
  start_date date,
  message text check (message is null or char_length(message) <= 1000),
  status public.request_status not null default 'nueva',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agreement_requests_status_idx on public.agreement_requests (status, created_at desc);

-- Convenios firmados: plan semanal o mensual
create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.agreement_requests (id) on delete set null,
  company text not null check (char_length(company) between 2 and 120),
  contact_name text not null,
  email text,
  phone text,
  period public.agreement_period not null,
  people integer not null check (people >= 1),
  price_per_person numeric(10, 2) not null check (price_per_person >= 0),
  services public.meal_service[] not null default array['almuerzo']::public.meal_service[],
  starts_on date not null,
  ends_on date,
  status public.agreement_status not null default 'activo',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agreements_dates_valid check (ends_on is null or ends_on >= starts_on)
);

create index agreements_request_idx on public.agreements (request_id);
create index agreements_status_idx on public.agreements (status);

-- ─── updated_at automático ──────────────────────────────────────────
create trigger dishes_updated_at before update on public.dishes
  for each row execute function public.set_updated_at();
create trigger daily_menus_updated_at before update on public.daily_menus
  for each row execute function public.set_updated_at();
create trigger promotions_updated_at before update on public.promotions
  for each row execute function public.set_updated_at();
create trigger reservations_updated_at before update on public.reservations
  for each row execute function public.set_updated_at();
create trigger agreement_requests_updated_at before update on public.agreement_requests
  for each row execute function public.set_updated_at();
create trigger agreements_updated_at before update on public.agreements
  for each row execute function public.set_updated_at();

-- ─── Copiar un menú del día a otra fecha ────────────────────────────
-- Usa los permisos de quien la llama (RLS aplica).
create function public.copy_daily_menu(p_from date, p_to date, p_service public.meal_service)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_from uuid;
  v_to uuid;
  v_section record;
  v_new_section uuid;
begin
  if not public.is_staff() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select id into v_from from public.daily_menus where menu_date = p_from and service = p_service;
  if v_from is null then
    raise exception 'No hay menú de % para copiar', p_from using errcode = 'P0002';
  end if;

  select id into v_to from public.daily_menus where menu_date = p_to and service = p_service;
  if v_to is null then
    insert into public.daily_menus (menu_date, service, published, notes)
    select p_to, p_service, false, notes from public.daily_menus where id = v_from
    returning id into v_to;
  elsif exists (select 1 from public.daily_menu_sections where daily_menu_id = v_to) then
    raise exception 'El menú de destino ya tiene categorías' using errcode = '23505';
  end if;

  for v_section in
    select * from public.daily_menu_sections where daily_menu_id = v_from order by position
  loop
    insert into public.daily_menu_sections (daily_menu_id, category_id, price, note, position)
    values (v_to, v_section.category_id, v_section.price, v_section.note, v_section.position)
    returning id into v_new_section;

    insert into public.daily_menu_items (section_id, dish_id, price, sold_out, position)
    select v_new_section, dish_id, price, false, position
    from public.daily_menu_items
    where section_id = v_section.id;
  end loop;

  return v_to;
end;
$$;

-- ════════════════════════════════════════════════════════════════════
-- Seguridad (Row Level Security)
--   anon  = visitantes de la página web
--   staff = personal (menú del día, platos, reservas)
--   admin = todo, incluidos promociones, mesas y convenios
-- ════════════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.dishes enable row level security;
alter table public.daily_menus enable row level security;
alter table public.daily_menu_sections enable row level security;
alter table public.daily_menu_items enable row level security;
alter table public.promotions enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.reservations enable row level security;
alter table public.agreement_requests enable row level security;
alter table public.agreements enable row level security;

-- Perfiles
create policy "Personal ve perfiles" on public.profiles
  for select to authenticated using ((select public.is_staff()));
create policy "Admin edita perfiles" on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Categorías y platos: lectura pública, edición del personal
create policy "Lectura pública de categorías" on public.menu_categories
  for select to anon, authenticated using (true);
create policy "Personal gestiona categorías" on public.menu_categories
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "Lectura pública de platos" on public.dishes
  for select to anon, authenticated using (true);
create policy "Personal gestiona platos" on public.dishes
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Menú del día: la web solo ve lo publicado
create policy "Web ve menús publicados" on public.daily_menus
  for select to anon using (published);
create policy "Personal gestiona menús" on public.daily_menus
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "Web ve secciones publicadas" on public.daily_menu_sections
  for select to anon using (
    exists (select 1 from public.daily_menus m where m.id = daily_menu_id and m.published)
  );
create policy "Personal gestiona secciones" on public.daily_menu_sections
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "Web ve platos del día publicados" on public.daily_menu_items
  for select to anon using (
    exists (
      select 1
      from public.daily_menu_sections s
      join public.daily_menus m on m.id = s.daily_menu_id
      where s.id = section_id and m.published
    )
  );
create policy "Personal gestiona platos del día" on public.daily_menu_items
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Promociones: la web ve las activas y vigentes; solo admin edita
create policy "Web ve promociones vigentes" on public.promotions
  for select to anon using (
    active
    and (starts_on is null or starts_on <= public.today_la_paz())
    and (ends_on is null or ends_on >= public.today_la_paz())
  );
create policy "Personal ve promociones" on public.promotions
  for select to authenticated using ((select public.is_staff()));
create policy "Admin crea promociones" on public.promotions
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edita promociones" on public.promotions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin elimina promociones" on public.promotions
  for delete to authenticated using ((select public.is_admin()));

-- Mesas: el personal las ve, el admin las gestiona
create policy "Personal ve mesas" on public.restaurant_tables
  for select to authenticated using ((select public.is_staff()));
create policy "Admin crea mesas" on public.restaurant_tables
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin edita mesas" on public.restaurant_tables
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin elimina mesas" on public.restaurant_tables
  for delete to authenticated using ((select public.is_admin()));

-- Reservas: la web solo puede crear reservas pendientes a futuro
create policy "Web crea reservas" on public.reservations
  for insert to anon with check (
    status = 'pendiente'
    and source = 'web'
    and table_id is null
    and reservation_date >= public.today_la_paz()
  );
create policy "Personal gestiona reservas" on public.reservations
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Solicitudes de convenio: la web solo puede crearlas; el admin las gestiona
create policy "Web crea solicitudes de convenio" on public.agreement_requests
  for insert to anon with check (status = 'nueva' and internal_notes is null);
create policy "Admin gestiona solicitudes" on public.agreement_requests
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admin gestiona convenios" on public.agreements
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
