# Diseño de la IA de YOU MADE ME

## Qué significa “IA” en este juego

El juego ejecuta agentes de decisión locales en JavaScript. No usa un modelo de lenguaje externo, no necesita clave de API y no depende de Python.

## Perfil y predicción

La IA mantiene una ventana móvil de acciones: salto, aproximación, retirada, quietud, dash, sprint, ataque, parry, recolección, habilidades y repetición. Un predictor estima qué acción podría seguir a la última y calcula confianza y entropía. La ventana reciente tiene más peso que el historial agregado.

## Elección táctica y recompensas

Los directores puntúan opciones contextualmente, añaden exploración y utilizan recompensas observadas para ajustar el valor de las tácticas. En el primer jefe, la elección se adapta a quietud, dash, salto y retirada. En la catedral un director de escuadrón emite directivas compartidas de fuego cruzado, flanqueo, pinza o castigo de retirada.

**Fracture Run** selecciona entre barrido aéreo, grieta de suelo, salvas de drones, sombra perseguidora y colapso en cadena. Registra si el jugador fue alcanzado o esquivó la amenaza.

**Signal Break** es un shooter cenital con cazadores, francotiradores, guardianes y agentes que disparan salvas múltiples. El director elige entre:
- **Crossfire:** incrementa la cadencia de fuego.
- **Lead shot:** anticipa la trayectoria y dispara hacia la posición probable del jugador.
- **Encircle:** los cazadores intentan rodear al jugador.
- **Minefield:** coloca minas con una señal previa antes de armarlas.

Los jefes de los mundos 3 y 6 también cambian los patrones según el perfil. La dificultad aumenta presión, velocidad o resistencia; no consiste únicamente en subir la vida.

## Provocación verbal como mecánica

La consola de provocación recibe cuatro intenciones predefinidas o una frase escrita por el jugador. Un clasificador local normaliza acentos y compara palabras clave con cuatro grupos: inteligencia, lógica/código, amenaza y guerra psicológica. Si no reconoce el contenido, lo clasifica como improvisación y emplea una respuesta general. No realiza comprensión semántica general ni genera respuestas nuevas mediante un LLM.

Cada categoría tiene consecuencias mecánicas distintas: la crítica lógica ralentiza brevemente ciertas acciones enemigas y abre una ventana de lectura; las amenazas aceleran la respuesta siguiente; la guerra psicológica puede interrumpir enemigos cercanos o eliminar proyectiles cercanos. La provocación tiene enfriamiento y las repeticiones se registran para variar la reacción. La frase propia se muestra durante unos segundos, pero no se persiste. El dossier conserva solo categoría y longitud.

## Escenarios, colapsos y memoria

Las plataformas frágiles pasan por estable, advertencia, caída y estado de escombros. La animación mantiene soporte físico y el estado final conserva un puente estrecho; así los huecos no forman un bloqueo imposible. Los puntos de anclaje restauran la geometría original de la zona.

Las animaciones de transición son diferentes por mundo: scanline, ondas rojas, portal, fractura, iris y conexión de circuitos. La interfaz indica tácticas, vida, objetivos y la información clave de cada modo.

## Memoria entre partidas

Si `localStorage` está disponible, `ymm-ai-dossier-v1` conserva estadísticas agregadas de acciones y recompensas. No guarda coordenadas, frases, transcripciones ni información personal. Si el almacenamiento está bloqueado, el juego sigue funcionando con memoria de la sesión.

## Limitaciones técnicas

- El mundo 4 utiliza raycasting sobre una cuadrícula 2D para simular perspectiva en primera persona; no es geometría poligonal ni WebGL.
- La consola de provocación clasifica palabras clave; no entiende lenguaje libre como un modelo de lenguaje.
- No hay una red neuronal entrenada. La complejidad reside en los perfiles, predicción, director contextual, recompensas y coordinación de roles.
