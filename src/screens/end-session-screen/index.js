import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';

const EndSessionScreen = (props) => {
  const { onLeaveSession } = props;

  const { t } = useTranslation();
  const orientation = useOrientation();

  const handleLeaveSessionButtonPress = () => {
    return onLeaveSession();
  };

  return (
    <Styled.ContainerView>
      <Styled.Image
        source={require('../../assets/application/endSessionImage.png')}
        resizeMode="contain"
        orientation={orientation}
      />
      <Styled.Title>{t('mobileSdk.breakout.endSession.modal.title')}</Styled.Title>
      <Styled.Subtitle>{t('mobileSdk.breakout.endSession.modal.subtitle')}</Styled.Subtitle>
      <Styled.ButtonContainer>
        <Styled.ConfirmButton onPress={handleLeaveSessionButtonPress}>
          {t('mobileSdk.breakout.endSession.modal.buttonLabel')}
        </Styled.ConfirmButton>
      </Styled.ButtonContainer>
    </Styled.ContainerView>
  );
};

export default EndSessionScreen;
