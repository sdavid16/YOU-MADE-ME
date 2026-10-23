# YOU MADE ME

Videojuego 2D retro sobre un enemigo que aprende de las provocaciones del jugador y acaba invadiendo otros mundos.

## Ejecutar

Descarga o clona el repositorio y abre `index.html` directamente en un navegador moderno. No requiere Python, npm, servidor local ni dependencias externas: usa scripts clásicos y rutas relativas para evitar módulos ES en `file://`.

También puedes usar **Code → Download ZIP**, descomprimir la carpeta y abrir `index.html`.

## Controles

- **Mundo 1:** flechas o A/D para moverte, Espacio/W/↑ para saltar, T para provocar, Esc para pausar.
- **Mundo 2:** flechas o WASD para moverte; recoge 3 fragmentos, pulsa E junto al terminal y llega al portal.
- **Mundo 3:** flechas o WASD para moverte, J para atacar cuando el núcleo esté expuesto y Shift para esquivar.
- **R** reinicia la partida.

## Arquitectura

- `src/core/`: utilidades, bus de eventos, entrada y audio.
- `src/game/`: niveles, IA, partículas, renderizado y lógica del juego.
- `src/ui/`: interfaz, HUD, registro narrativo y controles.
- `assets/css/style.css`: interfaz adaptable.
- `index.html`: punto de entrada.

Los gráficos se dibujan en Canvas y no dependen de recursos remotos. La IA usa una máquina de estados, memoria de eventos y adaptación basada en reglas; no es aprendizaje automático.

## Validación

Si tienes Node.js, puedes ejecutar la prueba de humo opcional:

```bash
node tests/smoke.cjs
```

El test comprueba inicio, enfriamiento de provocaciones, evolución de fases, plataformas de un solo sentido, fragmentos, terminal, portal, combate final y ambos desenlaces. No se necesita Node.js para jugar.
