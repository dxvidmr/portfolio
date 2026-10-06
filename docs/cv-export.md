# Mis CV: edición y exportación

La entrada `/admin/cv` gestiona variantes privadas guardadas en Turso. El CV público y sus controles de visibilidad son independientes de estas selecciones.

## Uso

1. Crear un CV o duplicar uno existente desde **Mis CV**.
2. Editar el nombre interno, título del documento, nombre personal, posición, correo electrónico, afiliación, web e idioma de las etiquetas. Afiliación y web se guardan por separado y se reúnen en la cabecera. El idioma no traduce los títulos ni los textos escritos.
3. Añadir bloques de texto narrativo y apartados de méritos. Reordenarlos arrastrando o con las flechas. Los textos admiten párrafos separados por líneas en blanco y listas con `- `; no HTML ni Markdown enriquecido.
4. En un apartado, añadir registros mediante búsqueda y filtro de tipo. Se pueden combinar tipos, ordenar manualmente o por fecha y escribir un comentario propio para cada mérito. Ese comentario no modifica el registro original.
5. Guardar o elegir **Guardar y vista previa**.
6. En la vista previa, pulsar **Exportar PDF**. Se conserva una entrega con los datos actuales en el historial y se descarga directamente un PDF A4, con texto seleccionable y enlaces activos. En una entrega existente, **Descargar PDF** vuelve a generar el archivo sin crear otra versión. La DB conserva el contenido reproducible, no los bytes del PDF.

El historial permite regenerar una entrega sin consultar sus registros originales. Una descarga fallida conserva la versión preparada y permite reintentarla. Crear una nueva exportación consulta los datos originales actuales. La vista previa muestra hojas A4 separadas, con márgenes, saltos de página y numeración. La exportación utiliza esas mismas hojas, sin pasar por Microsoft Print to PDF ni por otro controlador de impresión del sistema.

## Modelo y actualización

- `cv_profiles`: datos generales y versión para detectar escrituras concurrentes.
- `cv_blocks`: textos y apartados en su orden editorial.
- `cv_block_entries`: referencias `entity_type + entity_id`, orden, comentarios y adaptación de la aportación (`inherit`, `custom`, `hidden`).
- `cv_exports`: contenido congelado al preparar cada entrega.

Un cambio en una publicación, proyecto u otro registro original se refleja al cargar el editor, usar **Recargar datos**, abrir la vista previa o preparar una nueva entrega. No existe actualización en tiempo real de una página ya abierta. La selección no incorpora nuevos méritos automáticamente. Una referencia eliminada se conserva como aviso y bloquea la exportación hasta retirarla del CV.

Las modificaciones directas de selecciones o textos deben hacerse en una transacción y aumentar `cv_profiles.version`, además de actualizar `updated_at`, para que una pestaña abierta detecte el conflicto y no sobrescriba el cambio. Las funciones del servicio `src/lib/server/admin/cvs.ts` lo hacen automáticamente. No actualizar `cv_exports`: son entregas históricas.

Los documentos, certificados y notas privadas no se incluyen en el catálogo ni en los snapshots. Por petición expresa de David, se incluyen el importe y la moneda de las ayudas y premios personales; no se exportan los importes de proyectos ni de contextos externos. Se pueden seleccionar méritos que estén privados en la web; se identifican como tales en el editor. Todas las rutas permanecen bajo la autenticación existente de `/admin`, con `no-store` y `noindex`.

La migración `037_saved_cvs.sql` añade las cuatro tablas. ARCHives/ARCHiving está importado como CV #1 con los dos bloques narrativos y la selección previamente preparada. Los archivos locales `cv-profiles/` y `output/pdf/` de la primera versión se mantienen como material de referencia, no como fuente de verdad. El generador local anterior ha sido sustituido por el editor y la plantilla compartida `CvDocument.svelte`.

La plantilla adapta el diseño editorial de la web a A4: serif, metadatos monoespaciados, numeración de apartados y acentos verdes. `CvPagedDocument.svelte` pagina el contenido con Paged.js usando `cv-pagination.css`, después de cargar las fuentes de la web. La impresión se habilita cuando todas las hojas están preparadas. Los márgenes y números se incorporan al documento paginado.

El cuerpo usa Public Sans, servida localmente y limitada al documento del CV. Los títulos conservan la serif de la web. `CvMerit.svelte` usa tres composiciones: publicaciones como un párrafo bibliográfico con sangría francesa, autoría ligeramente destacada, título serif, contenedor en cursiva y enlace corto; comunicaciones con título, autoría/tipo y evento/sede/fecha reunidos; proyectos como fichas compactas con badge del rol, institución/periodo e IP/referencia. Publicaciones y comunicaciones no usan badges ni etiquetas de campos. Los datos estructurados se guardan en los snapshots nuevos; los anteriores conservan la presentación basada en los datos que ya contenían.

La migración `038_cv_header_and_project_roles.sql` incorpora posición y correo al encabezado. Corrige los tres proyectos PID como participación en el equipo de trabajo y los tres proyectos UNIR como investigador, según la indicación del usuario. Mantiene las dos colaboraciones externas y el rol genérico disponible para otros registros. El CV ARCHives/ARCHiving usa el título «Congresos y seminarios» para sus comunicaciones.

La migración `039_cv_affiliation_and_website.sql` separa afiliación y web, conservando la cabecera existente. La web acepta dominios sin protocolo y los normaliza a HTTPS al guardar. Los snapshots anteriores siguen mostrando su campo `contact` original.

## Proyectos y experiencia técnica

Las migraciones `040` y `041` separan la participación académica de los trabajos técnicos y profesionales. Los proyectos conservan naturaleza, programa/convocatoria, participación y «Mi aportación» como datos independientes. Las categorías de equipo de investigación y de trabajo solo están disponibles para Generación de Conocimiento. Las convocatorias de UNIR se identifican expresamente; se retira la falsa categoría de proyecto «Colaboración externa».

**Trabajos técnicos y profesionales** es una categoría de Entradas, con su propio formulario, controles de publicación, enlaces, documentos, financiación personal relacionada y vínculos con el portfolio. Permite encargos profesionales, colaboraciones técnicas e iniciativas propias. No exige destinatario ni proyecto. El tipo de trabajo es ampliable desde Taxonomías: desarrollo, edición digital, datos, análisis, asesoramiento y preservación son los términos iniciales.

Si el trabajo pertenece a proyectos en los que participas, `technical_work_projects` hereda sus contextos vivos. Si es un encargo o colaboración sin pertenencia académica, los campos opcionales de contexto describen la iniciativa, convocatoria, financiación y responsables dentro del trabajo; no se crea un proyecto académico ficticio. La DB impide duplicar ambos contextos. Eliminar un proyecto vinculado requiere primero resolver sus trabajos; publicar un trabajo no revela el contexto de un proyecto privado.

En cada selección de proyecto o trabajo técnico, **Mi aportación en este CV** permite mantener el texto del original, adaptarlo o esconderlo. «Copiar texto de la DB para adaptarlo» proporciona un punto de partida; esa copia no sigue posteriores cambios del original. El comentario adicional sigue siendo independiente. Las exportaciones históricas mantienen el texto y contexto que tenían al generarse.

La edición de Fray Andrés y la preparación de archivos para ETSO en 2022 se trasladan a trabajos técnicos conservando sus controles, referencias, comentarios e IDs. El encargo web de ETSO de 2026 es otro trabajo independiente. Versología queda vinculada a METADRAMA y conserva su condición privada, coherente con el borrador del portfolio. El CV ARCHives/ARCHiving reúne los cuatro trabajos en «Experiencia técnica y profesional», con seis proyectos académicos y 41 méritos en total. La financiación del proyecto Benson se conserva como contexto y no se registra como ayuda o retribución del desarrollador.

`043` conserva `projects.project_type` como alias sincronizado de lectura para el código público anterior. Los formularios, taxonomías, servicios y nuevas escrituras usan exclusivamente `programme_code`; no es otra clasificación ni un campo editable. El código nuevo está preparado para su despliegue, independiente de las migraciones de datos ya aplicadas.

## Verificación

Las migraciones `048` y `049` eliminan el campo redundante de función o responsabilidad, conservan su contenido exclusivo en la aportación y añaden la modalidad «Trabajo técnico en proyecto de investigación». `technical_work_projects` permite asociar un trabajo a varios proyectos; `technical_works.project_id` queda como referencia de compatibilidad, calculada al guardar el formulario. Los selectores, las relaciones de los proyectos, la web pública y el CV leen los vínculos múltiples. Los contextos privados se filtran en la web pública. feniX-ML y Biblioteca Digital PROLOPE comienzan en febrero de 2025 y están vinculados a PROLOPE I y II. Se conservan las instantáneas históricas.

`src/lib/server/admin/cv.integration.test.ts` cubre guardado y duplicación, conflicto de versiones, cambios originales frente a snapshots históricos, referencias eliminadas, limpieza en cascada, rechazo de referencias inválidas y ausencia de notas privadas en exportaciones. Se verificaron además el catálogo real, la importación, la búsqueda y reordenación en los componentes del navegador, `npm run check` y la compilación de producción. La vista previa A4 y la descarga se revisaron con una sesión OAuth autenticada, comprobando dimensiones, texto extraíble y enlaces activos.

## Generación del PDF

`/admin/cv/[id]/exports/[exportId]/pdf` exige la misma sesión de administrador que el editor. `cv-pdf.ts` abre la entrega en Chromium, espera a la paginación y genera el PDF con fondos, márgenes A4 y sin encabezados del navegador. Las cookies se limitan al dominio de la aplicación; se cierra el navegador tanto al terminar como ante un error. La respuesta es privada y no se almacena en caché.

En Windows se utiliza Edge o Chrome instalados. En Vercel/Linux, `@sparticuz/chromium` proporciona el ejecutable dentro de una función Node separada. Las fuentes del CV se sirven localmente: Public Sans para el cuerpo, Fraunces estática para títulos y JetBrains Mono en WOFF para metadatos y numeración. La paginación espera a todas las variantes antes de medir; el generador excluye las peticiones de Google Fonts de la web pública. Las pruebas del PDF confirmaron incrustación convencional, texto extraíble y enlaces, sin sustituciones de las familias del documento.

`technical-works.integration.test.ts` comprueba el traslado de relaciones y selecciones, la conservación del historial, los contextos heredados y externos, las iniciativas propias y la privacidad del proyecto vinculado. Las pruebas del CV cubren además herencia, adaptación y ocultación de aportaciones, duplicación y cambios del contexto original. Las migraciones se comprobaron sobre una restauración completa del respaldo antes de aplicarse en Turso.
# Periodos y selección

Los periodos con fecha final vacía se muestran como actuales. Cuando los años inicial y final coinciden se muestra un solo año. Una fecha final futura se identifica como prevista; la comparación respeta la precisión guardada (año, mes o día) y la zona Europe/Madrid. El doctorado conserva el año previsto y el estado en curso.

Los mandatos de una responsabilidad se registran independientemente de la pertenencia a una asociación. El CV puede seleccionar el mandato actual sin duplicar la pertenencia ni perder los anteriores. Docencia, responsabilidades y organización científica son apartados independientes con una presentación compacta compartida.
