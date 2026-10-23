# Engine decision: browser shell, Canvas and Three.js

## Decision

Keep the current browser-delivered game for this iteration, but stop treating Canvas raycasting as the only way to draw first-person scenes. The browser shell is HTML; the rendering/game engine is JavaScript. Those are different choices. HTML is still a reasonable distribution shell for a game that should run from a URL or a downloaded folder.

Worlds 8 and 9 now use Three.js/WebGL for polygonal walls, floor geometry, lighting, fog, animated memory shards and primitive 3D sentinels. The current collision and AI simulation still use the same tile-map coordinates, so the visual and gameplay worlds stay aligned. If the CDN import fails or WebGL is unavailable, the Canvas raycaster remains as a compatibility fallback.

## Why not migrate the whole project immediately?

A full migration to Godot or Unity would provide a more complete editor, physics, animation, asset pipeline and export targets, but it would also replace the existing runtime and make the game no longer a simple browser download. A Vite/TypeScript/Three.js setup is a sensible next step if the browser build grows; it is not required to deliver this rendering and gameplay increment.

## Current limitations

- Only the first-person worlds 8 and 9 use real WebGL geometry in this iteration; platforming, runner, boss and top-down worlds still use the custom Canvas renderer.
- Character models are procedural primitives, not authored meshes, skeletal animation or motion-captured animation.
- Player movement/collision is grid-based, not a full physics engine.
- The 3D renderer currently imports Three.js from a CDN, so first load needs network access. For an offline release, vendor/pin the dependency or add a production build.
- The adaptive opponent is a local game AI: behavior history, transition prediction, contextual tactics and reward updates. It is not a general reasoning model or LLM.

## Safe path to model-backed dialogue

If generated dialogue or an external reasoning model is added later, use a small backend service and store its key in server-side environment variables. Never put provider keys in HTML, client-side JavaScript, browser storage or a public Git repository. Send only the minimum necessary game state, avoid sending raw player text by default, add rate limits and provide an offline fallback.
