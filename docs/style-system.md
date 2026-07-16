# Sistema de estilos

La web usa Tailwind CSS 4 de forma progresiva, tanto en el dashboard como en la web pública. La migración debe reducir CSS repetido sin rediseñar accidentalmente la portada.

## Configuración de transición

- Tailwind se integra con el plugin oficial de Vite.
- Las utilidades llevan el prefijo `tw:` para no colisionar con las clases editoriales existentes.
- Preflight está desactivado mientras convivan estilos antiguos y nuevos. `app.css` sigue proporcionando el reset mínimo que ya tenía la web.
- `src/lib/styles/tailwind.css` conecta Tailwind con los tokens existentes de color, tipografía, espaciado y radio.

## Fuente de verdad

Los valores visuales compartidos viven en las variables de `app.css`: fondo, texto, líneas, acento, tipografías, radios y espaciado lateral. Tailwind los expone con nombres semánticos como `canvas`, `ink`, `rule`, `accent`, `font-title` o `rounded-ui`.

No se debe copiar un color hexadecimal a un componente si ya existe un token. Los estados destructivos usan `danger` y `danger-soft`; nunca reutilizan el verde de acento en `hover`.

## Reparto de responsabilidades

- Tailwind: composición, rejillas, espaciado, tipografía, controles y estados comunes.
- Componentes de `src/lib/components/ui`: patrones interactivos reutilizables, como botones y enlaces con aspecto de botón.
- Componentes de `src/lib/components/admin`: patrones propios del dashboard, como la cabecera de página y los campos de formulario.
- CSS local: animaciones complejas, pseudo-elementos editoriales y visualizaciones cuyo código sería menos claro convertido en utilidades.

## Criterio de migración

Cada bloque se migra por separado:

1. Conservar la estructura y las medidas actuales.
2. Sustituir reglas comunes por utilidades y componentes.
3. Mantener en CSS local solo lo específico del bloque.
4. Eliminar selectores que hayan quedado sin uso.
5. Ejecutar `npm run check` durante la iteración y reservar pruebas completas y `npm run build` para hitos o antes de publicar.

En la portada, cualquier simplificación debe conservar el resultado visual en tema claro y oscuro y en anchos de escritorio y móvil. La migración técnica no autoriza por sí sola cambios de diseño.
