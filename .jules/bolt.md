## 2025-05-18 - HUD Sync Garbage Allocation & DOM Mutation Bottleneck
**Learning:** In frame-based HUD sync routines, using inline `.filter(n => n.hp > 0).length` calls allocates short-lived array objects every sync tick (causing unnecessary GC pressure), while unconditionally setting `element.textContent` triggers DOM reflow/repaint work even when text is identical.
**Action:** Replace inline array filter calls with in-place counting loops (`countActive`) and guard DOM text assignments by checking `element.textContent !== nextValue` first.
