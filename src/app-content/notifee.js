import { useCallback, useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidForegroundServiceType, EventType } from 'react-native-notify-kit';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useSubscription } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import AudioQueries from '../components/audio/audio-controls/queries';
import LeaveQueries from '../components/custom-drawer/queries';
import { setPendingMuteAssert } from '../store/redux/slices/wide-app/audio';
import logger from '../services/logger';
import Colors from '../constants/colors';
import { useAppInstance } from '../app-instance/context';
import { getActiveInstanceOrNull } from '../app-instance/active-instance';

const CHANNEL_ID = 'main_meeting_channel';
// Fixed id: the breakout instance's notification replaces the main room's
// instead of duplicating it (two App instances run during breakouts, and the
// OS foreground service is one process-wide resource)
const NOTIFICATION_ID = 'audio_notification_main';

// Notification action handlers, one entry per mounted NotifeeController
// (i.e. per App instance), keyed by instance id. notifee's event handlers are
// process-global (onBackgroundEvent cannot even be unregistered), so they are
// registered ONCE below and dispatch to the handlers of the *active* App
// instance: the breakout while one is open, the main room otherwise. Without
// this, a "leave" press while a breakout is open would also leave the main
// meeting, and a stale handler could outlive its App.
const handlersByInstance = new Map();

const dispatchNotificationAction = async (pressActionId) => {
  const activeInstance = getActiveInstanceOrNull();
  const handlers = activeInstance && handlersByInstance.get(activeInstance.id)?.current;

  if (!handlers) return;

  if (pressActionId === 'leave') {
    await handlers.leave();
  } else if (pressActionId === 'mute' || pressActionId === 'unmute') {
    await handlers.toggleMute();
  }
};

const isOurActionPress = ({ type, detail }) => (
  detail?.notification?.android?.channelId === CHANNEL_ID
  && type === EventType.ACTION_PRESS
);

// Background event = device locked || app not in view || killed/quit
notifee.onBackgroundEvent(async (event) => {
  if (!isOurActionPress(event)) return;
  await dispatchNotificationAction(event.detail.pressAction?.id);
});

// Foreground event = device unlocked || app in view
notifee.onForegroundEvent((event) => {
  if (!isOurActionPress(event)) return;
  dispatchNotificationAction(event.detail.pressAction?.id);
});

// Foreground service task runner/notification: keeps audio/mic working on
// Android when the app is backgrounded or the screen is off. The promise
// never resolves on purpose - the service lives until stopForegroundService.
notifee.registerForegroundService((notification) => {
  return new Promise(() => {
    logger.debug({
      logCode: 'app_service_notification',
      extraInfo: { notification },
    }, 'Foreground service notification started.');
  });
});

// Android 14+ requires the started types to be a subset of the manifest
// declaration AND backed by granted permissions - starting a microphone-typed
// FGS without RECORD_AUDIO throws a SecurityException (e.g. listen-only users)
const getServiceTypes = async (isListenOnly) => {
  const types = [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK];

  if (!isListenOnly) {
    try {
      const hasMicPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (hasMicPermission) {
        types.push(AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE);
      }
    } catch (error) {
      logger.warn({
        logCode: 'notifee_mic_permission_check_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Failed to check mic permission for foreground service types');
    }
  }

  return types;
};

const NotifeeController = () => {
  const dispatch = useDispatch();
  const instance = useAppInstance();
  const audioIsConnected = useSelector((state) => state.audio.isConnected);
  const audioIsMuted = useSelector((state) => state.audio.isMuted);
  const isListenOnly = useSelector((state) => state.audio.isListenOnly);
  const { t } = useTranslation();
  const [userSetMuted] = useMutation(AudioQueries.USER_SET_MUTED);
  const [dispatchLeaveSession] = useMutation(LeaveQueries.USER_LEAVE_MEETING);
  const { data: currentUserVoiceData } = useSubscription(AudioQueries.USER_CURRENT_VOICE);
  const voice = currentUserVoiceData?.user_current[0]?.voice;

  const toggleMute = useCallback(async () => {
    if (!voice) return;

    // Explicit user mute toggle supersedes previous mute asserts
    // (mirrors audio-controls' toggleVoice)
    dispatch(setPendingMuteAssert(null));

    try {
      await userSetMuted({ variables: { muted: !voice.muted, userId: voice.userId } });
    } catch (error) {
      logger.error({
        logCode: 'notifee_toggle_mute_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Error on trying to toggle muted from notification');
    }
  }, [voice]);

  const leave = useCallback(async () => {
    try {
      await dispatchLeaveSession();
    } catch (error) {
      logger.error({
        logCode: 'notifee_leave_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Error on trying to leave session from notification');
    } finally {
      await notifee.stopForegroundService();
      await notifee.cancelNotification(NOTIFICATION_ID);
    }
  }, [dispatchLeaveSession]);

  // The module-level dispatcher reads the latest callbacks through this ref
  const handlersRef = useRef({ toggleMute, leave });
  handlersRef.current = { toggleMute, leave };

  const display = useCallback(async () => {
    const channelId = await notifee.createChannel({
      id: CHANNEL_ID,
      name: t('mobileSdk.notification.label'),
      vibration: false,
    });

    const buildNotification = (foregroundServiceTypes) => ({
      id: NOTIFICATION_ID,
      title: t('mobileSdk.notification.title'),
      body: t('mobileSdk.notification.body'),
      android: {
        channelId,
        asForegroundService: true,
        foregroundServiceTypes,
        ongoing: true,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: t('app.leaveModal.confirm'),
            pressAction: {
              id: 'leave',
            },
          },
          ...(isListenOnly ? [] : [
            audioIsMuted
              ? {
                title: t('app.actionsBar.unmuteLabel'),
                pressAction: {
                  id: 'unmute',
                },
              } : {
                title: t('app.actionsBar.muteLabel'),
                pressAction: {
                  id: 'mute',
                },
              },
          ]),
        ],
        color: Colors.blue,
        colorized: true,
        smallIcon: 'ic_launcher_foreground',
      },
    });

    try {
      await notifee.displayNotification(buildNotification(await getServiceTypes(isListenOnly)));
    } catch (error) {
      logger.warn({
        logCode: 'notifee_fgs_display_failed',
        extraInfo: { errorMessage: error?.message },
      }, 'Foreground service with mic type failed, retrying as mediaPlayback-only');

      try {
        await notifee.displayNotification(buildNotification(
          [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK],
        ));
      } catch (retryError) {
        logger.error({
          logCode: 'notifee_fgs_display_retry_failed',
          extraInfo: { errorMessage: retryError?.message },
        }, 'Failed to start the audio foreground service');
      }
    }
  }, [audioIsMuted, isListenOnly, t]);

  // Start/stop the foreground service with the audio connection; re-display on
  // mute changes so the mute/unmute action label stays in sync (same id
  // updates the notification in place)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    if (audioIsConnected) {
      display();
    } else {
      notifee.stopForegroundService();
      notifee.cancelNotification(NOTIFICATION_ID);
    }
  }, [audioIsConnected, display]);

  useEffect(() => {
    // POST_NOTIFICATIONS runtime prompt (Android 13+)
    notifee.requestPermission();

    handlersByInstance.set(instance.id, handlersRef);

    return () => {
      handlersByInstance.delete(instance.id);

      // Two controllers are sequential by construction (the main room exits
      // audio before a breakout joins, and re-displays the notification when
      // its audio reconnects after the breakout unmounts).
      if (Platform.OS === 'android') {
        notifee.stopForegroundService();
        notifee.cancelNotification(NOTIFICATION_ID);
      }
    };
  }, [instance]);

  return null;
};

export default NotifeeController;
