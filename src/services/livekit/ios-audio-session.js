import { setupIOSAudioManagement } from '@livekit/react-native';

// LiveKit RN 2.12 switched iOS audio-session handling to a native auto-config
// path that breaks mic/camera publishing here; keep the 2.11 JS-driven behavior
// (same configs as 2.11's defaults). No-op on Android.
//
// Called on App mount rather than at module load: a host app's
// registerGlobals() (default options) runs after this module is imported and
// would replace the setup with the native path again.
export const setupIOSAudioSession = () => setupIOSAudioManagement(
  true,
  ({ isRecordingEnabled, isPlayoutEnabled }) => {
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
  },
);
