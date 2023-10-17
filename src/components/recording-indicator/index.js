import { useCallback, useEffect, useRef } from 'react';
import { Pressable, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { openModal, setActiveModal } from '../../store/redux/slices/wide-app/modal';
import { showNotificationWithTimeout } from '../../store/redux/slices/wide-app/notification-bar';
import { isModerator } from '../../store/redux/slices/current-user';
import usePrevious from '../../hooks/use-previous';
import Colors from '../../constants/colors';
import Styled from './styles';

const RecordingIndicator = (props) => {
  const { recordMeeting } = props;
  const recording = recordMeeting?.recording;
  const previousRecording = usePrevious(recording);
  const amIModerator = useSelector(isModerator);
  const neverRecorded = (recordMeeting?.time === 0 || recordMeeting?.time === undefined)
    ? !recordMeeting?.recording
    : false;

  const dispatch = useDispatch();
  const anim = useRef(new Animated.Value(1));

  const hasRecordingPermission = amIModerator && true;

  const handleOpenRecordingViewerModal = () => {
    dispatch(setActiveModal('recording-status'));
    dispatch(openModal());
  };

  const handleOpenRecordingControlsModal = () => {
    dispatch(setActiveModal('recording-confirm'));
    dispatch(openModal());
  };

  useEffect(() => {
    if ((recording !== undefined && previousRecording !== undefined)
        && (recording !== previousRecording)
    ) {
      if (recording) {
        dispatch(showNotificationWithTimeout('recordingStarted'));
      } else {
        dispatch(showNotificationWithTimeout('recordingStopped'));
      }
    }
  }, [recording]);

  useFocusEffect(
    useCallback(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.current, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.current, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [recording])
  );

  if (!recordMeeting?.record) return null;

  const handleIcon = () => {
    if (neverRecorded) {
      return (<MaterialCommunityIcons name="record-circle-outline" size={24} color={Colors.white} />);
    }
    if (!recording) {
      return (<MaterialCommunityIcons name="pause-circle" size={24} color={Colors.blue} />);
    }
    return (<MaterialCommunityIcons name="record-circle-outline" size={24} color={Colors.orange} />);
  };

  return (
    <Styled.Container neverRecorded={neverRecorded}>
      <Styled.RecordingIndicatorIcon>
        <Pressable
          onPress={hasRecordingPermission
            ? handleOpenRecordingControlsModal
            : handleOpenRecordingViewerModal}
        >
          <Animated.View style={{ transform: [{ scale: recording ? anim.current : 1 }] }}>
            {handleIcon()}
          </Animated.View>
        </Pressable>
      </Styled.RecordingIndicatorIcon>
    </Styled.Container>

  );
};

export default RecordingIndicator;
