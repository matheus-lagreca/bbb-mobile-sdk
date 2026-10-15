# patches

Applied by [patch-package](https://github.com/ds300/patch-package) on `npm install` (`postinstall` -> `scripts/apply-patches.js`, which skips when the SDK is installed as a dependency). Host apps carry the same patch themselves (the ConferênciaWeb app has it in its own `patches/`).

## @livekit+react-native-webrtc+144.1.2.patch

**Fixes:** iOS screen share deadlock in `ios/RCTWebRTC/SocketConnection.m`.
`close` waited (`performSelector:onThread:waitUntilDone:YES`) on `networkThread`,
which only starts once the broadcast upload extension connects. If it never
connected (broadcast sheet dismissed, broadcast never started) stopping the
screen share track blocked the WebRTC module's queue forever: `createOffer` never
returned, LiveKit negotiation timed out and dropped the room, and the UI froze.
The patch only waits on the thread when it is running and only cancels the
listening source when there is one.

**Still present in:** 144.1.2 and 144.2.0 (latest when this was written).

**When upgrading `@livekit/react-native-webrtc`:**
- patch-package warns when the installed version no longer matches the version
  in the patch file name - check the new `SocketConnection.m` before
  regenerating (`npx patch-package @livekit/react-native-webrtc`).
- If `close` no longer waits on a network thread that may not have started
  (look for `waitUntilDone` and how `networkThread` is started), the fix is
  upstream: delete this patch, and the `postinstall` script and the
  `patch-package` devDependency if no other patch is left.
- To verify on a device: start a screen share, dismiss the iOS broadcast sheet
  without starting, and check the app stays responsive and in the room.
