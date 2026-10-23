# QA report — YOU MADE ME

## Alcance automatizado

- Campaña de diez mundos, desde Greenhill hasta The Singularity Engine.
- Las superficies frágiles avisan antes de colapsar, conservan soporte durante la animación y dejan un puente de escombros en lugar de borrar la ruta completa. Las pruebas verifican huecos saltables, colisión del puente y restauración por checkpoint.
- Consola de provocación con cuatro tipos, análisis local de texto libre, efectos mecánicos por categoría, enfriamiento y cambio de dificultad.
- Transiciones visuales diferentes entre mundos.
- Catedral en primera persona con escuadrón de roles distintos.
- Fracture Run con cinco biomas, suelo/plataformas colapsables, enemigos diversos, puntos de anclaje y pulso de ECHO.
- Signal Break con tres repetidores, disparos, EMP, agentes de distintas clases, director táctico y salida bloqueada hasta desconectar los repetidores.
- The Black Archive con cuatro registros y progresión a Echo Labyrinth.
- Echo Labyrinth con mapa alternativo, cinco registros, siete centinelas, pulso a distancia y progresión a The Singularity Engine.
- The Singularity Engine con cuatro nodos, agentes de varias clases, salva triple K y final de campaña al apagar los nodos.
- Renderizador Three.js/WebGL opcional en mundos 8 y 9, con fallback al raycaster si la importación remota falla.
- Pesadilla con multiplicador de presión 1,62×, telegráficos reducidos, respuestas a strafing repetitivo y refuerzos en mundos posteriores.
- Perfil de conducta, predicción de transición, elección de táctica y recompensas online. La memoria opcional entre partidas guarda estadísticas agregadas.

## Verificación automática

GitHub Actions ejecuta comprobaciones de sintaxis JavaScript y `node tests/smoke.cjs`. La suite verifica los caminos principales, las nuevas acciones de provocación, dificultad, derrumbes, modo shooter, objetivos y persistencia simulada del dossier.

Consulta [GitHub Actions](https://github.com/sdavid16/YOU-MADE-ME/actions) para conocer el resultado más reciente. Las pruebas automáticas ampliadas no sustituyen un playtest humano de la campaña completa.

## Pruebas manuales pendientes

- Completar la campaña en un navegador real y comprobar el ritmo entre los diez mundos.
- Ajustar las minas, la salva triple, los centinelas de Echo Labyrinth y el nivel de presión de Pesadilla; probar WebGL en Chromium, Firefox y Safari.
- Verificar pantalla panorámica, escritorio y móvil horizontal.
- Evaluar legibilidad de las animaciones entre mundos y ventanas de parry/EMP.
- Probar frases escritas variadas y revisar el clasificador de palabras clave.

## Limitaciones conocidas

- Los mundos 8 y 9 usan geometría 3D real con Three.js/WebGL cuando la CDN está disponible; el fallback usa raycasting y sprites Canvas. El resto del juego sigue siendo un motor Canvas propio, no un proyecto migrado a Unity/Godot.
- El clasificador verbal es léxico, no un LLM, y puede confundir frases ambiguas.
- El contenido sigue en desarrollo; no se afirma un playtest manual completo.
