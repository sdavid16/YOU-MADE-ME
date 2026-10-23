# YOU MADE ME

Un juego de ciencia ficción sobre una IA que empieza siendo una broma y termina aprendiendo a jugar contra ti. La campaña mezcla plataformas, laberintos, jefes, un shooter táctico y escenarios 3D en primera persona con Three.js/WebGL, además de un director de combate adaptativo.

## Ejecutar

Descarga el ZIP, descomprímelo y abre `index.html` en un navegador moderno. No necesitas instalar un motor ni ejecutar un proceso de compilación. La campaña base usa Canvas; los mundos 8 y 9 cargan Three.js desde una CDN para renderizar geometría real por WebGL. Necesitas conexión para cargar esa biblioteca; si no está disponible, el juego vuelve al renderizador de raycasting.

## Campaña: diez mundos

1. **Greenhill.exe** — plataformas, sprint con resistencia, salto, dash, ataques y plataformas que se resquebrajan.
2. **Memory Maze** — laberinto, tres fragmentos, terminal y portal.
3. **No Longer a Joke** — jefe que selecciona cargas, fintas, intercepciones y ondas según tus hábitos.
4. **The Null Cathedral** — primera persona, minimapa, fragmentos y escuadrón de cazador, flanqueador y guardián.
5. **Fracture Run** — persecución horizontal por cinco biomas fusionados. El suelo puede colapsar, aparecen grietas y proyectiles, hay puntos de anclaje y la aliada ECHO puede interrumpir hostiles.
6. **The Last Argument** — jefe final con ataques de área, fintas, embestidas, ventana vulnerable y parada temporizada.
7. **Signal Break** — shooter táctico cenital. Destruye tres repetidores, sobrevive a escuadrones con diferentes roles y abre el canal raíz. En Pesadilla la IA despliega dos agentes adicionales.
8. **The Black Archive** — escenario 3D en primera persona, seis centinelas, cuatro registros narrativos y la revelación del objetivo original.
9. **Echo Labyrinth** — otro mapa WebGL en primera persona, cinco registros, siete centinelas, rutas asimétricas y un ataque a distancia nuevo. En Pesadilla se añaden tres guardias.
10. **The Singularity Engine** — arena táctica final con cuatro nodos, nueve agentes en Pesadilla y una salva triple de alto daño. Desactivar el motor desbloquea el desenlace de la campaña.

### Derrumbes sin bloqueo de ruta

Las superficies frágiles muestran advertencias antes de caer. Los restos dejan puentes más estrechos con huecos diseñados para poder saltarse; no desaparece toda la colisión de un lado al otro. Los puntos de anclaje restauran la geometría local al morir. El objetivo es hacer peligrosa la ruta, no convertirla en una ruta imposible.

## Controles

- **Mundo 1:** ←/→ o A/D moverte; Espacio/W/↑ saltar; Ctrl correr; Shift esquivar; J ataque ligero; F pesado; T abrir la consola de provocación; G desafío de alto riesgo.
- **Mundo 2:** WASD/flechas moverte; recoge tres fragmentos; E junto al terminal; llega al portal.
- **Mundo 3:** WASD/flechas moverte; Shift esquivar; J atacar cuando el núcleo está expuesto.
- **Mundo 4:** W/S avanzar; ←/→ girar; A/D desplazamiento lateral; J/Espacio atacar; F golpe fuerte; Shift dash; E salida tras obtener tres fragmentos.
- **Mundo 5:** avance automático; Ctrl/D acelerar; A/← frenar; Espacio saltar; Shift dash; J/F atacar; Q pulso de ECHO.
- **Mundo 6:** WASD/flechas moverte; J/Espacio ataque ligero; F pesado; E parada perfecta; Shift dash.
- **Mundo 7:** WASD/flechas moverte; J dispara un pulso; F activa un EMP de área con enfriamiento; Shift dash; E abre el canal raíz tras destruir todos los repetidores.
- **Mundo 8:** W/S avanzar; ←/→ girar; A/D desplazamiento lateral; J/F ataque; Q pulso a distancia; Shift dash; E salir tras cuatro registros.
- **Mundo 9:** los mismos controles de primera persona; recoge cinco registros, usa Q para disparar el pulso y pulsa E en la salida.
- **Mundo 10:** WASD moverte; J pulso; K salva triple; F EMP; Shift dash; E extraer después de desactivar los cuatro nodos.
- **R** reinicia la sesión. Los botones superiores controlan sonido, pantalla completa y reinicio.

## Provocación verbal: una mecánica jugable

Pulsa **T** durante la partida para abrir la consola. Puedes elegir cuatro estrategias verbales o escribir una frase propia de hasta 140 caracteres:

- **Inteligencia:** provoca una respuesta contextual de la IA.
- **Lógica/código:** abre durante unos segundos una ventana de análisis táctico; los movimientos y ataques de la IA se ralentizan.
- **Amenaza:** opción de riesgo; acelera la próxima respuesta o amenaza según el mundo.
- **Guerra psicológica:** puede interrumpir brevemente a enemigos cercanos o retrasar el siguiente patrón.
- **Texto libre:** un clasificador local de palabras clave identifica la intención aproximada y selecciona la respuesta correspondiente.

Las teclas 1–4 activan las estrategias predefinidas con la consola abierta; Escape la cierra. El sistema no comprende cualquier texto como lo haría un modelo de lenguaje: clasifica palabras y expresiones conocidas. La frase solo se muestra brevemente en pantalla y no se guarda en el dossier. Se registran el tipo y la longitud, no una transcripción.

## Dificultad

El botón superior **DIF** alterna entre:

- **Historia:** más salud y mayor margen para responder; avisos más largos.
- **Normal:** ajuste predeterminado.
- **Pesadilla:** multiplicador de presión 1,62×, menos invulnerabilidad, telegráficos más cortos, selección táctica con mayor peso predictivo, menor cadencia entre decisiones, más resistencia y refuerzos en los mundos 7 y 8. Es un modo de alto castigo; su equilibrio final requiere pruebas humanas.

La dificultad afecta varias mecánicas, no solo una etiqueta de interfaz.

## IA táctica

El agente combina un perfil móvil de conducta, predicción de transiciones entre acciones, elección contextual de tácticas y aprendizaje mediante recompensas observadas. Los directores de los mundos 4–10 combinan políticas por contexto, enemigos por rol, elección táctica, anticipación de movimiento y recompensas observadas. En primera persona, los centinelas coordinan flanqueos y pueden ser interrumpidos con el pulso Q. En Pesadilla, la IA aumenta el peso de la predicción y contrarresta hábitos como correr, retirarse, quedarse quieto, repetir el dash o desplazarse lateralmente en bucle. El dossier opcional de `localStorage` guarda únicamente estadísticas agregadas entre partidas, nunca coordenadas ni textos de provocación. Si el navegador bloquea el almacenamiento, el juego sigue funcionando.

No es un LLM ni una red neuronal entrenada. Es una IA de juego local con predicción y aprendizaje online; no genera diálogo abierto ni realiza inferencia con un modelo remoto. La renderización WebGL usa Three.js desde una CDN, pero no transmite datos del jugador.

## Desarrollo y pruebas

Con Node.js instalado, ejecuta:

```bash
node tests/smoke.cjs
```

GitHub Actions ejecuta verificaciones sintácticas y pruebas de progresión. Consulta [Actions](https://github.com/sdavid16/YOU-MADE-ME/actions). La suite automatizada no sustituye un playtest manual de los diez mundos ni la validación de WebGL en distintos navegadores.
