import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ScreenWrapper from '../../components/screen-wrapper';
import VideoGrid from '../../components/video/video-grid';
import BreakoutRoomTimer from '../../components/breakout-room-timer';
import MiniAudioPlayerIcon from '../../components/audio-player/mini-audio-player-icon';
import TalkingIndicator from '../../components/talking-indicator';
import Styled from './styles';

const MainConferenceScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const initialChatMsgsFetched = useSelector((state) => state.client.initialChatMsgsFetched);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      if (initialChatMsgsFetched) {
        setIsLoading(false);
      }
    }, [initialChatMsgsFetched])
  );

  /* view components */
  const renderGridLayout = () => {
    return (
      <ScreenWrapper>
        <Styled.ContainerView>
          <TalkingIndicator />
          <VideoGrid />
          <BreakoutRoomTimer />
        </Styled.ContainerView>
      </ScreenWrapper>
    );
  };

  if (isLoading) {
    return (
      <Styled.GridItemSkeletonLoading />
    );
  }

  return renderGridLayout();
};

export default MainConferenceScreen;
