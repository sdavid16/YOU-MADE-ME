# Android / Google Play release path

The browser game now has a Capacitor build scaffold. This is **not yet a signed Android release**: the native Android project, release signing, device testing and Play Console submission still have to be completed.

## Requirements

- Node.js and npm.
- Android Studio with a supported Android SDK and Java toolchain.
- A Google Play Console developer account.
- A unique final application ID. The current scaffold uses `com.sdavid16.youmademe`; verify availability and ownership before publishing.
- A signed Android App Bundle (AAB) produced from the release build.

## Create the Android project

Run these commands from the repository root:

```bash
npm install
npm run build
npm run android:add
npm run android:sync
npm run android:open
```

The build script copies only the game shell, source, assets, manifest and service worker into `dist/`. It intentionally does not copy the repository, tests, Git metadata or documentation into the app bundle.

After Android Studio opens the generated project:

1. Wait for Gradle sync to finish and resolve SDK/toolchain prompts.
2. Confirm the application ID, app label, version code and version name.
3. Test on at least one low/mid-range Android device and one recent device.
4. Verify portrait and landscape layouts, safe areas, touch input, pause/resume, audio focus, offline fallback and WebGL availability.
5. Test interruption and recovery: incoming call, app backgrounding, screen lock, process recreation and low-memory conditions.
6. Run a release build and inspect the generated AAB before uploading.

## Release checklist

- [ ] App icon and launch experience reviewed at Android launcher sizes.
- [ ] No console errors or blocking JavaScript exceptions on target devices.
- [ ] Touch targets are reachable and do not cover objectives or exit prompts.
- [ ] Gameplay performance and memory usage measured on real devices.
- [ ] The 3D worlds tested on devices with WebGL support and on fallback devices.
- [ ] The external Three.js dependency's availability, licence and offline behaviour reviewed.
- [ ] Version code incremented for every upload.
- [ ] Release AAB signed using a protected upload key; never commit the key or passwords.
- [ ] Privacy policy published at a stable public URL.
- [ ] Play Console Data safety form matches actual app behaviour and all SDKs.
- [ ] Content rating, target audience, store listing, screenshots and support contact completed.
- [ ] Internal testing track completed before production rollout.
- [ ] Crash/ANR reporting and post-release rollback plan considered.

## Privacy and data handling

The new progression, mission, codex and settings systems use browser-local storage. The game does not need an account or send the player's custom taunts to a backend. Do not add an AI provider API key to the client bundle. If a remote generative AI service is added later, put credentials behind a server-side endpoint, document the data flow and update the privacy disclosures.

## Current limitations

- The repository does not yet contain a generated `android/` project or an AAB.
- This scaffold does not replace manual Android QA or Play Console policy review.
- WebGL uses Three.js loaded from a CDN; the PWA cache does not guarantee that the 3D library is available offline on a fresh install.
- Local profile data can be lost when the app's storage is cleared or the app is uninstalled. Cloud sync would require a separate backend and explicit privacy design.
