# Health App — Setup & Run Guide

An ultra-lightweight, **purely local** workout tracker.
No SQLite, no Redux, no network. O(1) synchronous reads/writes via MMKV (JSI).

## Stack

| Concern        | Choice                  | Why                                            |
| -------------- | ----------------------- | ---------------------------------------------- |
| Engine         | Hermes                  | Faster startup, lower memory (default on 0.76) |
| Storage        | `react-native-mmkv`     | Synchronous JSI key/value, ~O(1)               |
| State          | `zustand`               | Tiny, boilerplate-free                         |
| List rendering | `@shopify/flash-list`   | View recycling, no FlatList memory leaks       |

## File map

```
App.js                       # entry point (single screen)
index.js                     # registers App with RN
app.json                     # app name
src/
  theme.js                   # earth-tone palette + spacing
  defaultExercises.js        # back/shoulder quick-select list
  store.js                   # zustand + MMKV (loadWorkoutByDate / addWorkoutRecord)
  components/WorkoutCard.js   # memoized exercise card
  screens/MainScreen.js      # date selector + FlashList + input section
```

## Prerequisites

- Node 18+
- React Native dev environment set up (Android Studio for Android, Xcode for iOS).
  See: https://reactnative.dev/docs/set-up-your-environment

> The native projects (`android/`, `ios/`) are already generated (RN 0.76.5,
> Hermes + New Architecture enabled) and dependencies are installed, so the
> app is ready to run.

## Install (already done, for reference)

`node_modules/` is already installed. If you ever need a clean reinstall:

```bash
# --legacy-peer-deps avoids a transient flash-list/react peer warning
npm install --legacy-peer-deps

# iOS only: install CocoaPods
cd ios && pod install && cd ..
```

## Run

```bash
npm start          # Metro bundler (keep running in one terminal)
npm run android    # build + launch on Android emulator/device
npm run ios        # build + launch on iOS simulator (macOS only)
```

## Verify the JS bundle (no emulator needed)

```bash
npx react-native bundle --platform android --dev true \
  --entry-file index.js --bundle-output ./_verify.js --reset-cache
```

A successful `Done writing bundle output` means all imports compile.

## Hermes check

Hermes is **on by default** in RN 0.76. To verify, in any component:

```js
const isHermes = () => !!global.HermesInternal;
```

(For older RN: enable in `android/app/build.gradle` → `hermesEnabled true`,
and in `ios/Podfile` → `:hermes_enabled => true`.)

## How storage works

- **Key**: `YYYY-MM-DD`
- **Value**: JSON string of `[{ id, exercise, sets: [{ weight, reps }] }]`

Every `Save` / `Add Set` / delete calls `storage.set(...)` synchronously
(no `await`), then mirrors the new array into Zustand so React re-renders
instantly. Switching dates calls `setSelectedDate` → reads MMKV → updates state.
```
