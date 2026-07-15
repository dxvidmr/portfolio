# Guía: preparar OAuth y Vercel para la Fase 2 (dashboard /admin)

> Complemento operativo del plan (`docs/plan-dashboard-cv.md`, §8 y §17).
> Datos ya resueltos: usuario GitHub `dxvidmr`, ID numérico `62843910`.

Son cuatro tareas manuales tuyas (≈15 min). Los secretos no hace falta pasarlos por el chat: los pegas tú directamente en `.env` y en Vercel, y avisas cuando estén.

## 0. Antes de nada: desplegar la Fase 1

La migración ya está aplicada en Turso y el código actualizado en local, pero sin commit. Confirma en el chat que haga commit + push (o hazlo tú), y comprueba tras el deploy de Vercel:

- La portada muestra **8** entradas en "actividad reciente curada" (antes 5).
- `/es/cv` y `/en/cv` se ven completos (no debe faltar nada).

## 1. OAuth App de desarrollo

1. Ve a <https://github.com/settings/developers> → **OAuth Apps** → **New OAuth App**.
2. Rellena exactamente:
   - **Application name**: `Portfolio Admin (dev)`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/auth/callback/github`
3. **Register application**.
4. Copia el **Client ID** (visible siempre).
5. Pulsa **Generate a new client secret** y copia el secreto **en ese momento** (solo se muestra una vez).

## 2. OAuth App de producción

Igual que la anterior pero con el dominio real con el que entras a la web (el dominio del proyecto en Vercel; si usas dominio propio, ese):

- **Application name**: `Portfolio Admin`
- **Homepage URL**: `https://TU-DOMINIO`
- **Authorization callback URL**: `https://TU-DOMINIO/auth/callback/github`

GitHub solo admite **un** callback por OAuth App — por eso hacen falta dos apps. Usa el dominio canónico con el que visitarás `/admin` (si entras por `algo.vercel.app`, pon ese).

## 3. Generar los dos AUTH_SECRET

Uno para local y otro distinto para producción. En Git Bash:

```bash
openssl rand -base64 32
```

(o en PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`).

Ejecútalo dos veces y guarda ambos valores.

## 4. Variables en Vercel (producción)

En <https://vercel.com> → tu proyecto → **Settings** → **Environment Variables**, añade estas cinco con entorno **Production** (Preview no hace falta: `/admin` no funcionará en previews por el callback fijo):

| Nombre | Valor |
|---|---|
| `AUTH_SECRET` | uno de los generados en el paso 3 |
| `AUTH_GITHUB_ID` | Client ID de la app de **producción** (paso 2) |
| `AUTH_GITHUB_SECRET` | Client secret de la app de **producción** |
| `ADMIN_GITHUB_ID` | `62843910` |
| `AUTH_TRUST_HOST` | `true` |

Comprueba de paso que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` siguen ahí. Ojo: las variables solo se aplican a partir del **siguiente** deploy, y como usamos `$env/static/private` se incrustan en build — deben estar creadas antes de desplegar el código de la Fase 2.

## 5. Variables en local (`.env`)

Añade al final de tu `.env` (con los valores de la app de **desarrollo** del paso 1 y el otro secreto del paso 3):

```text
AUTH_SECRET=el-otro-secreto-generado
AUTH_GITHUB_ID=client-id-de-la-app-dev
AUTH_GITHUB_SECRET=client-secret-de-la-app-dev
ADMIN_GITHUB_ID=62843910
```

(En local no hace falta `AUTH_TRUST_HOST`.)

## 6. Avisar en el chat

Cuando esté todo, di simplemente: "OAuth listo, dominio X". Con eso arranca la Fase 2: instalación de Auth.js, guardia en hooks, exclusión de `/admin` y `/auth` en Paraglide, layout del dashboard y cierre de sesión.

## Resumen de quién guarda qué

| Sitio | Contenido |
|---|---|
| GitHub OAuth Apps | Solo *generan* las credenciales; no guardan nada de la app |
| Vercel → Env Variables | Todos los secretos de producción (build + runtime) |
| `.env` local (gitignored) | Los secretos de desarrollo |
| GitHub Secrets (repo) | Nada — no hay GitHub Actions |
| Repositorio | Nunca un secreto; `.env.example` solo nombres |
