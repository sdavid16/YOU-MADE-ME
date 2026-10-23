# YOU MADE ME

Un juego 2D retro de ciencia ficción: empiezas burlándote de un enemigo torpe y le enseñas, sin querer, a jugar contra ti.

## Ejecutar

Descarga el ZIP del repositorio y abre `index.html` en un navegador moderno. No necesitas Python, npm, terminal, servidor local ni dependencias externas. El juego usa Canvas, scripts locales clásicos y gráficos dibujados por código; el capítulo de primera persona usa raycasting para la perspectiva.

## Controles

- **Mundo 1:** ←/→ o A/D para moverte; Espacio/W/↑ para saltar; Ctrl para correr; Shift para esquivar; J ataque ligero; F ataque pesado; T para burlarte; G para desafiar; Esc para pausar.
- **Mundo 2:** flechas o WASD para moverte, recoge los 3 fragmentos, acércate al terminal y pulsa E, luego llega al portal.
- **Mundo 3:** flechas o WASD para moverte; Shift para esquivar; J para atacar durante la ventana en que el núcleo queda expuesto.
- **Mundo 4 (primera persona 3D por raycasting):** W/S avanzar o retroceder; ←/→ girar; A/D desplazamiento lateral; J/Espacio ataque; F golpe fuerte; Shift dash; E activar la salida cuando tengas los 3 fragmentos.
- **Mundo 5 (Fracture Run):** avanzar automáticamente; Ctrl/D acelera; A/flecha izquierda frena; Espacio salta; Shift dash; J/F ataca; Q activa el pulso táctico de ECHO.
- **Mundo 6 (arena final):** WASD/flechas moverte; J/Espacio ataque ligero; F ataque pesado; E parada perfecta; Shift dash. Ataca el núcleo solo cuando esté expuesto.
- **R** reinicia la sesión. Los controles de sonido y pantalla completa están en la esquina superior derecha.

## Campaña ampliada

La campaña contiene seis mundos conectados: plataformas que ahora incluyen superficies colapsables y combate cuerpo a cuerpo; laberinto de memoria; jefe adaptativo; catedral en primera persona renderizada con raycasting, minimapa, centinelas y combate; **Fracture Run**, una persecución que fusiona cinco biomas y mezcla suelo desmoronable, trampas, drones, brutos, rivales, proyectiles y un personaje aliado; y una arena final con ataques de área, fintas, embestidas, ataques ligeros/pesados y parada temporizada.

El mundo 4 usa renderizado de perspectiva por raycasting, una técnica clásica de juegos en primera persona; no es un escenario de mallas 3D con WebGL. Todo se dibuja localmente en Canvas y no requiere Python ni servidor.

## La IA del juego

El sistema ahora combina varios niveles de decisión: un perfil conductual móvil, un predictor de transiciones que estima qué acción es probable después de la última, un selector táctico contextual con exploración tipo bandido y una memoria compartida de sucesos para las amenazas del escenario. La directora de Fracture Run selecciona entre barrido aéreo, grieta de suelo, salvas de drones, sombra perseguidora y colapso en cadena según el estilo observado.

La política aprende además de los resultados: registra qué contraestrategias consiguieron alcanzar al jugador y actualiza su valor estimado mediante recompensas observadas, explorando ocasionalmente otras opciones. En fases posteriores el jefe cambia sus ataques según esos patrones: carga directa, intercepción predictiva, fintas contra esquivas y pulsos de área contra jugadores que permanecen quietos.

Los enemigos del quinto mundo tienen roles distintos: perseguidor, dron de disparo, bruto de carga, rival que copia tu ritmo y guardián a distancia. ECHO mantiene una posición de apoyo, advierte sobre plataformas inestables y emite un pulso que interrumpe hostiles. Las plataformas y algunos segmentos del suelo pasan de estables a advertencia, caída y desaparición; los puntos de anclaje reconstruyen una sección al morir. El director también actualiza las estimaciones de las amenazas mediante recompensas observadas. Los diálogos dependen de la fase, la conducta y los acontecimientos. Todo funciona localmente y sin conexión. **No es un LLM ni una red neuronal entrenada**: es una IA de juego adaptativa basada en perfilado conductual y aprendizaje online de recompensas.

## Estructura

- `src/core/`: utilidades, bus de eventos, entrada y audio.
- `src/game/`: mundos, IA, partículas, renderizado y lógica.
- `src/ui/`: interfaz de estado y controles.
- `assets/css/style.css`: modo de pantalla completa.
- `tests/smoke.cjs`: prueba de progresión sin dependencias.
- `index.html`: punto de entrada local.

## Validación

Con Node.js instalado, ejecuta opcionalmente:

```bash
node tests/smoke.cjs
```

No necesitas Node.js para jugar. Consulta `QA_REPORT.md` para conocer el alcance de las pruebas.
