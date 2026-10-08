# Portfolio

Web personal y CV de David Merino Recalde, en español e inglés, con un panel privado (`/admin`) para editar los méritos del CV, el portfolio y las variantes de CV exportables a PDF.

- **SvelteKit 2 + Svelte 5** (runes) sobre **Vite 8**, desplegado en **Vercel**.
- **Turso (libSQL)** como fuente de verdad de los datos. Solo se usa en el servidor.
- **Paraglide** para la localización, con rutas `/es/...` y `/en/...`.
- **Auth.js** con GitHub OAuth para el panel `/admin`.
- **Tailwind CSS 4**, con el prefijo `tw:` (ver [sistema de estilos](docs/style-system.md)).
- **Puppeteer** para exportar el CV a PDF.

## Puesta en marcha

Requisitos: Git y Node 22 o superior. En producción, Vercel usa Node 22.

```bash
git clone https://github.com/dxvidmr/portfolio.git
cd portfolio
npm ci
```

1. Copia `.env.example` a `.env` y rellena las variables. Las de Turso son imprescindibles: sin ellas falla el build y no cargan las páginas que leen datos. Las de Auth.js solo hacen falta para entrar en `/admin`; cómo obtenerlas está en la [guía de OAuth](docs/guia-fase2-oauth.md).
2. Arranca el servidor de desarrollo con `npm run dev` y abre <http://localhost:5173>.

> **Importante en un clon nuevo:** `src/lib/paraglide` es código generado y no está en el repo. Lo crea el plugin de Paraglide la primera vez que se ejecuta `npm run dev` o `npm run build`. Hasta entonces, `npm run check` da decenas de errores `Cannot find module '$lib/paraglide/runtime'`.

### Windows

- **`npm run build` necesita el Modo de desarrollador** (Configuración → Sistema → Para desarrolladores). Si no está activado, el adaptador de Vercel falla al final con `EPERM: operation not permitted, symlink`. `dev`, `check` y los tests funcionan sin él.
- **Finales de línea:** `.gitattributes` fija LF en todos los archivos, aunque Git para Windows use `core.autocrlf=true`. Algunos tests de integración dependen de ello.
- **Exportación a PDF en local:** usa Microsoft Edge o Google Chrome instalados en su ruta por defecto. En Vercel se usa `@sparticuz/chromium`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. También genera `src/lib/paraglide`. |
| `npm run build` / `npm run preview` | Build de producción y vista previa local. |
| `npm run check` | Comprobación de tipos con `svelte-check`. |
| `npm test` | Tests con Vitest. Los de integración usan bases SQLite temporales en `tmp/`, no Turso. |
| `npm run migrate` | Aplica las migraciones pendientes de `db/migrations/` a la base del `.env`. |
| `npm run backup` | Vuelca Turso a `backups/` y comprueba que el respaldo se restaura completo. |
| `npm run integrity` | Comprobaciones de integridad de solo lectura contra la base del `.env`. |

`migrate`, `backup` e `integrity` trabajan contra la base configurada en `.env`, que puede ser la de producción.

## Estructura

```
src/
  routes/          Web pública (portada, /cv, /portfolio/[slug]) y panel /admin
  lib/
    components/    Componentes de la web pública, del panel (admin/) y del CV en PDF (admin/cv/)
    content/       Textos, utilidades de contenido y sus tests
    server/        Acceso a datos (db.ts) y lógica del panel (admin/)
    styles/        Tailwind, estilos del panel y del CV paginado
    paraglide/     Generado; no editar ni versionar
messages/          Traducciones de Paraglide (es.json, en.json)
db/
  schema.sql       Esquema de referencia
  migrations/      Migraciones numeradas (NNN_descripcion.sql)
scripts/           Migración, respaldo e integridad de la base de datos
docs/              Documentación de diseño y guías
```

## Base de datos

Turso es la fuente de verdad. `db/cv-data.json` es histórico y no se sincroniza. Los cambios de esquema se hacen con una migración nueva en `db/migrations/`, numerada a continuación de la última, que se aplica con `npm run migrate`. Antes de una migración que borre o transforme datos, conviene hacer un respaldo con `npm run backup`.

## Despliegue

La web se despliega en Vercel. Las variables de entorno tienen que estar definidas en Vercel antes del build, porque se incrustan al compilar. En producción hay que añadir también `AUTH_TRUST_HOST=true`. Los detalles están en la [guía de OAuth y Vercel](docs/guia-fase2-oauth.md).

## Documentación

- [Índice transversal automático y dashboard privado del CV](docs/plan-dashboard-cv.md): plan y decisiones del panel `/admin`.
- [Guía de OAuth y Vercel](docs/guia-fase2-oauth.md)
- [Mis CV: edición y exportación](docs/cv-export.md)
- [Competencias técnicas y metodológicas](docs/competencies.md)
- [Sistema de estilos](docs/style-system.md)
