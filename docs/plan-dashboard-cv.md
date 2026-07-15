# Plan persistente: índice transversal automático y dashboard privado del CV

> Última actualización: 2026-07-15  
> Estado general: **Fase 5A completada; Fase 5B implementada con financiación, titulaciones y eventos canónicos, migraciones aplicadas, pendiente de prueba editorial y despliegue**
> Fuente de verdad: **Turso**. `db/cv-data.json` es histórico y no debe sincronizar contenido.  
> Propósito: este documento debe permitir retomar el trabajo en sesiones distintas sin reconstruir decisiones ni contexto.

## 1. Objetivo

Construir un sistema editorial privado dentro de la aplicación SvelteKit que permita:

- Crear, editar y eliminar entradas del CV en sus tablas específicas.
- Consultar todas las entidades desde un índice transversal generado automáticamente.
- Controlar mediante interruptores qué entradas son públicas, aparecen en portada o se destacan en el CV.
- Gestionar el orden editorial sin duplicar títulos o fechas.
- Mantener el token de Turso y todas las escrituras exclusivamente en el servidor.
- Evitar que una entrada incompleta se publique accidentalmente.
- Poder ampliar después la gestión de etiquetas, relaciones con proyectos, enlaces y documentos.

El resultado debe eliminar la necesidad de actualizar manualmente una tabla `entries` con copias de títulos y fechas.

## 2. Decisiones cerradas

Estas decisiones se consideran aceptadas salvo que se documenten explícitamente cambios posteriores:

1. **Turso es la única fuente de verdad.**
2. El antiguo seed fue de un solo uso y se ha eliminado.
3. No se moverán `show_home`, `featured` y otros controles a todas las tablas académicas.
4. Los datos derivados (`title_cache`, `sort_date`) se obtendrán mediante una vista SQL con `UNION ALL`.
5. Los controles editoriales vivirán en una tabla central independiente.
6. Las entradas nuevas se crearán como borradores privados.
7. El dashboard será monolingüe en español y vivirá en `/admin`, fuera de la navegación pública.
8. La autenticación recomendada es GitHub OAuth mediante Auth.js, limitada a un único ID de GitHub.
9. No habrá registro público, recuperación de contraseña propia ni gestión multiusuario en la primera versión.
10. Todas las mutaciones se harán con acciones de servidor de SvelteKit y transacciones de Turso.
11. Los nombres de tablas y columnas nunca procederán directamente de datos enviados por el navegador.
12. `portfolio_items.featured` seguirá siendo contextual a cada proyecto y no se mezclará con los controles generales.
13. La portada muestra **todas** las entradas con `show_home = 1`: no hay límite editorial fijo y el `LIMIT 5` actual se retira (decisión 2026-07-15). El fallback de actividad reciente conserva su propio límite.
14. «Proyecto de investigación» (fila de la tabla `projects`, referenciada por `project_id`) y «ficha del portfolio» (slug de `projects.ts` que consume `portfolio_items`) son relaciones distintas y la UI las nombrará de forma distinta (decisión 2026-07-15).
15. Las etiquetas de las fichas del home («líneas de trabajo») son contenido de los componentes (`projects.ts`) y **no** se migran a la BD; la base de datos solo conoce la relación entrada↔ficha por slug (`portfolio_items`). `tags`/`entity_tags` quedan reservadas para clasificación temática transversal, sin consumidor actual (decisión 2026-07-15; corrige la redacción anterior de este punto).
16. Los campos `*_type` dejan de ser TEXT libre: pasan a referenciar un vocabulario controlado en BD (`type_vocab`, con `label_es`/`label_en`), para impedir errores de escritura al rellenar y sacar las traducciones de subtipos de `labels.ts` (decisión 2026-07-15; ver sección 5.5, resuelve la pregunta 7). Extensión (mismo día): también los roles con datos y semántica clara — `projects.role` (dominio `project_role`) y `service_activities.role` (`service_role`), migración `005`. `academic_events.role` (sin datos) y `memberships.role` (valor descriptivo con matices y periodos) permanecen como texto libre hasta que haya vocabulario real que codificar.
17. Una entrada privada **no es un borrador**: es un elemento completo del CV que el autor decide no publicar. La UI habla de «privada/pública», nunca de «borrador» (decisión 2026-07-15). El campo `url` de cada entidad es el enlace canónico público del ítem (DOI, web del evento, editorial…); los archivos y certificados (Drive) se gestionarán aparte en `documents` (Fase 5).
18. `portfolio_items` se conserva como relación editorial entre las entradas del CV y las seis fichas narrativas definidas en `projects.ts`. `featured` será únicamente un énfasis visual contextual (símbolo/estilo), nunca un criterio de orden. Los trabajos relacionados se ordenan siempre por `sort_date DESC`; `sort_order` queda como columna heredada sin consumidor y se retirará en la limpieza posterior. La gestión debe priorizar búsqueda y alta rápida, sin reordenación manual (decisión 2026-07-15).
19. La financiación y los premios se relacionan de forma muchos-a-muchos con las actividades mediante `funding_relations`. El extremo de financiación tiene FK directa a `funding_awards`; el extremo polimórfico usa una FK compuesta a `entry_controls`, que actúa como registro transversal. La relación se tipa como `supports`, `recognizes` o `related`, se gestiona desde ambos extremos y no sustituye a `project_id` (decisión 2026-07-15).
20. `academic_works.education_id` relaciona cada TFM/TFG con su titulación mediante FK real; el texto `program` se conserva como descripción/copia bibliográfica, pero la relación se edita con selector. Las tres filas actuales se enlazan por coincidencia exacta y única (decisión 2026-07-15).
21. Los eventos tienen identidad canónica en `events`. Las contribuciones (`academic_events`) y las actividades de organización/evaluación (`service_activities`) conservan sus registros propios y apuntan al evento común mediante `canonical_event_id`, de modo que un mismo evento admite varios roles sin confundir el evento con la comunicación. La mera asistencia se registra aparte en `event_attendance`, con rol visible en el dashboard como «Oyente/asistente»: es siempre privada, no pertenece a `entry_source`, no tiene control de publicación y nunca llega a las consultas públicas. Será un propietario válido de certificados privados en Fase 5D (decisión 2026-07-15; sustituye el aplazamiento anterior de eventos canónicos).

## 3. Estado actual del repositorio

### Base de datos

- Hay una tabla por tipo de entidad: `publications`, `academic_events`, `teaching`, etc.
- `entries` es actualmente una tabla materializada y manual con:
  - `entity_type`
  - `entity_id`
  - `title_cache`
  - `sort_date`
  - `public`
  - `featured`
  - `show_home`
  - `sort_order`
- `projects` contiene además controles propios (`public`, `featured`, `show_home`, `sort_order`) que duplican el concepto general.
- `portfolio_items` tiene su propio `featured`, que sí tiene un significado contextual distinto y se usa en las fichas de proyectos.
- La portada consume `show_home` y cae a actividad reciente si no hay selección curada.
- `entries.featured` no tiene actualmente un consumidor visible en el CV completo.

### Aplicación

- SvelteKit 2 y Svelte 5.
- Adaptador de Vercel.
- Turso mediante `@libsql/client` y variables privadas del servidor.
- Paraglide gestiona `/es` y `/en`.
- `hooks.server.ts` combina redirección de raíz y middleware de idioma mediante `sequence()`.
- No hay autenticación ni rutas administrativas.
- No hay framework de validación ni suite de pruebas configurada.

## 4. Arquitectura objetivo

```text
┌───────────────────────────────────────────────────────────────┐
│ Dashboard privado /admin                                     │
│ crear · editar · publicar · ordenar · relacionar              │
└───────────────────────────────┬───────────────────────────────┘
                                │ acciones de servidor
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
┌────────────────────────────┐       ┌─────────────────────────┐
│ Tablas académicas          │       │ entry_controls          │
│ publications, events, ...  │       │ visibilidad y curación  │
└──────────────┬─────────────┘       └────────────┬────────────┘
               │                                  │
               └────────────────┬─────────────────┘
                                ▼
                    ┌────────────────────────┐
                    │ entries (VIEW)         │
                    │ índice transversal     │
                    └────────────┬───────────┘
                                 ▼
                    portada · CV · proyectos
```

### Principio de escritura

- El contenido académico se escribe una sola vez en su tabla específica.
- La vista calcula automáticamente el título y la fecha transversal.
- La tabla de controles contiene únicamente decisiones editoriales.
- La interfaz pública solo lee.

## 5. Modelo de datos objetivo

### 5.1. Tabla `entry_controls`

Nombre recomendado de columnas:

```sql
CREATE TABLE entry_controls (
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0
    CHECK (is_public IN (0, 1)),
  show_home INTEGER NOT NULL DEFAULT 0
    CHECK (show_home IN (0, 1)),
  home_order INTEGER NOT NULL DEFAULT 0,
  featured_cv INTEGER NOT NULL DEFAULT 0
    CHECK (featured_cv IN (0, 1)),
  cv_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (entity_type, entity_id),
  CHECK (show_home = 0 OR is_public = 1),
  CHECK (featured_cv = 0 OR is_public = 1)
);

CREATE INDEX idx_entry_controls_home
  ON entry_controls(is_public, show_home, home_order);

CREATE INDEX idx_entry_controls_cv
  ON entry_controls(is_public, featured_cv, cv_order);
```

Notas:

- `is_public = 0` por defecto es intencionado: una entrada sin control explícito no debe publicarse.
- El dashboard siempre creará el contenido y su control privado en la misma transacción.
- La ausencia de una fila de control equivale a borrador privado.
- `featured_cv` se conserva como capacidad futura, pero no debe mostrarse en el dashboard hasta que el CV público implemente su efecto.
- `home_order` y `cv_order` evitan sobrecargar un `sort_order` ambiguo.
- `updated_at` no se mantiene solo: fijarlo en el propio `UPSERT` (`SET updated_at = datetime('now')`) o con un trigger `AFTER UPDATE`; elegir una de las dos vías y aplicarla desde la primera versión.

### 5.2. Vista fuente `entry_source`

La vista declara una vez cómo obtener título y fecha de cada tipo. Después, cualquier fila nueva aparece automáticamente.

Mapa inicial:

| Tipo | Título transversal | Fecha transversal |
|---|---|---|
| `projects` | `title` | `date_start` |
| `education` | `degree_title` | `COALESCE(date_end, date_start)` |
| `research_stays` | `institution` | `date_start` |
| `courses` | `title` | `date_start` |
| `funding_awards` | `title` | `year` normalizado |
| `publications` | `title` | `year` normalizado |
| `academic_works` | `title` | `year` normalizado |
| `academic_events` | `title` | `COALESCE(date_start, year)` |
| `teaching` | `title` | `COALESCE(date_start, academic_year)` |
| `service_activities` | `title` | `COALESCE(date_start, year)` |
| `memberships` | `organization` | `date_start` |
| `skills` | `category` | `NULL` |
| `languages` | `language` | `NULL` |

La migración debe definir nombres de columna explícitos en la vista y normalizar las fechas de año a texto comparable. No se deben mezclar fechas arbitrarias sin documentar su formato.

Formato canónico de `sort_date` (cierra la pregunta 3 de la sección 25):

- Fecha completa conocida → `YYYY-MM-DD` (ISO, como ya almacenan las columnas `date_*`).
- Solo año conocido → `YYYY` mediante `CAST(year AS TEXT)`.
- Consecuencia asumida: en orden descendente `2024-06-01` > `2024`, así que dentro de un mismo año las entradas con fecha completa preceden a las de solo año. Es determinista; no fabricar sufijos artificiales (`-01-01`, `-12-31`).

### 5.3. Vista compatible `entries`

Para reducir el riesgo de la migración, la nueva vista `entries` conservará inicialmente la interfaz que espera el código actual:

```sql
CREATE VIEW entries AS
SELECT
  source.entity_type,
  source.entity_id,
  source.title AS title_cache,
  source.sort_date,
  COALESCE(control.is_public, 0) AS public,
  COALESCE(control.featured_cv, 0) AS featured,
  COALESCE(control.show_home, 0) AS show_home,
  COALESCE(control.home_order, 0) AS sort_order,
  control.updated_at
FROM entry_source AS source
LEFT JOIN entry_controls AS control
  ON control.entity_type = source.entity_type
 AND control.entity_id = source.entity_id;
```

Esto permite que `home-data.ts` y `portfolio-items.ts` sigan funcionando durante la primera migración. En una fase posterior podrán usar nombres más explícitos.

### 5.4. Relaciones polimórficas

Estas tablas seguirán usando `(entity_type, entity_id)`:

- `entry_controls`
- `portfolio_items`
- `entity_tags`
- `documents`
- `links`
- `funding_relations` (solo en el extremo de la actividad relacionada)

SQLite no puede expresar una clave foránea que apunte condicionalmente a trece tablas. La integridad se garantizará mediante:

- Acciones administrativas transaccionales.
- Validación previa de existencia.
- Limpieza explícita al eliminar.
- Pruebas de integridad periódicas.

Excepción incorporada en la Fase 5B: cuando una tabla relacional se crea después de `entry_controls`, puede usar esa clave compuesta como registro transversal. `funding_relations` lo hace y obtiene integridad referencial y borrado en cascada sin apuntar condicionalmente a trece tablas base. Las tablas polimórficas heredadas mantienen por ahora la validación y limpieza en aplicación descritas arriba.

No se añadirán triggers de sincronización de título o fecha. Se pueden añadir triggers de limpieza después, pero no son necesarios para la primera entrega.

### 5.5. Vocabulario controlado de tipos

Decisión 16: los siete campos de tipo (`publications.publication_type`, `academic_events.contribution_type`, `teaching.teaching_type`, `service_activities.activity_type`, `funding_awards.award_type`, `projects.project_type`, `academic_works.work_type`; más adelante también `documents.document_type` y `links.link_type`) pasan a referenciar un vocabulario central:

```sql
CREATE TABLE type_vocab (
  code TEXT PRIMARY KEY,
  domain TEXT NOT NULL,          -- 'publication_type', 'contribution_type', ...
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_type_vocab_domain ON type_vocab(domain, sort_order);
```

Notas:

- Semilla inicial: `entitySubtypeLabels` de `labels.ts` más los tipos hoy sin traducción (`predoctoral_contract`, `prize`, `scholarship`). Tras el cambio, `entitySubtypeLabels` desaparece y `labels.ts` conserva solo los nombres de entidad (`entityTypeLabels`), que podrán migrar más adelante si conviene.
- Añadir un tipo nuevo = un `INSERT` en `type_vocab` desde `/admin/taxonomias`, sin desplegar código: los selectores del dashboard y las etiquetas de la web pública leen del vocabulario.
- SQLite no permite añadir una FK con `ALTER TABLE`: cada tabla afectada se reconstruye (crear tabla nueva con `REFERENCES type_vocab(code)`, copiar datos, renombrar), una por transacción, retirando de paso los `CHECK` de tipos que el vocabulario sustituye.
- Límite conocido: una FK de una sola columna garantiza que el código exista, no que pertenezca al dominio correcto (una publicación podría referenciar `workshop`). Mitigación: los selectores del dashboard filtran por `domain` y la batería de integridad comprueba el `domain` por tabla.
- Migración independiente de la `002`, prevista como `004_type_vocabulary.sql`: se ejecuta con la `002` ya estable y tras corregir el valor sucio detectado en Fase 0.

## 6. Estrategia de migración de Turso

La migración debe ser versionada y no destructiva al principio.

Archivo previsto:

```text
db/migrations/002_entry_controls_and_views.sql
```

### Herramienta de aplicación y respaldo

- La CLI de Turso solo corre en WSL (`~/.turso/turso`, fuera del PATH no interactivo) y a fecha 2026-07-15 no tiene sesión iniciada: hace falta `turso auth login` antes del respaldo de Fase 0. Respaldo: `~/.turso/turso db shell curriculum .dump > backups/curriculum-AAAAMMDD.sql`, verificando que restaura en una base local.
- Para aplicar migraciones sin depender de la CLI, crear `scripts/migrate.ts` (con `tsx`, `dotenv` y `@libsql/client`, ya presentes en el proyecto) que lea `db/migrations/*.sql` en orden y registre las aplicadas en `schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`. Ejecutable como `npm run migrate` en local y CI con las variables del entorno.

### Paso A. Preparación

- [x] Confirmar que el árbol de trabajo está limpio o entender cambios pendientes (README y docs/ pendientes, trabajo de documentación).
- [x] Obtener un respaldo o snapshot verificable de Turso (`backups/curriculum-2026-07-15.sql`, restauración local verificada tabla a tabla; `backups/` en `.gitignore`).
- [x] Registrar recuentos de todas las tablas (ver resultados de Fase 0).
- [x] Exportar las filas actuales de `entries` con sus controles (incluidas en el respaldo completo).
- [x] Comprobar discrepancias entre controles de `projects` y `entries`: ninguna.
- [x] Documentar qué fuente gana en caso de discrepancia: no aplicó (0 discrepancias).

### Paso B. Crear controles

- [x] Crear `entry_controls` e índices.
- [x] Copiar todas las filas actuales de control desde `entries` (88 filas).
- [x] Traducir:
  - `public` → `is_public`
  - `show_home` → `show_home`
  - `sort_order` → `home_order`
  - `featured` → `featured_cv`
- [x] Conservar las ocho filas con `show_home = 1` existentes (auditadas el 2026-07-15; el plan asumía cuatro).
- [x] Crear controles con `is_public = 1` para las filas base que no estaban en `entries` (`courses` #7 y `academic_events` #20; el INSERT es genérico por tipo por si hubiera altas posteriores a la auditoría). Total: 90 controles, todos públicos.
- [x] Normalizar los empates de orden en portada: `home_order` explícito 10–80 reproduciendo el orden visual auditado.
- [x] Verificar que ninguna entrada pública se haya convertido en privada (90/90 públicas).

### Paso C. Crear vistas sin sustituir todavía `entries`

- [x] Crear `entry_source`.
- [x] Consultar recuento total y por `entity_type` (90; por tipo = tabla base en los 13 tipos).
- [x] Comparar títulos y fechas con la tabla `entries` antigua: el mapa se pre-validó contra datos reales antes de escribir la vista, con 0 discrepancias en las 88 filas coincidentes.
- [x] Resolver cualquier diferencia deliberadamente: no hubo.
- [x] Probar orden cronológico y fechas parciales (formatos presentes: `YYYY-MM-DD`, `YYYY-MM`, `YYYY`, `YYYY-YYYY`; orden lexicográfico descendente verificado con el orden de portada).

### Paso D. Sustitución compatible

- [x] Renombrar la tabla existente a `entries_legacy`.
- [x] Crear la vista compatible `entries`.
- [ ] Desplegar el código preparado para la vista (actualizado y compilado en local; falta commit + push a Vercel). Mientras tanto, el código desplegado antiguo sigue funcionando contra la vista compatible.
- [ ] Verificar portada, CV y fichas de proyectos en producción tras el despliegue (verificado ya contra la BD de producción con las consultas nuevas).
- [x] Mantener `entries_legacy` durante al menos una entrega estable (conservada, 88 filas).

### Paso E. Limpieza posterior

En una migración separada, no en la misma sesión:

```text
db/migrations/003_drop_entries_legacy.sql
```

- [ ] Confirmar que no hay código que escriba en `entries`.
- [ ] Confirmar que no hay diferencias entre vista y legado.
- [ ] Eliminar `entries_legacy`.
- [ ] Marcar como obsoletos los controles duplicados de `projects`.
- [ ] Eliminar esos controles de `projects` solo después de actualizar todas las consultas.

### Rollback

Si falla la vista o el despliegue:

1. Retirar o renombrar la vista `entries`.
2. Renombrar `entries_legacy` de nuevo a `entries`.
3. Restaurar el código de lectura anterior.
4. No eliminar `entry_controls`; puede permanecer sin consumidores hasta reintentar.

## 7. Cambios previstos en la capa de datos

### Archivos principales

```text
src/lib/server/db.ts
src/lib/server/home-data.ts
src/lib/server/portfolio-items.ts
src/routes/cv/+page.server.ts
src/routes/proyectos/[slug]/+page.server.ts
```

### Reglas

- La web pública solo puede mostrar filas con `public = 1` de la vista.
- La consulta de portada (`home-data.ts`) retirará el `LIMIT 5`: se muestran todas las filas con `show_home = 1` ordenadas por `home_order` (decisión 13). El fallback de actividad reciente mantiene un límite propio (hoy `slice(0, 4)`).
- El CV completo debe dejar de consultar tablas públicas sin aplicar visibilidad.
- El dashboard necesita dos consultas:
  - `entry_source` para ver también borradores sin control.
  - `entry_controls` para estados y orden.
- No se escribirá nunca en la vista `entries`, que es de solo lectura.
- Los detalles propios de cada entidad se seguirán consultando en su tabla específica.

### Pruebas de integridad SQL previstas

- Una fila fuente aparece exactamente una vez en `entry_source`.
- No existen controles huérfanos.
- No existen `portfolio_items`, `entity_tags`, `documents` o `links` huérfanos.
- Toda entrada con `show_home = 1` tiene `is_public = 1`.
- Toda entrada con `featured_cv = 1` tiene `is_public = 1`.
- No hay combinaciones duplicadas de `(entity_type, entity_id)`.
- Tras la migración `004`: todo valor `*_type` existe en `type_vocab` y su `domain` corresponde a la tabla que lo usa.

## 8. Autenticación y autorización

### Solución elegida

Auth.js para SvelteKit con GitHub OAuth y sesión JWT/cookie, sin adaptador de base de datos en la primera versión.

Dependencia prevista:

```bash
npm install @auth/sveltekit
```

Variables privadas previstas:

```text
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
ADMIN_GITHUB_ID=
```

`ADMIN_GITHUB_ID` debe contener el identificador numérico inmutable de GitHub, no solo el nombre de usuario o correo.

Dónde vive cada secreto (decidido 2026-07-15):

- **Vercel → Environment Variables (Production)**: todas las variables de arriba más las `TURSO_*` ya existentes. Con `$env/static/private` se incrustan en build, así que deben estar en Vercel **antes** del deploy que incluya el código de auth.
- **Local `.env`**: mismas variables pero con las credenciales de la OAuth App de desarrollo (callback `http://localhost:5173/auth/callback/github`) y un `AUTH_SECRET` distinto al de producción.
- **GitHub**: solo como origen — la OAuth App genera el Client ID/Secret. No se usa GitHub Secrets (no hay Actions; Vercel construye desde el repo).
- Dos OAuth Apps separadas (dev y prod): el callback debe coincidir exactamente. `/admin` no funcionará en previews de Vercel (URLs cambiantes); solo producción y local.
- En Vercel, Auth.js necesita confiar en el host de la petición: definir `AUTH_TRUST_HOST=true` (o `trustHost: true` en la configuración) o el callback fallará tras el proxy.

### Integración

Archivos previstos:

```text
src/auth.ts
src/hooks.server.ts
src/app.d.ts
src/routes/admin/+layout.server.ts
src/routes/admin/+layout.svelte
```

Pasos:

- [x] Configurar el proveedor GitHub (`src/auth.ts`, credenciales desde `$env/static/private`, `trustHost: true`).
- [x] Rechazar el inicio de sesión si el ID no coincide con `ADMIN_GITHUB_ID` (callback `signIn`; el ID numérico viaja al token JWT y a la sesión como `user.githubId`).
- [x] Añadir el handler de Auth.js a `sequence()` sin romper Paraglide (orden: rootRedirect → noindex → auth → guardia admin → paraglide; `/`, `/es`, `/en`, `/es/cv` verificados).
- [x] Excluir `/admin` y `/auth` de la localización de Paraglide (patrones añadidos a `vite.config.ts` antes del general; requiere reiniciar el dev server).
- [x] Tipar usuario y sesión (`Session.user.githubId` en `app.d.ts`; `App.Locals.auth()` lo aporta el propio paquete).
- [x] Proteger todo `/admin` con guardia por prefijo en `hooks.server.ts` + `+layout.server.ts` como defensa en profundidad. Verificado: GET y POST sin sesión → 303 a `/auth/signin`.
- [ ] Repetir la autorización dentro de cada acción de servidor sensible (helper `isAdmin()` exportado en `src/auth.ts`; aplicarlo en cada acción de las fases 3–4).
- [x] Añadir cierre de sesión (acción `salir` en `/admin/+page.server.ts` con el helper `signOut` de Auth.js).
- [x] Añadir `noindex` (meta en el layout admin + `X-Robots-Tag` en handle previo a Auth.js — sus respuestas de `/auth/*` cortocircuitan `resolve()` y solo los handles anteriores pueden cabecearlas) y sin enlaces públicos al dashboard.
- [x] Configurar callback local y de producción en GitHub OAuth (hecho por el autor; dominio `davidmerinorecalde.com`).

### Reglas de seguridad

- Nunca enviar `TURSO_AUTH_TOKEN` al cliente.
- Nunca usar un cliente Turso directamente desde componentes Svelte del navegador.
- No confiar solo en ocultar enlaces o botones.
- No aceptar nombres de tabla, columna u orden SQL sin allowlist.
- No interpolar valores de formularios en SQL.
- Usar argumentos parametrizados.
- Revalidar sesión y permisos en cada mutación.
- Las eliminaciones requieren confirmación y transacción.
- No registrar secretos, tokens ni contenido privado en logs.
- Considerar un token de Turso restringido a esta base y a las operaciones necesarias.

Referencias:

- [Auth.js para SvelteKit](https://authjs.dev/)
- [Turso con SvelteKit](https://docs.turso.tech/sdk/ts/guides/sveltekit)
- [Autorización y tokens de Turso](https://docs.turso.tech/sdk/authorization)

## 9. Estructura de rutas del dashboard

El dashboard será español únicamente y no se incluirá en el selector de idioma.

```text
/admin
  Resumen y accesos rápidos

/admin/entradas
  Índice transversal con búsqueda y filtros

/admin/entradas/nueva
  Selector de tipo y formulario de creación

/admin/entradas/[type]/[id]
  Edición de contenido y controles

/admin/portada
  Curación y orden de show_home

/admin/portfolio
  Relaciones entre proyectos del portfolio y entidades

/admin/taxonomias
  Vocabulario de tipos (`type_vocab`), etiquetas, enlaces y documentos; el vocabulario llega con la Fase 4, el resto en fase posterior
```

No se crearán endpoints JSON públicos si una acción de formulario de SvelteKit resuelve el caso. Las
acciones editoriales se mejoran progresivamente con `use:enhance`: escriben en la BD mediante `fetch`,
pero no navegan ni recargan la página.

## 10. Organización interna del código

Estructura prevista:

```text
src/lib/server/admin/
  auth.ts
  entity-definitions.ts
  entries.ts
  controls.ts
  relations.ts
  validation.ts

src/lib/components/admin/
  AdminShell.svelte
  EntryTable.svelte
  EntryFilters.svelte
  EntryControls.svelte
  EntityForm.svelte
  ConfirmDialog.svelte
  FormField.svelte
```

### `entity-definitions.ts`

Debe ser una allowlist central, no una configuración enviada desde el navegador.

Para cada tipo declarará:

- Nombre de tabla.
- Etiqueta humana.
- Campo de título.
- Campos permitidos en creación y edición.
- Tipos de campo. Los campos de tipo (select) toman sus opciones de `type_vocab` filtrado por `domain` (decisión 16).
- Campos obligatorios.
- Relaciones admitidas.
- Función de validación.
- SQL permitido o constructor seguro de consultas.

La primera versión no debe intentar hacer un CRUD completamente genérico mediante nombres arbitrarios. Compartirá componentes visuales, pero mantendrá control explícito de las columnas.

## 11. Formularios y validación

### Dependencia propuesta

Usar `zod` para esquemas de validación compartidos en servidor. Evaluar una librería de formularios solo si reduce complejidad real; SvelteKit form actions son suficientes para la primera versión.

**Decisión final (2026-07-15)**: zod evaluado y descartado. Con las definiciones de campo declarativas de `entity-definitions.ts`, un validador propio por tipo de campo (`validation.ts`, ~100 líneas, errores en español junto al campo) resultó menos código que el pegamento de esquemas dinámicos, sin dependencia nueva. Las form actions de SvelteKit se confirmaron suficientes.

### Comportamiento común

- Errores junto al campo correspondiente.
- Conservación de valores cuando falla la validación.
- Fechas normalizadas antes de guardar.
- URL validadas y vacíos convertidos en `NULL` cuando corresponda.
- Confirmación visible tras guardar.
- Aviso de cambios sin guardar.
- Navegación por teclado y etiquetas accesibles.
- Botón “Guardar borrador”.
- Acción separada “Publicar”.

### Prioridad de tipos

Primera tanda:

1. `publications`
2. `academic_events`
3. `teaching`
4. `projects`
5. `education`
6. `research_stays`
7. `funding_awards`
8. `service_activities`

Segunda tanda:

9. `academic_works`
10. `courses`
11. `memberships`
12. `skills`
13. `languages`

## 12. Operaciones CRUD

### Crear

Una transacción debe:

1. Validar sesión.
2. Validar `entity_type` contra allowlist.
3. Validar el formulario.
4. Insertar en la tabla específica.
5. Obtener `lastInsertRowid`.
6. Insertar `entry_controls` con `is_public = 0`.
7. Insertar relaciones opcionales válidas.
8. Registrar auditoría si está implementada.
9. Confirmar la transacción.

Nota de implementación: en Vercel el cliente libSQL trabaja sobre HTTP. Cuando el conjunto de sentencias se conoce de antemano (todas salvo la lectura de `lastInsertRowid` intermedia), preferir `db.batch('write', [...])`, que es transaccional y sin estado entre peticiones, frente a transacciones interactivas, que mantienen la transacción abierta entre round-trips y pueden expirar.

### Editar

1. Validar sesión, tipo e ID.
2. Confirmar que la entidad existe.
3. Actualizar solo columnas permitidas.
4. Actualizar controles mediante `UPSERT`.
5. Actualizar relaciones dentro de la misma transacción.
6. Confirmar y devolver estado actualizado.

### Publicar

- No permitir publicar si faltan campos esenciales.
- `show_home = 1` implica `is_public = 1`.
- Despublicar debe apagar también `show_home` y `featured_cv`.
- El dashboard debe mostrar claramente el estado final.

### Eliminar

Orden recomendado dentro de una transacción:

1. `documents`
2. `links`
3. `entity_tags`
4. `portfolio_items`
5. `funding_relations` en ambos extremos
6. `entry_controls`
7. Fila de la tabla específica

La primera versión puede implementar “archivar/despublicar” antes que borrado definitivo si se considera más seguro.

Casos especiales de eliminación: al borrar un proyecto, `publications`, `academic_events`, `teaching` y `funding_awards` tienen `project_id REFERENCES projects(id)`; al borrar una titulación, `academic_works.education_id` la referencia. La transacción debe poner esas FK a `NULL` (o reasignarlas) antes de eliminar. Verificar además si la conexión aplica `PRAGMA foreign_keys`, porque SQLite no lo activa por defecto.

## 13. Pantallas y experiencia de uso

### Resumen `/admin`

- Número de entradas públicas y borradores.
- Entradas visibles en portada.
- Últimas modificaciones.
- Accesos “Nueva entrada”, “Gestionar portada” y “Ver web pública”.

### Índice `/admin/entradas`

Columnas:

- Tipo.
- Título derivado.
- Fecha derivada.
- Estado público.
- Portada.
- Destacado CV, cuando exista consumidor.
- Última actualización.
- Acciones.

Filtros:

- Texto.
- Tipo.
- Año.
- Público/borrador.
- Portada sí/no.
- Con/sin relaciones.

### Curación `/admin/portada`

- Lista exclusiva de `show_home = 1`.
- Reordenación local mediante controles accesibles “subir/bajar”; arrastrar puede añadirse después.
- Las flechas solo cambian el borrador visible. El orden completo se persiste en una única escritura al
  pulsar «Guardar orden», sin recargar la página.
- Vista previa de tipo, título y fecha.
- Desactivar sin eliminar y sin perder el contexto actual de la interfaz.
- Sin límite editorial: la portada muestra todas las entradas activadas (decisión 13). La pantalla lista las ocho actuales completas, con su orden.
- Advertencia si no hay entradas seleccionadas y se activará el fallback público.

### Edición

Separar visualmente:

1. Contenido académico.
2. Visibilidad y curación.
3. Relaciones: evento de origen y proyecto de investigación (FK), ficha del portfolio y etiquetas, con nombres bien diferenciados (decisión 14).
4. Enlaces y documentos.
5. Zona peligrosa.

## 14. Relaciones y archivos

No forman parte del MVP inicial, pero el modelo debe prepararse para ellas.

### Cuatro planos de relación (no confundirlos)

La UI debe nombrar sin ambigüedad cuatro tipos de vínculo distintos:

1. **Relaciones estructurales (FK reales en la fila de la entidad).** `publications.event_id` → `academic_events` (publicación derivada de una comunicación); `project_id` en `publications`, `academic_events`, `teaching` y `funding_awards` → `projects` (proyecto de investigación de la BD); `academic_works.education_id` → `education` (titulación en la que se realizó el TFM/TFG); `academic_events.canonical_event_id` y `service_activities.canonical_event_id` → `events` (identidad común del evento). Se editan como selectores dentro del formulario de la propia entidad, declarados en `entity-definitions.ts` como campos de tipo relación con consulta de lookup allowlistada.
2. **Relación editorial con fichas del portfolio.** `portfolio_items.portfolio_slug` apunta a las fichas definidas en `projects.ts` — el “proyecto del home”. No es lo mismo que `project_id` y no deben compartir nombre en la interfaz: «Proyecto de investigación» frente a «Ficha del portfolio».
3. **Etiquetas** (`entity_tags`).
4. **Relaciones contextuales entre entradas.** `funding_relations` vincula una ayuda, contrato o premio con proyectos, formación, estancias, cursos, publicaciones, trabajos académicos, eventos, docencia o servicio. Es muchos-a-muchos y su tipo expresa «financia/sustenta», «premia/reconoce» o una relación contextual neutral.

Conviene además una vista inversa en la edición: desde un evento, listar las publicaciones derivadas; desde un proyecto de investigación, listar todas las entradas que lo referencian.

### Eventos canónicos y roles

- `events` guarda una sola vez nombre, fechas, institución, lugar, modalidad y URL común.
- `academic_events` representa una contribución concreta; mantiene su visibilidad editorial y puede seguir siendo origen de una publicación mediante `publications.event_id`.
- `service_activities` representa organización, comité, evaluación u otro servicio y conserva su visibilidad propia.
- `event_attendance` representa únicamente que el autor acudió como oyente/asistente. Su `role_label` es editable para conservar la denominación exacta del certificado, pero su tipo técnico es siempre `attendee` y el registro es privado por diseño.
- Editar los datos comunes desde `/admin/eventos/[id]` sincroniza las copias heredadas necesarias para compatibilidad. Las consultas públicas leen preferentemente del evento canónico.
- No se infiere asistencia a partir de contribuciones o servicio: cada rol se registra de forma explícita.

### `portfolio_items`

- Seleccionar uno o varios proyectos del portfolio.
- Orden cronológico automático dentro de cada proyecto.
- `featured` contextual, sin relación con `featured_cv`.
- Previsualizar cómo aparecerá en la ficha.

### Etiquetas

Estado actual (auditado 2026-07-15): `tags` tiene 4 etiquetas temáticas bilingües (`teatro-siglo-de-oro`, `estudios-teatrales`, `humanidades-digitales`, `edicion-archivistica-digital`) y `entity_tags` está vacía. Las etiquetas de las fichas del home son contenido de `projects.ts` y no van a la BD (decisión 15).

No confundir con la clasificación por tipo: `book`, `book_review`, `conference_paper`, etc. ya clasifican las entradas mediante las columnas `*_type` de cada tabla, y sus traducciones viven en `src/lib/content/labels.ts` (diseño documentado en la cabecera de `db/schema.sql`: código estable en BD, traducción en i18n del frontend). Duplicarlas en `tags`/`entity_tags` reintroduciría la duplicación que este plan elimina. Si se quisiera editar esas traducciones desde el dashboard, la forma correcta sería una tabla lookup `type_labels(domain, code, label_es, label_en)`, no `entity_tags` (ver pregunta 7 de la sección 25).

- `tags`/`entity_tags` quedan reservadas para clasificación temática transversal de entradas (p. ej., filtrar el CV por tema). Sin consumidor hoy: fuera del MVP hasta que exista un caso de uso.
- Selector múltiple desde `tags`.
- Crear etiqueta solo desde una pantalla específica para evitar duplicados ortográficos.
- Etiquetas bilingües obligatorias.

### Enlaces

- Tipo, etiqueta, URL, principal y público.
- Validar protocolo y URL.
- Permitir varios enlaces por entidad.

### Documentos

- La primera versión gestionará metadatos y URL, no subida directa.
- Nunca exponer certificados o documentos privados.
- `is_public` e `is_certificate` deben tener reglas explícitas.

## 15. Auditoría y observabilidad

Recomendado después del CRUD básico:

```sql
CREATE TABLE admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  summary TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Registrar:

- Creación.
- Edición.
- Publicación/despublicación.
- Cambio de portada.
- Cambio de orden.
- Eliminación.

No registrar tokens, secretos ni el contenido completo de campos sensibles.

## 16. Estrategia de pruebas

### Herramientas propuestas

- `vitest` para lógica y validación.
- Base libSQL/SQLite temporal local para integración: `createClient({ url: 'file:...' })` o `:memory:` permiten aplicar `schema.sql` más las migraciones y probar las vistas sin tocar Turso.
- `@playwright/test` para los flujos administrativos críticos, en una fase posterior.

### Pruebas mínimas de base de datos

- La vista devuelve todos los tipos esperados.
- Actualizar un título original cambia inmediatamente el título de la vista.
- Actualizar una fecha original cambia su orden transversal.
- Una entidad sin control es privada.
- Una entrada privada no aparece en portada ni CV público.
- Las ocho filas curadas actuales mantienen su estado y aparecen todas en portada, en el orden de `home_order`.
- Eliminar una entidad no deja relaciones huérfanas desde el dashboard.

### Pruebas mínimas de autenticación

- Usuario no autenticado → redirección a login.
- Usuario de GitHub no autorizado → acceso rechazado.
- Administrador permitido → acceso correcto.
- Acción POST sin sesión → rechazada.
- Cerrar sesión invalida el acceso.

### Pruebas mínimas de CRUD

- Crear borrador por cada tipo soportado.
- Editar y conservar valores `NULL` correctamente.
- Publicar y despublicar.
- Activar/desactivar portada.
- Reordenar portada.
- Manejar errores de Turso sin dejar escrituras parciales.
- Confirmar eliminación o archivado.

### Validaciones por fase

En cada fase ejecutar, según corresponda:

```bash
npm run check
npm run test
npm run build
```

No levantar un servidor nuevo como paso final si ya existe un servidor local de revisión.

## 17. Despliegue

### Antes del primer despliegue administrativo

- [ ] Crear aplicación OAuth de GitHub para desarrollo.
- [ ] Crear/configurar aplicación OAuth para producción.
- [ ] Configurar variables en Vercel.
- [ ] Verificar callback exacto.
- [ ] Aplicar migraciones con respaldo previo.
- [ ] Probar `/admin` en preview protegido.
- [ ] Probar una escritura no crítica.
- [ ] Confirmar que la web pública no cambia para borradores.

### Orden seguro de despliegue

1. Migración aditiva: controles y vistas auxiliares.
2. Código compatible con tabla antigua y vista nueva.
3. Sustitución de `entries` por vista compatible.
4. Dashboard de lectura y controles.
5. Formularios CRUD.
6. Limpieza de legado.

Nunca aplicar una migración destructiva y un cambio de código incompatible sin una ruta de rollback probada.

## 18. Fases de implementación

### Fase 0 — Auditoría y respaldo

Estado: `completado` (2026-07-15)

- [x] Inventariar recuentos y controles actuales.
- [x] Auditar duplicados entre `projects` y `entries`.
- [x] Auditar relaciones huérfanas existentes: ninguna (en `entries`, `portfolio_items`, tipos y slugs; `documents`, `links` y `entity_tags` están vacías).
- [x] Crear respaldo verificable: `backups/curriculum-2026-07-15.sql` (script propio con `@libsql/client`; restauración local verificada tabla a tabla; carpeta en `.gitignore`).
- [x] Corregir valores sucios: 4 corregidos y verificados, todos en las 2 filas creadas a mano — `academic_events` #20 (título con espacio final, `event_title` y `contribution_type` con tabulador) y `courses` #7 (título con tabulador).
- [x] Traducciones que faltan (`predoctoral_contract`, `prize`, `scholarship`): incluidas en la semilla de `type_vocab` (migración `004`), con textos redactados nuevos revisables desde `/admin/taxonomias` cuando exista.
- [x] Documentar resultados en este archivo.

Resultados de la auditoría (2026-07-15, consultas de solo lectura vía `@libsql/client` con las credenciales de `.env`):

- Recuentos base vs `entries`: idénticos en 11 de 13 tipos. Difieren `courses` (7 vs 6) y `academic_events` (20 vs 19): hay una fila de cada tipo sin entrada en el índice. Causa confirmada por el autor: se crearon directamente en las tablas base y el paso manual de duplicarlas en `entries` evidenció el defecto que este plan corrige. En el backfill reciben control con `is_public = 1`.
- Discrepancias de controles entre `projects` y `entries`: ninguna.
- Filas de `entries` con `public = 0`: ninguna; todo el índice actual es público.
- Curación de portada: **ocho** filas con `show_home = 1`, no cuatro como asumía este plan. Cinco comparten `sort_order = 0` (desempatan por `sort_date DESC`) y son las que muestra el `LIMIT 5`; las tres restantes (orden 20, 30, 40) no llegan a portada.
- El CV público (`/cv`) no muestra `courses`, `academic_works`, `memberships`, `skills` ni `languages`; el resto de tablas base se muestran sin ningún filtro de visibilidad (salvo `projects.public = 1`).
- Etiquetas: `tags` contiene 4 etiquetas temáticas bilingües y `entity_tags` está vacía (ninguna asignación). Las etiquetas de las fichas del home viven en `projects.ts` y no migran a BD (decisión 15).
- Tipos en uso: `academic_events` tiene un valor sucio `conference_paper` con tabulador final (1 fila) que escapa al diccionario de `labels.ts`. Los tres tipos de `funding_awards` (`predoctoral_contract`, `prize`, `scholarship`) no tienen entrada en `entitySubtypeLabels` y hoy se muestran con el fallback sin traducir.

Criterio de aceptación:

- Existe un snapshot/restauración posible y conocemos todas las discrepancias antes de migrar.

### Fase 1 — Vista transversal y controles

Estado: `completado` y desplegado en producción (2026-07-15)

- [x] Crear migración `002` (aplicada con el nuevo runner `scripts/migrate.ts` / `npm run migrate`; ensayada antes en local contra el respaldo restaurado, 23/23 comprobaciones).
- [x] Crear `entry_controls`.
- [x] Migrar controles actuales (88 + 2 backfill = 90, todos públicos).
- [x] Crear `entry_source`.
- [x] Validar títulos, fechas y recuentos (0 discrepancias con `entries_legacy`; solo difiere `sort_order` en las 8 de portada, por la normalización deliberada).
- [x] Crear vista compatible `entries`.
- [x] Actualizar consultas públicas necesarias: `/cv` aplica visibilidad vía JOIN con la vista (las 8 secciones), y la portada retiró el `LIMIT 5` (decisión 13). `npm run check` y `npm run build` en verde.
- [x] Mantener `entries_legacy`.

Criterio de aceptación:

- Cambiar un título o fecha en su tabla original se refleja sin tocar otra tabla.
- La portada muestra las ocho entradas curadas actuales completas: se retira el `LIMIT 5` (decisión 13).
- El CV y las fichas siguen funcionando.

### Fase 2 — Autenticación y shell privado

Estado: `completado` — login real verificado en producción con el administrador permitido

- [x] Instalar y configurar Auth.js (`@auth/sveltekit@1.11.2`).
- [x] Integrar GitHub OAuth y allowlist (detalle en §8).
- [x] Proteger `/admin` (hooks + layout; GET y POST sin sesión rechazados, verificado).
- [x] Crear layout administrativo (`/admin`: shell mono con nav, sesión y zonas pendientes marcadas).
- [x] Añadir cierre de sesión y `noindex` (meta + `X-Robots-Tag` verificada en `/auth/signin`).
- [x] Prueba de login real: entrada correcta con `dxvidmr` en producción; allowlist por ID confirmada mediante el rechazo previo cuando el ID de entorno no coincidía.

Criterio de aceptación:

- Solo el ID de GitHub configurado puede entrar y ninguna acción acepta sesiones ausentes.

### Fase 3 — Índice y controles editoriales

Estado: `completado` (2026-07-15) — prueba editorial del autor superada en local y en producción (ciclos de portada, reordenación, toasts). El criterio de aceptación se cumple: la portada se gestiona íntegramente desde `/admin` sin tocar Turso.

- [x] Crear listado transversal.
- [x] Añadir búsqueda y filtros.
- [x] Añadir interruptores público/portada.
- [x] Añadir orden accesible de portada.
- [x] Añadir feedback y manejo de errores.
- [x] Ejecutar búsqueda y filtros en memoria, sin peticiones ni navegación por cada cambio.
- [x] Mejorar interruptores y acciones de portada para persistir por `fetch` sin recargar la página.
- [x] Acumular la reordenación en cliente y guardar el orden completo solo al confirmarlo.
- [x] Mostrar el resultado de las acciones como toast flotante y temporal, no como aviso fijo en el flujo
  de la página (3,5 s para éxito; 6 s para error; cierre manual y `aria-live`).

Criterio de aceptación:

- Se puede gestionar íntegramente “Actividad reciente” sin usar Turso manualmente.

### Fase 4 — CRUD de tipos prioritarios

Estado: `completado` y desplegado en producción — dos pruebas editoriales del autor superadas (2026-07-15)

- [x] Añadir allowlist y validación: definiciones de campo declarativas por tipo en `entity-definitions.ts` (nombres de tabla/columna nunca del navegador) y validador propio en `validation.ts` (zod descartado, ver §11).
- [x] Migración `004`: `type_vocab` creado y sembrado (27 códigos, 7 dominios; incluye los 3 `award_type` con traducción nueva) y las 7 tablas reconstruidas con FK y sin los CHECK antiguos. Ensayo local 20/20; validación en producción 18/18. **Verificado que Turso aplica las FK**: un código inexistente se rechaza a nivel de BD.
- [x] Alimentar los selectores de tipo desde `type_vocab` filtrado por dominio (`getFieldOptions` en `crud.ts`; revalidación código+dominio contra BD en cada envío).
- [x] Sustituir `entitySubtypeLabels` de `labels.ts` por lecturas del vocabulario: `portfolio-items.ts` devuelve `subtype_label_es/en` vía JOIN y `ProjectModal` elige por locale con fallback al código. El diccionario se eliminó de `labels.ts` (solo queda `entityLabel`).
- [x] `/cv`: chips y filtro de tipo muestran etiquetas del vocabulario por idioma (verificado en `/es/cv` y `/en/cv`; cero códigos crudos). Los pseudotipos literales `education`/`research_stay` se retiraron: solo duplicaban el nombre de la sección.
- [x] Implementar formularios de la primera tanda: los 8 tipos (`publications`, `academic_events`, `teaching`, `projects`, `education`, `research_stays`, `funding_awards`, `service_activities`) comparten `EntityForm`/`FormField` con campos declarados por tipo.
- [x] Incluir los campos FK como selectores («Evento de origen», «Proyecto de investigación»), con lookup allowlistado y verificación de existencia en servidor.
- [x] Crear borradores privados: `/admin/entradas/nueva/[type]` inserta contenido + control `is_public = 0` en la misma transacción.
- [x] Editar y publicar: `/admin/entradas/[type]/[id]` con secciones Contenido / Visibilidad (publicar–despublicar reutiliza `updateEntryControl`, que en cascada apaga portada y CV al despublicar) / Zona peligrosa. Aviso de cambios sin guardar (`beforeunload`), errores junto al campo con valores conservados, confirmación tras guardar.
- [x] Eliminación segura: casilla de confirmación obligatoria + batch transaccional que borra relaciones → control → fila, y pone a `NULL` las referencias entrantes (`project_id` de las 4 tablas al borrar un proyecto; `event_id` de `publications` al borrar un evento).
- [x] Prueba editorial real del autor superada (2026-07-15); de ella salieron las mejoras siguientes.
- [x] Formularios de la segunda tanda (`academic_works`, `courses`, `memberships`, `skills`, `languages`): los 13 tipos son editables.
- [x] Mejoras tras la prueba editorial (2026-07-15): terminología «privada» en toda la UI (decisión 17); roles de `projects` y `service_activities` como vocabulario con FK (migración `005`, valores libres convertidos a códigos); toggle de portada en la propia ficha de edición junto a visibilidad; feedback como toasts temporales (mismo diseño que el índice); enlace «Volver» además del breadcrumb; orden del índice por fecha/nombre/actualización; retirado el aviso «Filtrado local»; ayuda del campo URL aclarando su semántica frente a los futuros Documentos.
- [x] Segunda prueba editorial del autor sobre las mejoras y despliegue.

Criterio de aceptación:

- Se pueden mantener desde el dashboard todas las secciones que hoy aparecen en el CV público.

### Fase 5 — Relaciones y recursos

Estado: `en curso` — 5A completada; 5B implementada y con migraciones `006`, `007` y `008` aplicadas, pendiente de prueba editorial y despliegue

#### Fase 5A — Curación de fichas del portfolio

- [x] Hacer visible `featured` mediante un énfasis discreto, sin separar listados ni alterar el orden.
- [x] Ordenar los trabajos relacionados exclusivamente por fecha descendente, con título como desempate; retirar `featured` y `sort_order` de la ordenación pública.
- [x] Completar los metadatos públicos para que los 13 tipos puedan relacionarse de forma coherente.
- [x] Crear `/admin/portfolio`: selector de las seis fichas, búsqueda por título, filtro por tipo y alta rápida de entradas.
- [x] Permitir retirar asociaciones y activar/desactivar `featured` sin recargar la página.
- [x] Mostrar claramente si una entrada asociada es privada: puede prepararse editorialmente, pero no aparece en la ficha pública hasta publicarse.
- [x] Validar `portfolio_slug` contra `projects.ts`, entidad contra la allowlist y existencia contra `entry_source` en cada mutación.
- [x] Añadir desde la ficha de edición la vista inversa «Aparece en estas fichas del portfolio».
- [x] Previsualizar o enlazar la ficha pública desde la pantalla de curación.
- [x] Completar la prueba editorial local y confirmar el funcionamiento de la curación.
- [ ] Desplegar y verificar una ficha pública en producción.

#### Fase 5B — Relaciones estructurales e interentidad

- [x] Desde un evento, listar las publicaciones derivadas mediante `publications.event_id`.
- [x] Desde un proyecto de investigación, listar publicaciones, eventos, docencia y financiación que lo referencian mediante `project_id`.
- [x] Mantener la edición de estas FK en los selectores ya implementados en Fase 4.
- [x] Crear `funding_relations` como relación muchos-a-muchos con FK directa a financiación y FK compuesta al registro transversal de entradas.
- [x] Gestionar desde ambos extremos ayudas, contratos y premios con búsqueda/filtro, alta, retirada y cambio de tipo sin recarga completa.
- [x] Incluir relaciones estructurales y de financiación en el recuento/filtro transversal «con relaciones».
- [x] Auditar otros vínculos posibles sobre los datos reales.
- [x] Añadir `academic_works.education_id`, selector en el trabajo, vista inversa en Formación y backfill de las tres coincidencias exactas.
- [x] Sustituir la coincidencia textual organización↔contribución por una entidad canónica `events` y FK desde ambos tipos de actividad.
- [x] Migrar los 21 eventos de contribuciones y deduplicar las 10 actividades de servicio relacionadas: 26 identidades canónicas, sin asociaciones ambiguas.
- [x] Crear `/admin/eventos` con búsqueda local, edición de datos comunes, agrupación de contribuciones/servicio y altas preseleccionadas desde el evento.
- [x] Permitir registrar de forma explícita el rol privado «Oyente/asistente», con etiqueta y notas privadas editables y sin crear una entrada publicable.
- [x] Hacer que CV y fichas del portfolio lean los metadatos del evento canónico; mantener sincronizadas las copias heredadas por compatibilidad.
- [ ] Completar la prueba editorial local y desplegar la vista inversa.

#### Fase 5C — Enlaces adicionales

- [ ] Definir la diferencia visible entre el `url` canónico de la entidad y sus enlaces adicionales.
- [ ] Gestionar varios enlaces por entidad: tipo, etiqueta, URL, principal, público y orden.
- [ ] Validar protocolo, URL y unicidad del enlace principal por entidad.
- [ ] Definir y construir su consumidor público.

#### Fase 5D — Documentos

- [ ] Gestionar metadatos y URL de documentos, sin subida directa de archivos.
- [ ] Aplicar reglas explícitas para documentos públicos, privados y certificados.
- [ ] Garantizar que certificados y documentos privados nunca llegan a las cargas públicas.
- [ ] Permitir que `event_attendance` sea propietario de certificados de asistencia enlazados desde Drive; estos documentos serán siempre privados aunque el evento tenga otras actividades públicas.
- [ ] Definir y construir el consumidor público de documentos autorizados.

#### Fase 5E — Taxonomías

- [ ] Crear `/admin/taxonomias` para mantener `type_vocab` sin SQL manual.
- [ ] Añadir vocabularios de tipos de enlace y documento si 5C/5D los necesitan.
- [ ] Mantener validación de código + dominio en todas las escrituras.

#### Fase 5F — Etiquetas temáticas (condicional)

- [ ] Definir primero un consumidor real: filtro, buscador o vista temática pública.
- [ ] Solo entonces gestionar `tags`/`entity_tags`; si no existe consumidor, dejarlas fuera del alcance.

Criterio de aceptación:

- Una entrada puede relacionarse con proyectos y recursos sin acceder directamente a Turso.

### Fase 6 — Calidad y limpieza

Estado: `pendiente`

- [ ] Completar pruebas automáticas.
- [ ] Añadir auditoría.
- [ ] Revisar accesibilidad y responsive.
- [ ] Eliminar `entries_legacy` en migración separada.
- [ ] Retirar controles duplicados de `projects`.
- [ ] Actualizar `db/schema.sql` como fotografía final del esquema.

Criterio de aceptación:

- No queda ninguna escritura manual duplicada ni estructura obsoleta en uso.

## 19. Fuera de alcance inicial

- Multiusuario y roles complejos.
- Registro público.
- Edición colaborativa simultánea.
- Subida y transformación de archivos dentro de la aplicación.
- Editor enriquecido generalista.
- Traducción automática.
- API pública de escritura.
- Historial completo con restauración de cualquier versión.
- Drag and drop como único mecanismo de ordenación.

## 20. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Perder controles durante la migración | Copia a `entry_controls`, respaldo y `entries_legacy` |
| Publicar un alta incompleta | `is_public = 0` por defecto y transacción |
| SQL dinámico inseguro | Allowlist de tipos/columnas y argumentos parametrizados |
| Romper Paraglide al añadir auth | Componer handlers con `sequence()` y probar `/`, `/es`, `/en`, `/admin` |
| Controles huérfanos | Eliminación transaccional y consulta periódica de integridad |
| Fechas parciales mal ordenadas | Normalización explícita por tipo en la vista |
| Ambigüedad de `featured` | Usar `featured_cv`; mantener `portfolio_items.featured` separado |
| Confundir `project_id` (proyecto BD) con `portfolio_slug` (ficha del home) | Nombres distintos en la UI y bloques separados en el formulario (decisión 14) |
| Código de `type_vocab` de dominio ajeno (la FK simple no comprueba `domain`) | Selectores filtrados por dominio y prueba de integridad por tabla |
| Token de Turso expuesto | Importación exclusiva desde `$env/static/private` |
| Migración y código incompatibles | Despliegue aditivo por etapas y vista compatible |
| Dashboard demasiado genérico | Formularios configurados mediante allowlist y campos explícitos |

## 21. Definición global de terminado

El proyecto se considera completado cuando:

- [ ] `entries` ya no almacena títulos ni fechas duplicados.
- [ ] Toda entrada nueva aparece automáticamente en el índice transversal.
- [ ] Toda entrada nueva nace privada.
- [ ] La portada se cura exclusivamente desde `/admin`.
- [ ] Los tipos principales del CV se crean y editan desde `/admin`.
- [ ] No hay rutas administrativas accesibles sin autorización.
- [ ] El token de Turso nunca llega al cliente.
- [ ] Las relaciones se gestionan sin SQL manual.
- [ ] No quedan controles duplicados activos en `projects`.
- [ ] `entries_legacy` ha sido eliminado después de un periodo estable.
- [ ] Pruebas, `npm run check` y `npm run build` pasan.
- [ ] `db/schema.sql` refleja el esquema real final.

## 22. Protocolo para continuar entre sesiones

### Al comenzar cada sesión

1. Leer este documento completo o, como mínimo:
   - Decisiones cerradas.
   - Estado de fases.
   - Último registro de sesión.
2. Ejecutar `git status --short`.
3. Revisar migraciones ya aplicadas antes de tocar Turso.
4. Seleccionar una única fase o subfase con criterio de aceptación concreto.
5. No repetir trabajo marcado como completado sin evidencia de regresión.

### Al terminar cada sesión

1. Actualizar la fecha superior.
2. Cambiar checkboxes y estado de la fase trabajada.
3. Añadir una fila al registro de sesiones.
4. Anotar migraciones aplicadas y entorno.
5. Registrar validaciones ejecutadas y resultado.
6. Escribir el siguiente paso exacto, no una indicación vaga.
7. Documentar cualquier decisión que modifique las “decisiones cerradas”.

### Estados permitidos

- `pendiente`
- `en curso`
- `bloqueado`
- `completado`

## 23. Registro de sesiones

| Fecha | Fase | Trabajo realizado | Validación | Siguiente paso exacto |
|---|---|---|---|---|
| 2026-07-15 | Planificación | Arquitectura y plan persistente redactados; seed eliminado previamente | Documento revisado en repositorio | Iniciar Fase 0: consultar recuentos, controles y relaciones huérfanas; guardar resultados aquí |
| 2026-07-15 | Fase 0 (parcial) + revisión del plan | Auditoría de solo lectura (recuentos, discrepancias, curación) contra Turso; corregido el supuesto de “cuatro curadas” (son ocho); añadidos: regla de backfill para filas fuera de `entries`, formato canónico de `sort_date`, guardia de auth en `hooks.server.ts`, exclusión de `/admin` y `/auth` en Paraglide, manejo de FKs al borrar proyectos, script `scripts/migrate.ts`, notas de `db.batch` y `updated_at` | Consultas documentadas en Fase 0; sin cambios de código | Completar Fase 0: `turso auth login` en WSL, respaldo `.dump` verificado, identificar las 2 filas ausentes de `entries` y auditar relaciones huérfanas |
| 2026-07-15 | Planificación | Decisiones nuevas del autor incorporadas: portada sin límite (decisión 13, se retira `LIMIT 5`); distinción explícita proyecto BD vs ficha del portfolio (decisión 14); tres planos de relación documentados en sección 14; FK como selectores en Fase 4 y vistas inversas en Fase 5; causa de las 2 filas ausentes confirmada (creación manual directa en tablas base); vocabulario de etiquetas traducido en BD (decisión 15; auditado: `tags` = 4 filas, `entity_tags` vacía, etiquetas monolingües hardcodeadas en `projects.ts`) | Solo documento | Completar Fase 0 (respaldo y huérfanos) y arrancar Fase 1 con la migración `002` |
| 2026-07-15 | Planificación | Decisión 15 corregida: las etiquetas de las fichas del home se quedan en `projects.ts`; los tipos (`book_review`…) ya están clasificados por columnas `*_type` y traducidos en `labels.ts`; `tags`/`entity_tags` reservadas para clasificación temática (pregunta 7 abierta). Auditoría de tipos: valor sucio `conference_paper`+tab en `academic_events` y 3 tipos de `funding_awards` sin traducción en `labels.ts` (checkboxes añadidos a Fase 0) | Consultas de tipos documentadas en Fase 0 | Completar Fase 0 (respaldo, huérfanos y limpiezas menores) y arrancar Fase 1 con la migración `002` |
| 2026-07-15 | Planificación | Decisión 16: los campos `*_type` pasan a FK contra vocabulario controlado `type_vocab` con traducciones en BD (nueva sección 5.5; migración prevista `004`; cierra la pregunta 7). Selectores y web pública leerán del vocabulario; `entitySubtypeLabels` se retirará de `labels.ts`; Fase 4 y `/admin/taxonomias` actualizadas | Solo documento | Completar Fase 0 (respaldo, huérfanos, valor sucio) y arrancar Fase 1 con la migración `002` |
| 2026-07-15 | Fases 0 y 1 — ejecución | Fase 0 completada: respaldo verificado por restauración local (`backups/`, en gitignore), 0 huérfanos, 4 valores sucios corregidos (filas manuales #20 y #7). Fase 1 completada: runner `scripts/migrate.ts` + `npm run migrate`; migración `002` ensayada en local (23/23) y aplicada en producción (90 controles públicos, `home_order` 10–80, vista `entries` compatible, `entries_legacy` conservada); `/cv` con visibilidad vía vista y portada sin `LIMIT 5` | 10 comprobaciones en producción; `npm run check` 0 errores; `npm run build` OK; consultas reales de portada (8 en orden) y CV (todo visible) verificadas | Commit + push para desplegar a Vercel y verificar portada/CV/fichas desplegadas; después Fase 2: crear app OAuth de GitHub (callback local y producción) y pasar `AUTH_*`/`ADMIN_GITHUB_ID` |
| 2026-07-15 | Fase 2 — implementación | Auth.js + GitHub OAuth con allowlist por ID numérico (`src/auth.ts`, helper `isAdmin`); guardia por prefijo en hooks + defensa en `+layout.server.ts`; `/admin` y `/auth` excluidos de Paraglide en `vite.config.ts`; `noindex` en handle previo a Auth.js (sus respuestas cortocircuitan `resolve()`); shell `/admin` con nav, sesión y acción `salir`; `.env.example` actualizado (fuera `ADMIN_USERNAME/PASSWORD` obsoletos); guía operativa en `docs/guia-fase2-oauth.md`; primer deploy a Vercel resuelto (las `TURSO_*` deben existir antes del build por `$env/static/private`); dominio `davidmerinorecalde.com` | `npm run check` y `build` en verde; smoke test local: `/admin` sin sesión → 303 signin, POST sin sesión rechazado, `/auth/signin` 200 + noindex, `/`, `/es`, `/en`, `/es/cv` intactos. Sin probar aún: login real (requiere navegador) | El autor: reiniciar su dev server (vite.config cambió), probar login en `localhost:5173/admin`, commit + push y probar `davidmerinorecalde.com/admin`. Después: Fase 3 (índice transversal y controles editoriales) |
| 2026-07-15 | Fase 2 — cierre + Fase 3 — implementación | Login real de GitHub completado en producción; credenciales normalizadas con `trim()` y `handleNoindex` adaptado a respuestas de redirección con cabeceras inmutables. Implementados resumen administrativo, índice transversal con filtros de texto/tipo/año/estado/portada/relaciones, controles público/portada, curación completa y orden accesible subir/bajar; acciones con allowlist, parámetros SQL y reautorización. | OAuth real confirmado por el autor; consulta Turso de solo lectura: 90 entradas, 90 públicas, 8 en portada y relaciones accesibles; `npm run check` 0 errores/avisos; `npm run build` OK; revisión UTF-8 sin mojibake. | Revisar visualmente `/admin`, probar una mutación reversible (quitar/añadir una entrada de portada y moverla), desplegar y confirmar que la portada pública refleja el orden. |
| 2026-07-15 | Fase 3 — interacción sin recargas | El índice carga una instantánea completa y aplica búsqueda/filtros en memoria; los controles público/portada usan acciones mejoradas con actualización optimista y rollback; la portada acumula los movimientos localmente y persiste el orden completo solo con «Guardar orden». Quitar de portada también conserva la navegación y el estado local. | `npm run check`: 0 errores y 0 avisos; `npm run build`: OK; revisión de mojibake limpia. | Prueba editorial local: conservar filtros al alternar controles, mover varias filas y comprobar que solo «Guardar orden» persiste; después desplegar. |
| 2026-07-15 | Fase 3 — correcciones de controles | Corregido el callback de `use:enhance`, que retenía el primer valor sí/no porque la acción no actualiza su parámetro tras montarse: ahora calcula la orden desde el estado vivo en cada envío. Cada mutación devuelve una lectura autoritativa de Turso y la UI se reconcilia con ella. Despublicar limpia portada y CV; desactivar solo portada usa un `UPDATE` directo. El dashboard desactiva el precargado de datos en sus enlaces y `/admin/entradas` y `/admin/portada` responden `private, no-store`, de modo que cambiar de sección ejecuta una carga fresca. | Consulta Turso de solo lectura: el intento anterior dejó 9 entradas activas; `npm run check`: 0 errores y 0 avisos; `npm run build`: OK. | Confirmar varios ciclos «Portada: Sí ↔ No» sin navegar y después entrar en `/admin/portada` para verificar la misma selección. |
| 2026-07-15 | Fase 3 — feedback temporal | Creado `AdminToast.svelte` y sustituido el feedback fijo de Entradas y Portada por notificaciones flotantes: éxito 3,5 s, error 6 s, cierre manual, animación breve y semántica accesible `status`/`alert` con `aria-live`. | `npm run check`: 0 errores y 0 avisos; `npm run build`: OK. | Revisar posición y duración del toast en escritorio y móvil durante la prueba editorial. |
| 2026-07-15 | Revisión de estado entre sesiones | Contrastado el plan con repo, Turso y producción: todo commiteado y pusheado (`e4c2433`); deploy de producción verificado sirviendo la curación completa (título en posición 7 presente en la home, imposible con el antiguo `LIMIT 5`); dominio canónico = apex (`www` redirige 308). BD: 9 filas en portada (`home_order` 20–100), incluida `academic_events#6` añadida durante las pruebas de controles; 90 controles, todos públicos. Corregidas líneas de estado obsoletas de Fases 1 y 3 | Consultas Turso de solo lectura + curl a producción; sin cambios de código | El autor: prueba editorial visual en `davidmerinorecalde.com/admin` (ciclos portada, reordenar y guardar, toasts) y decidir si `academic_events#6` se queda en portada. Después: Fase 4 (migración `004` de `type_vocab` + allowlist/validación + formularios de la primera tanda) |
| 2026-07-15 | Fase 3 cierre + Fase 4 arranque | Fase 3 completada (prueba editorial del autor superada en local y producción; portada final: 8 filas con `research_stays#1` primera y `academic_events#6` incluida). Fase 4: script permanente `scripts/backup.ts` (`npm run backup`, verificación por restauración); migración `004` aplicada — `type_vocab` con 27 códigos en 7 dominios, 7 tablas reconstruidas con FK, CHECKs de tipos retirados, vistas recreadas; `portfolio-items.ts` + `ProjectModal` leen etiquetas del vocabulario por locale; `entitySubtypeLabels` eliminado de `labels.ts` | Ensayo local 20/20 (vista `entries` byte a byte idéntica); producción 18/18 incl. FK activas en Turso; `npm run check` 0 errores; `npm run build` OK | Continuar Fase 4: `/cv` con etiquetas del vocabulario (hoy muestra códigos crudos, preexistente); después allowlist + validación (zod) y formularios de la primera tanda con selectores desde `type_vocab`. Pendiente commit + push de todo esto |
| 2026-07-15 | Fase 4 — CRUD primera tanda | `/cv` con etiquetas del vocabulario en chips y filtro (ES/EN, pseudotipos literales retirados). Infraestructura CRUD: campos declarativos por tipo en `entity-definitions.ts` (8 tipos), `validation.ts` propio (zod descartado, documentado en §11), `crud.ts` (crear con transacción contenido+control borrador; editar solo columnas allowlist con `updated_at`; eliminar en batch con limpieza de relaciones y `NULL` en FKs entrantes; opciones de selectores y revalidación código+dominio). Rutas `nueva`, `nueva/[type]` y `[type]/[id]` (Contenido / Visibilidad / Zona peligrosa con confirmación), componentes `EntityForm`/`FormField` (accesibles, errores junto al campo, aviso de cambios sin guardar). Índice con botón «Nueva entrada» y títulos enlazados a edición | `npm run check` 0 errores; `npm run build` OK; smoke test: GET y POST de `/admin/entradas/**` sin sesión → 303 signin (acción no ejecutada, verificado el sobre de redirección); `/es/cv` y `/en/cv` con etiquetas y cero códigos crudos | El autor: commit + push, y prueba editorial completa en producción — crear borrador, editar, publicar, verificar CV/portada, eliminar. Después: segunda tanda de formularios o Fase 5 (relaciones) |
| 2026-07-15 | Fase 4 — mejoras tras prueba editorial | Decisión 17 (privada ≠ borrador, terminología cambiada en toda la UI). Migración `005`: dominios `project_role` y `service_role` en `type_vocab` (9 códigos, traducciones nuevas revisables), valores libres de `service_activities.role` convertidos a códigos, FK en `projects.role` y `service_activities.role`; `academic_events.role` y `memberships.role` quedan texto libre (sin datos / valor descriptivo). Formularios de la segunda tanda: los 13 tipos editables. Ficha de edición: toggle de portada junto a visibilidad (sin ir a otra pantalla), toasts temporales en vez de avisos fijos, «Volver» + chip «En portada». Índice: orden por fecha/nombre/actualización, sin aviso de filtrado. Ayuda del campo URL (enlace canónico; Drive → Documentos, Fase 5) | Ensayo local de `005` 9/9 y producción 6/6; `npm run check` 0 errores; `npm run build` OK; smoke: rutas de tanda 2 activas y protegidas (303 sin sesión), `/es/cv` 200 | El autor: commit + push, segunda prueba editorial (roles como selector, portada desde la ficha, toasts) y revisar las traducciones EN de los 9 roles nuevos. Después: Fase 5 (relaciones: `portfolio_items`, enlaces, documentos) |
| 2026-07-15 | Fase 5A — curación de fichas del portfolio | Conservada `portfolio_items` como relación editorial con las seis fichas narrativas. Nueva pantalla `/admin/portfolio` con selector, búsqueda y filtro locales, alta/retirada y destacado mediante acciones mejoradas sin recarga, indicación de privacidad y enlace de previsualización. Vista inversa desde cada entrada. La salida pública admite los 13 tipos, se ordena por fecha descendente con título como desempate y representa `featured` con una estrella sin crear zonas separadas; `sort_order` permanece por compatibilidad, pero deja de tener consumidor. | Auditoría previa: 30 relaciones, 12 destacadas, 0 huérfanas, 0 privadas y 0 órdenes duplicados; `npm run check` 0 errores y 0 avisos; `npm run build` OK; smoke público local 200 con sección relacionada y marca de destacado; GET/POST administrativos sin sesión redirigen 303 sin ejecutar acciones | El autor: probar en local añadir, quitar y destacar varias relaciones; comprobar búsqueda, filtros y una entrada privada; revisar la ficha pública; después commit, push y verificación en producción. |
| 2026-07-15 | Fase 5B — relaciones estructurales inversas | Nueva lectura administrativa agrupada para las FK ya existentes, sin migración ni escrituras adicionales. La edición de un evento muestra sus publicaciones derivadas (`event_id`); la edición de un proyecto de investigación muestra publicaciones, eventos, docencia y financiación/premios que lo referencian (`project_id`). Cada resultado enlaza a su ficha, conserva el orden por fecha y señala si es público o privado; las FK siguen editándose mediante los selectores de contenido de la Fase 4. | Turso, solo lectura: 2 publicaciones, 5 eventos, 3 actividades docentes y 0 financiaciones con `project_id`; 3 publicaciones con `event_id`. Consultas exactas verificadas con un proyecto real (2 resultados) y un evento real (1 resultado). `npm run check` 0 errores y 0 avisos; `npm run build` OK | El autor: revisar en local una ficha de proyecto y una de evento, seguir los enlaces y cambiar/revertir una FK desde la entrada relacionada. Después: commit, despliegue y Fase 5C. |
| 2026-07-15 | Fase 5B — ampliación de financiación | Migración `006`: `funding_relations`, muchos-a-muchos, tipos `supports`/`recognizes`/`related`, FK directa a `funding_awards` y FK compuesta a `entry_controls`, cascadas y allowlist de nueve tipos de destino. Componente de edición reutilizable desde financiación y desde la actividad: búsqueda y filtro locales, sugerencia automática (`prize` → reconoce; resto → financia), alta/retirada/cambio de tipo con acciones mejoradas y relectura autoritativa. Limpieza al eliminar e índice transversal actualizado para contar relaciones estructurales y financieras. Auditoría semántica: beca Oxford ↔ estancia; contrato predoctoral ↔ doctorado/docencia/resultados a curar; premio 2023 ↔ póster; 3 trabajos ↔ 3 titulaciones exactas; 4 organizaciones ↔ participaciones en el mismo evento. No se crean asociaciones por inferencia. | Respaldo restaurable `curriculum-2026-07-15-1626.sql` (22 tablas); ensayo local `006` 9/9 (FK, CHECK, índice y cascadas); migración aplicada y estructura remota verificada (2 FK, índice, 0 filas iniciales); `npm run check` 0 errores/avisos; `npm run build` OK | El autor: relacionar docencia con el contrato predoctoral y probar quitar/cambiar tipo desde ambos extremos. Decidir `academic_works.education_id` y organización↔evento; después commit y despliegue. |
| 2026-07-15 | Fase 5B — trabajo académico y titulación | Decisión 20 y migración `007`: `academic_works.education_id REFERENCES education(id)`, índice y backfill únicamente por coincidencia exacta y única de `program = degree_title`. Selector «Titulación relacionada» en TFM/TFG, validación FK allowlistada, vista inversa «Trabajos académicos» desde Formación, relación incluida en el recuento transversal y limpieza a `NULL` al borrar una titulación. En ese momento se aplazó la entidad canónica de eventos; esa conclusión fue sustituida después por la decisión 21 al aparecer el consumidor real de roles y certificados. | Respaldo restaurable `curriculum-2026-07-15-1951.sql` (23 tablas); ensayo local `007` 9/9; Turso verificado: mappings `1→2`, `2→3`, `3→4`, índice y FK activas | El autor: revisar los tres trabajos y sus titulaciones desde ambos extremos; después commit y despliegue. |
| 2026-07-15 | Fase 5B — eventos canónicos y asistencia privada | Decisión 21 y migración `008`: nueva identidad `events`; FK desde contribuciones y servicio; backfill auditable de 21 contribuciones y deduplicación de actividades coincidentes en 26 eventos. `/admin/eventos` permite buscar, editar datos comunes, consultar todos los roles y crear actividades ya vinculadas. `event_attendance` registra manualmente «Oyente/asistente» con etiqueta/notas privadas, fuera de `entry_source` y de cualquier consulta pública. CV y portfolio leen el evento canónico; las copias heredadas se sincronizan para compatibilidad. | Respaldo restaurable `curriculum-2026-07-15-2026.sql` (23 tablas); ensayo local `008` 13/13; Turso verificado: 26 eventos, 21 contribuciones enlazadas, 10 servicios enlazados, 0 asistencias inferidas, FKs e índices activos y `entry_source` intacta con 91 filas. `npm run check` 0 errores/avisos; `npm run build` OK | El autor: probar un evento con solo rol de oyente, confirmar que no aparece en `/cv`, y revisar un evento que reúna contribución y organización. Después commit y despliegue. |
| 2026-07-15 | Fase 5B — carga de asistencias | Importados 12 eventos aportados por el autor y registrada asistencia privada «Oyente/asistente» en los 12 eventos sin participación activa. «Y sin embargo, amigos…» reutiliza el evento canónico #11, pero no conserva asistencia porque ya contiene la comunicación «Mil y una Fuenteovejuna»: una contribución prevalece sobre el rol genérico de oyente. Se normalizaron Unicode, comillas, una puntuación residual del PDF y «Universitat Autònoma de Barcelona»; no se inventaron ciudad, país, URL ni certificados ausentes. | Respaldo previo `curriculum-2026-07-15-2032.sql` (25 tablas); Turso final: 38 eventos, 12 asistencias privadas, 1 contribución en el evento #11 y `entry_source` intacta con 91 filas. | El autor: revisar las asistencias en `/admin/eventos` y completar certificados en Fase 5D. |

## 24. Registro de migraciones en Turso

| Migración | Estado | Fecha | Entorno | Verificación | Rollback disponible |
|---|---|---|---|---|---|
| `001_portfolio_items.sql` | existente; registrada en `schema_migrations` | 2026-07-15 | producción | tabla actualmente consumida | no documentado |
| `002_entry_controls_and_views.sql` | **aplicada** | 2026-07-15 | producción | ensayo local contra respaldo (23/23) + 10 comprobaciones en producción; edición de tabla base se refleja en la vista | `DROP VIEW entries; ALTER TABLE entries_legacy RENAME TO entries;` (documentado en el propio archivo) |
| `003_drop_entries_legacy.sql` | pendiente | — | — | — | requerirá snapshot previo |
| `004_type_vocabulary.sql` | **aplicada** | 2026-07-15 | producción | ensayo local contra respaldo (20/20: vista `entries` byte a byte idéntica, FK activas, CHECKs retirados) + 18 comprobaciones en producción (FK verificadas en Turso) | restaurar respaldo `backups/curriculum-2026-07-15-1313.sql` (la reconstrucción no es reversible por sentencias) |
| `005_role_vocabulary.sql` | **aplicada** | 2026-07-15 | producción | ensayo local 9/9 (vista idéntica, conversión de valores libres a códigos verificada) + 6 comprobaciones en producción (12 roles codificados, FK activa) | restaurar respaldo `backups/curriculum-2026-07-15-1358.sql` |
| `006_funding_relations.sql` | **aplicada** | 2026-07-15 | producción | respaldo restaurado; ensayo local 9/9; tabla, índice, dos FK compuestas/directas y 0 filas iniciales verificados en Turso | `DROP TABLE funding_relations;` o restaurar `backups/curriculum-2026-07-15-1626.sql` |
| `007_academic_works_education.sql` | **aplicada** | 2026-07-15 | producción | respaldo restaurado; ensayo local 9/9; 3/3 coincidencias exactas, índice y FK verificados en Turso | restaurar `backups/curriculum-2026-07-15-1951.sql` (SQLite no permite retirar la columna con el mismo grado de compatibilidad en todas las versiones) |
| `008_canonical_events.sql` | **aplicada** | 2026-07-15 | producción | respaldo restaurado; ensayo local 13/13; 26 eventos, 21 contribuciones, 10 servicios, 0 asistencias inferidas, mapeos exactos, FKs, índices, unicidad y cascada verificados en Turso | restaurar `backups/curriculum-2026-07-15-2026.sql` (retirar las columnas añadidas requiere reconstruir las tablas en SQLite) |

## 25. Preguntas que deben resolverse durante la Fase 0

Estas preguntas no bloquean la aprobación del plan, pero deben cerrarse antes de ejecutar la migración:

1. ¿Qué controles de `projects` difieren hoy de `entries`? **Resuelto 2026-07-15**: ninguno (ver auditoría de Fase 0).
2. ¿Debe `is_public` gobernar también el CV completo para todos los tipos? Recomendación: sí. Nota de la auditoría: al activarlo, decidir también si `courses`, `academic_works`, `memberships`, `skills` y `languages` (hoy ausentes de `/cv`) pasan a mostrarse.
3. ¿Qué formato canónico se usará para años parciales en `sort_date`? **Resuelto**: definido en la sección 5.2 (`YYYY-MM-DD` o `YYYY`, sin sufijos artificiales).
4. ¿Se implementará archivado lógico antes que borrado definitivo? Recomendación: sí para el MVP.
5. ¿`featured_cv` tendrá un efecto visible en el CV o se ocultará hasta una fase posterior? Recomendación: ocultarlo inicialmente.
6. ¿Se mantiene el fallback automático de “Actividad reciente” cuando no hay `show_home`? Recomendación: sí, con aviso en el dashboard.
7. ¿Deben las traducciones de los tipos (`book`, `book_review`, `predoctoral_contract`…) seguir en `labels.ts` o moverse a BD? **Resuelto 2026-07-15 (decisión 16)**: los campos `*_type` pasan a FK contra `type_vocab` con traducciones en BD (sección 5.5); `labels.ts` queda solo para los nombres de entidad. `tags`/`entity_tags` siguen reservadas para clasificación temática transversal, sin consumidor actual.
