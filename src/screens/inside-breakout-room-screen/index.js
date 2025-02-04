import React from 'react';
import BbbBreakoutSdk from 'bbb-breakout-sdk';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAudioJoin } from '../../hooks/use-audio-join';

const InsideBreakoutRoomScreen = (props) => {
  const { route } = props;
  const { i18n } = useTranslation();
  const navigation = useNavigation();
  const { joinAudio } = useAudioJoin();

  return (
    <BbbBreakoutSdk
      joinURL={route.params.joinURL}
      onLeaveSession={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        joinAudio();
      }}
      defaultLanguage={i18n.language}
    />
  );
};

export default InsideBreakoutRoomScreen;
