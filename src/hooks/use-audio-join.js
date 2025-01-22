import { useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useDispatch } from 'react-redux';
import useMeeting from '../graphql/hooks/useMeeting';
import { isLocked } from '../store/redux/slices/current-user';
import { setAudioError } from '../store/redux/slices/wide-app/audio';
import AudioManager from '../services/webrtc/audio-manager';
import logger from '../services/logger';

const ANDROID_SDK_MIN_BTCONNECT = 31;

export const useAudioJoin = () => {
  const dispatch = useDispatch();
  const { data: meetingData } = useMeeting();
  const meeting = meetingData?.meeting[0];

  const joinAudio = useCallback(async () => {
    const micDisabled = meeting.lockSettings?.disableMic && isLocked();
    const transparentListenOnly = true;
    const muteOnStart = meeting?.voiceProp?.muteOnStart;
    const audioBridge = meeting?.audioBridge;

    if (Platform.OS === 'android' && Platform.Version >= ANDROID_SDK_MIN_BTCONNECT) {
      const checkStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );

      if (checkStatus === false) {
        const permissionStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
        logger.info({
          logCode: 'audio_bluetooth_permission',
          extraInfo: {
            checkStatus,
            permissionStatus,
          }
        }, `Audio had to explicitly request BT permission, result=${permissionStatus}`);
      }
    }

    return AudioManager.joinMicrophone({
      muted: muteOnStart,
      isListenOnly: micDisabled,
      transparentListenOnly,
      audioBridge,
    }).catch((error) => {
      logger.error({
        logCode: 'audio_publish_failure',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        }
      }, `Audio published failed: ${error.message}`);
      dispatch(setAudioError(error.name));
    });
  }, [meeting]);

  return { joinAudio };
};
