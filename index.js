import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import Settings from './settings.json';
import { registerGlobals, setupIOSAudioManagement } from '@livekit/react-native';

// LiveKit RN 2.12 switched iOS audio-session handling to a native auto-config
// path that breaks mic/camera publishing here; keep the 2.11 JS-driven behavior
// (same configs as 2.11's defaults). No-op on Android.
registerGlobals({ autoConfigureAudioSession: false });
setupIOSAudioManagement(true, ({ isRecordingEnabled, isPlayoutEnabled }) => {
  if (isRecordingEnabled) {
    return {
      audioCategory: 'playAndRecord',
      audioCategoryOptions: ['allowBluetooth', 'mixWithOthers'],
      audioMode: 'videoChat',
    };
  }
  if (isPlayoutEnabled) {
    return {
      audioCategory: 'playback',
      audioCategoryOptions: ['mixWithOthers'],
      audioMode: 'spokenAudio',
    };
  }
  return {
    audioCategory: 'soloAmbient',
    audioCategoryOptions: [],
    audioMode: 'default',
  };
});

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
