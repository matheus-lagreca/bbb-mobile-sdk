import { useTranslation } from 'react-i18next';
import { Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import androidScreenCaptureService from '../../../services/screenshare/android-screen-capture-service';
import Styled from './styles';

const Screenshare = () => {
  const { t } = useTranslation();

  const [isAndroidScreenCaptureActive, setIsAndroidScreenCaptureActive] = useState(false);
  const [isAndroidScreenCaptureStarting, setIsAndroidScreenCaptureStarting] = useState(false);
  const [androidScreenCaptureError, setAndroidScreenCaptureError] = useState(null);

  useEffect(() => {
    const setupEventListeners = () => {
      if (Platform.OS === 'android' && androidScreenCaptureService.eventEmitter) {
        const onStarted = () => {
          setIsAndroidScreenCaptureActive(true);
          setIsAndroidScreenCaptureStarting(false);
          setAndroidScreenCaptureError(null);
        };

        const onStopped = () => {
          setIsAndroidScreenCaptureActive(false);
          setIsAndroidScreenCaptureStarting(false);
          setAndroidScreenCaptureError(null);
        };

        const onError = (event) => {
          setIsAndroidScreenCaptureActive(false);
          setIsAndroidScreenCaptureStarting(false);
          setAndroidScreenCaptureError(event.error);
        };

        androidScreenCaptureService.eventEmitter.addListener('onScreenCaptureStarted', onStarted);
        androidScreenCaptureService.eventEmitter.addListener('onScreenCaptureStopped', onStopped);
        androidScreenCaptureService.eventEmitter.addListener('onScreenCaptureError', onError);

        return () => {
          androidScreenCaptureService.eventEmitter.removeListener('onScreenCaptureStarted', onStarted);
          androidScreenCaptureService.eventEmitter.removeListener('onScreenCaptureStopped', onStopped);
          androidScreenCaptureService.eventEmitter.removeListener('onScreenCaptureError', onError);
        };
      }
      return () => { };
    };

    const cleanup = setupEventListeners();
    return cleanup;
  }, []);

  const handleScreenshareButton = async () => {
    console.log('Screenshare button pressed, current state:', {
      isActive: isAndroidScreenCaptureActive,
      isStarting: isAndroidScreenCaptureStarting,
      error: androidScreenCaptureError
    });

    if (Platform.OS !== 'android') {
      Alert.alert(
        t('app.actionsBar.actionsDropdown.desktopShareLabel'),
        t('app.actionsBar.actionsDropdown.desktopShareNotSupported'),
        [{ text: t('app.settings.main.cancel.label') }]
      );
      return;
    }

    try {
      if (isAndroidScreenCaptureActive) {
        console.log('Stopping screen capture...');
        await androidScreenCaptureService.stopScreenCapture();
      } else {
        console.log('Starting screen capture...');
        setIsAndroidScreenCaptureStarting(true);
        setAndroidScreenCaptureError(null);
        await androidScreenCaptureService.startScreenCapture();
      }
    } catch (error) {
      console.error('Screenshare error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setIsAndroidScreenCaptureStarting(false);
      setAndroidScreenCaptureError(error.message);
      Alert.alert(
        t('app.actionsBar.actionsDropdown.desktopShareLabel'),
        error.message || t('app.actionsBar.actionsDropdown.desktopShareError'),
        [{ text: t('app.settings.main.cancel.label') }]
      );
    }
  };

  const getButtonText = () => {
    if (isAndroidScreenCaptureStarting) {
      return t('app.actionsBar.actionsDropdown.desktopShareStarting');
    }
    if (isAndroidScreenCaptureActive) {
      return t('app.actionsBar.actionsDropdown.desktopShareStop');
    }
    return t('app.actionsBar.actionsDropdown.desktopShareLabel');
  };

  const getIconName = () => {
    if (isAndroidScreenCaptureActive) {
      return 'stop-screen-share';
    }
    return 'screen-share';
  };

  return (
    <Styled.ContainerPressable
      rippleColor="rgba(0, 0, 0, .32)"
      onPress={handleScreenshareButton}
      disabled={isAndroidScreenCaptureStarting}
      isActive={isAndroidScreenCaptureActive}
      isStarting={isAndroidScreenCaptureStarting}
    >
      <>
        <Styled.ScreenshareIconContainer>
          <Styled.ScreenshareIcon
            name={getIconName()}
            size={24}
            color={isAndroidScreenCaptureActive ? '#4CAF50' : '#FFFFFF'}
          />
        </Styled.ScreenshareIconContainer>
        <Styled.ScreenshareText isActive={isAndroidScreenCaptureActive}>
          {getButtonText()}
        </Styled.ScreenshareText>
      </>
    </Styled.ContainerPressable>
  );
};

export default Screenshare;
