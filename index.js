import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import Settings from './settings.json';
import { registerGlobals } from '@livekit/react-native';

// The iOS audio session is configured by App on mount (see
// src/services/livekit/ios-audio-session.js), so skip LiveKit 2.12's native
// auto-config here. No-op on Android.
registerGlobals({ autoConfigureAudioSession: false });

import App from './App';

// export for sdk purposes
export default App;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// Only register root component if you are running the sdk alone.
if (Settings.dev) {
  registerRootComponent(App);
}
