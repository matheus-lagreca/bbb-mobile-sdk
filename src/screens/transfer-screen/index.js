import React, { useState } from 'react';
import { Alert } from 'react-native';
import WebView from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import Styled from './styles';
import { useNavigation } from '@react-navigation/native';

const TransferScreen = (props) => {
  const { transferUrl } = props;
  const [joinTransfer, setJoinTransfer] = useState(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleLeaveSessionButtonPress = () => {
    navigation.navigate('EndSessionScreen');
  };

  const leaveConference = () => (
    Alert.alert(t('app.leaveModal.title'), t('app.leaveModal.desc'), [
      {
        text: t('app.settings.main.cancel.label'),
        onPress: () => { },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: handleLeaveSessionButtonPress
      },
    ])
  );

  if (joinTransfer) {
    return (
      <Styled.Container>
        <Styled.Wrapper>
          <WebView
            source={{ uri: transferUrl }}
            allowsFullscreenVideo
            javaScriptEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
          />
        </Styled.Wrapper>
        <Styled.LeaveIconButton onPress={leaveConference} />
      </Styled.Container>
    );
  }

  return (
    <Styled.ContainerView>
      <LottieView
        source={require('../../assets/application/lotties/transfer.json')}
        autoPlay
        loop
        style={{ width: 300, height: 300, left: -5 }}
      />
      <Styled.TitleText>
        {t('mobileSdk.transfer.title')}
      </Styled.TitleText>
      <Styled.SubtitleText>
        {t('mobileSdk.transfer.subtitle')}
      </Styled.SubtitleText>
      <Styled.SubtitleText>
        {t('mobileSdk.transfer.subtitle2')}
      </Styled.SubtitleText>
      <Styled.PressableButton
        onPress={() => setJoinTransfer(true)}
      >
        {t('mobileSdk.transfer.button.title')}
      </Styled.PressableButton>
    </Styled.ContainerView>
  );
};

export default TransferScreen;
