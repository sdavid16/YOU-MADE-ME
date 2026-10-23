# QA report — YOU MADE ME 0.2.0

Date: 2026-10-22

## Automated checks executed locally
- `node --check` on every game JavaScript file: passed.
- Dependency-free logic smoke test (`node tests/smoke.cjs`): passed.
- The smoke test covers boot/start, taunt cooldown, AI phase progression, one-way platform landing, collecting all three fragments, terminal activation, portal transition, boss victory and both endings.
- The test invokes rendering for the menu and game worlds through a mocked Canvas context to catch JavaScript-level rendering exceptions.

## Not claimed as tested
- No full human playtest has been performed.
- Real-browser visual fidelity, audio quality and balance need playtesting in multiple browsers and screen sizes.
- A headless browser test attempt was blocked by the execution environment's browser-navigation policy, so no end-to-end browser test is claimed here.
- The AI is rule-based. It does not use machine learning or an external language model.

## Known scope limits
- The three worlds and two endings are compact prototype content, not a commercial-scale campaign.
- Some collisions and difficulty choices will need tuning after actual play feedback.
- The local launch uses classic script tags and relative files (no ES modules, fetch or remote dependencies). If a browser blocks local file scripts, host the folder on a static site instead.