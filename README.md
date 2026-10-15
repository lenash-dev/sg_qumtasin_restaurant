# Qumt'asim · Sistema de gestión

Panel interno del Restaurante Qumt'asim: menú del día, platos, categorías, promociones, reservas, mesas y convenios con empresas. Los cambios del menú y de las promociones se reflejan en la página web (`p_web_quntasim_rest`).

## Stack

| Pieza | Uso |
| --- | --- |
| **Next.js 16** (App Router, Cache Components, Server Actions) | Cada pantalla carga al instante su "esqueleto" y los datos llegan en streaming |
| **Supabase** (Postgres + Auth + RLS) | Base de datos, inicio de sesión y permisos por rol |
| **@supabase/ssr** | Sesión en cookies; `src/proxy.ts` la refresca en cada petición |
| **Tailwind CSS 4** | Mismo diseño que la web, más liviano: el desenfoque solo en la navegación |
| **Zod** | Validación de formularios en el servidor |

Rendimiento: casi todo se dibuja en el servidor (poco JavaScript en el navegador), sin librerías de animación ni scroll suave, y con tarjetas sin `backdrop-filter`.

## Módulos

| Sección | Quién | Qué hace |
| --- | --- | --- |
| Panel | Todos | Resumen del día: reservas, pendientes, estado del menú, solicitudes nuevas |
| Menú del día | Todos | Por fecha y servicio (desayuno, almuerzo, cena): se eligen las categorías del día (ej. Almuerzo ejecutivo, Saludables, Platos extras), sus platos, precio de combo o por plato, "agotado", nota y **publicar**. Se puede copiar el menú de otro día |
| Platos | Todos | Catálogo con precio de carta, etiquetas, destacado (portada de la web) y activo |
| Categorías | Todos | Categorías por servicio y su orden en la web |
| Reservas | Todos | Por día: confirmar, llegó, completar, cancelar; asignar mesa (avisa si está ocupada ±90 min o si es pequeña); registrar reservas por teléfono |
| Promociones | Admin | Se publican en la web (activas y dentro de sus fechas) |
| Convenios | Admin | Solicitudes de la web (seguimiento y notas internas) y convenios semanales o mensuales |
| Mesas | Admin | Mesas, capacidad y zona |

Lo que no está publicado no aparece en la web: un servicio sin menú publicado se muestra como **"No disponible hoy"**.

## Puesta en marcha

### 1. Crear el proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta el contenido de `supabase/migrations/20261014000001_esquema_inicial.sql` (tablas, permisos y funciones).
3. Opcional: ejecuta `supabase/seed.sql` para cargar datos de ejemplo (categorías, platos, el almuerzo de hoy, promociones y mesas).
4. ⚠️ En **Authentication → Sign In / Providers**, desactiva *Allow new users to sign up*. Si queda activado, cualquiera podría crearse una cuenta con la clave pública y entrar como personal. Las cuentas las crea el administrador.

> Con la [CLI de Supabase](https://supabase.com/docs/guides/cli) también se puede: `pnpm dlx supabase link` y `pnpm dlx supabase db push`.

### 2. Crear el primer administrador

1. En **Authentication → Users → Add user**, crea el usuario con correo y contraseña y marca **Auto Confirm User** (si no, no podrá entrar hasta confirmar el correo).
2. En **SQL Editor**, dale el rol de administrador. Esta consulta crea el perfil si no existe (por ejemplo, si el usuario se creó antes de ejecutar la migración) o lo actualiza:

```sql
insert into public.profiles (id, full_name, role)
select id, 'Tu nombre', 'admin' from auth.users where email = 'tu-correo@ejemplo.com'
on conflict (id) do update set role = 'admin', full_name = excluded.full_name;
```

Los demás usuarios que crees quedan como **personal** (menú del día, platos, categorías y reservas).

### 3. Variables de entorno

Copia `.env.example` como `.env.local` y completa la URL y la clave pública del proyecto (*Project Settings → API*). `REVALIDATE_SECRET` debe ser el mismo en el sistema y en la web.

- `NEXT_PUBLIC_SUPABASE_URL` es la **URL del proyecto**, `https://<id>.supabase.co`, sin `/rest/v1/` (el código igual la recorta, pero es la forma correcta).
- `WEBSITE_REVALIDATE_URL` termina en `/api/revalidate` (si pones solo la URL de la web, se completa sola).
- Después de cambiar `.env.local`, reinicia `pnpm dev`.

### Si no puedes iniciar sesión

| Mensaje | Qué hacer |
| --- | --- |
| *Correo o contraseña incorrectos* | Revisa los datos o cambia la contraseña en *Authentication → Users*. |
| *Tu correo aún no está confirmado* | En *Authentication → Users*, abre el usuario y confírmalo. |
| *Tu usuario existe pero no tiene acceso* | Ejecuta la consulta del paso 2 con tu correo. |
| *No se pudo conectar con Supabase* | Revisa la URL y la clave pública en `.env.local` y reinicia `pnpm dev`. |

### 4. Ejecutar

```bash
pnpm install       # instalar dependencias (npm está bloqueado: solo pnpm)
pnpm dev           # http://localhost:3000 (usa "pnpm dev -p 3200" si la web ya ocupa el 3000)
pnpm build         # build de producción
pnpm lint
```

## Conexión con la página web

- La web lee el **menú publicado de hoy** y las **promociones vigentes** con la clave pública. Los permisos (RLS) solo le dejan leer eso y **crear** reservas y solicitudes de convenio; no puede leer datos de clientes.
- Al cambiar el menú, platos, categorías o promociones, el sistema llama a `WEBSITE_REVALIDATE_URL` y la web se actualiza al instante. Sin esa variable, la web se actualiza sola en un minuto.
- Las reservas de la web llegan como **pendientes**; las solicitudes de empresas, como **nuevas**.

## Estructura

```
supabase/
  migrations/      esquema, RLS y funciones (fuente de verdad de la base)
  seed.sql         datos de ejemplo
src/
  proxy.ts         sesión de Supabase y redirección al login
  app/login        inicio de sesión
  app/(panel)/     pantallas del panel (cada una con <Suspense> y esqueleto)
  features/        consultas, Server Actions y formularios por módulo
  components/      layout (barra lateral) y UI
  lib/             Supabase, sesión (auth.ts), fechas en hora de La Paz, utilidades
```

## Notas técnicas

- **Gestor de paquetes: pnpm** (versión fijada en `packageManager` de `package.json`). `scripts/only-pnpm.mjs` corre en `preinstall` y detiene `npm install` o `yarn`. La configuración de pnpm está en `pnpm-workspace.yaml`.
- `src/lib/supabase/database.types.ts` está escrito a mano según la migración. Cuando exista el proyecto, se puede regenerar con `pnpm dlx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts`.
- La seguridad está en la base (RLS): aunque alguien llame directo a la API con la clave pública, no puede leer reservas ni convenios, ni crear reservas en el pasado o ya confirmadas. Cada Server Action vuelve a verificar la sesión y el rol.
- Con Cache Components, todo lo que lee la sesión, la fecha o la URL va dentro de `<Suspense>`; el `fallback` es lo que se ve al instante.
- `backdrop-filter` se declara con `@apply backdrop-blur-*`: escrito a mano, Lightning CSS lo deja solo con prefijo `-webkit-` en producción.
- La migración se probó en PGlite (Postgres en WebAssembly) con un esquema `auth` simulado: 25 pruebas de permisos por rol, restricciones y la copia de menús.

## Pendiente

- [ ] Crear el proyecto de Supabase y conectar ambos proyectos (pasos de arriba).
- [ ] Pedidos y facturación (siguiente fase).
- [ ] Fotos de los platos: hoy se acepta un enlace; se puede sumar Supabase Storage para subirlas.
