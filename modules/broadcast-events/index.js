import { requireOptionalNativeModule } from 'expo';

// Emits `onBroadcastStarted` / `onBroadcastStopped` when the host app's screen
// broadcast extension starts or stops. null on Android and in host apps built
// without the module (see modules/broadcast-events/ios).
export default requireOptionalNativeModule('BroadcastEvents');
