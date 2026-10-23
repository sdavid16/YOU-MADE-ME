# QA report — YOU MADE ME: immersive adaptive AI

## Alcance de esta revisión
- El juego se presenta como una escena de pantalla completa centrada en Canvas; se retiró el diseño de página con cabecera, tarjetas y panel lateral.
- Se añadió un segundo tipo de provocación de alto riesgo (G), desplazamiento rápido (Shift), diálogo contextual, un perfil de comportamiento y contraestrategias.
- La política de utilidad incluye valores de recompensa actualizados a partir de aciertos/fallos de las contraestrategias y un término pequeño de exploración.
- El jefe del tercer mundo selecciona entre carga, intercepción, finta y pulso según los hábitos recientes del jugador.
- La IA funciona completamente local y no llama a un servicio de IA generativa. No es un LLM ni una red neuronal.

## Verificación automática
El repositorio ejecuta mediante GitHub Actions:
- `node --check` en cada archivo JavaScript.
- `node tests/smoke.cjs` para el inicio, progresión de la IA, enfriamiento de burlas, plataformas, fragmentos, terminal, portal, combate final y ambos desenlaces.

Los resultados de la última versión deben consultarse en la pestaña Actions del repositorio. No se afirma que se haya realizado una prueba humana completa.

## Pruebas manuales pendientes
- Jugar las dos rutas completas en Chrome, Edge y Firefox.
- Revisar aspecto en escritorio, pantalla panorámica y móvil en orientación horizontal.
- Ajustar la dificultad y las ventanas de ataque tras una sesión real.
- Confirmar que la IA se percibe como adaptativa y que las contraestrategias son legibles, no arbitrarias.
- Afinar los diálogos y evitar repeticiones en sesiones largas.

## Limitaciones conocidas
- El contenido sigue siendo un prototipo indie pequeño, no una campaña de tamaño comercial.
- La IA aprende dentro de la partida; el perfil no persiste entre sesiones.
- Una IA generativa de diálogo requeriría un modelo externo o un modelo local de gran tamaño, lo que no es necesario para este diseño y no debe implementarse exponiendo claves privadas en el navegador.
