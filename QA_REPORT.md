# QA report — YOU MADE ME

## Alcance automatizado

- Campaña de siete mundos: Greenhill, Memory Maze, No Longer a Joke, Null Cathedral, Fracture Run, The Last Argument y Signal Break.
- Las superficies frágiles avisan antes de colapsar, conservan soporte durante la animación y dejan un puente de escombros en lugar de borrar la ruta completa. Las pruebas verifican huecos saltables, colisión del puente y restauración por checkpoint.
- Consola de provocación con cuatro tipos, análisis local de texto libre, efectos mecánicos por categoría, enfriamiento y cambio de dificultad.
- Transiciones visuales diferentes entre mundos.
- Catedral en primera persona con escuadrón de roles distintos.
- Fracture Run con cinco biomas, suelo/plataformas colapsables, enemigos diversos, puntos de anclaje y pulso de ECHO.
- Signal Break con tres repetidores, disparos, EMP, agentes de distintas clases, director táctico, y salida bloqueada hasta desconectar los repetidores.
- Perfil de conducta, predicción de transición, elección de táctica y recompensas online. La memoria opcional entre partidas guarda estadísticas agregadas.

## Verificación automática

GitHub Actions ejecuta comprobaciones de sintaxis JavaScript y `node tests/smoke.cjs`. La suite verifica los caminos principales, las nuevas acciones de provocación, dificultad, derrumbes, modo shooter, objetivos y persistencia simulada del dossier.

Consulta [GitHub Actions](https://github.com/sdavid16/YOU-MADE-ME/actions) para conocer el resultado más reciente. Las pruebas automáticas no sustituyen un playtest humano.

## Pruebas manuales pendientes

- Completar la campaña en un navegador real y comprobar el ritmo entre los siete mundos.
- Ajustar las trayectorias y el equilibrio de las minas, los disparos predictivos y la dificultad Pesadilla.
- Verificar pantalla panorámica, escritorio y móvil horizontal.
- Evaluar legibilidad de las animaciones entre mundos y ventanas de parry/EMP.
- Probar frases escritas variadas y revisar el clasificador de palabras clave.

## Limitaciones conocidas

- El mundo 4 simula 3D con raycasting, no geometría poligonal/WebGL.
- El clasificador verbal es léxico, no un LLM, y puede confundir frases ambiguas.
- El contenido sigue en desarrollo; no se afirma un playtest manual completo.
