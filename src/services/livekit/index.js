import { Room } from 'livekit-client';
import { EventEmitter2 } from 'eventemitter2';
import logger from '../logger';

// React Native has no DOM (window/CustomEvent), so cross-module LiveKit signals
// go through a per-instance emitter instead of window.dispatchEvent/addEventListener.
export const LK_FATAL_ERROR_EVENT = 'liveKitFatalError';

// Every mounted App (main room or nested breakout) owns exactly one Room and
// one event emitter, created by createAppInstance() and reachable through
// `instance.liveKitRoom` / `instance.liveKitEvents` (or `useLiveKitRoom()` in
// React). There is deliberately no module-level Room anymore: a Room holds a
// single connection, and the breakout room and the main room are different
// connections.
export const createLiveKitEvents = () => new EventEmitter2();

export const createLiveKitRoom = () => new Room({
  adaptiveStream: true,
  dynacast: true,
  stopLocalTrackOnUnpublish: false,
  disconnectOnPageLeave: true,
});

// Disconnects the instance's room and, when `final`, destroys the instance's
// three WebRTC managers. Returns the promise so callers that hand media over to
// another instance (entering a breakout) can await the teardown before moving on.
export const disconnectLiveKitRoom = (instance, { final = false } = {}) => {
  return instance.liveKitRoom.disconnect()
    .then(() => {
      logger.debug({
        logCode: 'livekit_room_destroyed',
        extraInfo: { appInstanceId: instance.id, final },
      }, 'LiveKit room destroyed');
    })
    .catch((error) => {
      logger.error({
        logCode: 'livekit_disconnect_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
        },
      }, `LiveKit disconnect error: ${error.message}`);
    })
    .finally(() => {
      if (final) {
        instance.audioManager.destroy();
        instance.videoManager.destroy();
        instance.screenshareManager.destroy();
      }
    });
};
