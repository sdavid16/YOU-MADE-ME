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

## 5. Limitaciones deliberadas
- No hay aprendizaje entre sesiones.
- El agente no entiende lenguaje libre: las provocaciones son acciones de juego conocidas.
- No hay LLM ni entrenamiento de red neuronal.
- La personalidad se representa mediante estados narrativos y diálogos escritos; la adaptación mecánica es real dentro de las reglas del juego.
