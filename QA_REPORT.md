# QA report — YOU MADE ME: tactical director and six-world campaign

## Alcance de la revisión
- Campaña de seis mundos: plataformas con superficies colapsables; laberinto; primer jefe; catedral en primera persona; Fracture Run con cinco biomas fusionados; jefe final.
- El mundo 5 añade carrera continua, salto, sprint con resistencia, dash, ataques ligeros/pesados, seis células, puntos de anclaje, ECHO y su pulso Q.
- Las plataformas y algunos segmentos del suelo pasan por estados estable → advertencia → caída → desaparición. Al morir, el punto de anclaje reconstruye una sección cercana.
- Se añadieron seis agentes enemigos al corredor, con roles de perseguidor, dron, bruto, rival imitador y guardián; el mundo 4 también tiene cazador, flanqueador y guardián.
- La IA combina perfil conductual, predicción de transiciones, selección táctica contextual, exploración y aprendizaje de recompensas. Los jefes y el director de amenazas utilizan estas estimaciones.
- Cuando localStorage está disponible, el dossier guarda estadísticas agregadas entre partidas, sin registrar coordenadas ni transcripciones. En caso de bloqueo, la partida no depende del almacenamiento.
- El mundo 4 utiliza raycasting sobre una cuadrícula para representar perspectiva en primera persona; no se presenta como un motor WebGL de modelos 3D.

## Verificación automática
La acción de GitHub ejecuta:
- node --check sobre los archivos JavaScript.
- node tests/smoke.cjs, que comprueba inicio, progresión, plataformas y enemigos, predicción táctica, colapsos, puntos de anclaje, ECHO, catedral, ataques del jefe final y persistencia simulada del dossier.

Consulta https://github.com/sdavid16/YOU-MADE-ME/actions para ver el resultado más reciente. Las pruebas automáticas no sustituyen una partida manual completa.

## Pruebas manuales pendientes
- Completar los seis mundos en Chrome, Edge y Firefox.
- Ajustar velocidad, saltos y tiempo de advertencia de cada superficie colapsable.
- Comprobar la lectura visual de ataques y directivas del escuadrón.
- Evaluar el equilibrio de las amenazas del director táctico en estilos de juego distintos.
- Revisar diseño en escritorio, pantalla panorámica y móvil horizontal.

## Limitaciones conocidas
- Sigue siendo un proyecto indie en desarrollo, no una campaña de producción comercial.
- El mundo 4 simula 3D con raycasting; todavía no usa geometría poligonal ni WebGL.
- La IA es un sistema de agentes de juego; no genera lenguaje libre ni es una red neuronal entrenada.
- La validación humana completa continúa pendiente.
