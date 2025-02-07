import {
  useCallback,
  useRef,
  useState,
} from 'react';
import { useSubscription } from '@apollo/client';
import {
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
} from 'livekit-client';
import { useRemoteParticipants } from '@livekit/react-native';
import { liveKitRoom } from '../../../services/livekit';
import logger from '../../../services/logger';
import {
  AUDIO_GROUP_STREAMS_SUBSCRIPTION,
} from './queries';
import {
  AudioGroupStream,
  AudioSendersData,
  SUBSCRIPTION_RETRY,
  ParticipantTypes,
} from './types';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';

const PARTICIPANTS_UPDATE_FILTER = [
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
];

export const useAudioSenders = (remoteParticipants: RemoteParticipant[]): AudioSendersData => {
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.user_current[0]?.userId;
  const { data, error } = useSubscription(AUDIO_GROUP_STREAMS_SUBSCRIPTION);

  if (error) {
    logger.error({
      logCode: 'livekit_audio_group_streams_sub_error',
      extraInfo: {
        errorMessage: error.message,
      },
    }, 'LiveKit: Audio group streams subscription failed.');
  }

  const groups = data?.user_audioGroup as AudioGroupStream[] || [];
  const receiverFilter = [
    ParticipantTypes.RECEIVER,
    ParticipantTypes.SENDRECV,
  ];
  const myInboundGroupIds = groups.filter(
    (group) => group.userId === currentUserId && receiverFilter.includes(group.participantType),
  ).map((group) => group.groupId);
  const inAnyGroup = myInboundGroupIds.length > 0;
  const senderFilter = [
    ParticipantTypes.SENDER,
    ParticipantTypes.SENDRECV,
  ];

  // If we don't have any groups, we need to subscribe to all senders that
  // are not part of a sender group
  if (!inAnyGroup) {
    const senderIds = new Set(groups
      .filter((group) => senderFilter.includes(group.participantType))
      .map((group) => group.userId));

    const grouplessSenders = remoteParticipants
      .filter((participant) => !senderIds.has(participant.identity))
      .map((participant) => ({
        userId: participant.identity,
        groupId: 'default',
        participantType: ParticipantTypes.SENDRECV,
        active: true,
      }));

    return { senders: grouplessSenders, inAnyGroup: false };
  }

  const senders = groups
    .filter((group) => myInboundGroupIds.includes(group.groupId))
    .filter((stream) => senderFilter.includes(stream.participantType) && stream.active);

  return { senders, inAnyGroup };
};

interface RetryState {
  attempts: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export const useAudioSubscriptions = () => {
  const remoteParticipants = useRemoteParticipants({
    updateOnlyOn: PARTICIPANTS_UPDATE_FILTER,
  });
  const { senders, inAnyGroup } = useAudioSenders(remoteParticipants);
  const retryMap = useRef<Map<string, RetryState>>(new Map());
  const [subscriptionErrors, setSubscriptionErrors] = useState<Map<string, Error>>(new Map());

  const clearRetryTimer = (userId: string) => {
    const state = retryMap.current.get(userId);
    if (state?.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
  };

  const retrySubscription = useCallback((userId: string, publication: RemoteTrackPublication) => {
    const { trackSid } = publication;
    const state = retryMap.current.get(userId) || { attempts: 0, timer: null };
    const { attempts } = state;

    if (attempts >= SUBSCRIPTION_RETRY.MAX_RETRIES) {
      logger.error({
        logCode: 'livekit_audio_subscription_max_retries',
        extraInfo: {
          trackSid,
        },
      }, `LiveKit: audio maxed retries - ${trackSid}`);
      retryMap.current.delete(userId);
      return;
    }

    const delay = SUBSCRIPTION_RETRY.RETRY_INTERVAL
      ** (SUBSCRIPTION_RETRY.BACKOFF_MULTIPLIER, attempts);

    clearRetryTimer(userId);

    state.timer = setTimeout(async () => {
      try {
        publication.setSubscribed(true);
        logger.info({
          logCode: 'livekit_audio_subscription_retry_success',
          extraInfo: { userId, attempts: attempts + 1 },
        }, `Successfully subscribed to ${userId} after ${attempts + 1} attempts`);
        retryMap.current.delete(userId);
        setSubscriptionErrors((prev) => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      } catch (error) {
        state.attempts += 1;
        retryMap.current.set(userId, state);
        setSubscriptionErrors((prev) => {
          const next = new Map(prev);
          next.set(userId, error as Error);
          return next;
        });
        retrySubscription(userId, publication);
      }
    }, delay);

    retryMap.current.set(userId, state);
  }, []);

  const handleSubscriptionChanges = useCallback(async () => {
    if (!liveKitRoom) return;

    const currentSubscriptions = new Set<string>();
    remoteParticipants.forEach((participant) => {
      participant.audioTrackPublications.forEach((publication) => {
        if (publication.isSubscribed) {
          currentSubscriptions.add(participant.identity);
        }
      });
    });

    const desiredSubscriptions = new Set(
      senders.map((sender) => sender.userId),
    );

    currentSubscriptions.forEach((participantId) => {
      if (!desiredSubscriptions.has(participantId)) {
        const participant = remoteParticipants.find((p) => p.identity === participantId);
        if (participant) {
          participant.audioTrackPublications.forEach((publication) => {
            const { trackSid } = publication;
            if (publication.isSubscribed) {
              clearRetryTimer(participantId);
              retryMap.current.delete(participantId);
              try {
                publication.setSubscribed(false);
                logger.debug({
                  logCode: 'livekit_audio_unsubscribed',
                  extraInfo: {
                    userId: participantId,
                    inAnyGroup,
                  },
                }, `LiveKit: Unsubscribed from audio - ${trackSid}`);
              } catch (error) {
                logger.error({
                  logCode: 'livekit_audio_unsubscription_failed',
                  extraInfo: {
                    trackSid,
                    errorMessage: (error as Error).message,
                    errorStack: (error as Error).stack,
                  },
                }, `LiveKit: Failed to unsubscribe from audio - ${trackSid}`);
              }
            }
          });
        }
      }
    });

    // Handle new subscriptions
    desiredSubscriptions.forEach((participantId) => {
      if (!currentSubscriptions.has(participantId)) {
        const participant = remoteParticipants.find((p) => p.identity === participantId);
        if (participant) {
          participant.audioTrackPublications.forEach((publication) => {
            const { trackSid } = publication;

            if (!publication.isSubscribed) {
              try {
                publication.setSubscribed(true);
                logger.debug({
                  logCode: 'livekit_audio_subscribed',
                  extraInfo: {
                    trackSid,
                    inAnyGroup,
                  },
                }, `LiveKit: Subscribed to audio - ${trackSid}`);
              } catch (error) {
                logger.error({
                  logCode: 'livekit_audio_subscription_failed',
                  extraInfo: {
                    trackSid,
                    errorMessage: (error as Error).message,
                    errorStack: (error as Error).stack,
                  },
                }, `LiveKit: Failed to subscribe to audio - ${trackSid}`);

                setSubscriptionErrors((prev) => {
                  const next = new Map(prev);
                  next.set(participantId, error as Error);
                  return next;
                });

                retrySubscription(participantId, publication);
              }
            }
          });
        }
      }
    });
  }, [senders, inAnyGroup, retrySubscription, remoteParticipants]);

  return {
    handleSubscriptionChanges,
    subscriptionErrors,
  };
};
