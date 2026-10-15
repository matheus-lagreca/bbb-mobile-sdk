# broadcast-events

Local Expo module (iOS only) that tells JS when the screen broadcast actually
started or stopped. iOS does not report what the user picked in the system
broadcast sheet (`RPSystemBroadcastPickerView`), so without it the screenshare
track had to be published before knowing whether the user tapped "Start".

## How it works

The broadcast upload extension (`ios/BBBScreenShare/SampleHandler.swift`, and
the same code in host apps' extensions) posts the Darwin notifications
`iOS_BroadcastStarted` / `iOS_BroadcastStopped`. The module observes them and
emits `onBroadcastStarted` / `onBroadcastStopped` (`index.js` exports the native
module, or `null` where it is not linked).
`src/components/livekit/screenshare/controls` opens the sheet and publishes only
after `onBroadcastStarted`; when the module is missing it falls back to
publishing right away and probing for frames for 30s.

## Host apps

The SDK's own build links it from `modules/` automatically. A host app that
installs the SDK from `node_modules` must add the folder to its autolinking
search paths (`package.json`), then `pod install`:

```json
"expo": {
  "autolinking": {
    "searchPaths": ["./node_modules/bbb-mobile-sdk/modules"]
  }
}
```

Its broadcast extension must post the same Darwin notification names.

## When to remove

If `@livekit/react-native-webrtc` (or iOS) starts exposing the broadcast state
to JS - e.g. an event from `ScreenCapturePickerView` or the screen capturer when
the extension connects - switch the controls to it and delete this module, the
host apps' `searchPaths` entry and the fallback path in the controls.
