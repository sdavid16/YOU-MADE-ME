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

## 5. Escenarios, personajes y progresión

La campaña está formada por seis mundos con reglas distintas:

1. **Greenhill:** plataformas, provocaciones, salto, sprint, dash y ataques ligeros/pesados. Varias plataformas pasan por estados estable, advertencia, caída y desaparición.
2. **Memory Maze:** laberinto, fragmentos, terminal y amenazas espaciales.
3. **No Longer a Joke:** primer jefe que reacciona a hábitos de quietud, dash, retirada y aproximación.
4. **The Null Cathedral:** vista en primera persona por raycasting, colisiones en cuadrícula, tres fragmentos y tres centinelas con roles de cazador, flanqueador y guardián. Un director compartido asigna fuego cruzado, flanqueo, pinza o castigo de retirada.
5. **Fracture Run:** persecución horizontal de seis kilómetros de juego que fusiona cinco biomas en una ruta continua. Incluye plataformas/suelo colapsables, grietas, drones, sombras, proyectiles, checkpoints, células de memoria y la aliada ECHO, cuyo pulso Q interrumpe enemigos cercanos.
6. **The Last Argument:** jefe final con ataques de área, fintas, embestidas y carga, más una ventana vulnerable para contraatacar y una parada temporizada.

El mundo 5 contiene varios roles conductuales: stalker (perseguidor), drone (salvas predictivas), brute (ataque cargado), rival (imita el ritmo del jugador), warden (disparo a distancia) y sombras de emboscada. El suelo proporciona señales visuales antes de desmoronarse. ECHO avisa del colapso que viene y puede comprar tiempo, pero su pulso tiene enfriamiento.

El renderizado del mundo 4 usa raycasting de una cuadrícula 2D para simular perspectiva en primera persona. Es 3D perceptual, no un modelo de geometría poligonal ni un motor WebGL.

## 6. Director táctico y memoria entre mundos

La directora de Fracture Run utiliza chooseTactic('runner', ...) para elegir entre barrido aéreo, grieta de suelo, salva de drones, sombra perseguidora y colapso en cadena. Cada opción puntúa hábitos recientes y la predicción de la siguiente acción; se añade exploración y una estimación aprendida de recompensas. Al terminar una amenaza se registra si alcanzó al jugador o fue esquivada. En la catedral tridimensional un director de escuadrón elige directivas compartidas —fuego cruzado, flanqueo, pinza o castigo de retirada— mientras cazador, flanqueador y guardián mantienen roles individuales. Los jefes de los mundos 3 y 6 también consultan el director táctico.

El archivo ymm-ai-dossier-v1 de localStorage, cuando está disponible, guarda solo estadísticas agregadas de acciones y recompensas de tácticas: no almacena coordenadas, diálogo ni una transcripción de la partida. Si el navegador bloquea el almacenamiento, el juego sigue funcionando con aprendizaje limitado a la sesión.

## 7. Limitaciones deliberadas
- El mundo 4 usa raycasting sobre una cuadrícula 2D para simular perspectiva de primera persona; aún no es geometría poligonal 3D ni un motor WebGL.
- El agente no entiende lenguaje libre: las provocaciones y el diálogo son acciones conocidas y líneas escritas.
- No hay LLM ni entrenamiento de red neuronal. La complejidad está en la arquitectura de decisiones, los perfiles de conducta, la coordinación por roles y las recompensas online.
- La personalidad se representa mediante estados narrativos y diálogo contextual; la adaptación mecánica opera dentro de las reglas del juego.
