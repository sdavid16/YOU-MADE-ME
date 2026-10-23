# Diseño de la IA de YOU MADE ME

## Qué significa “IA” en este juego
El juego no usa un modelo de lenguaje externo. Usa un agente de toma de decisiones que observa al jugador, construye un perfil de comportamiento y modifica su política durante la partida. Es deliberadamente local, reproducible y no requiere una clave de API.

## 1. Perfil de comportamiento
La IA mantiene una ventana móvil de observaciones y estima proporciones de:
- saltos;
- aproximación y retirada;
- quietud;
- esquivas y dirección de la esquiva;
- ataques e interacciones con objetos.

La ventana móvil hace que el antagonista reaccione a la forma reciente de jugar, en lugar de basarse solo en el número acumulado de burlas.

## 2. Política contextual de utilidad
En el segundo nivel de evolución la IA puntúa cuatro contraestrategias:
- **Anti-air:** preferida cuando el jugador salta con frecuencia.
- **Intercept:** preferida cuando el jugador se retira o mantiene una trayectoria repetida.
- **Pressure:** preferida si el jugador espera o permanece quieto.
- **Feint:** preferida frente a las esquivas repetitivas.

Cada estrategia mantiene el número de intentos, el número de aciertos y la recompensa media observada. Los resultados actualizan el valor de la estrategia. Se añade una bonificación de exploración pequeña para evitar que la política se quede bloqueada demasiado pronto en una única respuesta.

Esto se aproxima a una política contextual con aprendizaje online de recompensas: las observaciones describen el contexto, el agente elige una acción y el resultado actualiza su estimación.

## 3. El jefe
El jefe observa los mismos patrones:
- jugadores que permanecen en un lugar provocan un ataque de área;
- las esquivas repetitivas provocan una finta con una segunda adquisición de objetivo;
- las retiradas frecuentes provocan una intercepción predictiva;
- en otros casos usa una carga directa con señal previa.

Las señales visuales son importantes: el jugador debe poder leer la intención, entender qué hábito explotó la IA y cambiar de táctica.

## 4. Diálogo contextual
Los diálogos dependen de fase, tipo de provocación, repetición de frases, estrategia aprendida y acontecimientos narrativos. Se evita repetir inmediatamente las mismas frases. En las fases iniciales la IA es burlona; tras observar patrones deja de responder como un NPC genérico y empieza a comentar el estilo del jugador.

## 5. Mundos y combate añadidos

El cuarto mundo usa una cuadrícula de colisiones, vista en primera persona por raycasting, tres fragmentos coleccionables y centinelas que persiguen al jugador y atacan a corta distancia. El jugador puede girar, desplazarse lateralmente, hacer dash y encadenar ataques ligeros/pesados. El quinto mundo incorpora un jefe con más salud, señales previas y cuatro familias de ataque: patrón directo, embestida, finta y onda de área. El jugador puede esquivar, usar una parada con ventana temporal corta y aprovechar la fase vulnerable para castigar el núcleo.

La política del jefe consulta el perfil de conducta reciente para elegir el patrón. La IA registra aciertos y fallos de las contraestrategias y actualiza sus valores estimados durante la sesión.

## 6. Limitaciones deliberadas
- El renderizado del mundo 4 es perspectiva por raycasting sobre un mapa 2D, no geometría poligonal 3D ni un motor WebGL.
- No hay aprendizaje entre sesiones.
- El agente no entiende lenguaje libre: las provocaciones son acciones de juego conocidas.
- No hay LLM ni entrenamiento de red neuronal.
- La personalidad se representa mediante estados narrativos y diálogos escritos; la adaptación mecánica es real dentro de las reglas del juego.
