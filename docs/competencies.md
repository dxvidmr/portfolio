# Competencias técnicas y metodológicas

El catálogo describe capacidades de trabajo, sin escalas de dominio. Sustituye el antiguo registro de categorías y listas de herramientas; no conserva campos ni equivalencias heredadas.

## Modelo

- `skills`: nombre y descripción en español e inglés, área controlada en `type_vocab` (dominio `skill_area`) y orden general. La visibilidad se gestiona con `entry_controls`.
- `skill_resources`: catálogo opcional de métodos, estándares, lenguajes, herramientas y plataformas. Las capacidades se vinculan mediante `skill_resource_links`.
- `skill_evidence_links`: referencias a méritos existentes, con clave compuesta y FK a `entry_controls`. Permite varios ejemplos para cada capacidad y varias capacidades para un trabajo.
- `skill_portfolio_links`: ejemplos narrativos del portfolio, referenciados por slug mediante FK.

Los recursos son representativos, no una lista de dependencias de software. Una biblioteca concreta puede documentarse únicamente en el trabajo donde se utiliza.

## Clasificación

1. Edición digital y tratamiento textual: textos, marcado y corpus.
2. Modelado y gestión de información: estructura, consulta, integración y migración de datos.
3. Desarrollo y mantenimiento de recursos digitales: aplicaciones, interfaces, automatización, versiones y documentación del software.
4. Análisis y visualización: redes, bibliometría, métrica y visualización de datos.

La documentación técnica se agrupa con el desarrollo: explica el uso y mantenimiento de los recursos. La gestión de información describe los datos de investigación. No se crea un quinto grupo de filosofía general ni se presentan «abierto» y «sostenible» como capacidades autónomas.

## Administración y presentación

`/admin/competencias` reúne capacidades por área y permite gestionar el catálogo de recursos. Cada capacidad se edita con el formulario general de entradas, que admite vínculos a méritos y portfolio. Los méritos y fichas del portfolio muestran los vínculos inversos.

La web pública presenta descripciones y ejemplos, y excluye los méritos privados y el portfolio no publicado. El CV privado permite escoger también esos registros, como sucede con el resto de méritos.

En cada CV se seleccionan y ordenan capacidades. La descripción puede heredarse, adaptarse u ocultarse utilizando los controles de texto existentes. `cv_block_entries.skill_options` almacena exclusivamente las claves de los recursos y ejemplos escogidos. Por defecto no se muestra ninguno: evitar alargar el CV es una decisión independiente del catálogo general. Los cambios en la DB se reflejan en la siguiente carga de la UI y regeneración de la vista previa. Las entregas exportadas conservan su fotografía.

La migración vacía las selecciones antiguas de competencias. El CV actual queda listo para elegir las capacidades del nuevo catálogo; sus restantes apartados no cambian.

La ampliación 053 incorpora colecciones digitales, arquitectura y publicación, flujos editoriales, materiales formativos y análisis de datos humanísticos. Añade Heurist, Jekyll, CollectionBuilder, Wax, SvelteKit, Supabase y Cloudflare R2 como recursos selectivos. La especialización en estilometría, la IA generativa y las metodologías escénicas no se añaden al catálogo técnico; tampoco se inventaría cada biblioteca de visualización.

El PDF agrupa las capacidades consecutivas mediante `CvSkills`: una tarjeta por área con fondo plano verde grisáceo. El encabezado verde identifica el área; las competencias se separan con líneas internas y distinguen título serif, descripción sans y recursos secundarios opcionales. Conserva el orden seleccionado y admite descripciones ocultas, textos adaptados, ejemplos enlazados y comentarios. Cada capacidad se mantiene unida y el encabezado de área acompaña a la primera. La vista previa A4 y la impresión comparten este componente.

La ampliación 054 añade `cv_blocks.skills_display`, con `names` como valor por defecto y `descriptions` como alternativa. La elección se guarda por apartado y se conserva al duplicar el CV y generar su fotografía. El modo compacto muestra los nombres en una tarjeta por área, sin borrar descripciones adaptadas, recursos, ejemplos ni comentarios.

El selector `CvSkillSelector` agrupa el catálogo por áreas, permite buscar, seleccionar capacidades individuales o áreas completas, y ordenar tanto áreas como capacidades. Las áreas se derivan de las capacidades seleccionadas; no son selecciones independientes. Las opciones de texto y recursos quedan en desplegables secundarios. El resto de méritos conserva su selector y orden propios.
