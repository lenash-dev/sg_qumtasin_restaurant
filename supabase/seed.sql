-- ════════════════════════════════════════════════════════════════════
-- Datos de ejemplo para empezar (se pueden editar o borrar desde el
-- sistema). Crea categorías, platos, el almuerzo de HOY publicado,
-- promociones y mesas. Desayuno y cena quedan sin menú a propósito:
-- la web los muestra como "No disponible".
-- ════════════════════════════════════════════════════════════════════

insert into public.menu_categories (service, name, description, position) values
  ('desayuno', 'Desayuno andino', 'Api, buñuelos y pan recién horneado.', 1),
  ('desayuno', 'Al paso', 'Salteñas y café para empezar el día.', 2),
  ('almuerzo', 'Almuerzo ejecutivo', 'El almuerzo completo del día.', 1),
  ('almuerzo', 'Saludables', 'Opciones ligeras y nutritivas.', 2),
  ('almuerzo', 'Platos extras', 'Para quien quiere algo más.', 3),
  ('cena', 'Platos de la noche', 'Clásicos para cerrar el día.', 1);

insert into public.dishes (name, description, price, tags, featured) values
  ('Sopa de maní', 'Caldo cremoso de maní con papas fritas al hilo, carne tierna y perejil.', 25, '{popular,de-la-casa}', true),
  ('Chairo paceño', 'Sopa tradicional con chuño, mote, carne y un toque de hierbabuena.', 28, '{}', false),
  ('Silpancho', 'Carne apanada sobre arroz y papa, coronada con huevo y ensalada fresca.', 42, '{popular}', false),
  ('Picante de pollo', 'Pollo en salsa de ají colorado con chuño phuti, arroz y sarza.', 45, '{picante}', false),
  ('Fricasé', 'Cerdo en caldo de ají amarillo con mote y chuño. Ideal para el frío.', 45, '{picante,popular}', true),
  ('Ensalada de quinua', 'Quinua real, palta, tomate, choclo y queso fresco con aliño de limón.', 30, '{vegetariano}', false),
  ('Sopa de quinua', 'Quinua real con verduras de temporada y queso fresco.', 22, '{vegetariano}', false),
  ('Pollo a la plancha', 'Pechuga a la plancha con verduras salteadas y papa nativa.', 38, '{}', false),
  ('Pique macho', 'Carne, salchicha, papas fritas, locoto, cebolla y huevo. Para compartir (o no).', 75, '{picante,para-compartir}', true),
  ('Chicharrón de cerdo', 'Dorado en su propia grasa, con mote, papa y llajua.', 55, '{para-compartir}', false),
  ('Anticuchos', 'Brochetas de corazón de res a la parrilla con papa y salsa de maní.', 30, '{picante}', false),
  ('Salteñas', 'Jugosas, horneadas cada mañana, con relleno de carne o pollo.', 10, '{popular}', false),
  ('Api morado con pastel', 'Bebida caliente de maíz morado con canela y un pastel recién frito.', 15, '{de-la-casa}', false),
  ('Mocochinchi', 'Refresco de durazno deshidratado con canela y clavo de olor.', 8, '{}', false),
  ('Buñuelos con miel', 'Crujientes por fuera, suaves por dentro, bañados en miel de caña.', 15, '{popular}', false);

-- Almuerzo de hoy, publicado
do $$
declare
  v_menu uuid;
  v_section uuid;
begin
  insert into public.daily_menus (menu_date, service, published, notes)
  values (public.today_la_paz(), 'almuerzo', true, 'Servimos de 12:00 a 15:00.')
  returning id into v_menu;

  -- Almuerzo ejecutivo: precio de combo, los platos van sin precio propio
  insert into public.daily_menu_sections (daily_menu_id, category_id, price, note, position)
  select v_menu, id, 35, 'Incluye sopa, segundo a elección, refresco y postre.', 1
  from public.menu_categories where service = 'almuerzo' and name = 'Almuerzo ejecutivo'
  returning id into v_section;

  insert into public.daily_menu_items (section_id, dish_id, position)
  select v_section, d.id, x.position
  from (values ('Sopa de maní', 1), ('Silpancho', 2), ('Picante de pollo', 3), ('Fricasé', 4)) as x (name, position)
  join public.dishes d on d.name = x.name;

  -- Saludables: cada plato con su precio
  insert into public.daily_menu_sections (daily_menu_id, category_id, position)
  select v_menu, id, 2
  from public.menu_categories where service = 'almuerzo' and name = 'Saludables'
  returning id into v_section;

  insert into public.daily_menu_items (section_id, dish_id, position)
  select v_section, d.id, x.position
  from (values ('Ensalada de quinua', 1), ('Sopa de quinua', 2), ('Pollo a la plancha', 3)) as x (name, position)
  join public.dishes d on d.name = x.name;

  -- Platos extras
  insert into public.daily_menu_sections (daily_menu_id, category_id, position)
  select v_menu, id, 3
  from public.menu_categories where service = 'almuerzo' and name = 'Platos extras'
  returning id into v_section;

  insert into public.daily_menu_items (section_id, dish_id, position)
  select v_section, d.id, x.position
  from (values ('Pique macho', 1), ('Chicharrón de cerdo', 2), ('Anticuchos', 3), ('Api morado con pastel', 4)) as x (name, position)
  join public.dishes d on d.name = x.name;
end;
$$;

insert into public.promotions (title, kicker, description, price, price_label, days, time_label, includes, terms, highlight, position) values
  ('Almuerzo ejecutivo', 'De lunes a viernes', 'El almuerzo completo para tu día de trabajo, servido rápido y con sabor de casa.', 35, null, '{1,2,3,4,5}', '12:00 – 15:00', '{"Sopa del día","Segundo a elección","Refresco de la casa","Postre"}', null, true, 1),
  ('Sábado de pique', 'Para dos', 'Un pique macho para compartir con dos refrescos de la casa.', 85, null, '{6}', null, '{"Pique macho para 2","2 refrescos"}', null, false, 2),
  ('Domingo familiar', 'Para cuatro', 'Cuatro platos paceños y una jarra de mocochinchi para la mesa grande.', 180, null, '{0}', null, '{"4 platos paceños","Jarra de mocochinchi"}', null, false, 3),
  ('La hora del api', 'Media tarde', 'Api morado con pastel a precio especial para la tarde fría.', 12, null, '{1,2,3,4,5,6}', '16:00 – 18:00', '{}', null, false, 4),
  ('Cumpleañero', 'Todos los días', 'Si celebras tu cumpleaños con nosotros, el postre corre por cuenta de la casa.', null, 'Postre gratis', null, null, '{}', 'Presentando tu carnet el día de tu cumpleaños.', false, 5);

insert into public.restaurant_tables (label, capacity, zone, position) values
  ('M1', 2, 'Salón', 1),
  ('M2', 2, 'Salón', 2),
  ('M3', 4, 'Salón', 3),
  ('M4', 4, 'Salón', 4),
  ('M5', 4, 'Salón', 5),
  ('M6', 6, 'Salón', 6),
  ('T1', 4, 'Terraza', 7),
  ('T2', 8, 'Terraza', 8);
