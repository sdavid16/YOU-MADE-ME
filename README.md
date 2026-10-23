# YOU MADE ME

Videojuego 2D retro sobre un enemigo que aprende de las provocaciones del jugador y acaba invadiendo otros mundos.

## Ejecutar
Descarga o clona el repositorio y abre `index.html` directamente en un navegador moderno. No requiere Python, npm, servidor local ni dependencias externas: usa scripts clásicos y rutas relativas para evitar módulos ES en `file://`.

## Controles
- Mundo 1: flechas o A/D para moverte, Espacio/W/↑ para saltar, T para provocar, Esc para pausar.
- Mundo 2: flechas o WASD para moverte; recoge 3 fragmentos, pulsa E en el terminal y llega al portal.
- Mundo 3: flechas o WASD para moverte, J para atacar cuando el núcleo esté expuesto y Shift para esquivar.
- R reinicia la partida.

## Arquitectura
`src/core/` contiene utilidades, eventos, entrada y audio; `src/game/` contiene niveles, IA, partículas, renderizado y lógica; `src/ui/` contiene la interfaz. Los gráficos se dibujan en Canvas y no dependen de recursos remotos.

La IA es una máquina de estados con memoria de eventos y adaptación basada en reglas, no aprendizaje automático.